import { createTestClient } from "./tests.js";

describe("graphql endpoint", () => {
  const { query } = createTestClient();

  test("can query graphgist", async () => {
    const res = await query({
      query: `
        {
          GraphGist(first: 10) {
            title
          }
        }
      `,
    });
    expect(res).toMatchSnapshot();
  });
});
