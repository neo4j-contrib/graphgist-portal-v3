import Asciidoctor from "asciidoctor";
import _ from "lodash";
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

export async function getCandidateByUUID(txc, uuid) {
  const result = await txc.run(
    `MATCH (g:GraphGistCandidate) WHERE g.uuid = $uuid RETURN g`,
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

const loading_image_tag = '<span class="loading-img"></span>';

const COMMENT_REPLACEMENTS = {
  console: '<p class="console"><span class="loading">' + loading_image_tag + ' Running queries, preparing the console!</span></p>',

  graph_result: '<h5 class="graph-visualization" data-style="{style}" graph-mode="result">Loading graph...' + loading_image_tag + '</h5>',
  graph: '<h5 class="graph-visualization" data-style="{style}">Loading graph...' + loading_image_tag + '</h5>',
  table: '<h5 class="result-table">Loading table...' + loading_image_tag + '</h5>',

  hide: '<span class="hide-query"></span>',
  setup: '<span class="setup"></span>',
  output: '<span class="query-output"></span>'
};

export async function convertAsciiDocToHtml(asciidoc) {
  const asciidoctor = Asciidoctor();

  _.toPairs(COMMENT_REPLACEMENTS).forEach(([tag, replacement]) => {
      const prefix = ['graph_result', 'graph'].indexOf(tag) >= 0 ? "\n\n[subs=\"attributes\"]\n" : "";
      const regex = new RegExp(`^\/\/\s*${tag}`, 'gm');
      asciidoc = asciidoc.replace(regex, `${prefix}++++\n${replacement}\n++++\n`);
  });

  const doc = asciidoctor.load(asciidoc);

  doc.setAttribute("toc", "macro");
  doc.setAttribute("toc-placement", "macro");
  doc.setAttribute("env-graphgist", "true");

  const attributes = doc.getAttributes();

  let rawHtml = asciidoctor.convert(asciidoc, { attributes });
  rawHtml = `${rawHtml}<span id="metadata" author="${attributes['author'] || ''}" version="${attributes['neo4j-version'] || ''}" twitter="${attributes['twitter'] || ''}" tags="${attributes['tags'] || ''}" />`;

  if (rawHtml === "") {
    throw new ValidationError(
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
              throw new ValidationError(
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
            throw new ValidationError(
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
