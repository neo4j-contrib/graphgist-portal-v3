/*eslint no-unused-expressions: 0*/
/*eslint no-unused-vars: 0*/
/*eslint no-throw-literal: 0*/
/*eslint no-sequences: 0*/

import $ from "jquery";

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

export default function (config, ready) {
  var $EDIT_BUTTON,
    $IFRAME,
    $IFRAME_WRAPPER,
    $PLAY_BUTTON,
    $RESIZE_BUTTON,
    $RESIZE_VERTICAL_BUTTON,
    $TOGGLE_CONSOLE_HIDE_BUTTON,
    $console_template,
    $resizeOverlay,
    RESIZE_IN_ICON,
    RESIZE_OUT_ICON,
    addConsole,
    addPlayButtons,
    consoleClass,
    consoleUrl,
    contentId,
    contentMoveSelector,
    createConsole,
    getQueryFromButton,
    getUrl,
    gist_id,
    neo4j_version;
  $IFRAME = $("<iframe/>").attr("id", "console").addClass("cypherdoc-console");
  $IFRAME_WRAPPER = $("<div/>").attr("id", "console-wrapper");
  RESIZE_OUT_ICON = "ui expand icon";
  RESIZE_IN_ICON = "ui large compress icon";
  $RESIZE_BUTTON = $(
    '<a class="resize-toggle ui icon green button fi-arrows-expand"><i class="' +
      RESIZE_OUT_ICON +
      '"></i></a>'
  );
  $RESIZE_VERTICAL_BUTTON = $(
    '<span class="resize-vertical-handle ui-resizable-handle ui-resizable-s"><span/></span>'
  );
  $PLAY_BUTTON = $(
    '<a class="run-query ui green icon button" data-toggle="tooltip" title="Execute in the console." href="#"><i class="ui play icon"></i></a>'
  );
  $EDIT_BUTTON = $(
    '<a class="edit-query ui icon button" data-toggle="tooltip" title="Edit in the console." href="#"><i class="ui edit icon"></i></a>'
  );
  $TOGGLE_CONSOLE_HIDE_BUTTON = $(
    '<a class="show-console-toggle ui icon button" data-toggle="tooltip"  title="Show or hide a Neo4j Console in order to try the examples in the GraphGist live."><i class="ui edit icon"></i> Show/Hide Live Console</a>'
  );
  $resizeOverlay = $('<div id="resize-overlay"/>');
  consoleClass = "consoleClass" in config ? config.consoleClass : "console";
  contentId = "contentId" in config ? config.contentId : "content";
  contentMoveSelector =
    "contentMoveSelector" in config ? config.contentMoveSelector : "div.navbar";
  consoleUrl = config.url;
  neo4j_version = config.neo4j_version;
  $console_template = config.$console_template;
  addConsole = function ($context, gistId, ready) {
    var $contentMoveSelector,
      $gistForm,
      $iframe,
      $iframeWrapper,
      $resizeButton,
      $resizeIcon,
      $toggleConsoleShowButton,
      $verticalResizeButton,
      url;
    url = getUrl(
      "none",
      "none",
      "\n\nUse the play/edit buttons to run the queries!"
    );
    $iframe = $IFRAME.clone().attr("src", url);
    $iframe.load(function () {
      var consolr, iframeWindow;
      iframeWindow = $iframe[0].contentWindow;
      if (!iframeWindow) {
        return;
      }
      consolr = new Consolr(gistId, neo4j_version);
      if (typeof ready === "function") {
        ready(consolr);
      }
      window.setTimeout(function () {
        var consoleLocation, err;
        try {
          if (iframeWindow.location && iframeWindow.location.href) {
            consoleLocation = iframeWindow.location.href;
            if (
              consoleLocation.indexOf("neo4j") === -1 &&
              consoleLocation.indexOf("localhost") === -1
            ) {
              $iframe.replaceWith(
                '<div class="alert alert-error"><h4>Error!</h4>The console can not be loaded. Please turn off ad blockers and reload the page!</div>'
              );
            }
          }
        } catch (_error) {
          err = _error;
        }
      }, 2000);
    });
    $context.empty();
    $iframeWrapper = $IFRAME_WRAPPER.clone();
    $iframeWrapper.append($iframe);
    $contentMoveSelector = $(contentMoveSelector).first();
    $context
      .append($iframeWrapper)
      .append('<span id="console-label" class="label">Console expanded</span>');
    $context.css("background", "none");
    $verticalResizeButton = $RESIZE_VERTICAL_BUTTON
      .clone()
      .appendTo($iframeWrapper)
      .mousedown(function (event) {
        event.preventDefault();
      });
    $iframeWrapper.resizable({
      handles: {
        s: $verticalResizeButton,
      },
      alsoResize: $context,
      minHeight: 80,
      start: function () {
        $resizeOverlay.appendTo($iframeWrapper);
      },
      stop: function (event, ui) {
        $resizeOverlay.detach();
      },
      resize: function (event, ui) {
        if (!$resizeIcon.hasClass(RESIZE_OUT_ICON)) {
          $contentMoveSelector.css("margin-top", ui.size.height + 11);
        }
      },
    });
    $gistForm = $("#gist-form");
    // contextHeight = 0;
    $resizeButton = $RESIZE_BUTTON
      .clone()
      .appendTo($iframeWrapper)
      .click(function () {
        if ($resizeIcon.hasClass(RESIZE_OUT_ICON)) {
          // contextHeight = $context.height();
          $context.height(36);
          $resizeIcon.removeClass(RESIZE_OUT_ICON).addClass(RESIZE_IN_ICON);
          $iframeWrapper.addClass("fixed-console");
          $context.addClass("fixed-console");
          $contentMoveSelector.css("margin-top", $iframeWrapper.height() + 11);
          $iframeWrapper.resizable("option", "alsoResize", null);
          $gistForm.css("margin-right", 56);
        } else {
          $context.height($iframeWrapper.height());
          $resizeIcon.removeClass(RESIZE_IN_ICON).addClass(RESIZE_OUT_ICON);
          $iframeWrapper.removeClass("fixed-console");
          $context.removeClass("fixed-console");
          $contentMoveSelector.css("margin-top", 0);
          $iframeWrapper.resizable("option", "alsoResize", $context);
          $gistForm.css("margin-right", 0);
          document.body.scrollTop = $iframeWrapper.offset().top - 100;
        }
      });
    $resizeIcon = $("i", $resizeButton);
    $toggleConsoleShowButton = $TOGGLE_CONSOLE_HIDE_BUTTON;
    $toggleConsoleShowButton.insertAfter($context);
    if (!$context.is(":visible")) {
      $toggleConsoleShowButton.addClass(
        "ui button green icon show-console-toggle-hidden-console"
      );
    }
    $toggleConsoleShowButton.click(function () {
      if ($context.is(":visible")) {
        if (!$resizeIcon.hasClass(RESIZE_OUT_ICON)) {
          $resizeButton.click();
        }
        $context.hide();
        $toggleConsoleShowButton.addClass("show-console-toggle-hidden-console");
      } else {
        $context.show();
        $toggleConsoleShowButton.removeClass(
          "show-console-toggle-hidden-console"
        );
      }
    });
  };
  addPlayButtons = function (consolr, element) {
    var fill_text_area;
    fill_text_area = function (target) {
      var $textarea, e, text;
      e = $(target).parents(".content").find(".query-wrapper")[0];
      text = e.innerText || e.textContent;
      $textarea = $console_template.find("textarea");
      $textarea.val(text);
      return $textarea[0].focus();
    };
    $("div.query-wrapper")
      .parent()
      .append(
        $PLAY_BUTTON.clone().click(function (event) {
          fill_text_area(event.target);
          $console_template.find(".run").click();
          event.preventDefault();
        })
      )
      .append(
        $EDIT_BUTTON.clone().click(function (event) {
          fill_text_area(event.target);
          event.preventDefault();
        })
      );
  };
  getQueryFromButton = function (button) {
    return $(button).prevAll("div.query-wrapper").first().data("query");
  };
  getUrl = function (database, command, message, session) {
    var url;
    url = consoleUrl;
    if (session != null) {
      url += ";jsessionid=" + session;
    }
    url += "?";
    if (database != null) {
      url += "init=" + encodeURIComponent(database);
    }
    if (command != null) {
      url += "&query=" + encodeURIComponent(command);
    }
    if (message != null) {
      url += "&message=" + encodeURIComponent(message);
    }
    if (window.neo4jVersion != null) {
      url += "&version=" + encodeURIComponent(window.neo4jVersion);
    }
    return url + "&no_root=true";
  };
  gist_id = function () {
    gist_id = $("#" + contentId).data("gist-id");
    if (gist_id == null || gist_id.length === 0) {
      throw (
        "The #" +
        contentId +
        " element is supposed to have a data-gist-id attribute.  Where is it, punk?"
      );
    }
    return gist_id;
  };
  createConsole = function (ready, elementClass, contentId) {
    var $element, consolr;
    if ($("code.language-cypher").length) {
      $element = $("p." + elementClass).first();
      if ($element.length !== 1) {
        $element = $("<p/>").addClass(elementClass);
        $("#" + contentId).append($element);
        $element.hide();
      }
      consolr = new Consolr(gist_id(), neo4j_version);
      $element.each(function () {
        var $context;
        $context = $(this);
        return typeof ready === "function" ? ready(consolr) : void 0;
      });
      addPlayButtons(consolr, $element);
    } else {
      ready();
    }
  };
  createConsole(ready, consoleClass, contentId);

  return {
    addConsole,
    getQueryFromButton,
  };
}

const Consolr = function (gistId, neo4j_version) {
  var authenticity_token,
    currently_querying,
    establishSession,
    init,
    process_query_queue,
    query,
    query_queue,
    sessionId;
  sessionId = void 0;
  query_queue = [];
  currently_querying = false;
  authenticity_token = $("meta[name=csrf-token]").attr("content");
  establishSession = function () {
    return $.ajax(process.env.REACT_APP_GRAPHQL_URI, {
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        operationName: "sessionId",
        variables: {
          neo4j_version: neo4j_version
        },
        query: "query sessionId($neo4j_version: String) { getConsoleSessionId(neo4j_version: $neo4j_version) }"
      }),
      crossDomain: true,
    }).done(function (result) {
      return (sessionId = result.data.getConsoleSessionId);
    });
  };
  init = function (params, success, error, data) {};
  process_query_queue = function (final_success, always) {
    var cypher, error, ref, success;
    if (currently_querying) {
      return;
    }
    currently_querying = true;
    (ref = query_queue.shift()),
      (cypher = ref.cypher),
      (success = ref.success),
      (error = ref.error);
    return $.ajax(process.env.REACT_APP_GRAPHQL_URI, {
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        operationName: "cypherQuery",
        variables: {
          session_id: sessionId,
          neo4j_version: neo4j_version,
          cypher: cypher,
        },
        query: "query cypherQuery($neo4j_version: String, $session_id: String!, $cypher: String!) { queryConsole(neo4j_version: $neo4j_version, session_id: $session_id, cypher: $cypher) }"
      }),
      crossDomain: true,
    }).done(function (result) {
      var data = JSON.parse(result.data.queryConsole);
      (data.error ? error : success)(data);
      if (query_queue.length) {
        currently_querying = false;
        return process_query_queue(final_success, always);
      } else {
        if (typeof final_success === "function") {
          final_success();
        }
        if (typeof always === "function") {
          always();
        }
        return (currently_querying = false);
      }
    });
  };
  query = function (cypher, success, error, final_success, always) {
    query_queue.push({
      cypher: cypher,
      success: success,
      error: error,
    });
    return process_query_queue(final_success, always);
  };
  return {
    establishSession: establishSession,
    init: init,
    query: query,
  };
};
