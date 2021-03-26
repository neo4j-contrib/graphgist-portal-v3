import { getGraphGistByUUID } from "./utils";
import { neo4jgraphql } from "neo4j-graphql-js";
import { createDatabase, runCypherOnDatabase }  from "neo4j-temp-db";

import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

export const getGraphGistCandidate = async (obj, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();
  const { uuid: graphGistUUID } = args;

  try {
    const graphGist = await getGraphGistByUUID(txc, graphGistUUID);
    if (!graphGist) {
      throw new Error("GraphGist not found");
    }

    const result = await txc.run(
      `
      MATCH (g:GraphGist {uuid: $uuid})<-[:IS_VERSION]-(c:GraphGistCandidate)
      RETURN c
    `,
      { uuid: graphGistUUID }
    );

    let candidateUUID;
    if (result.records.length > 0) {
      await txc.commit();
      candidateUUID = result.records[0].get("c").properties.uuid;
    } else {
      candidateUUID = uuidv4();
      const createResult = await txc.run(
        `
        MATCH (g:GraphGist {uuid: $uuid})
        MERGE (c:GraphGistCandidate)-[r:IS_VERSION]->(g)
        SET c = g
        SET c.uuid = $candidateUUID
        WITH c, g

        MATCH (g)<-[r:WROTE]-(p)
        WITH collect(p) as endNodes, c, g
        FOREACH(pp in endNodes | CREATE (c)<-[:WROTE]-(pp))
        WITH c, g

        MATCH (g)-[r:FOR_CHALLENGE]->(p)
        WITH collect(p) as endNodes, c, g
        FOREACH(pp in endNodes | CREATE (c)-[:FOR_CHALLENGE]->(pp))
        WITH c, g

        MATCH (g)-[r:FOR_INDUSTRY]->(p)
        WITH collect(p) as endNodes, c, g
        FOREACH(pp in endNodes | CREATE (c)-[:FOR_INDUSTRY]->(pp))
        WITH c, g

        MATCH (g)-[r:FOR_USE_CASE]->(p)
        WITH collect(p) as endNodes, c, g
        FOREACH(pp in endNodes | CREATE (c)-[:FOR_USE_CASE]->(pp))
        WITH c, g

        MATCH (g)-[r:HAS_IMAGE]->(p)
        WITH collect(p) as endNodes, c, g
        FOREACH(pp in endNodes | CREATE (c)-[:HAS_IMAGE]->(pp))
        WITH c, g

        RETURN c
      `,
        {
          uuid: graphGistUUID,
          candidateUUID,
        }
      );
      await txc.commit();
    }

    return neo4jgraphql(obj, { uuid: candidateUUID }, context, info);
  } catch (error) {
    console.error(error);
    await txc.rollback();
  } finally {
    await session.close();
  }

  return null;
};

const host_for_version = {
  "1.9": "neo4j-console-19.herokuapp.com",
  "2.0": "neo4j-console-20.herokuapp.com",
  "2.1": "neo4j-console-21.herokuapp.com",
  "2.2": "neo4j-console-22.herokuapp.com",
  "2.3": "neo4j-console-23.herokuapp.com",
  "3.0": "neo4j-console-30.herokuapp.com",
  "3.1": "neo4j-console-31.herokuapp.com",
  "3.2": "neo4j-console-32.herokuapp.com",
  "3.3": "neo4j-console-33.herokuapp.com",
  "3.4": "neo4j-console-34.herokuapp.com",
  "3.5": "neo4j-console-35.herokuapp.com", // default
};

const default_version = host_for_version["3.5"];

const console_request = async (type, neo4j_version, cypher, session_id) => {
  const console_version_url =
    host_for_version[neo4j_version] || default_version;
  const url = `http://${console_version_url}/console/${type}`;
  return await fetch(url, {
    method: "post",
    body: cypher,
    headers: {
      "X-Session": session_id,
    },
  });
};

export const getConsoleSessionId = async (obj, args, context, info) => {
  const tempDatabase = await createDatabase();
  return tempDatabase;
};

export const queryConsole = async (obj, args, context, info) => {
  const allowed_versions = ["3.5", "4.1", "4.2"];
  let neo4j_version = args.neo4j_version || "3.5";
  if (allowed_versions.indexOf("neo4j_version") < 0) {
    neo4j_version = allowed_versions[0];
  }
  const result = await runCypherOnDatabase(args.cypher, args.session_id, neo4j_version)
  return JSON.stringify(result);
};
