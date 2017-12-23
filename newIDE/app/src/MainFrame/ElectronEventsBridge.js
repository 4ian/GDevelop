import React, { Component } from 'react';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/**
 * Forward events received from Electron main process
 * to the underlying child React component.
 */
class ElectronEventsBridge extends Component {
  componentDidMount() {
    ipcRenderer.on(
      'main-menu-open',
      event => this.editor && this.editor.chooseProject()
    );
    ipcRenderer.on(
      'main-menu-save',
      event => this.editor && this.editor.save()
    );
    ipcRenderer.on(
      'main-menu-close',
      event => this.editor && this.editor.closeProject()
    );
    ipcRenderer.on(
      'main-menu-export',
      event => this.editor && this.editor.openExportDialog()
    );
    ipcRenderer.on(
      'main-menu-create',
      event => this.editor && this.editor.openCreateDialog()
    );
    ipcRenderer.on(
      'main-menu-open-start-page',
      event => this.editor && this.editor.openStartPage()
    );
    ipcRenderer.on(
      'main-menu-open-preferences',
      event => this.editor && this.editor.openPreferences()
    );
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: editor => (this.editor = editor),
    });
  }
}

export default ElectronEventsBridge;
