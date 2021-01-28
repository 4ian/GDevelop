// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';

export type Hint = {|
  kind: 'warning' | 'info',
  message: MessageDescriptor,
  identifier?: AlertMessageIdentifier,
|};
export type TutorialHint = {|
  kind: 'tutorial' | 'video-tutorial',
  name: string,
  message: MessageDescriptor,
  iconSrc: string,
  link: string,
  identifier: string,
|};

export const getDeprecatedBehaviorsInformation = (): {
  [string]: {| warning: MessageDescriptor |},
} => ({
  'PhysicsBehavior::PhysicsBehavior': {
    warning: t`A new physics engine (Physics Engine 2.0) is now available. You should prefer using it for new game. For existing games, note that the two behaviors are not compatible, so you should only use one of them with your objects.`,
  },
});

export const getExperimentalObjects = (): {
  [string]: boolean,
} => ({
  'Video::VideoObject': true,
  'BitmapText::BitmapTextObject': true,
  'SkeletonObject::Skeleton': true,
});

export const getExtraObjectsInformation = (): {
  [string]: Array<Hint>,
} => ({
  'Video::VideoObject': [
    {
      kind: 'warning',
      message: t`Most browsers will require the user to have interacted with your game before allowing any video to play. Make sure that the player click/touch the screen at the beginning of the game before starting any video.`,
    },
    {
      kind: 'warning',
      message: t`For a given video resource, only one video will be played in memory and displayed. If you put this object multiple times on the scene, all the instances will be displaying the exact same video (with the same timing and paused/played/stopped state).`,
    },
    {
      kind: 'info',
      message: t`Video format supported can vary according to devices and browsers. For maximum compatibility, use H.264/mp4 file format (and AAC for audio).`,
    },
  ],
  'BitmapText::BitmapTextObject': [
    {
      kind: 'warning',
      message: t`This object is experimental and not yet complete. It might have bugs or incomplete support in GDevelop, be sure to read the wiki by clicking on help button bellow.`,
    },
    {
      kind: 'info',
      message: t`For a pixel type font, you must disable the Smooth checkbox related to your texture in the game resources to disable anti-aliasing.`,
    },
    {
      kind: 'info',
      message: t`For editing the font size you have to make a new export in an external editor like bmFont, click on help button bellow for more help.`,
    },
  ],
  'SkeletonObject::Skeleton': [
    {
      kind: 'warning',
      message: t`This object is experimental and not actively maintained. It might have bugs or incomplete support in GDevelop. A maintainer is searched to improve the object implementation and solve any issue. Your help is welcome!`,
    },
    {
      kind: 'info',
      message: t`Only use this object if you can contribute back to the source code or are able to remove/replace it from your game in a future version.`,
    },
  ],
});

export const getExtraInstructionInformation = (type: string): ?Hint => {
  if (type.indexOf('PhysicsBehavior::') === 0) {
    return {
      kind: 'warning',
      message: t`This action is deprecated and should not be used anymore. Instead,
  use for all your objects the behavior called "Physics2" and the
  associated actions (in this case, all objects must be set up to use
  Physics2, you can't mix the behaviors).`,
    };
  }
  if (type === 'BitmapText::Scale') {
    return {
      kind: 'info',
      message: t`A scale under 1 on a Bitmap text object can downgrade the quality text, prefer to remake a bitmap font smaller in the external bmFont editor.`,
    };
  }
  if (type === 'TextObject::Size') {
    return {
      kind: 'warning',
      message: t`This action will create a new texture and re-render the text each time it is called, which is expensive and can reduce performances. Prefer to avoid changing a lot the character size of a text.`,
    };
  }
  if (type === 'PlayMusicCanal' || type === 'PlayMusic') {
    return {
      kind: 'warning',
      message: t`Musics will only be played if the user has interacted with the game before (by clicking/touching it or pressing a key on the keyboard). This is due to browser limitations. Make sure to have the user interact with the game before using this action.`,
    };
  }
  if (type === 'P2P::OnEvent') {
    return {
      kind: 'info',
      message: t`Read the wiki page for more info about the dataloss mode.`,
    };
  }
  if (type.indexOf('P2P::') === 0) {
    return {
      kind: 'warning',
      message: t`It is recommended to use your own custom broker server. Read the wiki page for more info.`,
      identifier: 'p2p-broker-recommendation',
    };
  }
  if (type === 'SystemInfo::IsMobile') {
    return {
      kind: 'warning',
      message: t`Note that the distinction between what is a mobile device and what is not is becoming blurry (with devices like iPad pro and other "desktop-class" tablets). If you use this for mobile controls, prefer to check if the device has touchscreen support.`,
    };
  }
  if (
    type === 'AdvancedWindow::SetClosable' ||
    type === 'AdvancedWindow::EnableWindow' ||
    type === 'AdvancedWindow::Show' ||
    type === 'AdvancedWindow::SetFocusable' ||
    type === 'AdvancedWindow::Focus'
  ) {
    return {
      kind: 'warning',
      message: t`Be careful with this action, you may have problems exiting the preview if you don't add a way to toggle it back.`,
    };
  }
  if (type === 'GetArgumentAsBoolean') {
    return {
      kind: 'info',
      message: t`If the parameter is a string or a number, you probably want to use the expressions "GetArgumentAsString" or "GetArgumentAsNumber", along with the conditions "Compare two strings" or "Compare two numbers".`,
    };
  }

  return null;
};

const tutorialHints = {
  'screen-shake-timer-variables': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/screen-shake-timer-variables.jpg',
    name: 'Screen Shake Effect with Timers and Variables',
    message: t`Learn how to add a screen shake effect when the player falls from a very high platform in a platformer.`,
    link: 'https://www.youtube.com/watch?v=0w0NGuj4OFQ',
    identifier: 'screen-shake-timer-variables',
  },
  'ghost-enemy-following-player': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/ghost-enemy-following-player.jpg',
    name: 'Ghost Enemy Following the Player',
    message: t`Make a ghost like enemy floating toward the player.`,
    link: 'https://www.youtube.com/watch?v=SLUlnhKuuqE',
    identifier: 'ghost-enemy-following-player',
  },
  'melee-sword-attack': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/melee-sword-attack.jpg',
    name: 'Melee/Sword Attack',
    message: t`Learn how to make a melee/sword attack with a randomly triggered animation each time a key is pressed.`,
    link: 'https://www.youtube.com/watch?v=3XT40kDRp8g',
    identifier: 'melee-sword-attack',
  },
  'physics-engine-platformer-game': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/physics-engine-platformer-game.jpg',
    name: 'Platformer with the physics engine',
    message: t`Learn how to make a platformer game using the physics engine.`,
    link: 'https://www.youtube.com/watch?v=96gNCmnQwaE',
    identifier: 'physics-engine-platformer-game',
  },
  'tween-behavior': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/tween-behavior.jpg',
    name: 'Tween Behavior',
    message: t`Learn how to use the Tween Behavior and how it can be used to add more life and animation to you projects.`,
    link: 'https://www.youtube.com/watch?v=SLqnwC9D5Q4',
    identifier: 'tween-behavior',
  },
  'responsive-ui': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/responsive-ui.jpg',
    name: 'Reponsive UI',
    message: t`Learn how to add responsive UI using anchors.`,
    link: 'https://www.youtube.com/watch?v=VgrEhg0esCg',
    identifier: 'responsive-ui',
  },
  'smooth-camera-movement': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/smooth-camera-movement.jpg',
    name: 'Smooth Camera Movement',
    message: t`Learn how to make the camera follow the player in a smooth movement.`,
    link: 'https://www.youtube.com/watch?v=yUNisggNh7s',
    identifier: 'smooth-camera-movement',
  },
  'pause-menu': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/pause-menu.jpg',
    name: 'Pause Menu',
    message: t`Learn how to stop the time and make a pause menu.`,
    link: 'https://www.youtube.com/watch?v=k2J784esdkc',
    identifier: 'pause-menu',
  },
  'character-selection-feature': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/character-selection-feature.jpg',
    name: 'Character Selection',
    message: t`Learn how to add a selector to choose a character (or anything else) in your game.`,
    link: 'https://www.youtube.com/watch?v=8DpsjXHd4ro',
    identifier: 'character-selection-feature',
  },
  'push-objects': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/push-objects.jpg',
    name: 'Push Objects',
    message: t`Learn how to push objects, like a box, in a platform game.`,
    link: 'https://www.youtube.com/watch?v=11tjJ0JgYuk',
    identifier: 'push-objects',
  },
  'save-and-load': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/save-and-load.jpg',
    name: 'Save and Load',
    message: t`Learn how to save the player progress, and other information, and to load them again later.`,
    link: 'https://www.youtube.com/watch?v=bXUGJqHhuCo',
    identifier: 'save-and-load',
  },
  'particle-effects': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/particle-effects.jpg',
    name: 'Particle Effects',
    message: t`Learn how to use particle emitters in GDevelop to create effects like fire, explosion, magic beam, etc...`,
    link: 'https://www.youtube.com/watch?v=7sqMmTntvKs',
    identifier: 'particle-effects',
  },
  'opening-chest': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/opening-chest.jpg',
    name: 'Open a Loot Chest',
    message: t`How to open a loot chest with a key that the player can find in the level`,
    link: 'https://www.youtube.com/watch?v=1qsCgwFtYfg',
    identifier: 'opening-chest',
  },
  'health-bar-and-health-potion': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/health-bar-and-health-potion.jpg',
    name: 'Create a Health Bar and Health Potion',
    message: t`How to show a health bar on screen and a potion to give back health to the player.`,
    link: 'https://www.youtube.com/watch?v=P-scQW7PeVg',
    identifier: 'health-bar-and-health-potion',
  },
  'touch-360-joystick-controller': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/touch-360-joystick-controller.jpg',
    name: 'Create a Touch 360 Joystick Controller',
    message: t`How to create a joystick displayed on screen, useful to control the player in mobile games.`,
    link: 'https://www.youtube.com/watch?v=-k-bVU3QrfA',
    identifier: 'touch-360-joystick-controller',
  },
  'flickering-dynamic-light-effect': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/flickering-dynamic-light-effect.jpg',
    name: 'Create a Flickering Dynamic Light Effect',
    message: t`Learn how to create a dynamic light following the player, with a flickering effect.`,
    link: 'https://www.youtube.com/watch?v=HolCWx4E0TU',
    identifier: 'flickering-dynamic-light-effect',
  },
  '2d-platformer-shooter': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/2d-platformer-shooter.jpg',
    name: 'Create a 2D Platformer Shooter',
    message: t`Create a 2D platform game where the player can shoot at enemies chasing him.`,
    link: 'https://www.youtube.com/watch?v=OOw3Sh6rga8',
    identifier: '2d-platformer-shooter',
  },
  'animated-buttons': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/animated-buttons.jpg',
    name: 'Create Animated Buttons',
    message: t`Create animated buttons that can be shown in your game menus (main menu, selection screen, etc...).`,
    link: 'https://www.youtube.com/watch?v=7_oLY_x4vEk',
    identifier: 'animated-buttons',
  },
  'simple-trampoline-platformer': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/simple-trampoline-platformer.jpg',
    name: 'Make a Simple Trampoline/Jump Pad',
    message: t`Create a trampoline in your platformer game, making the player jump very high when stepped on.`,
    link: 'https://www.youtube.com/watch?v=p42i4omA7j8',
    identifier: 'simple-trampoline-platformer',
  },
  '2d-car-physics-movement': {
    kind: 'video-tutorial',
    iconSrc: 'res/tutorial_icons/2d-car-physics-movement.jpg',
    name: 'How to Make a 2D Car or Bike Movement With Physics Engine',
    message: t`Learn how to create a physics based car movement.`,
    link: 'https://www.youtube.com/watch?v=_-fX755cctU',
    identifier: '2d-car-physics-movement',
  },
};

const allTutorialHints = Object.keys(tutorialHints).map(
  identifier => tutorialHints[identifier]
);

export const getObjectTutorialHints = (type: string): Array<TutorialHint> => {
  if (type === 'ParticleSystem::ParticleEmitter') {
    return [tutorialHints['particle-effects']];
  }
  if (type === 'Lighting::LightObject') {
    return [tutorialHints['flickering-dynamic-light-effect']];
  }

  return [];
};

export const getBehaviorTutorialHints = (type: string): Array<TutorialHint> => {
  if (type === 'Tween::TweenBehavior') {
    return [tutorialHints['tween-behavior']];
  }
  if (type === 'AnchorBehavior::AnchorBehavior') {
    return [tutorialHints['responsive-ui']];
  }
  if (type === 'Physics2::Physics2Behavior') {
    return [
      tutorialHints['physics-engine-platformer-game'],
      tutorialHints['2d-car-physics-movement'],
    ];
  }

  return [];
};

export const getInstructionTutorialHints = (
  type: string
): Array<TutorialHint> => {
  if (
    [
      'CameraX',
      'CameraY',
      'RotateCamera',
      'ZoomCamera',
      'FixCamera',
      'CentreCamera',
    ].includes(type)
  ) {
    return [tutorialHints['smooth-camera-movement']];
  }
  if (type === 'ChangeTimeScale') {
    return [tutorialHints['pause-menu']];
  }
  if (
    [
      'EcrireFichierExp',
      'EcrireFichierTxt',
      'LireFichierExp',
      'LireFichierTxt',
    ].includes(type)
  ) {
    return [tutorialHints['save-and-load']];
  }
  if (type === 'PlatformBehavior::SimulateJumpKey') {
    return [tutorialHints['simple-trampoline-platformer']];
  }

  return [];
};

export const getAllTutorialHints = (): Array<TutorialHint> => allTutorialHints;
