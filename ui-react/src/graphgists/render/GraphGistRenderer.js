import React from "react";
import $ from "jquery";
import GraphGist from "./GraphGist";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/midnight.css";

export default class extends React.Component {
  componentDidMount() {
    // window.graph_gist_portal_url = window.location.protocol + "//" + window.location.hostname;
    window.graph_gist_portal_url = "https://portal.graphgist.org";

    const GraphGistRenderer = GraphGist({
      preProcess: false
    });

    $(".sect1").addClass("ui container");
    let ref = $('code[class*="language-"]');
    for (let i = 0, len = ref.length; i < len; i++) {
      let code_element = ref[i];
      let classes = (function() {
        var j, len1, ref1, results;
        ref1 = code_element.classList;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          let e = ref1[j];
          if (e.match(/^language-/)) {
            results.push(e);
          }
        }
        return results;
      })();
      for (let j = 0, len1 = classes.length; j < len1; j++) {
        let c = classes[j];
        $(code_element)
          .parent("pre")
          .addClass(c);
      }
    }

    let ref1 = $("div.paragraph");
    for (let k = 0, len2 = ref1.length; k < len2; k++) {
      let element = ref1[k];
      $(element).replaceWith($("<p>" + element.innerHTML + "</p>"));
    }

    GraphGistRenderer.renderContent();
  }

  render() {
    return (
      <>
        {this.props.children}
        <div
          className="ui form"
          id="console-template"
          style={{ display: "block" }}
        >
          <div className="fields">
            <div className="fourteen wide field small-11 columns">
              <textarea
                className="cypher"
                name="cypher"
                placeholder="Use Cypher here to query the dataset"
              />
            </div>
            <div className="two wide field small-1 columns">
              <div className="ui submit button run">Run</div>
            </div>
          </div>
          <div className="tabs">
            <div className="tab active" data-name="table">
              Table
            </div>
            <div className="tab" data-name="graph">
              Graph
            </div>
          </div>
          <div className="result">
            <div className="table">Table!</div>
            <div className="graph" graph-mode="result">
              Graph!
            </div>
            <div className="error">Error!</div>
            <div className="loading">
              <img
                src="https://graphgist-portal.herokuapp.com/assets/loading-50c2262cd87a0d627a2cf25e6e4080708da264d77256262296745232807ea91e.gif"
                alt="Loading"
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
