// @flow
import { t } from '@lingui/macro';
import React, { PureComponent } from 'react';
import { Toolbar, ToolbarGroup } from '../UI/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import Window from '../Utils/Window';
import { I18n } from '@lingui/react';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';

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
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <I18n>
            {({ i18n }) => (
              <Toolbar>
                <ToolbarGroup firstChild>
                  {this.props.showProjectIcons && (
                    <ToolbarIcon
                      onClick={this.props.toggleProjectManager}
                      src="res/ribbon_default/projectManager32.png"
                      disabled={!this.props.hasProject}
                      tooltip={t`Project manager`}
                    />
                  )}
                  {this.props.showProjectIcons && (
                    <ToolbarIcon
                      onClick={this.props.exportProject}
                      src="res/ribbon_default/export32.png"
                      disabled={!this.props.hasProject}
                      tooltip={t`Export the game (Web, Android, iOS...)`}
                    />
                  )}
                  {this.isDev && (
                    <ElementWithMenu
                      element={
                        <ToolbarIcon src="res/ribbon_default/bug32.png" />
                      }
                      buildMenuTemplate={() => [
                        {
                          label: 'Request update from external editor',
                          disabled: !this.props.requestUpdate,
                          click: () => {
                            this.props.requestUpdate &&
                              this.props.requestUpdate();
                          },
                        },
                        {
                          label: 'Simulate update downloaded',
                          disabled: !this.props.simulateUpdateDownloaded,
                          click: () => {
                            this.props.simulateUpdateDownloaded &&
                              this.props.simulateUpdateDownloaded();
                          },
                        },
                        {
                          label: 'Simulate update available',
                          disabled: !this.props.simulateUpdateAvailable,
                          click: () => {
                            this.props.simulateUpdateAvailable &&
                              this.props.simulateUpdateAvailable();
                          },
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
        )}
      </ResponsiveWindowMeasurer>
    );
  }
}

export default MainFrameToolbar;
