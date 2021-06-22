import {
  convertAsciiDocToHtml,
  renderMathJax,
  getGraphGistByUUID,
  imageUrlRegex
} from './utils';
import {uploadImage, deleteImage} from '../images/imagekit';
import S3 from '../images/s3';
import _ from 'lodash';
import { AuthenticationError } from 'apollo-server';
import ejs from 'ejs';
import { sendEmail } from '../mailer.js';
import { v4 as uuidv4 } from "uuid";

export const PreviewGraphGist = async (root, args, context, info) => {
  return renderMathJax(await convertAsciiDocToHtml(args.asciidoc));
};

export const CreateGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  try {
    const {
      industries,
      use_cases,
      challenges,
      author,
      images,
      ...properties
    } = args.graphgist;

    //Create new asciidoc text
    let asciidoc = properties.asciidoc
    const imagekitImages = []

    const imagesMatches = args.graphgist.asciidoc.matchAll(imageUrlRegex)

    for (const match of imagesMatches){
      const originalUrl =  match[1]
      try {
        const id = String(uuidv4())
        const {...imageData} = await uploadImage(originalUrl, id) //Upload image to imagekit
        asciidoc = asciidoc.replace(originalUrl, imageData.url)
        
        imageData.uuid = id;
        imageData.source = 'imagekit';
        imageData.originalUrl = originalUrl
        imagekitImages.push(imageData)

      } catch (err) {
        console.log(`Error when uploading image: ${originalUrl}`)
      }
    }
    //Overwrite the original asciidoc with new Urls
    properties.asciidoc = asciidoc


    const graphgist_post = {
      ...properties,
      status: 'draft',
      raw_html: renderMathJax(
        await convertAsciiDocToHtml(properties.asciidoc)
      ),
      has_errors: false,
    };

    const result = await txc.run(
      `
      MERGE (g:GraphGist { uuid: randomUUID() })<-[:IS_VERSION]-(gc:GraphGistCandidate { uuid: randomUUID() })
      SET g += $graphgist
      SET g.slug = g.uuid
      SET g += { is_candidate_updated: TRUE, has_errors: FALSE }
      SET gc += $graphgist
      SET gc.slug = g.slug
      RETURN g, gc
      `,
      {
        graphgist: graphgist_post,
      }
    );
    const graphgist = result.records[0].get('g').properties;
    const candidate = result.records[0].get('gc').properties;

    const current_user = context.user;
    const authorResult = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid}), (gc:GraphGistCandidate {uuid: $candidateUuid}), (User {uuid: $authorUuid})-[:IS_PERSON]->(p:Person)
      CREATE (gc)<-[r:WROTE]-(p)
      CREATE (g)<-[rr:WROTE]-(p)
      RETURN r, rr, p
      `,
      {
        uuid: graphgist.uuid,
        candidateUuid: candidate.uuid,
        authorUuid: current_user.uuid,
      }
    );
    const authorPerson = authorResult.records[0].get('p').properties;

    //imagekit
    for (let imagekitImage of imagekitImages) {
      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate), (a:Person {uuid: $authorUuid})
        CREATE (i:Image $image)
        CREATE (i)<-[:HAS_IMAGE]-(gc)
        CREATE (i)<-[:HAS_IMAGE]-(g)
        CREATE (i)<-[:OWN_IMAGE]-(a)
        `,
        { uuid: graphgist.uuid, image: imagekitImage, authorUuid: authorPerson.uuid }
      );
    }


    let categoryUuid;

    for (categoryUuid of industries) {
      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid}), (gc:GraphGistCandidate {uuid: $candidateUuid}), (c:Industry {uuid: $categoryUuid})
        CREATE (g)-[r:FOR_INDUSTRY]->(c)
        CREATE (gc)-[rr:FOR_INDUSTRY]->(c)
        RETURN r, rr
        `,
        {
          uuid: graphgist.uuid,
          candidateUuid: candidate.uuid,
          categoryUuid: categoryUuid,
        }
      );
    }

    for (categoryUuid of use_cases) {
      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid}), (gc:GraphGistCandidate {uuid: $candidateUuid}), (c:UseCase {uuid: $categoryUuid})
        CREATE (g)-[r:FOR_USE_CASE]->(c)
        CREATE (gc)-[rr:FOR_USE_CASE]->(c)
        RETURN r, rr
        `,
        {
          uuid: graphgist.uuid,
          candidateUuid: candidate.uuid,
          categoryUuid: categoryUuid,
        }
      );
    }

    for (categoryUuid of challenges) {
      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid}), (gc:GraphGistCandidate {uuid: $candidateUuid}), (c:Challenge {uuid: $categoryUuid})
        CREATE (g)-[r:FOR_CHALLENGE]->(c)
        CREATE (gc)-[rr:FOR_CHALLENGE]->(c)
        RETURN r, rr
        `,
        {
          uuid: graphgist.uuid,
          candidateUuid: candidate.uuid,
          categoryUuid: categoryUuid,
        }
      );
    }

    for (let image_upload of images) {
      const image_uploaded = await S3.upload(image_upload);
      image_uploaded.source = 'file_upload';
      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid}), (gc:GraphGistCandidate {uuid: $candidateUuid}), (a:Person {uuid: $authorUuid})
        CREATE (i:Image $image)
        CREATE (i)<-[r:HAS_IMAGE]-(g)
        CREATE (i)<-[:HAS_IMAGE]-(gc)
        CREATE (i)<-[:OWN_IMAGE]-(a)
        RETURN r
        `,
        {
          uuid: graphgist.uuid,
          candidateUuid: candidate.uuid,
          authorUuid: authorPerson.uuid,
          image: image_uploaded,
        }
      );
    }

    ejs.renderFile(
      `${__dirname}/notify_admins_about_creation.ejs`,
      {
        FRONTEND_URL: process.env.FRONTEND_URL,
        candidate: candidate,
        graphgist: graphgist,
        author: authorPerson,
      },
      {},
      async (err, htmlBody) => {
        if (err) {
          console.error(err, err.stack);
        } else {
          const adminsResult = await txc.run(
            `
          MATCH (u:User {admin: true})
          WHERE EXISTS (u.email)
          RETURN u.email
          `
          );
          const adminEmails = adminsResult.records
            .map((record) => record.get('u.email'))
            .filter((item) => !!item);
          sendEmail({
            to: adminEmails,
            subject: `[New GraphGist] ${graphgist.title}`,
            htmlBody,
          });
        }
      }
    );

    await txc.commit();
    return candidate;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const SubmitForApprovalGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user) {
    throw new AuthenticationError('You must be logged in');
  }

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)<-[r:WROTE]-(p)
      SET g.status = "candidate"
      SET gc.status = "candidate"
      RETURN g, gc, p
      `,
      { uuid: args.uuid }
    );

    const graphgist = result.records[0].get('g').properties;
    const candidate = result.records[0].get('gc').properties;
    const authorPerson = result.records[0].get('p').properties;

    const adminsResult = await txc.run(
      `
      MATCH (u:User {admin: true})
      WHERE EXISTS (u.email)
      RETURN u.email
      `
    );

    await txc.commit();

    ejs.renderFile(
      `${__dirname}/notify_admins_about_submit_for_approval.ejs`,
      {
        FRONTEND_URL: process.env.FRONTEND_URL,
        candidate: candidate,
        graphgist: graphgist,
        author: authorPerson,
      },
      {},
      async (err, htmlBody) => {
        if (err) {
          console.error(err, err.stack);
        } else {
          const adminEmails = adminsResult.records
            .map((record) => record.get('u.email'))
            .filter((item) => !!item);
          sendEmail({
            to: adminEmails,
            subject: `[New GraphGist] ${graphgist.title}`,
            htmlBody,
          });
        }
      }
    );

    return result.records[0].get('g').properties;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const UpdateGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user) {
    throw new AuthenticationError('You must be authenticated');
  }
  
  try {

    const graphGist = await getGraphGistByUUID(txc, args.uuid);
    const { industries, use_cases, challenges, author, images, ...properties } =
      args.graphgist;

    //Create new asciidoc text
    let asciidoc = properties.asciidoc

    const imagesMatches = args.graphgist.asciidoc.matchAll(imageUrlRegex)

    for (const match of imagesMatches){
      const originalUrl =  match[1]
      const id = String(uuidv4())
      const {...imageData} = await uploadImage(originalUrl, id) //Upload image to imagekit
      asciidoc = asciidoc.replace(originalUrl, imageData.url)

      imageData.uuid = id;
      imageData.source = 'imagekit';
      imageData.originalUrl = originalUrl

      await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate), (User {uuid: $authorUuid})-[:IS_PERSON]->(p:Person)
        CREATE (i:Image $image)
        CREATE (i)<-[r:HAS_IMAGE]-(gc)
        CREATE (i)<-[:OWN_IMAGE]-(p)
        RETURN r
        `,
        { uuid: args.uuid, image: imageData, authorUuid: current_user.uuid }
      );
    }
    //Overwrite the original asciidoc with new Urls
    properties.asciidoc = asciidoc




    const rawHtml = await convertAsciiDocToHtml(asciidoc);
    if (typeof rawHtml === 'object') {
      throw rawHtml;
    }

    let graphGistUpgateCypher = `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET gc += $graphgist
      SET g += { is_candidate_updated: TRUE, has_errors: FALSE }
      RETURN gc
    `;
    if (graphGist.status === 'draft' || graphGist.status === 'candidate') {
      graphGistUpgateCypher = `
        MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
        SET g += $graphgist
        SET gc += $graphgist
        SET g += { is_candidate_updated: TRUE, has_errors: FALSE }
        RETURN gc
      `;
    }

    const result = await txc.run(graphGistUpgateCypher, {
      uuid: args.uuid,
      graphgist: {
        ...properties,
        status: 'draft',
        raw_html: rawHtml,
        has_errors: false,
      },
    });
    const candidate = result.records[0].get('gc').properties;

    await txc.run(
      `
      MATCH (gc:GraphGistCandidate {uuid: $uuid})<-[r:WROTE]-()
      DELETE r
      `,
      { uuid: candidate.uuid }
    );
    await txc.run(
      `
      MATCH (gc:GraphGistCandidate {uuid: $uuid}), (a:Person {uuid: $authorUuid})
      CREATE (gc)<-[r:WROTE]-(a)
      RETURN r
      `,
      { uuid: candidate.uuid, authorUuid: author }
    );

    await txc.run(
      `
      MATCH (gc:GraphGistCandidate {uuid: $uuid})-[r:FOR_CHALLENGE|FOR_USE_CASE|FOR_INDUSTRY]->()
      DELETE r
      `,
      { uuid: candidate.uuid }
    );
    var categoryUuid;

    for (categoryUuid of industries) {
      await txc.run(
        `
        MATCH (gc:GraphGistCandidate {uuid: $uuid}), (c:Industry {uuid: $categoryUuid})
        CREATE (gc)-[r:FOR_INDUSTRY]->(c)
        RETURN r
        `,
        { uuid: candidate.uuid, categoryUuid }
      );
    }

    for (categoryUuid of use_cases) {
      await txc.run(
        `
        MATCH (gc:GraphGistCandidate {uuid: $uuid}), (c:UseCase {uuid: $categoryUuid})
        CREATE (gc)-[r:FOR_USE_CASE]->(c)
        RETURN r
        `,
        { uuid: candidate.uuid, categoryUuid }
      );
    }

    for (categoryUuid of challenges) {
      await txc.run(
        `
        MATCH (gc:GraphGistCandidate {uuid: $uuid}), (c:Challenge {uuid: $categoryUuid})
        CREATE (gc)-[r:FOR_CHALLENGE]->(c)
        RETURN r
        `,
        { uuid: candidate.uuid, categoryUuid }
      );
    }

    const uploaded_images = images.filter((i) => !!i);
    if (uploaded_images.length > 0) {
      await txc.run(
        `
        MATCH (gc:GraphGistCandidate {uuid: $uuid})-[r:HAS_IMAGE]->()
        DELETE r
        `,
        { uuid: candidate.uuid }
      );

      for (let image_upload of uploaded_images) {
        const image_uploaded = await S3.upload(image_upload);
        image_uploaded.source = 'file_upload';
        await txc.run(
          `
          MATCH (gc:GraphGistCandidate {uuid: $uuid}), (a:Person {uuid: $authorUuid})
          CREATE (i:Image $image)
          CREATE (i)<-[:HAS_IMAGE]-(gc)
          CREATE (i)<-[:OWN_IMAGE]-(a)
          `,
          { uuid: candidate.uuid, image: image_uploaded, authorUuid: author }
        );
      }
    }

    await txc.commit();
    return candidate;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const PublishGraphGistCandidate = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user || !current_user.admin) {
    throw new AuthenticationError('You must be an admin');
  }

  const { uuid } = args;

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET g.asciidoc = gc.asciidoc
      SET g.summary = gc.summary
      SET g.raw_html = gc.raw_html
      SET g.title = gc.title
      SET g.url = gc.url
      SET g.neo4j_version = gc.neo4j_version
      SET g.is_guide = gc.is_guide
      SET g.is_candidate_updated = false
      SET g.status = "live"
      SET gc.status = "live"
      RETURN g, gc
    `,
      { uuid }
    );
    const candidate = result.records[0].get('gc').properties;
    const graphGist = result.records[0].get('g').properties;

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[r:WROTE]-()
      DELETE r
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)<-[:WROTE]-(p)
      CREATE (g)<-[:WROTE]-(p)
      RETURN p
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})-[r:FOR_CHALLENGE|FOR_USE_CASE|FOR_INDUSTRY|HAS_IMAGE]->()
      DELETE r
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)-[:FOR_INDUSTRY]->(c)
      WITH collect(c) as endNodes, g
      FOREACH(cc in endNodes | CREATE (g)-[:FOR_INDUSTRY]->(cc))
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)-[:FOR_USE_CASE]->(c)
      WITH collect(c) as endNodes, g
      FOREACH(cc in endNodes | CREATE (g)-[:FOR_USE_CASE]->(cc))
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)-[:FOR_CHALLENGE]->(c)
      WITH collect(c) as endNodes, g
      FOREACH(cc in endNodes | CREATE (g)-[:FOR_CHALLENGE]->(cc))
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)-[:HAS_IMAGE]->(c)
      WITH collect(c) as endNodes, g
      FOREACH(cc in endNodes | CREATE (g)-[:HAS_IMAGE]->(cc))
      `,
      { uuid }
    );

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const DisableGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user || !current_user.admin) {
    throw new AuthenticationError('You must be an admin');
  }

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET gc.status = "draft"
      SET g.status = "disabled"
      RETURN g, gc
    `,
      {
        uuid: args.uuid,
      }
    );
    const graphGist = result.records[0].get('g').properties;

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const FlagGraphGistAsGuide = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user || !current_user.admin) {
    throw new AuthenticationError('You must be an admin');
  }

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET gc.is_guide = $is_guide
      SET g.is_guide = $is_guide
      RETURN g, gc
    `,
      {
        uuid: args.uuid,
        is_guide: args.is_guide,
      }
    );
    const graphGist = result.records[0].get('g').properties;

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const FlagGraphGistAsFeatured = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user || !current_user.admin) {
    throw new AuthenticationError('You must be an admin');
  }

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET gc.featured = $featured
      SET g.featured = $featured
      RETURN g, gc
    `,
      {
        uuid: args.uuid,
        featured: args.featured,
      }
    );
    const graphGist = result.records[0].get('g').properties;

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};

export const Rate = async (root, args, context, info) => {
  const session = context.driver.session();
  const current_user = context.user;

  if (!current_user) {
    throw new AuthenticationError('You must authenticate');
  }

  const asset = await session.readTransaction(async (txc) => {
    const asset_result = await txc.run(
      `
      MATCH (a {uuid: $uuid})
      RETURN a
    `,
      { uuid: args.to }
    );
    return asset_result.records[0].get('a').properties;
  });

  if (asset) {
    return await session.writeTransaction(async (txc) => {
      const result = await txc.run(
        `
        MATCH (u:User {uuid: $user})
        MATCH (a {uuid: $to})
        MERGE (a)<-[r:RATES]-(u)
        SET r.level = $level
        SET r.rated_at = datetime($rated_at)
        RETURN r
        `,
        {
          to: args.to,
          user: current_user.uuid,
          level: args.level,
          rated_at: new Date().toISOString(),
        }
      );
      return result.records[0].get('r').properties;
    });
  }
};