// @flow
import * as React from 'react';
import MainFrame from '.';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Element<typeof MainFrame>,
|};

/**
 * Forward events received from Electron main process
 * to the underlying child React component.
 */
class ElectronEventsBridge extends React.Component<Props, {||}> {
  editor: ?MainFrame;
  componentDidMount() {
    if (!ipcRenderer) return;

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
      event => this.editor && this.editor.askToCloseProject(() => {})
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
      'main-menu-open-project-manager',
      event => this.editor && this.editor.openProjectManager()
    );
    ipcRenderer.on(
      'main-menu-open-start-page',
      event => this.editor && this.editor.openStartPage()
    );
    ipcRenderer.on(
      'main-menu-open-debugger',
      event => this.editor && this.editor.openDebugger()
    );
    ipcRenderer.on(
      'main-menu-open-about',
      event => this.editor && this.editor.openAboutDialog()
    );
    ipcRenderer.on(
      'main-menu-open-preferences',
      event => this.editor && this.editor.openPreferences()
    );
    ipcRenderer.on(
      'main-menu-open-profile',
      event => this.editor && this.editor.openProfile()
    );
    ipcRenderer.on(
      'update-status',
      (event, status) => this.editor && this.editor.setUpdateStatus(status)
    );
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: editor => (this.editor = editor),
    });
  }
}

export default ElectronEventsBridge;
