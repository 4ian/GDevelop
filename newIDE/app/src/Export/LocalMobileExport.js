import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

export default class LocalMobileExport extends Component {
  openURL = () => {
    shell.openExternal('https://github.com/4ian/GD');
  };

  render() {
    return (
      <div style={{ height: 200 }}>
        <PlaceholderMessage>
          <Column>
            <Line>This export is not available yet!</Line>
            <Line>
              <FlatButton
                onTouchTap={this.openURL}
                primary
                label="Help by contributing on GitHub"
              />
            </Line>
          </Column>
        </PlaceholderMessage>
      </div>
    );
  }
}
