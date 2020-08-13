/*eslint react-hooks/rules-of-hooks: 0*/

import Base64 from "./base64.js";

/**
 * Licensed to Neo Technology under one or more contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership. Neo Technology licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You
 * may obtain a copy of the License at
#
 * http://www.apache.org/licenses/LICENSE-2.0
#
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default function($, $content) {
  var COPY_COM_PUBLIC_LINK,
    DROPBOX_PRIVATE_API_BASE_URL,
    DROPBOX_PRIVATE_BASE_URL,
    DROPBOX_PUBLIC_BASE_URL,
    RISEUP_BASE_URL,
    VALID_GIST,
    errorMessage,
    fetchAnyUrl,
    fetchDropboxFile,
    fetchGithubFile,
    fetchGithubGist,
    fetchLocalSnippet,
    fetchPrivateDropboxFile,
    fetchPublicDropboxFile,
    getGistAndRenderPage,
    gist_uuid,
    neo4jGistFetcher,
    preview_gist_from_url,
    readSourceId,
    useGithubGist,
    useGithubRepoParts,
    useRestOfTheUrl;
  DROPBOX_PUBLIC_BASE_URL = "https://dl.dropboxusercontent.com/u/";
  DROPBOX_PRIVATE_BASE_URL = "https://www.dropbox.com/s/";
  DROPBOX_PRIVATE_API_BASE_URL = "https://dl.dropboxusercontent.com/s/";
  RISEUP_BASE_URL = "https://pad.riseup.net/p/";
  // RISEUP_EXPORT_POSTFIX = '/export/txt';
  COPY_COM_PUBLIC_LINK = "https://copy.com/";
  VALID_GIST = /^[0-9a-f]{5,32}\/?$/;
  getGistAndRenderPage = function(renderer, defaultSource) {
    var error, fetcher, fetchers, id, idCut, returnCount, success, successful;
    id = window.location.search;
    success = function(content, link, imagesdir) {
      var successful;
      if (successful) {
        return;
      }
      successful = true;
      returnCount++;
      renderer(content, link, imagesdir);
    };
    error = function(message) {
      console.log("Error fetching", id, message);
      returnCount++;
      if (!successful && returnCount === fetchers.length) {
        errorMessage(message, id);
      }
    };
    if (id.length < 2) {
      id = defaultSource;
    } else {
      id = id.substr(1);
      idCut = id.indexOf("&");
      if (idCut !== -1) {
        id = id.substring(0, idCut);
      }
      if (id.length > 20 && id.substring(0, 4) === "_ga=") {
        id = defaultSource;
      }
    }
    fetchers = [];
    if (window.location.hostname.indexOf("www.neo4j.org") !== -1) {
      fetchers.push(neo4jGistFetcher);
    }
    fetcher = fetchGithubGist;
    if (id.length > 8 && id.substr(0, 8) === "dropbox-") {
      fetcher = fetchPublicDropboxFile;
    } else if (id.length > 9 && id.substr(0, 9) === "dropboxs-") {
      fetcher = fetchPrivateDropboxFile;
    } else if (id.length > 7 && id.substr(0, 7) === "github-") {
      fetcher = fetchGithubFile;
    } else if (!VALID_GIST.test(id)) {
      if (id.indexOf("%3A%2F%2F") !== -1) {
        fetcher = fetchAnyUrl;
      } else {
        fetcher = fetchLocalSnippet;
      }
    }
    fetchers.push(fetcher);
    returnCount = 0;
    successful = false;
    $.each(fetchers, function() {
      this(id, success, error);
    });
  };
  readSourceId = function(event) {
    var $target;
    if (event.which !== 13 && event.which !== 9) {
      return;
    }
    event.preventDefault();
    $target = $(event.target);
    $target.blur();
    preview_gist_from_url($target.val());
  };
  preview_gist_from_url = function(url) {
    window.location.href =
      "/#!/gists/" +
      encodeURIComponent(encodeURIComponent(gist_uuid($.trim(url)))) +
      "?original_url=" +
      url;
  };
  gist_uuid = function(gist_string) {
    var baseUrl,
      baseUrls,
      internal,
      j,
      parts,
      result,
      sourceParser,
      sourceParserName,
      split;
    internal = {};
    internal["sourceParsers"] = {
      "GraphGist Portal": {
        baseUrl: "http://graphgist.neo4j.com/#!/gists/",
        parse: function(gist, parts, baseUrl) {
          return useRestOfTheUrl("", baseUrl, gist);
        }
      },
      "GitHub Gist": {
        baseUrl: "https://gist.github.com/",
        parse: function(gist, parts) {
          return useGithubGist(4, parts.length - 1, parts);
        }
      },
      "Raw GitHub Gist": {
        baseUrl: "https://gist.githubusercontent.com/",
        parse: function(gist, parts) {
          return useGithubGist(5, 4, parts);
        }
      },
      "GitHub Repository File": {
        baseUrl: "https://github.com/",
        parse: function(gist, parts) {
          return useGithubRepoParts(
            {
              branch: 6,
              path: 7
            },
            parts
          );
        }
      },
      "Raw GitHub Repository File": {
        baseUrl: [
          "https://raw.github.com/",
          "https://raw.githubusercontent.com/"
        ],
        parse: function(gist, parts) {
          return useGithubRepoParts(
            {
              branch: 5,
              path: 6
            },
            parts
          );
        }
      },
      "Public Dropbox File": {
        baseUrl: DROPBOX_PUBLIC_BASE_URL,
        parse: function(gist, parts, baseUrl) {
          return useRestOfTheUrl("dropbox-", baseUrl, gist);
        }
      },
      "Shared Private Dropbox File": {
        baseUrl: DROPBOX_PRIVATE_BASE_URL,
        parse: function(gist, parts, baseUrl) {
          return useRestOfTheUrl("dropboxs-", baseUrl, gist);
        }
      },
      "Copy.com Public Link": {
        baseUrl: COPY_COM_PUBLIC_LINK,
        parse: function(gist, parts, baseUrl) {
          return useRestOfTheUrl("copy-", baseUrl, gist);
        }
      },
      "Riseup Pad": {
        baseUrl: RISEUP_BASE_URL,
        parse: function(gist, parts) {
          var pad;
          if (parts.length < 5) {
            return {
              error: "No pad id in the URL."
            };
          }
          pad = parts[4];
          if (pad.length < 1) {
            return {
              error: "Missing pad id in the URL."
            };
          }
          return {
            id: "riseup-" + pad
          };
        }
      },
      Etherpad: {
        baseUrl: [
          "https://beta.etherpad.org/",
          "https://piratepad.ca/p/",
          "https://factor.cc/pad/p/",
          "https://pad.systemli.org/p/",
          "https://pad.fnordig.de/p/",
          "https://notes.typo3.org/p/",
          "https://pad.lqdn.fr/p/",
          "https://pad.okfn.org/p/",
          "https://beta.publishwith.me/p/",
          "https://tihlde.org/etherpad/p/",
          "https://tihlde.org/pad/p/",
          "https://etherpad.wikimedia.org/p/",
          "https://etherpad.fr/p/",
          "https://piratenpad.de/p/",
          "https://bitpad.co.nz/p/",
          "http://beta.etherpad.org/",
          "http://notas.dados.gov.br/p/",
          "http://free.primarypad.com/p/",
          "http://board.net/p/",
          "https://pad.odoo.com/p/",
          "http://pad.planka.nu/p/",
          "http://qikpad.co.uk/p/",
          "http://pad.tn/p/",
          "http://lite4.framapad.org/p/",
          "http://pad.hdc.pw/p/"
        ],
        parse: function(gist, parts, baseUrl) {
          var baseParts, basePrefix, pad, prefix;
          if (gist.length <= baseUrl.length) {
            return {
              error: "No pad id in the URL."
            };
          }
          baseParts = gist.split("/");
          pad = parts[baseParts.length - 1];
          if (pad.length < 1) {
            return {
              error: "Missing pad id in the URL."
            };
          }
          basePrefix = gist.indexOf("https") === 0 ? "eps" : "ep";
          prefix = "";
          if (gist.indexOf("/p/") !== -1) {
            prefix = "p";
          }
          if (gist.indexOf("/pad/p/") !== -1) {
            prefix = "pp";
          } else if (gist.indexOf("/etherpad/p/") !== -1) {
            prefix = "ep";
          }
          prefix = basePrefix + prefix + "-";
          return {
            id: prefix + baseParts[2] + "-" + pad
          };
        }
      }
    };
    gist_uuid = void 0;
    if (gist_string.indexOf("/") !== -1) {
      if (gist_string.indexOf("#") !== -1) {
        split = gist_string.split("#");
        if (split[1].indexOf("/") === -1) {
          gist_uuid = split[0];
        }
      }
      parts = gist_string.split("/");
      for (sourceParserName in internal.sourceParsers) {
        sourceParser = internal.sourceParsers[sourceParserName];
        baseUrls = sourceParser.baseUrl;
        if (!Array.isArray(baseUrls)) {
          baseUrls = [baseUrls];
        }
        j = 0;
        while (j < baseUrls.length) {
          baseUrl = baseUrls[j];
          if (gist_string.indexOf(baseUrl) === 0) {
            result = sourceParser.parse(gist_string, parts, baseUrl);
            if ("error" in result && result.error) {
              errorMessage(
                'Error when parsing "' +
                  gist_string +
                  '" as a ' +
                  sourceParserName +
                  ".\n" +
                  result.error
              );
            } else if ("id" in result) {
              return result.id;
            }
            return;
          }
          j++;
        }
      }
      if (gist_string.indexOf("?") !== -1) {
        gist_uuid = gist_string.split("?").pop();
      } else {
        if (gist_string.indexOf("://") !== -1) {
          gist_uuid = gist_string;
        } else {
          errorMessage(
            'Do not know how to parse "' +
              gist_string +
              '" as a DocGist source URL.'
          );
        }
      }
    }
    return gist_uuid;
  };
  fetchGithubGist = function(gist, success, error) {
    var url;
    if (!VALID_GIST.test(gist)) {
      error("The gist id is malformed: " + gist);
      return;
    }
    url = "https://api.github.com/gists/" + gist.replace("/", "");
    $.ajax({
      url: url,
      success: function(data) {
        var content, file, link;
        file = data.files[Object.keys(data.files)[0]];
        content = file.content;
        link = data.html_url;
        success(content, link);
      },
      dataType: "json",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  fetchGithubFile = function(gist, success, error) {
    var branch, decoded, parts, pathPartsIndex, url;
    gist = gist.substr(7);
    decoded = decodeURIComponent(gist);
    parts = decoded.split("/");
    branch = "master";
    pathPartsIndex = 3;
    if (decoded.indexOf("/contents/") !== -1) {
      window.location.href =
        "?github-" + encodeURIComponent(decoded.replace("/contents/", "//"));
      return;
    }
    if (parts.length >= 4 && parts[3] === "") {
      branch = parts[2];
      pathPartsIndex++;
    }
    url =
      "https://api.github.com/repos/" +
      parts[0] +
      "/" +
      parts[1] +
      "/contents/" +
      parts.slice(pathPartsIndex).join("/");
    $.ajax({
      url: url,
      data: {
        ref: branch
      },
      success: function(data) {
        var content, imagesdir, link;
        content = Base64.decode(data.content);
        link = data.html_url;
        imagesdir =
          "https://raw.github.com/" +
          parts[0] +
          "/" +
          parts[1] +
          "/" +
          branch +
          "/" +
          data.path.substring(0, -data.name.length);
        success(content, link, imagesdir);
      },
      dataType: "json",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  fetchPublicDropboxFile = function(id, success, error) {
    id = id.substr(8);
    fetchDropboxFile(id, success, error, DROPBOX_PUBLIC_BASE_URL);
  };
  fetchPrivateDropboxFile = function(id, success, error) {
    id = id.substr(9);
    fetchDropboxFile(id, success, error, DROPBOX_PRIVATE_API_BASE_URL);
  };
  fetchDropboxFile = function(id, success, error, baseUrl) {
    var url;
    url = baseUrl + decodeURIComponent(id);
    $.ajax({
      url: url,
      success: function(data) {
        success(data, url);
      },
      dataType: "text",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  fetchAnyUrl = function(id, success, error) {
    var url;
    url = decodeURIComponent(id);
    $.ajax({
      url: url,
      success: function(data) {
        success(data, url);
      },
      dataType: "text",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  neo4jGistFetcher = function(id, success, error) {
    var url;
    url = "http://www.neo4j.org/api/graphgist?" + id;
    $.ajax({
      url: url,
      success: function(data, status, res) {
        var source;
        source = res.getResponseHeader("GraphGist-Source");
        success(data, source || url);
      },
      dataType: "text",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  useGithubGist = function(minLength, index, parts) {
    var id;
    if (parts.length < minLength) {
      return {
        error: "No gist id in the URL."
      };
    }
    id = parts[index];
    if (!VALID_GIST.test(id)) {
      return {
        error: "No valid gist id in the url."
      };
    }
    return {
      id: id
    };
  };
  useGithubRepoParts = function(spec, parts) {
    return {
      id:
        "github-" +
        parts[3] +
        "/" +
        parts[4] +
        "//" +
        parts.slice(spec.path).join("/")
    };
  };
  useRestOfTheUrl = function(prefix, baseUrl, gist) {
    if (gist.length <= baseUrl.length) {
      return {
        error: "Missing content in the URL."
      };
    }
    return {
      id: prefix + gist.substr(baseUrl.length)
    };
  };
  fetchLocalSnippet = function(id, success, error) {
    var url;
    url = "./gists/" + id + ".adoc";
    $.ajax({
      url: url,
      success: function(data) {
        var link;
        link =
          "https://github.com/neo4j-contrib/graphgist/tree/master/gists/" +
          id +
          ".adoc";
        success(data, link);
      },
      dataType: "text",
      error: function(xhr, status, errorMessage) {
        error(errorMessage);
      }
    });
  };
  errorMessage = function(message, gist) {
    var messageText;
    messageText = void 0;
    if (gist) {
      messageText =
        'Something went wrong fetching the GraphGist "' +
        gist +
        '":<p>' +
        message +
        "</p>";
    } else {
      messageText = "<p>" + message + "</p>";
    }
    $content.html(
      '<div class="alert alert-block alert-error"><h4>Error</h4>' +
        messageText +
        "</div>"
    );
  };
  return {
    getGistAndRenderPage: getGistAndRenderPage,
    readSourceId: readSourceId,
    preview_gist_from_url: preview_gist_from_url,
    gist_uuid: gist_uuid
  };
}
