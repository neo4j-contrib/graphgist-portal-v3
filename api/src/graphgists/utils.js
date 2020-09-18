import Asciidoctor from "asciidoctor";
import {GraphQLError} from "graphql";

const fetch = require('node-fetch');

export async function getGraphGistByUUID(txc, uuid) {
    const result = await txc.run(
        `MATCH (g:GraphGist) WHERE g.uuid = $uuid RETURN g`,
        {uuid}
    );

    if (result.records.length >= 1) {
        return result.records[0].get("g").properties;
    }
}

export function convertAsciiDocToHtml(asciidoc) {
    const asciidoctor = Asciidoctor();
    const rawHtml = asciidoctor.convert(asciidoc, {
        toc: "macro",
        "toc-placement": "macro",
        "env-graphgist": true,
    });
    if (rawHtml === '') {
        throw new GraphQLError("AsciiDoc is empty, it is required.");
    }
    const matches = rawHtml.match(/(?:href|src)=["'](https?:\/\/[^"']+)["']/im);
    if (matches.length === 0) {
        return rawHtml;
    } else {
        for (let index = 0; index < matches.length; index++) {
            const match = matches[index]
            if (!match.includes("href") && !match.includes("src")) {
                const response = await fetch(match);
                if (!response.ok) {
                    throw new GraphQLError("We could not verify that " + match + " is a correct url");
                }
            }
        }
    }
    return rawHtml;
}
