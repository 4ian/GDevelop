// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type AlertMessageIdentifier } from '../MainFrame/Preferences/PreferencesContext';

export type Hint = {|
  kind: 'warning' | 'info',
  message: MessageDescriptor,
  identifier?: AlertMessageIdentifier,
|};

export const getDeprecatedBehaviorsInformation = (): {
  [string]: {| warning: MessageDescriptor |},
} => ({
  'PhysicsBehavior::PhysicsBehavior': {
    warning: t`A new physics engine (Physics Engine 2.0) is now available. You should prefer using it for new game. For existing games, note that the two behaviors are not compatible, so you should only use one of them with your objects.`,
  },
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
      kind: 'info',
      message: t`For a pixel type font, you must disable the Smooth checkbox related to your texture in the game resources to disable anti-aliasing.`,
    },
    {
      kind: 'info',
      message: t`The font size is stored directly inside the font. If you want to change it, export again your font using an external editor like bmFont. Click on the help button to learn more.`,
    },
  ],
  'TileMap::TileMap': [
    {
      kind: 'info',
      message: t`The tilemap must be designed in a separated program, Tiled, that can be downloaded on mapeditor.org. Save your map as a JSON file, then select here the Atlas image that you used and the Tile map JSON file.`,
    },
  ],
  'TextInput::TextInputObject': [
    {
      kind: 'warning',
      message: t`The text input will be always shown on top of all other objects in the game - this is a limitation that can't be changed. According to the platform/device or browser running the game, the appearance can also slightly change.`,
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
  if (type.startsWith('BoundingBox')) {
    return {
      kind: 'info',
      message: t`The bounding box is an imaginary rectangle surrounding the object collision mask. Even if the object X and Y positions are not changed, this rectangle can change if the object is rotated or if an animation is being played. Usually you should use actions and conditions related to the object position or center, but the bounding box can be useful to deal with the area of the object.`,
    };
  }
  if (type === 'PickedInstancesCount') {
    return {
      kind: 'info',
      message: t`If no previous condition or action used the specified object(s), the picked instances count will be 0.`,
    };
  }
  if (type === 'CompareTimer') {
    return {
      kind: 'info',
      message: t`To start a timer, don't forget to use the action "Start (or reset) a scene timer" in another event.`,
    };
  }
  if (type === 'CompareObjectTimer') {
    return {
      kind: 'info',
      message: t`To start a timer, don't forget to use the action "Start (or reset) an object timer" in another event.`,
    };
  }
  if (type === 'FixCamera') {
    return {
      kind: 'info',
      message: t`Please prefer using the new action "Enforce camera boundaries" which is more flexible.`,
    };
  }
  if (type === 'BitmapText::Scale') {
    return {
      kind: 'info',
      message: t`A scale under 1 on a Bitmap text object can downgrade the quality text, prefer to remake a bitmap font smaller in the external bmFont editor.`,
    };
  }
  if (type === 'TextObject::Text::SetFontSize') {
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
      identifier: 'p2p-dataloss',
    };
  }
  if (type === 'PlatformBehavior::IsObjectOnGivenFloor') {
    return {
      kind: 'info',
      message: t`This condition may have unexpected results when the object is on different floors at the same time, due to the fact that the engine only considers the first floor the object comes into contact with.`,
    };
  }
  if (type === 'P2P::OverrideID') {
    return {
      kind: 'warning',
      message: t`Overriding the ID may have unwanted consequences, such as blocking the ability to connect to any peer. Do not use this feature unless you really know what you are doing.`,
    };
  }
  if (type.indexOf('P2P::') === 0) {
    return {
      kind: 'warning',
      message: t`P2P is merely a peer-to-peer networking solution. It only handles the connection to another player, and the exchange of messages. Higher-level tasks, such as synchronizing the game state, are left to by implemented by you. 

Use the THNK Framework if you seek an easy, performant and flexible higher-level solution.`,
      identifier: 'p2p-is-networking',
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
  if (type === 'PrioritizeLoadingOfScene') {
    return {
      kind: 'info',
      message: t`For most games, the default automatic loading of resources will be fine. This action should only be used when trying to avoid loading screens from appearing between scenes.`,
    };
  }

  return null;
};
