import { AuthenticationError } from "apollo-server-express";
import { convertAsciiDocToHtml, getGraphGistByUUID } from "./utils";
import { GraphQLError } from "graphql";
import ValidationError from "../ValidationError";

export const PreviewGraphGist = (root, args, context, info) => {
  return convertAsciiDocToHtml(args.asciidoc);
};

export const UpdateGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  try {
    const graphGist = await getGraphGistByUUID(txc, args.uuid);
    const {
      industries,
      use_cases,
      challenges,
      author,
      ...properties
    } = args.graphgist;
    const rawHtml = await convertAsciiDocToHtml(properties.asciidoc);
    console.log(typeof rawHtml);
    if (typeof rawHtml === "object") {
      throw rawHtml;
    }
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET gc += $graphgist
      SET g += { is_candidate_updated: TRUE, has_errors: FALSE }
      RETURN gc
      `,
      {
        uuid: args.uuid,
        graphgist: {
          ...properties,
          status: "candidate",
          raw_html: rawHtml,
          has_errors: false,
        },
      }
    );
    const candidate = result.records[0].get("gc").properties;

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
      MATCH (gc:GraphGistCandidate {uuid: $uuid})-[r:FOR_CHALLENGE|:FOR_USE_CASE|:FOR_INDUSTRY]->()
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

    await txc.commit();
    return candidate;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
};

export const PublishGraphGistCandidate = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();
  const { uuid } = args;

  try {
    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(gc:GraphGistCandidate)
      SET g.asciidoc = gc.asciidoc
      SET g.title = gc.title
      SET g.url = gc.url
      SET g.is_guide = gc.is_guide
      SET g.is_candidate_updated = false
      SET g.status = "live"
      SET gc.status = "live"
      RETURN g, gc
    `,
      { uuid }
    );
    const candidate = result.records[0].get("gc").properties;
    const graphGist = result.records[0].get("g").properties;

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[r:WROTE]-()
      DELETE r
      WITH g
      MATCH (g)<-[:IS_VERSION]-(gc:GraphGistCandidate)<-[:WROTE]-(p)
      CREATE (g)<-[:WROTE]-(p)
      RETURN p
      `,
      { uuid }
    );

    await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})-[r:FOR_CHALLENGE|:FOR_USE_CASE|:FOR_INDUSTRY]->()
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

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
};

export const DisableGraphGist = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

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
    const graphGist = result.records[0].get("g").properties;

    await txc.commit();
    return graphGist;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
};
