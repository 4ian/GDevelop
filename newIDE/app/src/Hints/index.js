// @flow
import { t } from '@lingui/macro';

export type Hint = {| kind: 'warning' | 'info', message: string |};

export const getDeprecatedBehaviorsInformation = (): {
  [string]: {| warning: string |},
} => ({
  'PhysicsBehavior::PhysicsBehavior': {
    warning: t`A new physics engine (Physics Engine 2.0) is now available. You should prefer using it for new game. For existing games, note that the two behaviors are not compatible, so you should only use one of them with your objects.`,
  },
});

export const getExperimentalObjects = (): {
  [string]: boolean,
} => ({
  'Video::VideoObject': true,
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

  return null;
};
