import $ from 'jquery';
import GraphGist from './GraphGist';
import '../GraphGistPage.scss';

export default function GraphGistRender(gistBody) {
  var renderer = GraphGist({
    preProcess: false,
  });

  $('.sect1').addClass('ui container');
  let ref = $('code[class*="language-"]');
  for (let i = 0, len = ref.length; i < len; i++) {
    let code_element = ref[i];
    let classes = (function () {
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
      $(code_element).parent('pre').addClass(c);
    }
  }

  let ref1 = $('div.paragraph');
  for (let k = 0, len2 = ref1.length; k < len2; k++) {
    let element = ref1[k];
    $(element).replaceWith($('<p>' + element.innerHTML + '</p>'));
  }

  renderer.renderContent();
}
