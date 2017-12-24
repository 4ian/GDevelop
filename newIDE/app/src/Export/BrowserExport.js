import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';

export default class BrowserExport extends Component {
  openWebsite = () => {
    Window.openExternalURL('http://compilgames.net');
  };

  render() {
    return (
      <div style={{ height: 200 }}>
        <Column>
          <Line>
            Export is not yet available in GDevelop online version. Instead,
            download the full GDevelop desktop version to export and publish
            your game!
          </Line>
          <Line>
            <RaisedButton
              onClick={this.openWebsite}
              primary
              label="Download GDevelop"
            />
          </Line>
        </Column>
      </div>
    );
  }
}
