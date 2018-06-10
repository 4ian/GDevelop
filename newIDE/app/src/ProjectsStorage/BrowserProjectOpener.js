import asteroids from '../fixtures/asteroids/asteroids.json';
import brakeout from '../fixtures/brakeout/brakeout.json';
import changePositionOfObject from '../fixtures/change-position-of-object/change-position-of-object.json';
import changeScaleOfSprites from '../fixtures/change-scale-of-sprites/change-scale-of-sprites.json';
import changeSpriteAnimation from '../fixtures/change-sprite-animation/change-sprite-animation.json';
import createObjectWithMouseclick from '../fixtures/create-object-with-mouseclick/create-object-with-mouseclick.json';
import dragCameraWithMouse from '../fixtures/drag-camera-with-mouse/drag-camera-with-mouse.json';
import infiniteScrollingBackground from '../fixtures/infinite-scrolling-background/infinite-scrolling-background.json';
import instanceTimer from '../fixtures/instance-timer/instance-timer.json';
import inventorySystem from '../fixtures/inventory-system/inventory-system.json';
import keyboardPractice from '../fixtures/keyboard-practice/keyboard-practice.json';
import manipulateTextObject from '../fixtures/manipulate-text-object/manipulate-text-object.json';
import moveCameraToPosition from '../fixtures/move-camera-to-position/move-camera-to-position.json';
import moveObjectTowardPosition from '../fixtures/move-object-toward-position/move-object-toward-position.json';
import moveObjectWithPhysics from '../fixtures/move-object-with-physics/move-object-with-physics.json';
import parallax from '../fixtures/parallax/parallax.json';
import parallaxScrolling from '../fixtures/parallax-scrolling/parallax-scrolling.json';
import parseJsonFromApi from '../fixtures/parse-json-from-api/parse-json-from-api.json';
import particlesExplosions from '../fixtures/particles-explosions/particles-explosions.json';
import particlesVariousEffects from '../fixtures/particles-various-effects/particles-various-effects.json';
import pathfinding from '../fixtures/pathfinding/pathfinding.json';
import pathfindingBasics from '../fixtures/pathfinding-basics/pathfinding-basics.json';
import physics from '../fixtures/physics/physics.json';
import platformer from '../fixtures/platformer/platformer.json';
import playStopSpriteAnimation from '../fixtures/play-stop-sprite-animation/play-stop-sprite-animation.json';
import randomColorPicker from '../fixtures/random-color-picker/random-color-picker.json';
import rotateTowardMouse from '../fixtures/rotate-toward-mouse/rotate-toward-mouse.json';
import rotateTowardPosition from '../fixtures/rotate-toward-position/rotate-toward-position.json';
import rotateWithKeypress from '../fixtures/rotate-with-keypress/rotate-with-keypress.json';
import saveLoad from '../fixtures/save-load/save-load.json';
import shootBullets from '../fixtures/shoot-bullets/shoot-bullets.json';
import spaceShooter from '../fixtures/space-shooter/space-shooter.json';
import splashScreen from '../fixtures/splash-screen/splash-screen.json';
import toggleMusicPlaySound from '../fixtures/toggle-music-play-sound/toggle-music-play-sound.json';
import typeOnTextEffect from '../fixtures/type-on-text-effect/type-on-text-effect.json';
import zDepth from '../fixtures/z-depth/z-depth.json';
import zombieLaser from '../fixtures/zombie-laser/zombie-laser.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'internal://asteroids') {
      return Promise.resolve(asteroids);
    }
    else if (url === 'internal://brakeout') {
      return Promise.resolve(brakeout);
    }
    else if (url === 'internal://change-position-of-object') {
      return Promise.resolve(changePositionOfObject);
    }
    else if (url === 'internal://change-scale-of-sprites') {
      return Promise.resolve(changeScaleOfSprites);
    }
    else if (url === 'internal://change-sprite-animation') {
      return Promise.resolve(changeSpriteAnimation);
    }
    else if (url === 'internal://create-object-with-mouseclick') {
      return Promise.resolve(createObjectWithMouseclick);
    }
    else if (url === 'internal://drag-camera-with-mouse') {
      return Promise.resolve(dragCameraWithMouse);
    }
    else if (url === 'internal://infinite-scrolling-background') {
      return Promise.resolve(infiniteScrollingBackground);
    }
    else if (url === 'internal://instance-timer') {
      return Promise.resolve(instanceTimer);
    }
    else if (url === 'internal://inventory-system') {
      return Promise.resolve(inventorySystem);
    }
    else if (url === 'internal://keyboard-practice') {
      return Promise.resolve(keyboardPractice);
    }
    else if (url === 'internal://manipulate-text-object') {
      return Promise.resolve(manipulateTextObject);
    }
    else if (url === 'internal://move-camera-to-position') {
      return Promise.resolve(moveCameraToPosition);
    }
    else if (url === 'internal://move-object-toward-position') {
      return Promise.resolve(moveObjectTowardPosition);
    }
    else if (url === 'internal://move-object-with-physics') {
      return Promise.resolve(moveObjectWithPhysics);
    }
    else if (url === 'internal://parallax') {
      return Promise.resolve(parallax);
    }
    else if (url === 'internal://parallax-scrolling') {
      return Promise.resolve(parallaxScrolling);
    }
    else if (url === 'internal://parse-json-from-api') {
      return Promise.resolve(parseJsonFromApi);
    }
    else if (url === 'internal://particles-explosions') {
      return Promise.resolve(particlesExplosions);
    }
    else if (url === 'internal://particles-various-effects') {
      return Promise.resolve(particlesVariousEffects);
    }
    else if (url === 'internal://pathfinding') {
      return Promise.resolve(pathfinding);
    }
    else if (url === 'internal://pathfinding-basics') {
      return Promise.resolve(pathfindingBasics);
    }
    else if (url === 'internal://physics') {
      return Promise.resolve(physics);
    }
    else if (url === 'internal://platformer') {
      return Promise.resolve(platformer);
    }
    else if (url === 'internal://play-stop-sprite-animation') {
      return Promise.resolve(playStopSpriteAnimation);
    }
    else if (url === 'internal://random-color-picker') {
      return Promise.resolve(randomColorPicker);
    }
    else if (url === 'internal://rotate-toward-mouse') {
      return Promise.resolve(rotateTowardMouse);
    }
    else if (url === 'internal://rotate-toward-position') {
      return Promise.resolve(rotateTowardPosition);
    }
    else if (url === 'internal://rotate-with-keypress') {
      return Promise.resolve(rotateWithKeypress);
    }
    else if (url === 'internal://save-load') {
      return Promise.resolve(saveLoad);
    }
    else if (url === 'internal://shoot-bullets') {
      return Promise.resolve(shootBullets);
    }
    else if (url === 'internal://space-shooter') {
      return Promise.resolve(spaceShooter);
    }
    else if (url === 'internal://splash-screen') {
      return Promise.resolve(splashScreen);
    }
    else if (url === 'internal://toggle-music-play-sound') {
      return Promise.resolve(toggleMusicPlaySound);
    }
    else if (url === 'internal://type-on-text-effect') {
      return Promise.resolve(typeOnTextEffect);
    }
    else if (url === 'internal://z-depth') {
      return Promise.resolve(zDepth);
    }
    else if (url === 'internal://zombie-laser') {
      return Promise.resolve(zombieLaser);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
