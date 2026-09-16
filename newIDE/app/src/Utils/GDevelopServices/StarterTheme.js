// @flow
import axios from 'axios';
import { GDevelopAssetCdn, GDevelopExampleCdn } from './ApiConfigs';
import { retryIfFailed } from '../RetryIfFailed';

/**
 * Maps the placeholder art of the 3D starters to the "slots" a theme fills.
 * Published by the Examples repository, next to the examples database.
 */
export type StarterPlaceholders = {|
  version: number,
  slots: Array<{|
    id: string,
    kind: 'model' | 'texture',
    label: string,
  |}>,
  models: { [fileBaseName: string]: string },
  textures: { [fileBaseName: string]: string },
  ignoredTextures: Array<string>,
|};

export type StarterThemeResourceOrigin = {|
  name: string,
  identifier: string,
|};

/**
 * A model slot carries the serialized `content` of the asset's
 * Scene3D::Model3DObject (dimensions, rotation, material, animations) and the
 * file the project's model resource must point at.
 */
export type StarterThemeModelSlot = {|
  kind: 'model',
  file: string,
  objectContent: Object,
  assetStoreId?: ?string,
  origin?: ?StarterThemeResourceOrigin,
|};

export type StarterThemeTextureSlot = {|
  kind: 'texture',
  file: string,
  origin?: ?StarterThemeResourceOrigin,
|};

export type StarterThemeSlot = StarterThemeModelSlot | StarterThemeTextureSlot;

/**
 * Everything needed to re-skin a starter, in a single payload: it is fetched in
 * parallel with the template and applied before the project is loaded, so the
 * placeholder art is never displayed.
 */
export type StarterTheme = {|
  id: string,
  name: string,
  slots: { [slotId: string]: StarterThemeSlot },
|};

export type StarterThemeShortHeader = {|
  id: string,
  name: string,
  description: string,
|};

// Both files change only when a starter or a theme is published: keep them for
// the session so re-creating a project costs no extra request.
let starterPlaceholdersPromise: ?Promise<StarterPlaceholders> = null;
const starterThemePromises: { [themeId: string]: Promise<StarterTheme> } = {};

export const getStarterPlaceholders = (): Promise<StarterPlaceholders> => {
  if (!starterPlaceholdersPromise) {
    starterPlaceholdersPromise = retryIfFailed({ times: 2 }, async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const response = await axios.get(
        `${GDevelopExampleCdn.baseUrl.live}/starterPlaceholders.json`
      );
      return response.data;
    }).catch(error => {
      starterPlaceholdersPromise = null;
      throw error;
    });
  }
  return starterPlaceholdersPromise;
};

export const getStarterTheme = (themeId: string): Promise<StarterTheme> => {
  if (!starterThemePromises[themeId]) {
    starterThemePromises[themeId] = retryIfFailed({ times: 2 }, async () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const response = await axios.get(
        `${GDevelopAssetCdn.baseUrl.live}/themes/${themeId}.json`
      );
      return response.data;
    }).catch(error => {
      delete starterThemePromises[themeId];
      throw error;
    });
  }
  return starterThemePromises[themeId];
};

export const listStarterThemes = async (): Promise<
  Array<StarterThemeShortHeader>
> => {
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const response = await axios.get(
    `${GDevelopAssetCdn.baseUrl.live}/themes/themes.json`
  );
  return response.data;
};
