import Asciidoctor from "asciidoctor";

export async function getGraphGistByUUID(txc, uuid) {
  const result = await txc.run(
    `MATCH (g:GraphGist) WHERE g.uuid = $uuid RETURN g`,
    { uuid }
  );

  if (result.records.length >= 1) {
    return result.records[0].get("g").properties;
  }
}

export function convertAsciiDocToHtml(asciidoc) {
  const asciidoctor = Asciidoctor();
  return asciidoctor.convert(asciidoc, {
    toc: "macro",
    "toc-placement": "macro",
    "env-graphgist": true,
  });
}
