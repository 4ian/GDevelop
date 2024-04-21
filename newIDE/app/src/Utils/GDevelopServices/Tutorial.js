// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';

export type TutorialCategory =
  | 'game-mechanic'
  | 'full-game'
  | 'official-beginner'
  | 'official-intermediate'
  | 'official-advanced';

export type Tutorial = {|
  id: string,
  /** Deprecated - see `titleByLocale`. */
  title: string,
  titleByLocale: MessageByLocale,
  /** Deprecated - see `descriptionByLocale`. */
  description: string,
  descriptionByLocale: MessageByLocale,
  type: 'video' | 'text',
  category: TutorialCategory,
  duration?: number,
  /** Deprecated - see `linkByLocale`. */
  link: string,
  linkByLocale: MessageByLocale,
  /** Deprecated - see `thumbnailUrlByLocale`. */
  thumbnailUrl: string,
  thumbnailUrlByLocale: MessageByLocale,
|};

export const listAllTutorials = (): Promise<Array<Tutorial>> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/tutorial`)
    .then(response => response.data);
};

export const getObjectTutorialIds = (type: string): Array<string> => {
  switch (type) {
    case 'ParticleSystem::ParticleEmitter':
      return ['in-depth-tutorial-particle-emitter'];
    case 'Lighting::LightObject':
      return ['flickering-dynamic-light-effect'];
    case 'BitmapText::BitmapTextObject':
    case 'TileMap::TileMap':
      return ['intermediate-bitmap-text-and-tilemap'];
    default:
      return [];
  }
};

export const getBehaviorTutorialIds = (type: string): Array<string> => {
  switch (type) {
    case 'Tween::TweenBehavior':
      return ['tween-behavior'];
    case 'AnchorBehavior::AnchorBehavior':
      return ['responsive-ui'];
    case 'Physics2::Physics2Behavior':
      return ['in-depth-tutorial-physics-engine-two'];
    case 'PlatformBehavior::PlatformerObjectBehavior':
    case 'PlatformBehavior::PlatformBehavior':
      return ['in-depth-tutorial-platformer'];
    case 'TopDownMovementBehavior::TopDownMovementBehavior':
      return ['in-depth-tutorial-top-down-behavior'];
    default:
      return [];
  }
};

export const getInstructionTutorialIds = (type: string): Array<string> => {
  switch (type) {
    case 'CameraX':
    case 'CameraY':
    case 'RotateCamera':
    case 'ZoomCamera':
    case 'FixCamera':
    case 'CentreCamera':
      return ['smooth-camera-movement'];
    case 'ChangeTimeScale':
      return ['pause-menu'];
    case 'EcrireFichierExp':
    case 'EcrireFichierTxt':
    case 'LireFichierExp':
    case 'LireFichierTxt':
      return ['intermediate-storage'];
    case 'PlatformBehavior::SimulateJumpKey':
      return ['simple-trampoline-platformer'];
    case 'AjoutObjConcern':
    case 'PickNearest':
    case 'AjoutHasard':
      return ['intermediate-object-picking'];
    case 'ToggleObjectVariableAsBoolean':
    case 'ToggleGlobalVariableAsBoolean':
    case 'ToggleSceneVariableAsBoolean':
      return ['iIntermediate-toggle-states-with-variable'];
    case 'Scene':
    case 'PushScene':
    case 'PopScene':
      return ['intermediate-level-select-menu'];
    case 'Animation':
    case 'AnimationName':
    case 'ChangeAnimation':
    case 'ChangeAnimationName':
      return ['intermediate-changing-animations'];
    case 'PopStartedTouch':
    case 'MouseButtonPressed':
      return ['intermediate-touchscreen-controls'];
    default:
      return [];
  }
};
