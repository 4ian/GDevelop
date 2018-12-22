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
                onClick={() => {
                  sendNewGameCreated('platformer');
                  this.props.onOpen('example://platformer');
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
                  this.props.onOpen('example://space-shooter');
                }}
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
                onClick={() => {
                  sendNewGameCreated('isometric-game');
                  this.props.onOpen('example://isometric-game');
                }}
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
      </Column>
    );
  }
}
