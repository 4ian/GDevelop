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
