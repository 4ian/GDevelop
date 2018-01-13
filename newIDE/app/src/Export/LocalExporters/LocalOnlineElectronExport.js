// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Window from '../../Utils/Window';
import PlaceholderMessage from '../../UI/PlaceholderMessage';

export default class LocalOnlineElectronExport extends React.Component<*, *> {
  _openGithub() {
    Window.openExternalURL('https://github.com/4ian/GD');
  }

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <div style={{ height: 300 }}>
        <PlaceholderMessage>
          <p>This export is not ready yet!</p>
          <FlatButton
            label="Help by contributing on GitHub"
            onClick={this._openGithub}
          />
        </PlaceholderMessage>
      </div>
    );
  }
}
