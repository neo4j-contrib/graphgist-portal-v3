import S3 from "../images/s3";
import _ from "lodash";
import slugify from "slugify";

export const CreateChallenge = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  try {
    const {
      images,
        start_date,
        end_date,
        ...proprieties
    } = args.challenge;

    const challenge_post = {
      ...proprieties,
      start_date: !_.isEmpty(start_date) ? start_date.formatted : null,
      end_date: !_.isEmpty(end_date) ? end_date.formatted : null,
      slug: slugify(proprieties.name).toLowerCase()
    };
    const result = await txc.run(
      `
      MERGE (g:Challenge { uuid: randomUUID() })
      SET g += $challenge
      SET g.start_date = datetime($challenge.start_date)
      SET g.end_date = datetime($challenge.end_date)
      RETURN g
      `,
      {
        challenge: challenge_post,
      }
    );

    const challenge = result.records[0].get("g").properties;

    for (let image_upload of images) {
      const image_uploaded = await S3.upload(image_upload);
      await txc.run(
        `
        MATCH (g:Challenge {uuid: $uuid})
        CREATE (i:Image $image)
        CREATE (i)<-[r:HAS_IMAGE]-(g)
        RETURN r
        `,
        {
          uuid: challenge.uuid,
          image: image_uploaded,
        }
      );
    }

    await txc.commit();
    return challenge;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
};

const getChallengeByUUID = async (txc, uuid) => {
  const result = await txc.run(
    `MATCH (c:Challenge) WHERE c.uuid = $uuid RETURN c`,
    { uuid }
  );

  if (result.records.length >= 1) {
    return result.records[0].get("c").properties;
  }
};

export const UpdateChallenge = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  try {
    const challenge = getChallengeByUUID(txc, args.uuid);

    const {
      images,
        start_date,
        end_date,
        ...proprieties
    } = args.challenge;

    const challenge_post = {
      ...proprieties,
      start_date: !_.isEmpty(start_date) ? start_date.formatted : null,
      end_date: !_.isEmpty(end_date) ? end_date.formatted : null,
      slug: slugify(proprieties.name).toLowerCase()
    };


    const result = await txc.run(
      `
      MATCH (g:Challenge { uuid: $uuid })
      SET g += $challenge
      SET g.start_date = datetime($challenge.start_date)
      SET g.end_date = datetime($challenge.end_date)
      RETURN g
      `,
      {
        challenge: challenge_post,
        uuid: args.uuid,
      }
    );

    const challenge_update = result.records[0].get("g").properties;

    const uploaded_images = images.filter((i) => !!i);
    if (uploaded_images.length > 0) {
      await txc.run(
        `
        MATCH (g:Challenge {uuid: $uuid})-[r:HAS_IMAGE]->()
        DELETE r
        `,
        { uuid: args.uuid }
      );
      for (let image_upload of uploaded_images) {
        const image_uploaded = await S3.upload(image_upload);
        await txc.run(
          `
          MATCH (g:Challenge {uuid: $uuid})
          CREATE (i:Image $image)
          CREATE (i)<-[r:HAS_IMAGE]-(g)
          RETURN r
          `,
          {
            uuid: args.uuid,
            image: image_uploaded,
          }
        );
      }
    }

    await txc.commit();
    return challenge_update;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
};
