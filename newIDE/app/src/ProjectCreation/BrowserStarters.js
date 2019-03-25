import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';

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
                onClick={() => {
                  sendNewGameCreated('space-shooter');
                  this.props.onOpen('example://space-shooter');
                }}
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
                onClick={() => {
                  sendNewGameCreated('isometric-game');
                  this.props.onOpen('example://isometric-game');
                }}
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
                onClick={() => {
                  sendNewGameCreated('downhill-bike-physics-demo');
                  this.props.onOpen('example://downhill-bike-physics-demo');
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
