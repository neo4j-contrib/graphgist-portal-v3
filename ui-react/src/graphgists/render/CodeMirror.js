import CodeMirror from "codemirror";
import CodeMirrorCypher from "./codemirror/mode/cypher";
import CodeMirrorAsciidoc from "./codemirror/mode/asciidoc";
import CodeMirrorColorize from "./codemirror/runmode/colorize";
import CodeMirrorRunmode from "./codemirror/runmode/runmode";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/midnight.css";

CodeMirrorRunmode(CodeMirror);
CodeMirrorColorize(CodeMirror);
CodeMirrorCypher(CodeMirror);
CodeMirrorAsciidoc(CodeMirror);

export default CodeMirror;
