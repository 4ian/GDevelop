// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import {
  serializeToJSObject,
  serializeToJSON,
  addFinalNewline,
} from '../../Utils/Serializer';
import { serializeToJSObjectInBackground } from '../../Utils/BackgroundSerializer';
import {
  type FileMetadata,
  type SaveAsLocation,
  type SaveAsOptions,
  type SaveProjectOptions,
} from '../index';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  split,
  splitPaths,
  getSlugifiedUniqueNameFromProperty,
} from '../../Utils/ObjectSplitter';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import SaveAsOptionsDialog from '../SaveAsOptionsDialog';
import {
  type ShowAlertFunction,
  type ShowConfirmFunction,
} from '../../UI/Alert/AlertContext';
import {
  stripGameplayTestResultsFromLegacyProject,
  writeLegacyProjectAsMultiFile,
  writeMultiFileSourceTree,
} from './LocalMultiFileProject';
import {
  MULTI_FILE_ENTRY_NAME,
  MULTI_FILE_CONSTANTS_URI,
  removeLegacyFolderStructuresFromProject,
  serializeConstantsToToml,
} from '../MultiFileProjectFormat';
import {
  PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH,
  PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH,
  buildLegacyInstructionCatalogDelta,
  buildProjectDeprecatedInstructionCatalog,
  buildProjectInstructionCatalog,
  createCatalogInstructionFormatter,
  createCatalogInstructionResolver,
  getCatalogCodeOnlyParameterIndicesByType,
  mergeProjectInstructionCatalogs,
  normalizeLegacyProjectInstructionParameters,
  serializeProjectInstructionCatalog,
} from '../../EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog';
import { getLocalProjectLastModifiedDate } from './LocalProjectFileModificationTime';
import {
  PROJECT_SETTINGS_CATALOG_RELATIVE_PATH,
  buildBehaviorPropertySchemasByType,
  buildProjectSettingsCatalog,
  serializeProjectSettingsCatalog,
} from '../ProjectSourceCatalog';
import {
  PROJECT_API_RELATIVE_PATH,
  PROJECT_RUNTIME_API_RELATIVE_PATH,
  JavaScriptAuthoringApiError,
  buildJavaScriptAuthoringArtifacts,
  validateProjectJavaScriptAuthoring,
} from '../JavaScriptAuthoringApi';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const crypto = optionalRequire('crypto');
const gd: libGDevelop = global.gd;

export const GENERATED_LEGACY_PROJECT_RELATIVE_PATH = '.gdevelop/game.json';
const RETIRED_PROJECT_LAYOUT_CATALOG_RELATIVE_PATH =
  '.gdevelop/layout-catalog.json';
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

export const splittedProjectFolderNames = [
  'layouts',
  'externalLayouts',
  'externalEvents',
  'eventsFunctionsExtensions',
];

export const splittedProjectSingleFileNames: Array<string> = [];

const deleteExistingFilesFromDirs = (
  project: gdProject,
  projectPath: string
) => {
  //If multiFile is not enabled in settings and directories do not exist.
  if (!project.isFolderProject()) return;

  const entries = fs.readdirSync(projectPath);
  entries.forEach(entry => {
    if (!splittedProjectFolderNames.includes(entry)) return;

    const dirPath = path.join(projectPath, entry);
    if (!fs.statSync(dirPath).isDirectory()) return;

    const filenames = fs.readdirSync(dirPath);
    filenames.forEach(file => {
      const fileToRemovePath = path.join(dirPath, file);
      try {
        fs.unlinkSync(fileToRemovePath);
      } catch (e) {
        throw new Error(`Unable to remove file ${file}: ${e.message}`);
      }
    });
  });

  splittedProjectSingleFileNames.forEach(fileName => {
    const fileToRemovePath = path.join(projectPath, fileName + '.json');
    if (!fs.existsSync(fileToRemovePath)) return;
    if (!fs.statSync(fileToRemovePath).isFile()) return;

    try {
      fs.unlinkSync(fileToRemovePath);
    } catch (e) {
      throw new Error(
        `Unable to remove file ${fileToRemovePath}: ${e.message}`
      );
    }
  });
};

const checkFileContent = (filePath: string, expectedContent: string) => {
  const time = performance.now();
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, content) => {
      if (err) return reject(err);

      if (content === '') {
        reject(new Error(`Written file is empty, did the write fail?`));
      }
      if (content !== expectedContent) {
        reject(
          new Error(
            `Written file is not containing the expected content, did the write fail?`
          )
        );
      }
      const verificationTime = performance.now() - time;
      console.info(
        `Verified ${filePath} content in ${verificationTime.toFixed()}ms.`
      );
      resolve();
    });
  });
};

const writeAndCheckFile = async (
  content: string,
  filePath: string
): Promise<void> => {
  if (!fs) throw new Error('Filesystem is not supported.');
  if (content === '')
    throw new Error('The content to save on disk is empty. Aborting.');

  await fs.ensureDir(path.dirname(filePath));
  const temporaryPath = `${filePath}.tmp-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  try {
    await fs.writeFile(temporaryPath, content);
    await checkFileContent(temporaryPath, content);
    await fs.move(temporaryPath, filePath, { overwrite: true });
    await checkFileContent(filePath, content);
  } finally {
    if (await fs.pathExists(temporaryPath)) {
      await fs.remove(temporaryPath);
    }
  }
};

const writeAndCheckFormattedJSONFile = async (
  object: Object,
  filePath: string
): Promise<void> => {
  const content = addFinalNewline(JSON.stringify(object, null, 2));
  await writeAndCheckFile(content, filePath);
};

// Source catalogs are small generated artifacts that are written from the
// renderer immediately after a project reload. Keep these writes synchronous:
// an async fs.ensureDir/fs.writeFile callback that is starved or never delivered
// leaves the whole reload promise pending even though the renderer remains
// otherwise responsive. Synchronous, atomic temp-file replacement either
// completes or throws at the exact artifact subphase, so reload_project can
// never be left waiting on an unobservable libuv filesystem callback.
const checkFileContentSync = (filePath: string, expectedContent: string) => {
  const time = performance.now();
  const content = fs.readFileSync(filePath, { encoding: 'utf8' });
  if (content === '') {
    throw new Error(`Written file is empty, did the write fail?`);
  }
  if (content !== expectedContent) {
    throw new Error(
      `Written file is not containing the expected content, did the write fail?`
    );
  }
  const verificationTime = performance.now() - time;
  console.info(
    `Verified ${filePath} content synchronously in ${verificationTime.toFixed()}ms.`
  );
};

const writeAndCheckGeneratedFileSync = (
  content: string,
  filePath: string
): void => {
  if (!fs) throw new Error('Filesystem is not supported.');
  if (content === '')
    throw new Error('The content to save on disk is empty. Aborting.');

  fs.ensureDirSync(path.dirname(filePath));
  const temporaryPath = `${filePath}.tmp-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  try {
    fs.writeFileSync(temporaryPath, content);
    checkFileContentSync(temporaryPath, content);
    fs.moveSync(temporaryPath, filePath, { overwrite: true });
    checkFileContentSync(filePath, content);
  } finally {
    if (fs.pathExistsSync(temporaryPath)) {
      fs.removeSync(temporaryPath);
    }
  }
};

type ProjectSourceCatalogWriteOptions = {|
  reportProgress?: (phase: string) => void,
  instructionCatalog?: Object,
  deprecatedInstructionCatalog?: Object,
  additionalExtensions?: Array<gdPlatformExtension>,
|};

export class ProjectSourceCatalogGenerationError extends Error {
  code: string;
  catalogPhase: string;
  catalogArtifact: ?string;

  constructor(catalogPhase: string, error: Error) {
    const artifactMatch = /^catalog-(.+)-(?:building|built|writing|written)$/.exec(
      catalogPhase
    );
    super(
      `Project source catalog generation failed in subphase "${catalogPhase}": ${
        error && error.message ? error.message : String(error)
      }`
    );
    this.name = 'ProjectSourceCatalogGenerationError';
    this.code = 'MCP_RELOAD_CATALOG_SUBPHASE_FAILED';
    this.catalogPhase = catalogPhase;
    this.catalogArtifact = catalogPhase.startsWith('catalog-project-serializ')
      ? 'project-serialization'
      : artifactMatch
      ? artifactMatch[1]
      : null;
  }
}

const reportCatalogProgress = (
  options: ?ProjectSourceCatalogWriteOptions,
  phase: string
) => {
  if (options && options.reportProgress) options.reportProgress(phase);
};

let cachedInstructionCatalogs: ?{|
  key: string,
  instructionCatalog: Object,
  deprecatedInstructionCatalog: Object,
|} = null;

const getInstructionCatalogCacheKey = (
  project: gdProject,
  serializedProject: Object
): string => {
  const platformExtensionNames = [];
  const platformExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let index = 0; index < platformExtensions.size(); index++) {
    platformExtensionNames.push(platformExtensions.at(index).getName());
  }
  platformExtensionNames.sort();
  const properties = serializedProject.properties || {};
  const signatureSource = JSON.stringify({
    coreVersion: gd.VersionWrapper.fullString(),
    initialGDVersion: serializedProject.initialGDVersion || '',
    currentPlatform: properties.currentPlatform || '',
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    platformExtensionNames,
    eventsFunctionsExtensions:
      serializedProject.eventsFunctionsExtensions || [],
  });
  return crypto
    ? crypto
        .createHash('sha256')
        .update(signatureSource)
        .digest('hex')
    : signatureSource;
};

export const writeProjectInstructionCatalog = async (
  project: gdProject,
  projectPath: string,
  options?: ProjectSourceCatalogWriteOptions
): Promise<Object> => {
  let catalog;
  if (options && options.instructionCatalog) {
    reportCatalogProgress(options, 'catalog-instructions-cache-hit');
    catalog = options.instructionCatalog;
  } else {
    reportCatalogProgress(options, 'catalog-instructions-building');
    catalog = buildProjectInstructionCatalog(
      project,
      undefined,
      options && options.additionalExtensions
    );
    reportCatalogProgress(options, 'catalog-instructions-built');
  }
  const catalogPath = path.join(
    projectPath,
    ...PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
  );
  reportCatalogProgress(options, 'catalog-instructions-writing');
  writeAndCheckGeneratedFileSync(
    serializeProjectInstructionCatalog(catalog),
    catalogPath
  );
  reportCatalogProgress(options, 'catalog-instructions-written');
  return catalog;
};

const writeProjectDeprecatedInstructionCatalog = async (
  project: gdProject,
  projectPath: string,
  options?: ProjectSourceCatalogWriteOptions
): Promise<Object> => {
  let catalog;
  if (options && options.deprecatedInstructionCatalog) {
    reportCatalogProgress(options, 'catalog-deprecated-instructions-cache-hit');
    catalog = options.deprecatedInstructionCatalog;
  } else {
    reportCatalogProgress(options, 'catalog-deprecated-instructions-building');
    catalog = buildProjectDeprecatedInstructionCatalog(
      project,
      undefined,
      options && options.instructionCatalog,
      options && options.additionalExtensions
    );
    reportCatalogProgress(options, 'catalog-deprecated-instructions-built');
  }
  const catalogPath = path.join(
    projectPath,
    ...PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
  );
  reportCatalogProgress(options, 'catalog-deprecated-instructions-writing');
  writeAndCheckGeneratedFileSync(
    serializeProjectInstructionCatalog(catalog),
    catalogPath
  );
  reportCatalogProgress(options, 'catalog-deprecated-instructions-written');
  return catalog;
};

export const writeProjectSettingsCatalog = async (
  project: gdProject,
  projectPath: string,
  serializedProjectObject?: Object,
  options?: ProjectSourceCatalogWriteOptions
): Promise<Object> => {
  reportCatalogProgress(options, 'catalog-settings-building');
  const serializedProject =
    serializedProjectObject || serializeToJSObject(project, 'serializeTo');
  const catalog = buildProjectSettingsCatalog({
    project,
    serializedProject,
    additionalExtensions: options && options.additionalExtensions,
  });
  reportCatalogProgress(options, 'catalog-settings-built');
  reportCatalogProgress(options, 'catalog-settings-writing');
  writeAndCheckGeneratedFileSync(
    serializeProjectSettingsCatalog(catalog),
    path.join(projectPath, ...PROJECT_SETTINGS_CATALOG_RELATIVE_PATH.split('/'))
  );
  fs.removeSync(
    path.join(
      projectPath,
      ...RETIRED_PROJECT_LAYOUT_CATALOG_RELATIVE_PATH.split('/')
    )
  );
  reportCatalogProgress(options, 'catalog-settings-written');
  return catalog;
};

export const writeProjectJavaScriptAuthoringApi = async (
  project: gdProject,
  projectPath: string,
  serializedProjectObject?: Object,
  options?: ProjectSourceCatalogWriteOptions
): Promise<Object> => {
  reportCatalogProgress(options, 'catalog-javascript-api-building');
  const serializedProject =
    serializedProjectObject || serializeToJSObject(project, 'serializeTo');
  const artifacts = buildJavaScriptAuthoringArtifacts(serializedProject);
  reportCatalogProgress(options, 'catalog-javascript-api-built');
  reportCatalogProgress(options, 'catalog-runtime-api-writing');
  writeAndCheckGeneratedFileSync(
    artifacts.runtimeApi,
    path.join(projectPath, ...PROJECT_RUNTIME_API_RELATIVE_PATH.split('/'))
  );
  reportCatalogProgress(options, 'catalog-runtime-api-written');
  reportCatalogProgress(options, 'catalog-project-api-writing');
  writeAndCheckGeneratedFileSync(
    artifacts.projectApi,
    path.join(projectPath, ...PROJECT_API_RELATIVE_PATH.split('/'))
  );
  reportCatalogProgress(options, 'catalog-project-api-written');
  return {
    counts: artifacts.counts,
    hashes: artifacts.hashes,
  };
};

export const writeProjectSourceCatalogs = async (
  project: gdProject,
  projectPath: string,
  options?: ProjectSourceCatalogWriteOptions
): Promise<Object> => {
  let lastPhase = 'catalog-project-serializing';
  const trackedOptions: ProjectSourceCatalogWriteOptions = {
    ...(options || {}),
    reportProgress: (phase: string) => {
      lastPhase = phase;
      reportCatalogProgress(options, phase);
    },
  };
  try {
    reportCatalogProgress(trackedOptions, 'catalog-project-serializing');
    const serializedProject = serializeToJSObject(project, 'serializeTo');
    reportCatalogProgress(trackedOptions, 'catalog-project-serialized');
    reportCatalogProgress(
      trackedOptions,
      'catalog-instruction-signature-building'
    );
    const instructionCatalogCacheKey = getInstructionCatalogCacheKey(
      project,
      serializedProject
    );
    reportCatalogProgress(
      trackedOptions,
      'catalog-instruction-signature-built'
    );
    const cachedCatalogs =
      !(options && options.additionalExtensions) &&
      cachedInstructionCatalogs &&
      cachedInstructionCatalogs.key === instructionCatalogCacheKey
        ? cachedInstructionCatalogs
        : null;
    const instructionCatalog = await writeProjectInstructionCatalog(
      project,
      projectPath,
      {
        ...trackedOptions,
        instructionCatalog:
          (options && options.instructionCatalog) ||
          (cachedCatalogs ? cachedCatalogs.instructionCatalog : undefined),
      }
    );
    const deprecatedInstructionCatalog = await writeProjectDeprecatedInstructionCatalog(
      project,
      projectPath,
      {
        ...trackedOptions,
        instructionCatalog,
        deprecatedInstructionCatalog:
          (options && options.deprecatedInstructionCatalog) ||
          (cachedCatalogs
            ? cachedCatalogs.deprecatedInstructionCatalog
            : undefined),
      }
    );
    cachedInstructionCatalogs = {
      key: instructionCatalogCacheKey,
      instructionCatalog,
      deprecatedInstructionCatalog,
    };
    const settingsCatalog = await writeProjectSettingsCatalog(
      project,
      projectPath,
      serializedProject,
      trackedOptions
    );
    const javascriptApi = await writeProjectJavaScriptAuthoringApi(
      project,
      projectPath,
      serializedProject,
      trackedOptions
    );

    return {
      instructions: instructionCatalog.counts,
      settings: settingsCatalog.counts,
      javascript: javascriptApi,
    };
  } catch (error) {
    if (error instanceof ProjectSourceCatalogGenerationError) throw error;
    throw new ProjectSourceCatalogGenerationError(lastPhase, error);
  }
};

const writeProjectFiles = async ({
  project,
  filePath,
  projectPath,
  useBackgroundSerializer,
  canonicalEventSerialization,
}: {
  project: gdProject,
  filePath: string,
  projectPath: string,
  useBackgroundSerializer: boolean,
  canonicalEventSerialization: boolean,
}): Promise<void> => {
  const startTime = Date.now();

  let serializedProjectObject;
  if (useBackgroundSerializer) {
    // Canonical mode is currently not propagated to the background
    // serializer worker (which uses its own libGD instance). Background
    // serialization is hardcoded off in MainFrame so this is not
    // exercised in production yet.
    serializedProjectObject = await serializeToJSObjectInBackground(project);
  } else {
    serializedProjectObject = serializeToJSObject(project, 'serializeTo', {
      canonicalEventSerialization,
    });
  }
  const serializeEndTime = Date.now();
  const constants = JSON.parse(project.getConstantsJson());

  if (path.basename(filePath).toLowerCase() === MULTI_FILE_ENTRY_NAME) {
    const authoringCatalog = buildProjectInstructionCatalog(project);
    const baseDeprecatedCatalog = buildProjectDeprecatedInstructionCatalog(
      project
    );
    const baseSerializationCatalog = mergeProjectInstructionCatalogs(
      authoringCatalog,
      baseDeprecatedCatalog
    );
    const serializedProjectWithConstants = {
      ...serializedProjectObject,
      constants,
    };
    const deprecatedCatalog = mergeProjectInstructionCatalogs(
      baseDeprecatedCatalog,
      buildLegacyInstructionCatalogDelta(
        baseSerializationCatalog,
        serializedProjectWithConstants
      )
    );
    const serializationCatalog = mergeProjectInstructionCatalogs(
      authoringCatalog,
      deprecatedCatalog
    );
    const authoringSerializedProjectObject = normalizeLegacyProjectInstructionParameters(
      serializedProjectWithConstants,
      serializationCatalog
    );
    const settingsCatalog = buildProjectSettingsCatalog({
      project,
      serializedProject: authoringSerializedProjectObject,
    });
    const behaviorPropertySchemasByType = buildBehaviorPropertySchemasByType(
      settingsCatalog
    );
    // Hidden behavior properties are omitted from the authoring catalog, but
    // they can still contain data configured by a specialized editor that the
    // runtime needs. Keep the serializer output lossless.
    const javascriptArtifacts = buildJavaScriptAuthoringArtifacts(
      authoringSerializedProjectObject
    );
    const javascriptValidation = validateProjectJavaScriptAuthoring({
      serializedProject: authoringSerializedProjectObject,
      runtimeApiDeclaration: javascriptArtifacts.runtimeApi,
      projectApiDeclaration: javascriptArtifacts.projectApi,
    });
    if (!javascriptValidation.valid) {
      throw new JavaScriptAuthoringApiError(javascriptValidation.errors[0]);
    }
    await writeLegacyProjectAsMultiFile(
      authoringSerializedProjectObject,
      filePath,
      {
        decomposeOptions: {
          behaviorPropertySchemasByType,
          instructionParameterIndicesToIgnoreByType: getCatalogCodeOnlyParameterIndicesByType(
            serializationCatalog
          ),
          eventsDslOptions: {
            formatInstruction: createCatalogInstructionFormatter(
              serializationCatalog
            ),
          },
        },
        composeOptions: {
          behaviorPropertySchemasByType,
          compileOptions: {
            resolveInstruction: createCatalogInstructionResolver(
              serializationCatalog
            ),
          },
        },
      }
    );
    await writeAndCheckFile(
      serializeProjectInstructionCatalog(authoringCatalog),
      path.join(
        projectPath,
        ...PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
      )
    );
    await writeAndCheckFile(
      serializeProjectInstructionCatalog(deprecatedCatalog),
      path.join(
        projectPath,
        ...PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
      )
    );
    await writeAndCheckFile(
      serializeProjectSettingsCatalog(settingsCatalog),
      path.join(
        projectPath,
        ...PROJECT_SETTINGS_CATALOG_RELATIVE_PATH.split('/')
      )
    );
    fs.removeSync(
      path.join(
        projectPath,
        ...RETIRED_PROJECT_LAYOUT_CATALOG_RELATIVE_PATH.split('/')
      )
    );
    await writeAndCheckFile(
      javascriptArtifacts.runtimeApi,
      path.join(projectPath, ...PROJECT_RUNTIME_API_RELATIVE_PATH.split('/'))
    );
    await writeAndCheckFile(
      javascriptArtifacts.projectApi,
      path.join(projectPath, ...PROJECT_API_RELATIVE_PATH.split('/'))
    );
    const generatedLegacyProject = stripGameplayTestResultsFromLegacyProject(
      removeLegacyFolderStructuresFromProject(authoringSerializedProjectObject)
    );
    delete generatedLegacyProject.constants;
    await writeAndCheckFormattedJSONFile(
      generatedLegacyProject,
      path.join(
        projectPath,
        ...GENERATED_LEGACY_PROJECT_RELATIVE_PATH.split('/')
      )
    );
    console.log(
      `[LocalProjectWriter] Multi-file project written in ${Date.now() -
        startTime}ms (including ${serializeEndTime -
        startTime}ms serialization)`
    );
    return;
  }

  if (project.isFolderProject()) {
    const partialObjects = split(serializedProjectObject, {
      pathSeparator: '/',
      getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
      shouldSplit: splitPaths(
        new Set([
          ...splittedProjectFolderNames.map(folderName => `/${folderName}/*`),
          ...splittedProjectSingleFileNames.map(fileName => `/${fileName}`),
        ])
      ),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });

    await Promise.all(
      partialObjects.map(partialObject => {
        return writeAndCheckFormattedJSONFile(
          partialObject.object,
          path.join(projectPath, partialObject.reference) + '.json'
        ).catch(err => {
          console.error('Unable to write a partial file:', err);
          throw err;
        });
      })
    );
    await writeAndCheckFormattedJSONFile(
      serializedProjectObject,
      filePath
    ).catch(err => {
      console.error('Unable to write the split project:', err);
      throw err;
    });
  } else {
    await writeAndCheckFormattedJSONFile(serializedProjectObject, filePath);
  }
  await writeAndCheckFile(
    serializeConstantsToToml(constants),
    path.join(projectPath, 'constants.toml')
  );

  console.log(
    `[LocalProjectWriter] Project file(s) written in ${Date.now() -
      startTime}ms (including ${serializeEndTime - startTime}ms for ${
      useBackgroundSerializer ? 'background' : 'main'
    } thread serialization)`
  );
};

export const onSaveProject = async (
  project: gdProject,
  fileMetadata: FileMetadata,
  saveOptions?: SaveProjectOptions,
  actions: {|
    showAlert: ShowAlertFunction,
    showConfirmation: ShowConfirmFunction,
  |}
): Promise<{|
  wasSaved: boolean,
  fileMetadata: FileMetadata,
|}> => {
  const canBeSafelySaved = await canFileMetadataBeSafelySaved(
    fileMetadata,
    saveOptions,
    actions
  );
  if (!canBeSafelySaved) {
    return { wasSaved: false, fileMetadata: fileMetadata };
  }

  const filePath = fileMetadata.fileIdentifier;
  if (!filePath) {
    throw new Error('Unable to find file path before saving.');
  }
  // Ensure we always pick the latest name and gameId.
  const newFileMetadata = {
    ...fileMetadata,
    name: project.getName(),
    gameId: project.getProjectUuid(),
  };

  const projectPath = path.dirname(filePath);

  if (path.basename(filePath).toLowerCase() !== MULTI_FILE_ENTRY_NAME) {
    try {
      deleteExistingFilesFromDirs(project, projectPath);
    } catch (e) {
      console.warn('Unable to clean project folder before saving project: ', e);
    }
  }

  await writeProjectFiles({
    project,
    filePath,
    projectPath,
    useBackgroundSerializer:
      !!saveOptions && !!saveOptions.useBackgroundSerializer,
    canonicalEventSerialization:
      !!saveOptions && !!saveOptions.canonicalEventSerialization,
  });
  const lastModifiedDate = await getLocalProjectLastModifiedDate(filePath);
  return {
    wasSaved: true,
    // $FlowFixMe[incompatible-type]
    fileMetadata: {
      ...newFileMetadata,
      lastModifiedDate: lastModifiedDate || Date.now(),
    },
  };
};

export const generateOnChooseSaveProjectAsLocation = ({
  setDialog,
  closeDialog,
}: {
  setDialog: (() => React.Node) => void,
  closeDialog: () => void,
}): (({
  displayOptionToGenerateNewProjectUuid: boolean,
  fileMetadata: ?FileMetadata,
  project: gdProject,
}) => Promise<{
  saveAsLocation: ?SaveAsLocation,
  saveAsOptions: ?SaveAsOptions,
}>) => async ({
  project,
  fileMetadata,
  displayOptionToGenerateNewProjectUuid,
}: {|
  project: gdProject,
  fileMetadata: ?FileMetadata, // This is the current location.
  displayOptionToGenerateNewProjectUuid: boolean,
|}): Promise<{|
  saveAsLocation: ?SaveAsLocation, // This is the newly chosen location (or null if cancelled).
  saveAsOptions: ?SaveAsOptions,
|}> => {
  const options = await new Promise(resolve => {
    setDialog(() => (
      <SaveAsOptionsDialog
        onCancel={() => {
          closeDialog();
          resolve(null);
        }}
        nameSuggestion={
          fileMetadata ? `${project.getName()} - Copy` : project.getName()
        }
        mainActionLabel={<Trans>Continue</Trans>}
        displayOptionToGenerateNewProjectUuid={
          displayOptionToGenerateNewProjectUuid
        }
        onSave={options => {
          closeDialog();
          resolve(options);
        }}
      />
    ));
  });

  if (!options) return { saveAsLocation: null, saveAsOptions: null }; // Save was cancelled.

  let defaultPath = fileMetadata ? fileMetadata.fileIdentifier : '';
  // $FlowFixMe[incompatible-use]
  const { name } = options;
  if (path && defaultPath && name) {
    const safeFilename = name.replace(/[<>:"/\\|?*]/g, '_');
    defaultPath = path.join(
      path.dirname(defaultPath),
      safeFilename,
      MULTI_FILE_ENTRY_NAME
    );
  }

  const browserWindow = remote.getCurrentWindow();
  const saveDialogOptions = {
    defaultPath,
    filters: [{ name: 'GDevelop project', extensions: ['gdevelop'] }],
  };

  if (!dialog) {
    throw new Error('Unsupported');
  }
  const selectedPath = dialog.showSaveDialogSync(
    browserWindow,
    saveDialogOptions
  );
  if (!selectedPath) {
    return { saveAsLocation: null, saveAsOptions: null };
  }
  const filePath =
    path.basename(selectedPath).toLowerCase() === MULTI_FILE_ENTRY_NAME
      ? selectedPath
      : path.join(
          path.dirname(selectedPath),
          path.basename(selectedPath, path.extname(selectedPath)),
          MULTI_FILE_ENTRY_NAME
        );

  return {
    saveAsLocation: {
      // $FlowFixMe[incompatible-use]
      name: options.name,
      fileIdentifier: filePath,
    },
    saveAsOptions: {
      // $FlowFixMe[incompatible-use]
      generateNewProjectUuid: options.generateNewProjectUuid,
    },
  };
};

export const onSaveProjectAs = async (
  project: gdProject,
  saveAsLocation: ?SaveAsLocation,
  options: {|
    onStartSaving: () => void,
    onMoveResources: ({| newFileMetadata: FileMetadata |}) => Promise<void>,
  |}
): Promise<{|
  wasSaved: boolean,
  fileMetadata: ?FileMetadata,
|}> => {
  if (!saveAsLocation)
    throw new Error('A location was not chosen before saving as.');
  const filePath = saveAsLocation.fileIdentifier;
  if (!filePath)
    throw new Error('A file path was not chosen before saving as.');

  options.onStartSaving();

  // Make sure the destination folder exists before any resource is moved or
  // any file is written. The default location for a new project sits inside
  // "~/Documents/GDevelop projects/<name>", and that parent folder might not
  // exist yet on a fresh machine. fs-extra's ensureDir is recursive and a
  // no-op when the folder already exists.
  if (fs && path) {
    try {
      await fs.ensureDir(path.dirname(filePath));
    } catch (error) {
      console.error(
        `Unable to create project folder "${path.dirname(filePath)}":`,
        error
      );
      throw error;
    }
  }

  // Ensure we always pick the latest name and gameId.
  const newFileMetadata = {
    fileIdentifier: filePath,
    name: project.getName(),
    gameId: project.getProjectUuid(),
  };

  // Move (copy or download, etc...) the resources first.
  // $FlowFixMe[incompatible-type]
  await options.onMoveResources({ newFileMetadata });

  // Save the project when resources have been copied.
  const projectPath = path.dirname(filePath);
  project.setProjectFile(filePath);

  await writeProjectFiles({
    project,
    filePath,
    projectPath,
    useBackgroundSerializer: false,
    // SaveAs is a one-off operation: the user will typically save again
    // through the normal onSaveProject path, which honors the preference.
    canonicalEventSerialization: false,
  });
  const lastModifiedDate = await getLocalProjectLastModifiedDate(filePath);
  return {
    wasSaved: true,
    // $FlowFixMe[incompatible-type]
    fileMetadata: {
      ...newFileMetadata,
      lastModifiedDate: lastModifiedDate || Date.now(),
    },
  };
};

export const onAutoSaveProject = (
  project: gdProject,
  fileMetadata: FileMetadata
): Promise<void> => {
  if (
    path.basename(fileMetadata.fileIdentifier).toLowerCase() ===
    MULTI_FILE_ENTRY_NAME
  ) {
    const autoSaveEntryPath = path.join(
      path.dirname(fileMetadata.fileIdentifier),
      '.gdevelop',
      'autosave',
      'current',
      MULTI_FILE_ENTRY_NAME
    );
    const serializedProjectObject = {
      ...serializeToJSObject(project, 'serializeTo'),
      constants: JSON.parse(project.getConstantsJson()),
    };
    return writeLegacyProjectAsMultiFile(
      serializedProjectObject,
      autoSaveEntryPath,
      { persistGameplayTestResults: false }
    ).then(() => undefined);
  }
  const autoSavePath = fileMetadata.fileIdentifier + '.autosave';
  return writeAndCheckFile(serializeToJSON(project), autoSavePath).catch(
    err => {
      console.error(`Unable to write ${autoSavePath}:`, err);
      throw err;
    }
  );
};

export const onAutoSaveConstants = async (
  constants: Object,
  fileMetadata: FileMetadata
): Promise<boolean> => {
  const entryPath = fileMetadata.fileIdentifier;
  if (path.basename(entryPath).toLowerCase() !== MULTI_FILE_ENTRY_NAME) {
    await writeAndCheckFile(
      serializeConstantsToToml(constants),
      path.join(path.dirname(entryPath), 'constants.toml')
    );
    return true;
  }

  await writeMultiFileSourceTree({
    entryPath,
    files: {
      [MULTI_FILE_CONSTANTS_URI]: serializeConstantsToToml(constants),
    },
  });
  return true;
};

export const getWriteErrorMessage = (error: Error): MessageDescriptor =>
  t`An error occurred when saving the project. Please try again by choosing another location.`;

export const getProjectLocation = ({
  saveAsLocation,
  newProjectsDefaultFolder,
}: {
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  newProjectsDefaultFolder?: string,
}): SaveAsLocation => {
  if (
    saveAsLocation &&
    path.basename(saveAsLocation.fileIdentifier).toLowerCase() ===
      MULTI_FILE_ENTRY_NAME
  ) {
    return saveAsLocation;
  }
  const outputPath = saveAsLocation
    ? path.dirname(saveAsLocation.fileIdentifier)
    : newProjectsDefaultFolder
    ? newProjectsDefaultFolder
    : '';
  // The generated "My project XX" folder (or the folder chosen by the user)
  // is already the project root.
  return {
    fileIdentifier: path.join(outputPath, MULTI_FILE_ENTRY_NAME),
  };
};

export const renderNewProjectSaveAsLocationChooser = ({
  projectName,
  saveAsLocation,
  setSaveAsLocation,
  newProjectsDefaultFolder,
}: {|
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  setSaveAsLocation: (?SaveAsLocation) => void,
  newProjectsDefaultFolder?: string,
|}): React.Node => {
  const projectLocation = getProjectLocation({
    projectName,
    saveAsLocation,
    newProjectsDefaultFolder,
  });
  return (
    <LocalFolderPicker
      fullWidth
      value={path.dirname(projectLocation.fileIdentifier)}
      onChange={newOutputPath => {
        setSaveAsLocation({
          fileIdentifier: path.join(newOutputPath, MULTI_FILE_ENTRY_NAME),
        });
      }}
      type="create-game"
    />
  );
};

const isTryingToSaveInForbiddenPath = (filePath: string): boolean => {
  if (!remote) return false; // This should not happen, but let's be safe.
  // If the user is saving locally and chose the same location as where the
  // executable is running, prevent this, as it will be deleted when the app is updated.
  const exePath = remote.app.getPath('exe');
  if (!exePath) return false; // This should not happen, but let's be safe.
  const gdevelopDirectory = path.dirname(exePath);
  return filePath.startsWith(gdevelopDirectory);
};

export const canFileMetadataBeSafelySaved = async (
  fileMetadata: FileMetadata,
  saveOptions: ?SaveProjectOptions,
  actions: {|
    showAlert: ShowAlertFunction,
    showConfirmation: ShowConfirmFunction,
  |}
): Promise<boolean> => {
  const path = fileMetadata.fileIdentifier;
  if (isTryingToSaveInForbiddenPath(path)) {
    await actions.showAlert({
      title: t`Choose another location`,
      message: t`Your project is saved in the same folder as the application. This folder will be deleted when the application is updated. Please choose another location if you don't want to lose your project.`,
    });
  }

  // We don't block the save, in case the user wants to save anyway.
  return true;
};

export const canFileMetadataBeSafelySavedAs = async (
  fileMetadata: FileMetadata,
  actions: {|
    showAlert: ShowAlertFunction,
    showConfirmation: ShowConfirmFunction,
  |}
): Promise<boolean> => {
  const path = fileMetadata.fileIdentifier;
  if (isTryingToSaveInForbiddenPath(path)) {
    await actions.showAlert({
      title: t`Choose another location`,
      message: t`Your project is saved in the same folder as the application. This folder will be deleted when the application is updated. Please choose another location if you don't want to lose your project.`,
    });

    // We block the save as we don't want new projects to be saved there.
    return false;
  }

  return true;
};
