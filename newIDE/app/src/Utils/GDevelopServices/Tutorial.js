// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';

export type Tutorial = {|
  id: string,
  title: string,
  description: string,
  type: 'video' | 'text',
  link: string,
  thumbnailUrl: string,
|};

export const listAllTutorials = (): Promise<Array<Tutorial>> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/tutorial`)
    .then(response => response.data);
};

export const getObjectTutorialIds = (type: string): Array<string> => {
  switch (type) {
    case 'ParticleSystem::ParticleEmitter':
      return ['particle-effects'];
    case 'Lighting::LightObject':
      return ['flickering-dynamic-light-effect'];
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
      return ['physics-engine-platformer-game', '2d-car-physics-movement'];
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
      return ['save-and-load'];
    case 'PlatformBehavior::SimulateJumpKey':
      return ['simple-trampoline-platformer'];
    default:
      return [];
  }
};
