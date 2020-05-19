import { ApolloServer } from "apollo-server-express";
import { createTestClient as apolloCreateTestClient } from "apollo-server-testing";
import neo4j from 'neo4j-driver';
import { makeAugmentedSchema } from "neo4j-graphql-js";
import dotenv from "dotenv";
import { typeDefs } from "./graphql-schema";

dotenv.config();

const schema = makeAugmentedSchema({
  typeDefs,
  config: {
    mutation: false
  }
});

const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "neo4j"
  )
);

const server = new ApolloServer({
  context: { driver },
  schema: schema,
  mocks: true
});

export function createTestClient() {
  return apolloCreateTestClient(server);
}
