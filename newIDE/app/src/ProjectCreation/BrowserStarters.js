import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from '../UI/RaisedButton';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import ListIcon from '../UI/ListIcon';
const gd = global.gd;

export default class BrowserStarters extends Component {
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
                onClick={() => {
                  sendNewGameCreated('platformer');
                  this.props.onOpen('example://platformer');
                }}
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
                      A beautiful, retro side-scrolling shooter where you must
                      defeat incoming enemies with your mecha transforming
                      spaceship. Huge boss included!
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('space-shooter');
                  this.props.onOpen('example://space-shooter');
                }}
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
                      An example of an isometric game where you can explore a
                      map with your character.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('isometric-game');
                  this.props.onOpen('example://isometric-game');
                }}
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
                onClick={() => {
                  sendNewGameCreated('downhill-bike-physics-demo');
                  this.props.onOpen('example://downhill-bike-physics-demo');
                }}
              />
              <ListItem
                leftAvatar={
                  <ListIcon iconSize={32} src="res/starters_icons/pairs.png" />
                }
                primaryText="Pairs"
                secondaryText={
                  <p>
                    <Trans>
                      Find all matching pairs of cards in this relaxing game.
                      Use tweens to create smooth, natural animations with a few
                      events.
                    </Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('pairs');
                  this.props.onOpen('example://pairs');
                }}
              />
              <ListItem
                primaryText={<Trans>Empty game</Trans>}
                secondaryText={
                  <p>
                    <Trans>Start a new game from scratch.</Trans>
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('');

                  const project = gd.ProjectHelper.createNewGDJSProject();
                  this.props.onCreate(project);
                }}
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
    );
  }
}
