import { createTestClient } from "./tests.js";
import gql from "graphql-tag";

describe("graphql endpoint", () => {
  const { query, mutate } = createTestClient();

  test("can query graphgist", async () => {
    const res = await query({
      query: gql`
        {
          GraphGist(first: 10) {
            title
          }
        }
      `,
    });
    expect(res).toMatchSnapshot();
  });

  test("can preview graphgist", async () => {
    const res = await mutate({
      mutation: gql`
        mutation Preview($asciidoc: String!) {
          PreviewGraphGist(asciidoc: $asciidoc)
        }
      `,
      variables: { asciidoc: "== Testtt" },
    });
    expect(res).toMatchSnapshot();
  });
});
