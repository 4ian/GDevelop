// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import {
  getExample,
  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
const gd: libGDevelop = global.gd;

export type NewProjectSource = {|
  project: ?gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
  templateSlug?: ?string,
|};

const getNewProjectSourceFromUrl = (projectUrl: string): NewProjectSource => {
  return {
    project: null,
    storageProvider: UrlStorageProvider,
    fileMetadata: {
      fileIdentifier: projectUrl,
    },
  };
};

export const addDefaultLightToLayer = (layer: gdLayer): void => {
  const directionalLight = layer
    .getEffects()
    .insertNewEffect('3D Sun Light', 0);
  directionalLight.setEffectType('Scene3D::DirectionalLight');
  directionalLight.setStringParameter('color', '255;255;255');
  directionalLight.setDoubleParameter('intensity', 0.75);
  directionalLight.setStringParameter('top', 'Z+');
  directionalLight.setDoubleParameter('elevation', 40);
  directionalLight.setDoubleParameter('rotation', 300);
  directionalLight.setBooleanParameter('isCastingShadow', true);
  directionalLight.setStringParameter('shadowQuality', 'medium');
  directionalLight.setDoubleParameter('minimumShadowBias', 0);
  directionalLight.setDoubleParameter('distanceFromCamera', 1500);
  directionalLight.setDoubleParameter('frustumSize', 4000);

  const ambientLight = layer
    .getEffects()
    .insertNewEffect('3D Ammbient Light', 0);
  ambientLight.setEffectType('Scene3D::AmbientLight');
  ambientLight.setStringParameter('color', '255;255;255');
  ambientLight.setDoubleParameter('intensity', 0.25);
};

export const addDefaultLightToAllLayers = (layout: gdLayout): void => {
  for (let layerIndex = 0; layerIndex < layout.getLayersCount(); layerIndex++) {
    const layer = layout.getLayerAt(layerIndex);
    addDefaultLightToLayer(layer);
  }
};

export const createNewEmptyProject = (): NewProjectSource => {
  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();

  sendNewGameCreated({ exampleUrl: '', exampleSlug: '' });
  return {
    project,
    storageProvider: null,
    fileMetadata: null,
  };
};

export const createNewProjectFromTutorialTemplate = (
  tutorialTemplateUrl: string,
  tutorialId: string
): NewProjectSource => {
  sendNewGameCreated({
    exampleUrl: tutorialTemplateUrl,
    exampleSlug: tutorialId,
  });
  const newProjectSource = getNewProjectSourceFromUrl(tutorialTemplateUrl);
  newProjectSource.templateSlug = tutorialId;
  return newProjectSource;
};

export const createNewProjectFromCourseChapterTemplate = (
  templateUrl: string,
  courseChapterId: string
): NewProjectSource => {
  sendNewGameCreated({
    exampleUrl: templateUrl,
    exampleSlug: courseChapterId,
    isCourseChapterTemplate: true,
  });
  const newProjectSource = getNewProjectSourceFromUrl(templateUrl);
  newProjectSource.templateSlug = courseChapterId;
  return newProjectSource;
};

export const createNewProjectFromPrivateGameTemplate = (
  privateGameTemplateUrl: string,
  privateGameTemplateTag: string
): NewProjectSource => {
  sendNewGameCreated({
    exampleUrl: privateGameTemplateUrl,
    exampleSlug: privateGameTemplateTag,
  });
  const newProjectSource = getNewProjectSourceFromUrl(privateGameTemplateUrl);
  newProjectSource.templateSlug = privateGameTemplateTag;
  return newProjectSource;
};

export const createNewProjectFromExampleShortHeader = async ({
  i18n,
  exampleShortHeader,
  isQuickCustomization,
}: {|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  isQuickCustomization?: boolean,
|}): Promise<?NewProjectSource> => {
  try {
    const example = await getExample(exampleShortHeader);

    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: `${isQuickCustomization ? 'qc-' : ''}${
        exampleShortHeader.slug
      }`,
    });
    const newProjectSource = getNewProjectSourceFromUrl(example.projectFileUrl);
    newProjectSource.templateSlug = exampleShortHeader.slug;
    return newProjectSource;
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
    return;
  }
};
