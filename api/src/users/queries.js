import { neo4jgraphql } from "neo4j-graphql-js";

export const me = async (obj, args, context, info) => {
  try {
    const user = await context.user;
    if (user) {
      return neo4jgraphql(obj, { uuid: user.uuid }, context, info);
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};
