// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import RaisedButton from '../UI/RaisedButton';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import { List, ListItem } from 'material-ui/List';
import { findExamples } from './LocalExamplesFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import { findEmptyPath } from './LocalPathFinder';
import ListIcon from '../UI/ListIcon';
import { showGameFileCreationError } from './LocalExamples';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');
const gd = global.gd;

type Props = {|
  onOpen: string => void,
  onCreate: gdProject => void,
  onShowExamples: () => void,
|};

type State = {|
  outputPath: string,
|};

export default class LocalStarters extends Component<Props, State> {
  state = {
    outputPath: findEmptyPath(
      path && app
        ? path.join(app.getPath('documents'), 'GDevelop projects')
        : ''
    ),
  };

  _handleChangePath = (outputPath: string) =>
    this.setState({
      outputPath,
    });

  createFromExample(i18n: I18nType, exampleName: string) {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    findExamples(examplesPath => {
      try {
        fs.mkdirsSync(outputPath);
        fs.copySync(path.join(examplesPath, exampleName), outputPath);
      } catch (error) {
        showGameFileCreationError(i18n, outputPath, error);
        return;
      }

      this.props.onOpen(path.join(outputPath, exampleName + '.json'));
      sendNewGameCreated(exampleName);
    });
  }

  createEmptyGame(i18n: I18nType) {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    try {
      fs.mkdirsSync(outputPath);
    } catch (error) {
      showGameFileCreationError(i18n, outputPath, error);
      return;
    }

    const project = gd.ProjectHelper.createNewGDJSProject();
    project.setProjectFile(path.join(outputPath, 'game.json'));
    this.props.onCreate(project);
    sendNewGameCreated('');
  }

  render() {
    return (
      <I18n>
        {({ i18n }) => (
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
                    leftAvatar={
                      <ListIcon
                        iconSize={32}
                        src="res/starters_icons/platformer.png"
                      />
                    }
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
                    onClick={() => this.createFromExample(i18n, 'platformer')}
                  />
                  <ListItem
                    leftAvatar={
                      <ListIcon
                        iconSize={32}
                        src="res/starters_icons/space-shooter.png"
                      />
                    }
                    primaryText={<Trans>8-bit Space Shooter</Trans>}
                    secondaryText={
                      <p>
                        <Trans>
                          A beautiful, retro side-scrolling shooter where you
                          must defeat incoming enemies with your mecha
                          transforming spaceship. Huge boss included!
                        </Trans>
                      </p>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'space-shooter')
                    }
                  />
                  <ListItem
                    leftAvatar={
                      <ListIcon
                        iconSize={32}
                        src="res/starters_icons/isometric-game.png"
                      />
                    }
                    primaryText={<Trans>Isometric game</Trans>}
                    secondaryText={
                      <p>
                        <Trans>
                          An example of an isometric game where you can explore
                          a map with your character.
                        </Trans>
                      </p>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'isometric-game')
                    }
                  />
                  <ListItem
                    leftAvatar={
                      <ListIcon
                        iconSize={32}
                        src="res/starters_icons/downhill-bike-physics-demo.png"
                      />
                    }
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
                      this.createFromExample(i18n, 'downhill-bike-physics-demo')
                    }
                  />
                  <ListItem
                    leftAvatar={
                      <ListIcon
                        iconSize={32}
                        src="res/starters_icons/pairs.png"
                      />
                    }
                    primaryText="Pairs"
                    secondaryText={
                      <p>
                        <Trans>
                          Find all matching pairs of cards in this relaxing
                          game. Use tweens to create smooth, natural animations
                          with a few events.
                        </Trans>
                      </p>
                    }
                    secondaryTextLines={2}
                    onClick={() => this.createFromExample(i18n, 'pairs')}
                  />
                  <ListItem
                    primaryText={<Trans>Empty game</Trans>}
                    secondaryText={
                      <p>
                        <Trans>Start a new game from scratch.</Trans>
                      </p>
                    }
                    secondaryTextLines={2}
                    onClick={() => this.createEmptyGame(i18n)}
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
                  type="create-game"
                />
              </Column>
            </Line>
          </Column>
        )}
      </I18n>
    );
  }
}
