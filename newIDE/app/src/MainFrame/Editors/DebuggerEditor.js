// @flow
import * as React from 'react';
import Debugger from '../../Debugger';
import BaseEditor from './BaseEditor';

export default class DebuggerEditor extends BaseEditor {
  editor: ?Debugger;

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  render() {
    return <Debugger {...this.props} ref={editor => (this.editor = editor)} />;
  }
}
