import React from "react";
import { Form, } from "semantic-ui-react";
import CodeMirror from "./CodeMirror";


class TextArea extends React.Component {
  componentDidMount() {
    const codemirror_asciidoc = document.getElementById('codemirror_asciidoc');
    const cm = CodeMirror.fromTextArea(codemirror_asciidoc, {
      lineNumbers: true,
      lineWrapping: true,
      mode: 'asciidoc',
      theme: 'midnight'
    });
    cm.on('change', (e, changeObj) => {
      const value = e.getValue();
      this.props.onChange({
        target: {
          name: this.props.name,
          value
        }
      }, value);
    });
  }

	render() {
		return (
      <Form.TextArea
        {...this.props}
        id="codemirror_asciidoc"
      />
		);
  }
}

export default TextArea;
