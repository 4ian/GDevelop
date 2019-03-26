import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import ExamplesList from './ExamplesList';

// This is the list of available examples in src/fixtures folder.
// To add a new example, add it first in resources/examples, using the desktop Electron version
// of GDevelop, then use scripts/update-fixtures-from-resources-examples.js to have the web-app version
// of the example generated. Finally, add it in this list, in BrowserProjectOpener.js
// and upload the example resources online.
const exampleNames = [
  'admob',
  'advanced-shape-based-painter',
  'animation-speed-scale',
  'asteroids',
  'basic-ai-with-pathfinding',
  'basic-artificial-intelligence',
  'basic-topdown-car-driving',
  'betabox-basics-learning-experience',
  'bomb-the-crate',
  'bouncing-ball-and-rope',
  'breakout',
  'buttons',
  'car-physics',
  'center-object-within-another',
  'change-position-of-object',
  'change-scale-of-sprites',
  'change-sprite-animation',
  'change-sprite-color',
  'character-selection',
  'controller-input',
  'create-object-with-mouseclick',
  'custom-font',
  'custom-mouse-pointer',
  'customize-keys-with-lastpressedkey',
  'device-orientation-ballgame',
  'device-orientation-compass',
  'device-vibration',
  'downhill-bike-physics-demo',
  'drag-camera-with-mouse',
  'drop-collect-items-from-storage',
  'endless-up-runner',
  'exit-app',
  'facebook-instant-game',
  'find-diagonals',
  'geodash',
  'health-bar',
  'infinite-scrolling-background',
  'inventory-system',
  'isometric-game',
  'javascript-blocks-in-platformer',
  'keyboard-practice',
  'level-editor',
  'load-image-from-url',
  'magnet',
  'manipulate-text-object',
  'move-camera-to-position',
  'move-object-back-and-forth',
  'move-object-in-circle',
  'move-object-toward-position',
  'move-object-with-mouse-joint',
  'move-object-with-physics',
  'multitouch',
  'object-gravity',
  'object-selection',
  'objects-timers',
  'open-url-in-browser',
  'parallax-scrolling',
  'parallax',
  'parse-json-from-api',
  'parse-json-string',
  'particles-explosions',
  'particles-various-effects',
  'pathfinding-basics',
  'pathfinding',
  'physics-joints-demo',
  'physics-joints-settings-demo',
  'physics',
  'pin-object-to-another-multiple-parents',
  'pin-object-to-another',
  'pixel-perfect-platform-game',
  'plane-and-clouds',
  'platformer-double-jump',
  'platformer',
  'play-music-on-mobile',
  'play-stop-sprite-animation',
  'racing-game',
  'ragdoll',
  'rain',
  'random-color-picker',
  'rotate-toward-mouse',
  'rotate-toward-position',
  'rotate-with-keypress',
  'save-load',
  'screen-shake',
  'shoot-bullet-in-parabola',
  'shoot-bullets',
  'shooting-bullets-explanation',
  'snap-object-to-grid',
  'space-invaders',
  'space-shooter-with-functions',
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
  render() {
    return (
      <Column noMargin>
        <Column>
          <p>
            <Trans>Choose or search for an example to open:</Trans>
          </p>
        </Column>
        <Line>
          <ExamplesList
            exampleNames={exampleNames}
            onCreateFromExample={exampleName => {
              sendNewGameCreated(exampleName);
              this.props.onOpen(`example://${exampleName}`);
            }}
          />
        </Line>
      </Column>
    );
  }
}
