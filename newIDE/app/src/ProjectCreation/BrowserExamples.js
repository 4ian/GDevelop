import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import RaisedButton from 'material-ui/RaisedButton';
import Window from '../Utils/Window';

const formatExampleName = (name: string) => {
  if (!name.length) return '';

  return name[0].toUpperCase() + name.substr(1).replace(/-/g, ' ');
};

// This is the list of available examples in src/fixtures folder.
// To add a new example, add it first in resources/examples, using the desktop Electron version
// of GDevelop, then use scripts/update-fixtures-from-resources-examples.js to have the web-app version
// of the example generated. Finally, add it in this list, in BrowserProjectOpener.js
// and upload the example resources online.
const exampleNames = [
  'advanced-shape-based-painter',
  'animation-speed-scale',
  'asteroids',
  'basic-ai-with-pathfinding',
  'basic-artificial-intelligence',
  'basic-topdown-car-driving',
  'bomb-the-crate',
  'brakeout',
  'buttons',
  'car-physics',
  'center-object-within-another',
  'change-position-of-object',
  'change-scale-of-sprites',
  'change-sprite-animation',
  'change-sprite-color',
  'create-object-with-mouseclick',
  'customize-keys-with-lastpressedkey',
  'drag-camera-with-mouse',
  'find-diagonals',
  'infinite-scrolling-background',
  'instance-timer',
  'inventory-system',
  'isometric-game',
  'keyboard-practice',
  'magnet',
  'manipulate-text-object',
  'move-camera-to-position',
  'move-object-in-circle',
  'move-object-toward-position',
  'move-object-with-physics',
  'multitouch',
  'object-gravity',
  'object-selection',
  'open-url-in-browser',
  'parallax-scrolling',
  'parallax',
  'parse-json-from-api',
  'parse-json-string',
  'particles-explosions',
  'particles-various-effects',
  'pathfinding-basics',
  'pathfinding',
  'physics',
  'pin-object-to-another-multiple-parents',
  'pin-object-to-another',
  'platformer',
  'play-music-on-mobile',
  'play-stop-sprite-animation',
  'racing-game',
  'rain',
  'random-color-picker',
  'rotate-toward-mouse',
  'rotate-toward-position',
  'rotate-with-keypress',
  'save-load',
  'shoot-bullet-in-parabola',
  'shoot-bullets',
  'shooting-bullets-explanation',
  'snap-object-to-grid',
  'space-shooter',
  'splash-screen',
  'sprite-fade-in-out',
  'text-entry-object',
  'text-fade-in-out',
  'text-to-speech',
  'toggle-music-play-sound',
  'type-on-text-effect',
  'z-depth',
  'zombie-laser',
];

export default class BrowserExamples extends Component {
  _submitExample() {
    const body = `Hi!

I'd like to submit a new example to be added to GDevelop.
Here is the link to download it: **INSERT the link to your game here, or add it as an attachment**.

I confirm that any assets can be used freely by anybody, including for commercial usage.
`;
    Window.openExternalURL(
      `https://github.com/4ian/GD/issues/new?body=${encodeURIComponent(
        body
      )}&title=New%20example`
    );
  }

  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>Choose an example to open:</p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <List>
              {exampleNames.map(exampleName => (
                <ListItem
                  key={exampleName}
                  primaryText={formatExampleName(exampleName)}
                  onClick={() => {
                    sendNewGameCreated(exampleName);
                    this.props.onOpen(`example://${exampleName}`);
                  }}
                />
              ))}
            </List>
            <Column expand>
              <p>Want to contribute to the examples?</p>
              <Line alignItems="center" justifyContent="center">
                <RaisedButton
                  label="Submit your example"
                  onClick={this._submitExample}
                />
              </Line>
            </Column>
          </Column>
        </Line>
      </Column>
    );
  }
}
