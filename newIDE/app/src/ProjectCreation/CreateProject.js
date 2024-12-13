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
  const light = layer.getEffects().insertNewEffect('3D Light', 0);
  light.setEffectType('Scene3D::HemisphereLight');
  light.setStringParameter('skyColor', '255;255;255');
  light.setStringParameter('groundColor', '64;64;64');
  light.setDoubleParameter('intensity', 1);
  light.setStringParameter('top', 'Y-');
  light.setDoubleParameter('elevation', 45);
  light.setDoubleParameter('rotation', 0);
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

export const createNewProjectFromAIGeneratedProject = (
  generatedProjectUrl: string
): NewProjectSource => {
  sendNewGameCreated({
    exampleUrl: generatedProjectUrl,
    exampleSlug: 'generated-project',
  });
  const newProjectSource = getNewProjectSourceFromUrl(generatedProjectUrl);
  newProjectSource.templateSlug = 'generated-project';
  return newProjectSource;
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
}: {|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
|}): Promise<?NewProjectSource> => {
  try {
    const example = await getExample(exampleShortHeader);

    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
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
