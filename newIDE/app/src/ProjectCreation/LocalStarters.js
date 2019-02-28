import { Trans } from '@lingui/macro';
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
            <p>
              <Trans>Choose a game to use as a starter:</Trans>
            </p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <List>
              <ListItem
                primaryText={<Trans>Platformer</Trans>}
                secondaryText={
                  <p>
                    <Trans>
                      A simple platform game, with coins to collect, moving
                      platforms and enemies.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('platformer')}
              />
              <ListItem
                primaryText={<Trans>Space Shooter</Trans>}
                secondaryText={
                  <p>
                    <Trans>
                      A side-scrolling shooter where you must defeat incoming
                      enemies with your spaceship.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('space-shooter')}
              />
              <ListItem
                primaryText={<Trans>Isometric game</Trans>}
                secondaryText={
                  <p>
                    <Trans>
                      An example of an isometric game where you can explore a
                      map with your character.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createFromExample('isometric-game')}
              />
              <ListItem
                primaryText="Downhill Bike Racing"
                secondaryText={
                  <p>
                    <Trans>
                      An example of a 2D physics based driving game, where
                      player have to reach the end as fast as possible.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() =>
                  this.createFromExample('downhill-bike-physics-demo')
                }
              />
              <ListItem
                primaryText={<Trans>Empty game</Trans>}
                secondaryText={
                  <p>
                    <Trans>Start a new game from scratch.</Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.createEmptyGame()}
              />
            </List>
            <Line alignItems="center" justifyContent="center">
              <RaisedButton
                label={<Trans>See examples</Trans>}
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
              title={<Trans>Folder where to create the game</Trans>}
              message={<Trans>Choose where to create the game</Trans>}
            />
          </Column>
        </Line>
      </Column>
    );
  }
}
