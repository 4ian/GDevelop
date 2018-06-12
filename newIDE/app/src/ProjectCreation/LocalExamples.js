import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import { List, ListItem } from 'material-ui/List';
import { findExamples } from './LocalExamplesFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import { findEmptyPath } from './LocalPathFinder';
import Window from '../Utils/Window';
import PlaceholderLoader from '../UI/PlaceholderLoader';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');

const formatExampleName = (name: string) => {
  if (!name.length) return '';

  return name[0].toUpperCase() + name.substr(1).replace(/-/g, ' ');
};

export default class LocalExamples extends Component {
  state = {
    outputPath: findEmptyPath(
      path ? path.join(app.getPath('home'), 'GDevelop projects') : ''
    ),
    exampleNames: null,
  };

  componentDidMount() {
    findExamples(examplesPath => {
      fs.readdir(examplesPath, (error, exampleNames) => {
        if (error) {
          console.error('Unable to read examples:', error);
          return;
        }

        this.setState(
          {
            exampleNames: exampleNames.filter(name => name !== '.DS_Store'),
          },
          () => this.props.onExamplesLoaded()
        );
      });
    });
  }

  _handleChangePath = outputPath =>
    this.setState({
      outputPath,
    });

  _submitExample() {
    const body = `Hi!

I'd like to submit a new example to be added to GDevelop.
Here is the link to download it: **INSERT the link to your game here, or add it as an attachment**.

I confirm that any assets can be used freely by anybody, including for commercial usage.
`;
    Window.openExternalURL(
      `https://github.com/4ian/GD/issues/new?body=${encodeURIComponent(
        body
      )}&title=New%20example`
    );
  }

  createFromExample(exampleName) {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    findExamples(examplesPath => {
      fs.mkdirsSync(outputPath);
      fs.copySync(path.join(examplesPath, exampleName), outputPath);
      this.props.onOpen(path.join(outputPath, exampleName + '.json'));
      sendNewGameCreated(exampleName);
    });
  }

  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>Choose an example to open:</p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <List>
              {this.state.exampleNames &&
                this.state.exampleNames.map(exampleName => (
                  <ListItem
                    key={exampleName}
                    primaryText={formatExampleName(exampleName)}
                    onClick={() => this.createFromExample(exampleName)}
                  />
                ))}
              {!this.state.exampleNames && <PlaceholderLoader />}
            </List>
            <Column expand>
              <p>Want to contribute to the examples?</p>
              <Line alignItems="center" justifyContent="center">
                <RaisedButton
                  label="Submit your example"
                  onClick={this._submitExample}
                />
              </Line>
            </Column>
          </Column>
        </Line>
        <Divider />
        <Line expand>
          <Column expand>
            <LocalFolderPicker
              fullWidth
              value={this.state.outputPath}
              onChange={this._handleChangePath}
              title="Folder where to create the game"
              message="Choose where to create the game"
            />
          </Column>
        </Line>
      </Column>
    );
  }
}
