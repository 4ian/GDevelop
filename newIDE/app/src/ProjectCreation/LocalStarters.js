// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import RaisedButton from '../UI/RaisedButton';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import Text from '../UI/Text';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import { List, ListItem } from '../UI/List';
import Subheader from '../UI/Subheader';
import { findExamples } from './LocalExamplesFinder';
import optionalRequire from '../Utils/OptionalRequire.js';
import ListIcon from '../UI/ListIcon';
import { showGameFileCreationError } from './LocalExamples';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import LocalFileStorageProvider from '../ProjectsStorage/LocalFileStorageProvider';
import { findEmptyPath } from './LocalPathFinder';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');
const gd: libGDevelop = global.gd;

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void,
  onCreate: (
    gdProject,
    storageProvider: ?StorageProvider,
    fileMetadata: ?FileMetadata
  ) => void,
  onChangeOutputPath: (outputPath: string) => void,
  onShowExamples: () => void,
  outputPath: string,
|};

type State = {||};

export default class LocalStarters extends Component<Props, State> {
  createFromExample(i18n: I18nType, exampleName: string) {
    const { outputPath } = this.props;
    if (!fs || !outputPath) return;

    findExamples(examplesPath => {
      try {
        fs.mkdirsSync(outputPath);
        fs.copySync(path.join(examplesPath, exampleName), outputPath);
      } catch (error) {
        showGameFileCreationError(i18n, outputPath, error);
        return;
      }

      this.props.onOpen(LocalFileStorageProvider, {
        fileIdentifier: path.join(outputPath, exampleName + '.json'),
      });
      sendNewGameCreated(exampleName);
    });
  }

  createEmptyGame(i18n: I18nType) {
    const { outputPath } = this.props;
    if (!fs || !outputPath) return;

    try {
      fs.mkdirsSync(outputPath);
    } catch (error) {
      showGameFileCreationError(i18n, outputPath, error);
      return;
    }

    const project: gdProject = gd.ProjectHelper.createNewGDJSProject();
    const filePath = path.join(outputPath, 'game.json');
    project.setProjectFile(filePath);
    this.props.onCreate(project, LocalFileStorageProvider, {
      fileIdentifier: filePath,
    });
    sendNewGameCreated('');
  }

  componentDidMount() {
    if (this.props.outputPath === '')
      if (path && app)
        this.props.onChangeOutputPath(
          findEmptyPath(
            path.join(app.getPath('documents'), 'GDevelop projects')
          )
        );
  }

  render() {
    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <Line expand>
              <Column expand>
                <LocalFolderPicker
                  fullWidth
                  value={this.props.outputPath}
                  onChange={this.props.onChangeOutputPath}
                  type="create-game"
                />
              </Column>
            </Line>
            <Divider />
            <Line>
              <Column>
                <Text>
                  <Trans>Choose a game to use as a starter:</Trans>
                </Text>
              </Column>
            </Line>
            <Line>
              <Column expand noMargin>
                <List>
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/platformer.png"
                      />
                    }
                    primaryText={<Trans>Platformer</Trans>}
                    secondaryText={
                      <Trans>
                        A simple platform game, with coins to collect, moving
                        platforms and enemies.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() => this.createFromExample(i18n, 'platformer')}
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/space-shooter.png"
                      />
                    }
                    primaryText={<Trans>8-bit Space Shooter</Trans>}
                    secondaryText={
                      <Trans>
                        A beautiful, retro side-scrolling shooter where you must
                        defeat incoming enemies with your mecha transforming
                        spaceship. Huge boss included!
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'space-shooter')
                    }
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/geometry-monster.png"
                      />
                    }
                    primaryText={<Trans>Geometry Monster</Trans>}
                    secondaryText={
                      <Trans>
                        A hyper casual endless game where you have to collect
                        shapes and avoid bombs, with a progressively increasing
                        difficulty.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'geometry-monster')
                    }
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/isometric-game.png"
                      />
                    }
                    primaryText={<Trans>Isometric game</Trans>}
                    secondaryText={
                      <Trans>
                        An example of an isometric game where you can explore a
                        map with your character.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'isometric-game')
                    }
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/downhill-bike-physics-demo.png"
                      />
                    }
                    primaryText="Downhill Bike Racing"
                    secondaryText={
                      <Trans>
                        An example of a 2D physics based game, where players
                        have to reach the end as fast as possible.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'downhill-bike-physics-demo')
                    }
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/pairs.png"
                      />
                    }
                    primaryText="Pairs"
                    secondaryText={
                      <Trans>
                        Find all matching pairs of cards in this relaxing game.
                        Use tweens to create smooth, natural animations with a
                        few events.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() => this.createFromExample(i18n, 'pairs')}
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/new.png"
                      />
                    }
                    primaryText={<Trans>Empty game</Trans>}
                    secondaryText={
                      <Trans>Start a new game from scratch.</Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() => this.createEmptyGame(i18n)}
                  />
                  <Subheader>
                    <Trans>Advanced</Trans>
                  </Subheader>
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/particle-effects-demo.png"
                      />
                    }
                    primaryText={<Trans>Particle Effects Demo</Trans>}
                    secondaryText={
                      <Trans>
                        A demo of various high quality particle effects (fire,
                        magic, snow, rune spell...) that you can try and use in
                        your game.
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'particle-effects-demo')
                    }
                  />
                  <ListItem
                    leftIcon={
                      <ListIcon
                        iconSize={40}
                        src="res/starters_icons/game-feel-demo.png"
                      />
                    }
                    primaryText={<Trans>Game Feel Demo</Trans>}
                    secondaryText={
                      <Trans>
                        A demo showing how to enhance the "game feel" of your
                        project: VFX, shot trail, ambient sounds and SFX,
                        screenshake, wobble...
                      </Trans>
                    }
                    secondaryTextLines={2}
                    onClick={() =>
                      this.createFromExample(i18n, 'game-feel-demo')
                    }
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
          </Column>
        )}
      </I18n>
    );
  }
}
