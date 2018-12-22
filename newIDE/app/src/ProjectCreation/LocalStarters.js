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
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');
const gd = global.gd;

export default class LocalStarters extends Component {
  state = {
    outputPath: findEmptyPath(
      path ? path.join(app.getPath('home'), 'GDevelop projects') : ''
    ),
  };

  _handleChangePath = outputPath =>
    this.setState({
      outputPath,
    });

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

  createEmptyGame() {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    fs.mkdirsSync(outputPath);
    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(path.join(outputPath, 'game.json'));
    this.props.onCreate(project);
    sendNewGameCreated('');
  }

  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>Choose a game to use as a starter:</p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <List>
              <ListItem
                primaryText="Platformer"
                secondaryText={
                  <p>
                    A simple platform game, with coins to collect, moving
                    platforms and enemies.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('platformer')}
              />
              <ListItem
                primaryText="Space Shooter"
                secondaryText={
                  <p>
                    A side-scrolling shooter where you must defeat incoming
                    enemies with your spaceship.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('space-shooter')}
              />
              <ListItem
                primaryText="Isometric game"
                secondaryText={
                  <p>
                    An example of an isometric game where you can explore a map
                    with your character.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('isometric-game')}
              />
              <ListItem
                primaryText="Empty game"
                secondaryText={<p>Start a new game from scratch.</p>}
                secondaryTextLines={2}
                onClick={() => this.createEmptyGame()}
              />
            </List>
            <Line alignItems="center" justifyContent="center">
              <RaisedButton
                label="See examples"
                onClick={() => this.props.onShowExamples()}
              />
            </Line>
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
