import React, { Component } from 'react';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';

export default class LocalCreateDialog extends Component {
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
              <Subheader>Starters</Subheader>
              <ListItem
                primaryText="Platformer"
                secondaryText={
                  <p>
                    A simple platform game, with coins to collect, moving
                    platforms and enemies.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('platformer');
                  this.props.onOpen('internal://platformer');
                }}
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
                onClick={() => {
                  sendNewGameCreated('space-shooter');
                  this.props.onOpen('internal://space-shooter');
                }}
              />
              <Subheader>Examples</Subheader>
              <ListItem
                primaryText="Pathfinding"
                secondaryText={
                  <p>
                    Example showing how to move a tank avoiding obstacles on the
                    battlefield.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('pathfinding');
                  this.props.onOpen('internal://pathfinding');
                }}
              />
            </List>
          </Column>
        </Line>
      </Column>
    );
  }
}
