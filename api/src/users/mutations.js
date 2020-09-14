import { AuthenticationError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import { neo4jgraphql } from "neo4j-graphql-js";
import { auth0Verify, getUser } from "../auth";

export const UpdateUser = async (obj, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();
  try {
    const profile = args.user;
    const user = await context.user;

    const result = await txc.run(
      `
      MATCH (u:User {uuid: $uuid})
      MERGE (u)-[:IS_PERSON]->(p:Person)
      SET u += $user
      SET p += $person
      RETURN u, p
    `,
      {
        uuid: user.uuid,
        user: {
          name: profile.name,
          twitter_username: profile.twitter_username,
          email: profile.email,
        },
        person: {
          name: profile.name,
          twitter_username: profile.twitter_username,
          email: profile.email,
          tshirt_size: profile.tshirt_size,
          tshirt_size_other: profile.tshirt_size_other,
        },
      }
    );
    await txc.commit();
    return neo4jgraphql(obj, { uuid: user.uuid }, context, info);
  } catch (error) {
    console.error(error);
  }

  return null;
};


export const Authenticate = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  try {
    const user = await auth0Verify(args.token);
    const [provider, uid] = user.sub.split("|");

    const result = await txc.run(
      `MATCH (u:User) WHERE (u.provider = $provider AND u.uid = $uid) OR u.uid = '${provider}|${uid}' OR u.email = $email RETURN u`,
      {
        provider: provider,
        uid: uid,
        email: user.email,
      }
    );

    const uuid = uuidv4();
    const uniq = uuid.split('-')[0];

    if (result.records.length === 0) {
      const createUser = await txc.run(
        `CREATE (u:User {
        uuid: $uuid,
        uid: $uid,
        password: $password,
        username: $username,
        email: $email,
        name: $name,
        image: $image,
        provider: $provider
      })
      CREATE (p:Person {
        uuid: $uuidPerson,
        uid: $uuidPerson,
        slug: $username,
        email: $email,
        name: $name,
        image: $image
      })
      CREATE (u)-[r:IS_PERSON]->(p)
      RETURN u, r, p`,
        {
          uid: user.sub,
          provider,
          uuidPerson: uuidv4(),
          uuid: uuid,
          password: user.aud,
          username: `${user.nickname}-${uniq}`,
          email: user.email,
          name: user.name,
          image: user.picture,
        }
      );
      await txc.commit();
      return createUser.records[0].get("u").properties;
    } else {
      await txc.commit();
      return result.records[0].get("u").properties;
    }
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw new AuthenticationError("Unable to retrieve user");
  } finally {
    await session.close();
  }

  return null;
};
