// @flow
import React, { PureComponent } from 'react';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconMenu from '../UI/Menu/IconMenu';
import Window from '../Utils/Window';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';

const styles = {
  toolbar: {
    flexShrink: 0, // Toolbar height should never be reduced
    overflowX: 'auto',
    overflowY: 'hidden',
  },
};

type Props = {
  showProjectIcons: boolean,
  hasProject: boolean,
  toggleProjectManager: () => void,
  requestUpdate: ?() => void,
  simulateUpdateDownloaded: ?() => void,
  simulateUpdateAvailable: ?() => void,
  exportProject: Function,
};

type State = {
  editorToolbar: any,
};

export class MainFrameToolbar extends PureComponent<Props, State> {
  state = {
    editorToolbar: null,
  };

  isDev = Window.isDev();

  setEditorToolbar(editorToolbar: any) {
    this.setState({
      editorToolbar,
    });
  }

  render() {
    return (
      <I18n>
        {({ i18n }) => (
          <Toolbar style={styles.toolbar}>
            <ToolbarGroup firstChild={true}>
              {this.props.showProjectIcons && (
                <ToolbarIcon
                  onClick={this.props.toggleProjectManager}
                  src="res/ribbon_default/projectManager32.png"
                  disabled={!this.props.hasProject}
                  tooltip={i18n._(t`Project manager`)}
                />
              )}
              {this.props.showProjectIcons && (
                <ToolbarIcon
                  onClick={this.props.exportProject}
                  src="res/ribbon_default/export32.png"
                  disabled={!this.props.hasProject}
                  tooltip={i18n._(t`Export the game (Web, Android, iOS...)`)}
                />
              )}
              {this.isDev && (
                <IconMenu
                  iconButtonElement={
                    <ToolbarIcon src="res/ribbon_default/bug32.png" />
                  }
                  buildMenuTemplate={() => [
                    {
                      label: i18n._(t`Request update from external editor`),
                      disabled: !this.props.requestUpdate,
                      click: () =>
                        this.props.requestUpdate && this.props.requestUpdate(),
                    },
                    {
                      label: i18n._(t`Simulate update downloaded`),
                      disabled: !this.props.simulateUpdateDownloaded,
                      click: () =>
                        this.props.simulateUpdateDownloaded &&
                        this.props.simulateUpdateDownloaded(),
                    },
                    {
                      label: i18n._(t`Simulate update available`),
                      disabled: !this.props.simulateUpdateAvailable,
                      click: () =>
                        this.props.simulateUpdateAvailable &&
                        this.props.simulateUpdateAvailable(),
                    },
                  ]}
                />
              )}
              <ToolbarSeparator />
            </ToolbarGroup>
            {this.state.editorToolbar || <ToolbarGroup />}
          </Toolbar>
        )}
      </I18n>
    );
  }
}

export default MainFrameToolbar;
