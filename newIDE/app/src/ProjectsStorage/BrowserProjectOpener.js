import advancedShapeBasedPainter from '../fixtures/advanced-shape-based-painter/advanced-shape-based-painter.json';
import animationSpeedScale from '../fixtures/animation-speed-scale/animation-speed-scale.json';
import asteroids from '../fixtures/asteroids/asteroids.json';
import basicAiWithPathfinding from '../fixtures/basic-ai-with-pathfinding/basic-ai-with-pathfinding.json';
import basicArtificialIntelligence from '../fixtures/basic-artificial-intelligence/basic-artificial-intelligence.json';
import basicTopdownCarDriving from '../fixtures/basic-topdown-car-driving/basic-topdown-car-driving.json';
import bombTheCrate from '../fixtures/bomb-the-crate/bomb-the-crate.json';
import brakeout from '../fixtures/brakeout/brakeout.json';
import buttons from '../fixtures/buttons/buttons.json';
import carPhysics from '../fixtures/car-physics/car-physics.json';
import centerObjectWithinAnother from '../fixtures/center-object-within-another/center-object-within-another.json';
import changePositionOfObject from '../fixtures/change-position-of-object/change-position-of-object.json';
import changeScaleOfSprites from '../fixtures/change-scale-of-sprites/change-scale-of-sprites.json';
import changeSpriteAnimation from '../fixtures/change-sprite-animation/change-sprite-animation.json';
import changeSpriteColor from '../fixtures/change-sprite-color/change-sprite-color.json';
import createObjectWithMouseclick from '../fixtures/create-object-with-mouseclick/create-object-with-mouseclick.json';
import customizeKeysWithLastpressedkey from '../fixtures/customize-keys-with-lastpressedkey/customize-keys-with-lastpressedkey.json';
import dragCameraWithMouse from '../fixtures/drag-camera-with-mouse/drag-camera-with-mouse.json';
import findDiagonals from '../fixtures/find-diagonals/find-diagonals.json';
import infiniteScrollingBackground from '../fixtures/infinite-scrolling-background/infinite-scrolling-background.json';
import instanceTimer from '../fixtures/instance-timer/instance-timer.json';
import inventorySystem from '../fixtures/inventory-system/inventory-system.json';
import isometricGame from '../fixtures/isometric-game/isometric-game.json';
import keyboardPractice from '../fixtures/keyboard-practice/keyboard-practice.json';
import magnet from '../fixtures/magnet/magnet.json';
import manipulateTextObject from '../fixtures/manipulate-text-object/manipulate-text-object.json';
import moveCameraToPosition from '../fixtures/move-camera-to-position/move-camera-to-position.json';
import moveObjectInCircle from '../fixtures/move-object-in-circle/move-object-in-circle.json';
import moveObjectTowardPosition from '../fixtures/move-object-toward-position/move-object-toward-position.json';
import moveObjectWithPhysics from '../fixtures/move-object-with-physics/move-object-with-physics.json';
import multitouch from '../fixtures/multitouch/multitouch.json';
import objectGravity from '../fixtures/object-gravity/object-gravity.json';
import objectSelection from '../fixtures/object-selection/object-selection.json';
import openUrlInBrowser from '../fixtures/open-url-in-browser/open-url-in-browser.json';
import parallax from '../fixtures/parallax/parallax.json';
import parallaxScrolling from '../fixtures/parallax-scrolling/parallax-scrolling.json';
import parseJsonFromApi from '../fixtures/parse-json-from-api/parse-json-from-api.json';
import parseJsonString from '../fixtures/parse-json-string/parse-json-string.json';
import particlesExplosions from '../fixtures/particles-explosions/particles-explosions.json';
import particlesVariousEffects from '../fixtures/particles-various-effects/particles-various-effects.json';
import pathfinding from '../fixtures/pathfinding/pathfinding.json';
import pathfindingBasics from '../fixtures/pathfinding-basics/pathfinding-basics.json';
import physics from '../fixtures/physics/physics.json';
import pinObjectToAnother from '../fixtures/pin-object-to-another/pin-object-to-another.json';
import pinObjectToAnotherMultipleParents from '../fixtures/pin-object-to-another-multiple-parents/pin-object-to-another-multiple-parents.json';
import platformer from '../fixtures/platformer/platformer.json';
import playMusicOnMobile from '../fixtures/play-music-on-mobile/play-music-on-mobile.json';
import playStopSpriteAnimation from '../fixtures/play-stop-sprite-animation/play-stop-sprite-animation.json';
import racingGame from '../fixtures/racing-game/racing-game.json';
import rain from '../fixtures/rain/rain.json';
import randomColorPicker from '../fixtures/random-color-picker/random-color-picker.json';
import rotateTowardMouse from '../fixtures/rotate-toward-mouse/rotate-toward-mouse.json';
import rotateTowardPosition from '../fixtures/rotate-toward-position/rotate-toward-position.json';
import rotateWithKeypress from '../fixtures/rotate-with-keypress/rotate-with-keypress.json';
import saveLoad from '../fixtures/save-load/save-load.json';
import shootBulletInParabola from '../fixtures/shoot-bullet-in-parabola/shoot-bullet-in-parabola.json';
import shootBullets from '../fixtures/shoot-bullets/shoot-bullets.json';
import shootingBulletsExplanation from '../fixtures/shooting-bullets-explanation/shooting-bullets-explanation.json';
import snapObjectToGrid from '../fixtures/snap-object-to-grid/snap-object-to-grid.json';
import spaceShooter from '../fixtures/space-shooter/space-shooter.json';
import splashScreen from '../fixtures/splash-screen/splash-screen.json';
import spriteFadeInOut from '../fixtures/sprite-fade-in-out/sprite-fade-in-out.json';
import textEntryObject from '../fixtures/text-entry-object/text-entry-object.json';
import textFadeInOut from '../fixtures/text-fade-in-out/text-fade-in-out.json';
import textToSpeech from '../fixtures/text-to-speech/text-to-speech.json';
import toggleMusicPlaySound from '../fixtures/toggle-music-play-sound/toggle-music-play-sound.json';
import typeOnTextEffect from '../fixtures/type-on-text-effect/type-on-text-effect.json';
import zDepth from '../fixtures/z-depth/z-depth.json';
import zombieLaser from '../fixtures/zombie-laser/zombie-laser.json';

export default class BrowserProjectOpener {
  static readInternalFile(url) {
    if (url === 'example://advanced-shape-based-painter') {
      return Promise.resolve(advancedShapeBasedPainter);
    } else if (url === 'example://animation-speed-scale') {
      return Promise.resolve(animationSpeedScale);
    } else if (url === 'example://asteroids') {
      return Promise.resolve(asteroids);
    } else if (url === 'example://basic-ai-with-pathfinding') {
      return Promise.resolve(basicAiWithPathfinding);
    } else if (url === 'example://basic-artificial-intelligence') {
      return Promise.resolve(basicArtificialIntelligence);
    } else if (url === 'example://basic-topdown-car-driving') {
      return Promise.resolve(basicTopdownCarDriving);
    } else if (url === 'example://bomb-the-crate') {
      return Promise.resolve(bombTheCrate);
    } else if (url === 'example://brakeout') {
      return Promise.resolve(brakeout);
    } else if (url === 'example://buttons') {
      return Promise.resolve(buttons);
    } else if (url === 'example://car-physics') {
      return Promise.resolve(carPhysics);
    } else if (url === 'example://pin-object-to-another') {
      return Promise.resolve(pinObjectToAnother);
    } else if (url === 'example://pin-object-to-another-multiple-parents') {
      return Promise.resolve(pinObjectToAnotherMultipleParents);
    } else if (url === 'example://center-object-within-another') {
      return Promise.resolve(centerObjectWithinAnother);
    } else if (url === 'example://change-position-of-object') {
      return Promise.resolve(changePositionOfObject);
    } else if (url === 'example://change-scale-of-sprites') {
      return Promise.resolve(changeScaleOfSprites);
    } else if (url === 'example://change-sprite-animation') {
      return Promise.resolve(changeSpriteAnimation);
    } else if (url === 'example://change-sprite-color') {
      return Promise.resolve(changeSpriteColor);
    } else if (url === 'example://create-object-with-mouseclick') {
      return Promise.resolve(createObjectWithMouseclick);
    } else if (url === 'example://customize-keys-with-lastpressedkey') {
      return Promise.resolve(customizeKeysWithLastpressedkey);
    } else if (url === 'example://drag-camera-with-mouse') {
      return Promise.resolve(dragCameraWithMouse);
    } else if (url === 'example://find-diagonals') {
      return Promise.resolve(findDiagonals);
    } else if (url === 'example://infinite-scrolling-background') {
      return Promise.resolve(infiniteScrollingBackground);
    } else if (url === 'example://instance-timer') {
      return Promise.resolve(instanceTimer);
    } else if (url === 'example://inventory-system') {
      return Promise.resolve(inventorySystem);
    } else if (url === 'example://isometric-game') {
      return Promise.resolve(isometricGame);
    } else if (url === 'example://keyboard-practice') {
      return Promise.resolve(keyboardPractice);
    } else if (url === 'example://magnet') {
      return Promise.resolve(magnet);
    } else if (url === 'example://manipulate-text-object') {
      return Promise.resolve(manipulateTextObject);
    } else if (url === 'example://move-camera-to-position') {
      return Promise.resolve(moveCameraToPosition);
    } else if (url === 'example://move-object-in-circle') {
      return Promise.resolve(moveObjectInCircle);
    } else if (url === 'example://move-object-toward-position') {
      return Promise.resolve(moveObjectTowardPosition);
    } else if (url === 'example://move-object-with-physics') {
      return Promise.resolve(moveObjectWithPhysics);
    } else if (url === 'example://multitouch') {
      return Promise.resolve(multitouch);
    } else if (url === 'example://object-gravity') {
      return Promise.resolve(objectGravity);
    } else if (url === 'example://object-selection') {
      return Promise.resolve(objectSelection);
    } else if (url === 'example://open-url-in-browser') {
      return Promise.resolve(openUrlInBrowser);
    } else if (url === 'example://parallax') {
      return Promise.resolve(parallax);
    } else if (url === 'example://parallax-scrolling') {
      return Promise.resolve(parallaxScrolling);
    } else if (url === 'example://parse-json-from-api') {
      return Promise.resolve(parseJsonFromApi);
    } else if (url === 'example://parse-json-string') {
      return Promise.resolve(parseJsonString);
    } else if (url === 'example://particles-explosions') {
      return Promise.resolve(particlesExplosions);
    } else if (url === 'example://particles-various-effects') {
      return Promise.resolve(particlesVariousEffects);
    } else if (url === 'example://pathfinding') {
      return Promise.resolve(pathfinding);
    } else if (url === 'example://pathfinding-basics') {
      return Promise.resolve(pathfindingBasics);
    } else if (url === 'example://physics') {
      return Promise.resolve(physics);
    } else if (url === 'example://platformer') {
      return Promise.resolve(platformer);
    } else if (url === 'example://play-music-on-mobile') {
      return Promise.resolve(playMusicOnMobile);
    } else if (url === 'example://play-stop-sprite-animation') {
      return Promise.resolve(playStopSpriteAnimation);
    } else if (url === 'example://racing-game') {
      return Promise.resolve(racingGame);
    } else if (url === 'example://rain') {
      return Promise.resolve(rain);
    } else if (url === 'example://random-color-picker') {
      return Promise.resolve(randomColorPicker);
    } else if (url === 'example://rotate-toward-mouse') {
      return Promise.resolve(rotateTowardMouse);
    } else if (url === 'example://rotate-toward-position') {
      return Promise.resolve(rotateTowardPosition);
    } else if (url === 'example://rotate-with-keypress') {
      return Promise.resolve(rotateWithKeypress);
    } else if (url === 'example://save-load') {
      return Promise.resolve(saveLoad);
    } else if (url === 'example://shoot-bullet-in-parabola') {
      return Promise.resolve(shootBulletInParabola);
    } else if (url === 'example://shoot-bullets') {
      return Promise.resolve(shootBullets);
    } else if (url === 'example://shooting-bullets-explanation') {
      return Promise.resolve(shootingBulletsExplanation);
    } else if (url === 'example://snap-object-to-grid') {
      return Promise.resolve(snapObjectToGrid);
    } else if (url === 'example://space-shooter') {
      return Promise.resolve(spaceShooter);
    } else if (url === 'example://splash-screen') {
      return Promise.resolve(splashScreen);
    } else if (url === 'example://sprite-fade-in-out') {
      return Promise.resolve(spriteFadeInOut);
    } else if (url === 'example://text-entry-object') {
      return Promise.resolve(textEntryObject);
    } else if (url === 'example://text-fade-in-out') {
      return Promise.resolve(textFadeInOut);
    } else if (url === 'example://text-to-speech') {
      return Promise.resolve(textToSpeech);
    } else if (url === 'example://toggle-music-play-sound') {
      return Promise.resolve(toggleMusicPlaySound);
    } else if (url === 'example://type-on-text-effect') {
      return Promise.resolve(typeOnTextEffect);
    } else if (url === 'example://z-depth') {
      return Promise.resolve(zDepth);
    } else if (url === 'example://zombie-laser') {
      return Promise.resolve(zombieLaser);
    }

    return Promise.reject(`Unknown built-in game with URL ${url}`);
  }
}
