import Asciidoctor from "asciidoctor";
import ValidationError from "../ValidationError";

const fetch = require("node-fetch");

export async function getGraphGistByUUID(txc, uuid) {
  const result = await txc.run(
    `MATCH (g:GraphGist) WHERE g.uuid = $uuid RETURN g`,
    { uuid }
  );

  if (result.records.length >= 1) {
    return result.records[0].get("g").properties;
  }
}

export async function convertAsciiDocToHtml(asciidoc) {
  const asciidoctor = Asciidoctor();
  const rawHtml = asciidoctor.convert(asciidoc, {
    toc: "macro",
    "toc-placement": "macro",
    "env-graphgist": true,
  });
  if (rawHtml === "") {
    return new ValidationError(
      [{ key: "asciidoc", message: "AsciiDoc is empty, it is required." }],
      "AsciiDoc is empty, it is required."
    );
  }
  const matches = rawHtml.matchAll(
    /(?:href|src)=["'](https?:\/\/[^"']+)["']/gim
  );

  if (matches.length === 0) {
    return rawHtml;
  } else {
    for (const localMatch of matches) {
      for (let index = 0; index < localMatch.length; index++) {
        const match = localMatch[index];
        if (!match.includes("href") && !match.includes("src")) {
          try {
            const response = await fetch(match);
            if (!response.ok) {
              return new ValidationError(
                [
                  {
                    key: "asciidoc",
                    message:
                      "We could not verify that " + match + " is a correct url",
                  },
                ],
                "We could not verify that " + match + " is a correct url"
              );
            }
          } catch (error) {
            return new ValidationError(
              [
                {
                  key: "asciidoc",
                  message:
                    "We could not verify that " + match + " is a correct url",
                },
              ],
              "We could not verify that " + match + " is a correct url"
            );
          }
        }
      }
    }
  }
  return rawHtml;
}
