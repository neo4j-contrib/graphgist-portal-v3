/* eslint no-mixed-operators: 0 */

import $ from "jquery";
import _ from "underscore";
import Gist from "./Gist";
import Neod3Renderer from "./Neod3Renderer";
import CypherConsole from "./console";
import DotWrapper from "./dot";
import CodeMirror from "./CodeMirror";
import jqueryMutate from "./jquery/mutate";
import { renderTable as cypherRenderTable } from "./cypher.datatable";

import "./jquery/jquery.dataTables";

jqueryMutate($);

const CONSOLE_VERSIONS = {
  local: "http://localhost:8080/",
  "1.9": "http://neo4j-console-19.herokuapp.com/",
  "2.0.0-M06": "http://neo4j-console-20m06.herokuapp.com/",
  "2.0.0-RC1": "http://neo4j-console-20rc1.herokuapp.com/",
  "2.1": "http://neo4j-console-21.herokuapp.com/",
  "2.2": "http://neo4j-console-22.herokuapp.com/",
  "2.3": "http://neo4j-console-23.herokuapp.com/",
  "3.0": "http://neo4j-console-30.herokuapp.com/",
  "3.1": "http://neo4j-console-31.herokuapp.com/",
  "3.2": "http://neo4j-console-32.herokuapp.com/",
  "3.3": "http://neo4j-console-33.herokuapp.com/",
  "3.4": "http://neo4j-console-34.herokuapp.com/",
  "3.5": "http://neo4j-console-35.herokuapp.com/", // default
};
const DEFAULT_VERSION = "3.5";

$.fn.goTo = function () {
  $("html, body").animate(
    {
      scrollTop: $(this).offset().top - 60 + "px",
    },
    "fast"
  );
  return this;
};

const GraphGist = function (options, graphgist_cached_queries) {
  var $I,
    $QUERY_ERROR_LABEL,
    $QUERY_MESSAGE,
    $QUERY_OK_LABEL,
    $QUERY_TOGGLE_BUTTON,
    $RESULT_TOGGLE_BUTTON,
    $TABLE_CONTAINER,
    $TOGGLE_BUTTON,
    $VISUALIZATION,
    $VISUALIZATION_ICONS,
    $WRAPPER,
    $console_template,
    $content,
    $gistId,
    COLLAPSE_ICON,
    EXPAND_ICON,
    HAS_ERRORS,
    VISUALIZATION_HEIGHT,
    consolr,
    content_id,
    createQueryResultButton,
    current_display_result_tab_name,
    display_result_section,
    executeQueries,
    findQuery,
    find_all_next_globally,
    find_between,
    find_next_globally,
    // formUrl,
    gist,
    handleSelection,
    initAndGetHeading,
    most_recent_visulization_number,
    neod3Renderer,
    postProcessPage,
    postProcessRendering,
    querySearchParams,
    renderContent,
    renderGraph,
    renderTable,
    replaceNewlines,
    toggler;
  HAS_ERRORS = false;
  $WRAPPER = $('<div class="query-wrapper" />');
  COLLAPSE_ICON = "ui large compress icon fi-arrows-compress";
  EXPAND_ICON = "ui large expand icon fi-arrows-expand";
  $QUERY_OK_LABEL = $(
    '<span class="label label-success query-info">Test run OK</span>'
  );
  $QUERY_ERROR_LABEL = $(
    '<span class="label label-important query-info">Test run Error</span>'
  );
  $TOGGLE_BUTTON = $(
    '<span data-toggle="tooltip"><i class="' + COLLAPSE_ICON + '"></i></span>'
  );
  $QUERY_TOGGLE_BUTTON = $TOGGLE_BUTTON
    .clone()
    .addClass("query-toggle")
    .attr("title", "Show/hide query.");
  $RESULT_TOGGLE_BUTTON = $TOGGLE_BUTTON
    .clone()
    .addClass("result-toggle")
    .attr("title", "Show/hide result.");
  $QUERY_MESSAGE = $("<pre/>").addClass("query-message");
  $VISUALIZATION = $("<div/>").addClass("visualization");
  VISUALIZATION_HEIGHT = 400;
  // DEFAULT_SOURCE = 'github-neo4j-contrib%2Fgists%2F%2Fmeta%2FHome.adoc';
  $VISUALIZATION_ICONS = $(
    '<div class="visualization-icons"><i class="ui large expand icon fi-arrows-expand fullscreen-icon" title="Toggle fullscreen mode"></i></div>'
  );
  $I = $("<i/>");
  neod3Renderer = new Neod3Renderer();
  var teardown = () => {};
  $content = void 0;
  $gistId = void 0;
  consolr = void 0;
  content_id = "gist-body";
  $content = $("#" + content_id);
  $gistId = $("#gist-id");
  gist = new Gist($, $content);
  $gistId.keydown(gist.readSourceId);
  $console_template = $("#console-template");
  querySearchParams = function () {
    var searchParams;
    searchParams = {};
    window.location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        searchParams[item.split("=")[0]] = item.split("=")[1];
      });
    return searchParams;
  };
  renderContent = function () {
    var consoleUrl, version;
    version = postProcessPage();
    consoleUrl =
      CONSOLE_VERSIONS[version in CONSOLE_VERSIONS ? version : DEFAULT_VERSION];
    if (querySearchParams()["use_test_console_server"] === "true") {
      consoleUrl = "http://neo4j-console-test.herokuapp.com/";
    }
    if (
      typeof graphgist_cached_queries !== "undefined" &&
      graphgist_cached_queries !== null
    ) {
      return executeQueries(function () {}, postProcessRendering);
    } else {
      return CypherConsole(
        {
          url: consoleUrl,
          neo4j_version: version,
          contentId: content_id,
          $console_template: $console_template,
        },
        function (conslr) {
          if (typeof conslr !== "undefined") {
            consolr = conslr;
            return typeof consolr.establishSession === "function"
              ? consolr.establishSession().done(function () {
                  return executeQueries(function () {}, postProcessRendering);
                })
              : void 0;
          }
        }
      );
    }
  };
  postProcessRendering = function () {
    var $status;
    $status = $("#status");
    if (HAS_ERRORS) {
      $status.text("Errors.");
      $status.addClass("label-important");
    } else {
      $status.text("No Errors.");
      $status.addClass("label-success");
    }
    return DotWrapper($).scan();
  };
  // formUrl = function (url, title, author, twitter) {
  //   return (
  //     "https://docs.google.com/forms/d/1blgZoRZ6vLbpnqdJx3b5c4BkO_mgmD-hgdRQTMm7kc4/viewform?entry.718349727=" +
  //     encodeURIComponent(url) +
  //     "&entry.1981612324=" +
  //     encodeURIComponent(
  //       title.length > 18 ? title.substr(0, title.length - 18) : title
  //     ) +
  //     "&entry.1328778537=" +
  //     encodeURIComponent(author) +
  //     "&entry.507462214=" +
  //     encodeURIComponent(twitter)
  //   );
  // };
  initAndGetHeading = function () {
    var heading, headingText;
    headingText = "Neo4j GraphGist";
    heading = $("h1").first();
    if (!heading.length) {
      heading = $("h2").first();
    }
    if (heading.length) {
      headingText = heading.text();
    }
    return headingText;
  };
  postProcessPage = function () {
    // var $footer,
    var  $meta,
      author,
      // authorHtml,
      number,
      regex,
      tags,
      twitter,
      version;
    $meta = $("#metadata", $content);
    version = $meta.attr("version");
    tags = $meta.attr("tags");
    author = $meta.attr("author");
    twitter = $meta.attr("twitter");
    regex = /^(\d+)\.(\d+)\.\d+$/;
    if (typeof version !== "undefined" && version.match(regex)) {
      version = version.replace(regex, "$1.$2");
    }
    if (tags === "{tags}") {
      tags = false;
    }
    if (author === "{author}") {
      author = false;
    }
    if (twitter === "{twitter}") {
      twitter = false;
    }
    if (typeof version === "undefined" || !(version in CONSOLE_VERSIONS)) {
      version = DEFAULT_VERSION;
    }
    // $footer = $("footer");
    // if (tags) {
    //   $footer.prepend('<i class="icon-tags"></i> Tags <em>' + tags + "</a> ");
    // }
    if (twitter) {
      twitter = twitter.replace("@", "");
    }
    if (twitter && !author) {
      author = twitter;
    }
    // if (author) {
    //   authorHtml =
    //     "<i class=" +
    //     (twitter ? '"icon-twitter-sign"' : '"icon-user"') +
    //     "></i> Author ";
    //   if (twitter) {
    //     authorHtml +=
    //       '<a target="_blank" href="http://twitter.com/' + twitter + '">';
    //   }
    //   authorHtml += author;
    //   if (twitter) {
    //     authorHtml += "</a>";
    //   }
    //   authorHtml += " ";
    //   // $footer.prepend(authorHtml);
    // }
    // $footer.prepend(
    //   '<i class="icon-check"></i><a target="_blank" title="Submit an original GraphGist and get a Neo4j t-shirt" href="' +
    //     formUrl(window.location.href, document.title, author, twitter) +
    //     '"> Submit</a> '
    // );
    // $footer.prepend(
    //   '<i class="icon-cogs"></i> Uses Neo4j Version <a target="_blank" href="http://docs.neo4j.org/chunked/' +
    //     version +
    //     '/cypher-query-lang.html">' +
    //     version +
    //     "</a> "
    // );
    $("h2[id]")
      .css({
        cursor: "pointer",
      })
      .click(function () {
        return (window.location.href = window.location.href.replace(
          /($|#.+?$)/,
          "#" + $(this).attr("id")
        ));
      });
    findQuery("span.hide-query", $content, function (codeElement) {
      return $(codeElement.parentNode).addClass("hide-query");
    });
    findQuery("span.setup", $content, function (codeElement) {
      return $(codeElement.parentNode).addClass("setup-query");
    });
    findQuery("span.query-output", $content, function (codeElement) {
      return $(codeElement.parentNode).data("show-output", true);
    });
    number = 0;
    $("code", $content).each(function (index, el) {
      var $el, $parent, $toggleQuery, $wrapper;
      $el = $(el);
      if ($el.hasClass("language-cypher")) {
        number++;
        $parent = $el.parent();
        $parent.addClass("with-buttons");
        $el.attr("data-lang", "cypher");
        $parent.prepend("<h5>Query " + number + "</h5>");
        $el.wrap($WRAPPER).each(function () {
          return $el.parent().data("query", $el.text());
        });
        $toggleQuery = $QUERY_TOGGLE_BUTTON.clone();
        $parent.append($toggleQuery);
        $toggleQuery.click(function () {
          var $icon, $queryMessage, $queryWrapper, action;
          $icon = $("i", this);
          $queryWrapper = $icon.parent().prevAll("div.query-wrapper").first();
          action = toggler($queryWrapper, this);
          if (action === "hide") {
            $queryMessage = $queryWrapper.nextAll("pre.query-message").first();
            $icon = $queryWrapper.nextAll("span.result-toggle").first();
            toggler($queryMessage, $icon, "hide");
          }
        });
        if ($parent.hasClass("hide-query")) {
          $wrapper = $toggleQuery.prevAll("div.query-wrapper").first();
          return toggler($wrapper, $toggleQuery, "hide");
        }
      }
    });
    $("pre code.language-cypher").addClass("cm-s-neo");
    CodeMirror.colorize(document.getElementsByClassName("language-cypher"));
    $("table").addClass("table");
    return version;
  };
  find_next_globally = function (element, selector) {
    var $current_element,
      $matching_cousins,
      $matching_siblings,
      current_element,
      i,
      len,
      ref,
      sibling;
    current_element = element;
    while (current_element) {
      $current_element = $(current_element);
      $matching_siblings = $current_element.nextAll(selector);
      if ($matching_siblings.length) {
        return $matching_siblings[0];
      }
      ref = $current_element.nextAll();
      for (i = 0, len = ref.length; i < len; i++) {
        sibling = ref[i];
        $matching_cousins = $(sibling).find(selector);
        if ($matching_cousins.length) {
          return $matching_cousins[0];
        }
      }
      current_element = $current_element.parent()[0];
    }
    return null;
  };
  find_all_next_globally = function (element, selector) {
    var $current_element, current_element, i, len, ref, result, sibling;
    current_element = element;
    result = [];
    while (current_element) {
      $current_element = $(current_element);
      result = result.concat($current_element.nextAll(selector).get());
      ref = $current_element.nextAll();
      for (i = 0, len = ref.length; i < len; i++) {
        sibling = ref[i];
        result = result.concat($(sibling).find(selector).get());
      }
      current_element = $current_element.parent()[0];
    }
    return result;
  };
  find_between = function (element1, element2, selector) {
    var element1_nexts, element2_nexts;
    element1_nexts = find_all_next_globally(element1, selector);
    element2_nexts = find_all_next_globally(element2, selector);
    if (element1_nexts.length > element2_nexts.length) {
      return _(element1_nexts).difference(element2_nexts);
    } else {
      return _(element2_nexts).difference(element1_nexts);
    }
  };
  executeQueries = function (final_success, always) {
    var $elements;
    $elements = $("div.query-wrapper");
    $elements.each(function (index, element) {
      var $element, error, statement, success;
      $element = $(element);
      statement = $element.data("query");
      success = function (data) {
        var i,
          j,
          len,
          len1,
          next_query_wrapper,
          results,
          showOutput,
          table_element,
          table_elements,
          visualization_element,
          visualization_elements;
        showOutput = $element.parent().data("show-output");
        createQueryResultButton(
          $QUERY_OK_LABEL,
          $element,
          data.result,
          !showOutput
        );
        $element.data("visualization", data["visualization"]);
        $element.data("data", data);
        next_query_wrapper = find_next_globally($element, "div.query-wrapper");
        table_elements =
          next_query_wrapper != null
            ? find_between($element, next_query_wrapper, ".result-table")
            : find_all_next_globally($element, ".result-table");
        for (i = 0, len = table_elements.length; i < len; i++) {
          table_element = table_elements[i];
          renderTable(table_element, data);
        }
        visualization_elements =
          next_query_wrapper != null
            ? find_between($element, next_query_wrapper, ".graph-visualization")
            : find_all_next_globally($element, ".graph-visualization");
        results = [];
        for (j = 0, len1 = visualization_elements.length; j < len1; j++) {
          visualization_element = visualization_elements[j];
          try {
            results.push(renderGraph(visualization_element, data));
          } catch (e) {
            console.error(e);
          }
        }
        return results;
      };
      error = function (data) {
        HAS_ERRORS = true;
        return createQueryResultButton(
          $QUERY_ERROR_LABEL,
          $element,
          data.error,
          false
        );
      };
      final_success = function () {
        if ($("p.console").length) {
          $("p.console").replaceWith($console_template.detach());
        }
        return $console_template.show();
      };
      if (
        typeof graphgist_cached_queries !== "undefined" &&
        graphgist_cached_queries !== null
      ) {
        return success(graphgist_cached_queries[index]);
      } else {
        return consolr.query(statement, success, error, final_success, always);
      }
    });
    if (
      typeof graphgist_cached_queries !== "undefined" &&
      graphgist_cached_queries !== null
    ) {
      $("p.console").hide();
    }
    if (!$elements.length) {
      return always();
    }
  };
  display_result_section = function (section_name) {
    var $element;
    $console_template.find(".result").show();
    $console_template.find(".result > *").hide();
    $element = $console_template.find(".result > ." + section_name);
    $element.show();
    return $element;
  };
  current_display_result_tab_name = function () {
    return $console_template.find(".tabs .tab.active").data("name");
  };
  $console_template.find(".run").click(function () {
    var error, statement, success;
    display_result_section("loading");
    $console_template.goTo();
    statement = $console_template.find(".cypher").val();
    success = function (data) {
      var $element, display_result_tab_name;
      display_result_tab_name = current_display_result_tab_name();
      $element = display_result_section("graph");
      renderGraph($element, data, false);
      $element = display_result_section("table");
      renderTable($element[0], data, false, {
        searching: false,
        paging: false,
      });
      return display_result_section(display_result_tab_name);
    };
    error = function (data) {
      var $element;
      $element = display_result_section("error");
      return $element.html("<pre>" + data.error + "</pre>");
    };
    return consolr.query(statement, success, error);
  });
  $console_template.find(".tabs .tab").click(function (event) {
    var $el;
    $el = $(event.target);
    $console_template.find(".tabs .tab").removeClass("active");
    $el.addClass("active");
    return display_result_section($el.data("name"));
  });
  most_recent_visulization_number = 0;
  renderGraph = function (visualization_element, data, replace) {
    var $visContainer,
      $visualizationIcons,
      $visualization_element,
      actionData,
      actions,
      contract,
      expand,
      fullscreenClick,
      iconName,
      id,
      keyHandler,
      rendererHooks,
      selectedVisualization,
      show_result_only,
      sizeChange,
      style,
      subscriptions;
    if (replace == null) {
      replace = true;
    }
    $visualization_element = $(visualization_element);
    most_recent_visulization_number++;
    id = "graph-visualization-" + most_recent_visulization_number;
    $visContainer = $VISUALIZATION.clone().attr("id", id);
    style = $visualization_element.attr("data-style");
    show_result_only =
      $visualization_element.attr("graph-mode") &&
      $visualization_element.attr("graph-mode").indexOf("result") !== -1;
    selectedVisualization = handleSelection(
      data.visualization,
      show_result_only
    );
    if (replace) {
      $visualization_element.replaceWith($visContainer);
    } else {
      $visualization_element.html("");
      $visualization_element.append($visContainer);
    }
    $visContainer.height(VISUALIZATION_HEIGHT);
    fullscreenClick = function () {
      if ($visContainer.hasClass("fullscreen")) {
        $("body").unbind("keydown", keyHandler);
        return contract();
      } else {
        expand();
        return $("body").keydown(keyHandler);
      }
    };
    expand = function () {
      $visContainer.addClass("fullscreen");
      $visContainer.height("100%");
      return typeof subscriptions.expand === "function"
        ? subscriptions.expand()
        : void 0;
    };
    contract = function () {
      $visContainer.removeClass("fullscreen");
      $visContainer.height(400);
      return typeof subscriptions.contract === "function"
        ? subscriptions.contract()
        : void 0;
    };
    sizeChange = function () {
      return typeof subscriptions.sizeChange === "function"
        ? subscriptions.sizeChange()
        : void 0;
    };
    keyHandler = function (event) {
      if ("which" in event && event.which === 27) {
        return contract();
      }
    };
    if (data) {
      $visualization_element.data("visualization", data);
      rendererHooks = neod3Renderer.render(
        id,
        $visContainer,
        selectedVisualization,
        style
      );
      subscriptions =
        "subscriptions" in rendererHooks ? rendererHooks["subscriptions"] : {};
      actions = "actions" in rendererHooks ? rendererHooks["actions"] : {};
      teardown =
        "teardown" in rendererHooks ? rendererHooks["teardown"] : () => {};
      $visualizationIcons = $VISUALIZATION_ICONS
        .clone()
        .appendTo($visContainer);
      $visualizationIcons.children("i.fullscreen-icon").click(fullscreenClick);
      for (iconName in actions) {
        actionData = actions[iconName];
        $I.clone()
          .addClass(iconName)
          .attr("title", actionData.title)
          .appendTo($visualizationIcons)
          .click(actionData.func);
      }
      $visContainer.mutate("width", sizeChange);
    } else {
      $visContainer
        .text("There is no graph to render.")
        .addClass("alert-error");
    }
    return $visContainer;
  };
  handleSelection = function (data, show_result_only) {
    var hasSelectedRels, i, len, link, links, node, nodes, ref;
    if (!show_result_only) {
      return data;
    }
    links = [];
    nodes = (function () {
      var i, len, ref, results;
      ref = data.nodes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (node.selected) {
          results.push(node);
        }
      }
      return results;
    })();
    hasSelectedRels =
      data.links.filter(function (link) {
        return link.selected;
      }).length > 0;
    ref = data.links;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (
        link.selected ||
        (!hasSelectedRels &&
          data.nodes[link.source].selected &&
          data.nodes[link.target].selected)
      ) {
        links.push(link);
      }
    }
    return {
      nodes: nodes,
      links: links,
    };
  };
  $TABLE_CONTAINER = $("<div/>").addClass("result-table");
  renderTable = function (table_element, data, replace, options) {
    var $table_container, $table_element;
    if (replace == null) {
      replace = true;
    }
    if (options == null) {
      options = {};
    }
    $table_element = $(table_element);
    $table_container = $TABLE_CONTAINER.clone();
    if (replace) {
      $table_element.replaceWith($table_container);
    } else {
      $table_element.html("");
      $table_element.append($table_container);
    }
    if (!cypherRenderTable($table_container, data, options)) {
      return $table_container
        .text("Couldn't render the result table.")
        .addClass("alert-error");
    }
  };
  replaceNewlines = function (str) {
    if (str) {
      return str.replace(/\\n/g, '&#013;');
    } else {
      return str;
    }
  };
  createQueryResultButton = function ($labelType, $wrapper, message, hide) {
    var $button, $label, $message;
    $label = $labelType.clone();
    $button = $RESULT_TOGGLE_BUTTON.clone();
    $wrapper.after($label).after($button);
    $message = $QUERY_MESSAGE.clone().text(replaceNewlines(message));
    toggler($message, $button, hide ? "hide" : "show");
    $button.click(function () {
      return toggler($message, $button);
    });
    return $wrapper.after($message);
  };
  toggler = function ($target, button, action) {
    var $icon, stateIsExpanded;
    $icon = $("i", button);
    stateIsExpanded = $icon.hasClass(COLLAPSE_ICON);
    if (
      (action && action === "hide") ||
      (action === void 0 && stateIsExpanded)
    ) {
      $target.hide();
      $icon.removeClass(COLLAPSE_ICON).addClass(EXPAND_ICON);
      return "hide";
    } else {
      $target.show();
      $icon.removeClass(EXPAND_ICON).addClass(COLLAPSE_ICON);
      return "show";
    }
  };
  findQuery = function (selector, context, operation) {
    $(selector, context).each(function () {
      $(this)
        .nextAll("div.listingblock")
        .children("div")
        .children("pre.highlight")
        .children("code.language-cypher")
        .first()
        .each(function () {
          operation(this);
        });
    });
  };
  if (typeof options !== "undefined") {
    options = {};
  }
  if (typeof options.preProcess !== "undefined") {
    options.preProcess = true;
  }
  if ("support" in $) {
    $.support.cors = true;
  }
  return {
    renderContent: renderContent,
    initAndGetHeading,
    teardown: teardown,
  };
};

export default GraphGist;
