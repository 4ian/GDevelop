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
                primaryText="Various particles effects"
                secondaryText={
                  <p>
                    Example showing particles emitters used to create different
                    kind of effects.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('particles-various-effects');
                  this.props.onOpen('internal://particles-various-effects');
                }}
              />
              <ListItem
                primaryText="Explosions with particles"
                secondaryText={
                  <p>
                    See how to create realistic explosions effects with particles
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('particles-explosions');
                  this.props.onOpen('internal://particles-explosions');
                }}
              />
              <ListItem
                primaryText="Physics"
                secondaryText={
                  <p>
                    Example showing how to configure physics behavior on objects and use events to detect collisions.
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => {
                  sendNewGameCreated('physics');
                  this.props.onOpen('internal://physics');
                }}
              />
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
