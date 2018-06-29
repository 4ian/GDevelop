// @flow
import React, { PureComponent } from 'react';
import { translate, type TranslatorProps } from 'react-i18next';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import ToolbarIcon from '../UI/ToolbarIcon';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import IconMenu from '../UI/Menu/IconMenu';
import Window from '../Utils/Window';

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
  toggleProjectManager: boolean,
  requestUpdate: ?() => void,
  simulateUpdateDownloaded: ?() => void,
  exportProject: Function,
} & TranslatorProps;

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
    const { t } = this.props;

    return (
      <Toolbar style={styles.toolbar}>
        <ToolbarGroup firstChild={true}>
          {this.props.showProjectIcons && (
            <ToolbarIcon
              onClick={this.props.toggleProjectManager}
              src="res/ribbon_default/projectManager32.png"
              disabled={!this.props.hasProject}
              tooltip={t('Project manager')}
            />
          )}
          {this.props.showProjectIcons && (
            <ToolbarIcon
              onClick={this.props.exportProject}
              src="res/ribbon_default/export32.png"
              disabled={!this.props.hasProject}
              tooltip={t('Export the game (Web, Android, iOS...)')}
            />
          )}
          {this.isDev && (
            <IconMenu
              iconButtonElement={
                <ToolbarIcon src="res/ribbon_default/bug32.png" />
              }
              buildMenuTemplate={() => [
                {
                  label: 'Request update from external editor',
                  disabled: !this.props.requestUpdate,
                  click: () =>
                    this.props.requestUpdate && this.props.requestUpdate(),
                },
                {
                  label: 'Simulate update downloaded',
                  disabled: !this.props.simulateUpdateDownloaded,
                  click: () =>
                    this.props.simulateUpdateDownloaded &&
                    this.props.simulateUpdateDownloaded(),
                },
              ]}
            />
          )}
          <ToolbarSeparator />
        </ToolbarGroup>
        {this.state.editorToolbar || <ToolbarGroup />}
      </Toolbar>
    );
  }
}

export default translate('', { withRef: true })(MainFrameToolbar);
