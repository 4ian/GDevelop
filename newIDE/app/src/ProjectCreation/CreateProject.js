// @flow
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { getExample } from '../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
import {
  type ExampleProjectSetup,
  type NewProjectCreationSource,
} from './NewProjectSetupDialog';
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
    .insertNewEffect('3D Ambient Hemisphere Light', 0);
  ambientLight.setEffectType('Scene3D::HemisphereLight');
  ambientLight.setStringParameter('skyColor', '255;255;255');
  ambientLight.setStringParameter('groundColor', '127;127;127');
  ambientLight.setDoubleParameter('intensity', 0.33);
  ambientLight.setStringParameter('top', 'Z+');
  ambientLight.setDoubleParameter('elevation', 40);
  ambientLight.setDoubleParameter('rotation', 300);
};

export const addDefaultLightToAllLayers = (layout: gdLayout): void => {
  for (let layerIndex = 0; layerIndex < layout.getLayersCount(); layerIndex++) {
    const layer = layout.getLayerAt(layerIndex);
    addDefaultLightToLayer(layer);
  }
};

const getCompositeSlug = (
  creationSource: NewProjectCreationSource,
  exampleShortHeaderSlug: string
) => {
  if (creationSource === 'quick-customization')
    return `qc-${exampleShortHeaderSlug}`;
  if (creationSource === 'ai-agent-request')
    return `ai-${exampleShortHeaderSlug}`;
  if (creationSource === 'course-chapter')
    return `course-${exampleShortHeaderSlug}`;
  if (creationSource === 'in-app-tutorial')
    return `in-app-tutorial-${exampleShortHeaderSlug}`;
  return exampleShortHeaderSlug; // 'default'.
};

export const createNewEmptyProject = ({
  creationSource,
}: {|
  creationSource: NewProjectCreationSource,
|}): NewProjectSource => {
  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();

  const exampleSlug = 'empty-project';

  sendNewGameCreated({
    exampleUrl: '',
    exampleSlug,
    creationSource,
    exampleCompositeSlug: getCompositeSlug(creationSource, exampleSlug),
  });
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
    creationSource: 'in-app-tutorial',
    exampleCompositeSlug: getCompositeSlug('in-app-tutorial', tutorialId),
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
    creationSource: 'course-chapter',
    exampleCompositeSlug: getCompositeSlug('course-chapter', courseChapterId),
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
    creationSource: 'default',
    exampleCompositeSlug: getCompositeSlug('default', privateGameTemplateTag),
  });
  const newProjectSource = getNewProjectSourceFromUrl(privateGameTemplateUrl);
  newProjectSource.templateSlug = privateGameTemplateTag;
  return newProjectSource;
};

export const createNewProjectFromExampleShortHeader = async ({
  i18n,
  exampleShortHeader,
  newProjectSetup,
}: ExampleProjectSetup): Promise<?NewProjectSource> => {
  try {
    const example = await getExample(exampleShortHeader);
    const creationSource = newProjectSetup.creationSource;

    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
      exampleCompositeSlug: getCompositeSlug(
        creationSource,
        exampleShortHeader.slug
      ),
      creationSource,
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
