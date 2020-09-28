import Asciidoctor from "asciidoctor";
import ValidationError from "../ValidationError";

import { mathjax } from "mathjax-full/js/mathjax";
import { TeX } from "mathjax-full/js/input/tex";
import { CHTML } from "mathjax-full/js/output/chtml";
import { SVG } from "mathjax-full/js/output/svg";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";

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

export async function getGraphGistBySlug(txc, slug) {
  const result = await txc.run(
    `MATCH (g:GraphGist) WHERE g.slug = $slug RETURN g`,
    { slug }
  );

  if (result.records.length >= 1) {
    return result.records[0].get("g").properties;
  }
}

export function renderMathJax(raw_html) {
  const adaptor = liteAdaptor({ fontSize: "1em" });
  RegisterHTMLHandler(adaptor);

  const tex = new TeX({
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
  }); // packages: argv.packages.split(/\s*,\s*/)
  const chtml = new SVG({ fontCache: "none" }); // {fontURL: argv.fontURL, exFactor: argv.ex / argv.em}
  const html = mathjax.document(raw_html, { InputJax: tex, OutputJax: chtml });

  html.render();

  return adaptor.innerHTML(html.document.body);
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
