// @flow
import { t } from '@lingui/macro';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { getExample } from '../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
import optionalRequire from '../Utils/OptionalRequire';
import {
  type ExampleProjectSetup,
  type NewProjectCreationSource,
} from './NewProjectSetupDialog';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { findLocalProjectTemplatePath } from './LocalProjectTemplateFinder';
const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

export type ProjectTemplateFilesSource =
  | {|
      type: 'github-repository',
      owner: string,
      name: string,
      ref: string,
      // Optional repository subdirectory holding the template files. When set,
      // only files under this directory are copied, and the prefix is stripped
      // so they land at the root of the new project folder.
      subdirectory?: string,
    |}
  | {|
      // Template files bundled with the app (works offline and in the packaged
      // binary). The folder is located at runtime via
      // findLocalProjectTemplatePath.
      type: 'local-folder',
    |};

export type NewProjectSource = {|
  project: ?gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
  templateSlug?: ?string,
  templateFilesSource?: ?ProjectTemplateFilesSource,
|};

export const emptyProjectTemplateFilesSource: ProjectTemplateFilesSource = {
  // The empty-project template (incl. the gdevelop-mcp skill and AGENTS.md) is
  // bundled with the app and copied locally on creation. This avoids any network
  // dependency and keeps working in the released binary.
  type: 'local-folder',
};

type GitHubProjectTemplateRepository = {|
  owner: string,
  name: string,
  ref: string,
  subdirectory?: string,
|};

const getGitHubRepositoryTreeUrl = ({
  owner,
  name,
  ref,
}: GitHubProjectTemplateRepository): string =>
  `https://api.github.com/repos/${owner}/${name}/git/trees/${ref}?recursive=1`;

const getGitHubRepositoryRawFileUrl = (
  repository: GitHubProjectTemplateRepository,
  filePath: string
): string => {
  const encodedFilePath = filePath
    .split('/')
    .map(pathPart => encodeURIComponent(pathPart))
    .join('/');
  return `https://raw.githubusercontent.com/${repository.owner}/${
    repository.name
  }/${repository.ref}/${encodedFilePath}`;
};

export const getProjectTemplateFileDestinationPath = ({
  projectFolder,
  repositoryFilePath,
  path: pathModule = path,
}: {|
  projectFolder: string,
  repositoryFilePath: string,
  path?: any,
|}): string => {
  if (!pathModule) throw new Error('Path module is not supported.');

  const normalizedRelativePath = pathModule.normalize(repositoryFilePath);
  if (
    !normalizedRelativePath ||
    normalizedRelativePath === '.' ||
    normalizedRelativePath === '..' ||
    pathModule.isAbsolute(normalizedRelativePath) ||
    normalizedRelativePath.startsWith(`..${pathModule.sep}`)
  ) {
    throw new Error(`Unsafe project template file path: ${repositoryFilePath}`);
  }

  const destinationPath = pathModule.join(
    projectFolder,
    normalizedRelativePath
  );
  const relativeToProjectFolder = pathModule.relative(
    projectFolder,
    destinationPath
  );
  if (
    !relativeToProjectFolder ||
    relativeToProjectFolder === '..' ||
    relativeToProjectFolder.startsWith(`..${pathModule.sep}`) ||
    pathModule.isAbsolute(relativeToProjectFolder)
  ) {
    throw new Error(`Unsafe project template file path: ${repositoryFilePath}`);
  }

  return destinationPath;
};

export const copyGitHubRepositoryFilesToLocalProjectFolder = async ({
  projectFilePath,
  repository,
  fetch: fetchImpl = typeof fetch !== 'undefined' ? fetch : null,
  fs: fsModule = fs,
  path: pathModule = path,
}: {|
  projectFilePath: string,
  repository: GitHubProjectTemplateRepository,
  fetch?: any,
  fs?: any,
  path?: any,
|}): Promise<void> => {
  if (!fsModule || !pathModule) {
    throw new Error('Filesystem is not supported.');
  }
  if (!fetchImpl) {
    throw new Error('Network fetch is not supported.');
  }

  const treeResponse = await fetchImpl(getGitHubRepositoryTreeUrl(repository));
  if (!treeResponse.ok) {
    throw new Error('Unable to list project template files.');
  }

  const treeData = await treeResponse.json();
  if (!treeData || !Array.isArray(treeData.tree)) {
    throw new Error('Invalid project template file listing.');
  }
  if (treeData.truncated) {
    throw new Error('Project template has too many files to copy.');
  }

  const projectFolder = pathModule.dirname(projectFilePath);
  // When the template lives in a repository subdirectory, only copy files under
  // it and strip the prefix so they land at the new project's root.
  const subdirectory = repository.subdirectory
    ? repository.subdirectory.replace(/\/+$/, '')
    : null;
  const subdirectoryPrefix = subdirectory ? `${subdirectory}/` : null;

  for (const treeEntry of treeData.tree) {
    if (!treeEntry || treeEntry.type !== 'blob') continue;
    const repositoryFilePath = treeEntry.path;
    if (typeof repositoryFilePath !== 'string') continue;

    // The path used to fetch the raw file (always the full repository path).
    let relativeFilePath = repositoryFilePath;
    if (subdirectoryPrefix) {
      if (!repositoryFilePath.startsWith(subdirectoryPrefix)) continue;
      relativeFilePath = repositoryFilePath.slice(subdirectoryPrefix.length);
      if (!relativeFilePath) continue;
    }

    const destinationPath = getProjectTemplateFileDestinationPath({
      projectFolder,
      repositoryFilePath: relativeFilePath,
      path: pathModule,
    });
    const fileResponse = await fetchImpl(
      getGitHubRepositoryRawFileUrl(repository, repositoryFilePath)
    );
    if (!fileResponse.ok) {
      throw new Error(
        `Unable to download project template file: ${repositoryFilePath}`
      );
    }

    const fileContent = new Uint8Array(await fileResponse.arrayBuffer());
    await fsModule.ensureDir(pathModule.dirname(destinationPath));
    await fsModule.writeFile(destinationPath, fileContent);
  }
};

// Recursively copy a bundled local template folder into the new project folder.
// Used for the empty-project template so creation works offline and in the
// packaged binary (no network/GitHub dependency).
export const copyLocalTemplateFilesToLocalProjectFolder = async ({
  projectFilePath,
  templateFolderPath,
  fs: fsModule = fs,
  path: pathModule = path,
}: {|
  projectFilePath: string,
  templateFolderPath: string,
  fs?: any,
  path?: any,
|}): Promise<void> => {
  if (!fsModule || !pathModule) {
    throw new Error('Filesystem is not supported.');
  }
  if (!fsModule.existsSync(templateFolderPath)) {
    throw new Error(`Project template folder not found: ${templateFolderPath}`);
  }

  const projectFolder = pathModule.dirname(projectFilePath);

  const copyDirectory = async (sourceDir: string, relativeDir: string) => {
    const entries = await fsModule.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryRelativePath = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name;
      const sourcePath = pathModule.join(sourceDir, entry.name);
      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, entryRelativePath);
        continue;
      }
      if (!entry.isFile()) continue;

      // Reuse the same path-safety check as the GitHub path.
      const destinationPath = getProjectTemplateFileDestinationPath({
        projectFolder,
        repositoryFilePath: entryRelativePath,
        path: pathModule,
      });
      await fsModule.ensureDir(pathModule.dirname(destinationPath));
      const fileContent = await fsModule.readFile(sourcePath);
      await fsModule.writeFile(destinationPath, fileContent);
    }
  };

  await copyDirectory(templateFolderPath, '');
};

// Copy the template files for a NewProjectSource into the new project folder,
// dispatching on the source type (bundled local folder, or GitHub repository).
export const copyProjectTemplateFilesToLocalProjectFolder = async ({
  projectFilePath,
  templateFilesSource,
}: {|
  projectFilePath: string,
  templateFilesSource: ProjectTemplateFilesSource,
|}): Promise<void> => {
  if (templateFilesSource.type === 'local-folder') {
    const templateFolderPath = findLocalProjectTemplatePath();
    if (!templateFolderPath) {
      throw new Error('Could not locate the bundled project template folder.');
    }
    await copyLocalTemplateFilesToLocalProjectFolder({
      projectFilePath,
      templateFolderPath,
    });
    return;
  }

  await copyGitHubRepositoryFilesToLocalProjectFolder({
    projectFilePath,
    repository: templateFilesSource,
  });
};

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
    templateFilesSource: emptyProjectTemplateFilesSource,
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
    const example = await retryIfFailed({ times: 3 }, () =>
      getExample(exampleShortHeader)
    );
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
