// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { type FileMetadata } from '../index';
import { unsplit } from '../../Utils/ObjectSplitter';
import { openFilePicker, readJSONFile } from '../../Utils/FileSystem';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  getLegacyMigrationSourceHash,
  hashLegacySource,
  migrateLegacyProject,
  openMultiFileProject,
} from './LocalMultiFileProject';
import { writeProjectSourceCatalogs } from './LocalProjectWriter';
import {
  MULTI_FILE_ENTRY_NAME,
  MultiFileProjectError,
  parseConstantsFromToml,
} from '../MultiFileProjectFormat';
import {
  PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH,
  PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH,
  buildLegacyInstructionCatalogDelta,
  buildProjectDeprecatedInstructionCatalog,
  buildProjectInstructionCatalog,
  createCatalogInstructionFormatter,
  createCatalogInstructionResolver,
  getCatalogCodeOnlyParameterIndicesByType,
  mergeProjectInstructionCatalogs,
  normalizeLegacyProjectInstructionParameters,
} from '../../EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog';
import {
  generateEventsFunctionExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../../EventsFunctionsExtensionsLoader';
import {
  PROJECT_SETTINGS_CATALOG_FORMAT_VERSION,
  PROJECT_SETTINGS_CATALOG_RELATIVE_PATH,
} from '../ProjectSourceCatalog';
import {
  PROJECT_API_RELATIVE_PATH,
  PROJECT_RUNTIME_API_RELATIVE_PATH,
} from '../JavaScriptAuthoringApi';
import { getLocalProjectLastModifiedDate } from './LocalProjectFileModificationTime';
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const gd: libGDevelop = global.gd;

const eventsFunctionCodeWriter: EventsFunctionCodeWriter = {
  getIncludeFileFor: (functionName: string) => `${functionName}.js`,
  writeFunctionCode: async () => {},
  writeBehaviorCode: async () => {},
  writeObjectCode: async () => {},
};
const catalogI18n = ({
  _: value =>
    typeof value === 'string' ? value : value.id || value.message || '',
}: any);

const generateProjectAdditionalExtensions = (
  project: gdProject
): Array<gdPlatformExtension> => {
  const additionalExtensions = [];
  for (
    let index = 0;
    index < project.getEventsFunctionsExtensionsCount();
    index++
  ) {
    additionalExtensions.push(
      generateEventsFunctionExtensionMetadata(
        project,
        project.getEventsFunctionsExtensionAt(index),
        { eventsFunctionCodeWriter, i18n: catalogI18n }
      )
    );
  }
  return additionalExtensions;
};

type MigrationInstructionCatalogs = {|
  authoringCatalog: Object,
  deprecatedCatalog: Object,
  serializationCatalog: Object,
|};

const buildMigrationInstructionCatalogs = (
  legacyProject: Object
): MigrationInstructionCatalogs => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const additionalExtensions: Array<gdPlatformExtension> = [];
  try {
    unserializeFromJSObject(project, legacyProject);
    additionalExtensions.push(...generateProjectAdditionalExtensions(project));
    const authoringCatalog = buildProjectInstructionCatalog(
      project,
      catalogI18n,
      additionalExtensions
    );
    const baseDeprecatedCatalog = buildProjectDeprecatedInstructionCatalog(
      project,
      catalogI18n,
      authoringCatalog,
      additionalExtensions
    );
    const baseSerializationCatalog = mergeProjectInstructionCatalogs(
      authoringCatalog,
      baseDeprecatedCatalog
    );
    const deprecatedCatalog = mergeProjectInstructionCatalogs(
      baseDeprecatedCatalog,
      buildLegacyInstructionCatalogDelta(
        baseSerializationCatalog,
        legacyProject
      )
    );
    return {
      authoringCatalog,
      deprecatedCatalog,
      serializationCatalog: mergeProjectInstructionCatalogs(
        authoringCatalog,
        deprecatedCatalog
      ),
    };
  } finally {
    additionalExtensions.forEach(extension => extension.delete());
    project.delete();
  }
};

const writeMigrationProjectSourceCatalogs = async (
  legacyProject: Object,
  projectRoot: string,
  catalogs: MigrationInstructionCatalogs
): Promise<void> => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const additionalExtensions: Array<gdPlatformExtension> = [];
  try {
    unserializeFromJSObject(project, legacyProject);
    additionalExtensions.push(...generateProjectAdditionalExtensions(project));
    await writeProjectSourceCatalogs(project, projectRoot, {
      additionalExtensions,
      instructionCatalog: catalogs.authoringCatalog,
      deprecatedInstructionCatalog: catalogs.deprecatedCatalog,
    });
  } finally {
    additionalExtensions.forEach(extension => extension.delete());
    project.delete();
  }
};

const bootstrapProjectSourceCatalogs = async (
  projectFile: string
): Promise<void> => {
  const projectRoot = path.dirname(projectFile);
  const settingsCatalogPath = path.join(
    projectRoot,
    ...PROJECT_SETTINGS_CATALOG_RELATIVE_PATH.split('/')
  );
  const retiredLayoutCatalogPath = path.join(
    projectRoot,
    '.gdevelop',
    'layout-catalog.json'
  );
  const generatedArtifactRelativePaths = [
    PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH,
    PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH,
    PROJECT_SETTINGS_CATALOG_RELATIVE_PATH,
    PROJECT_RUNTIME_API_RELATIVE_PATH,
    PROJECT_API_RELATIVE_PATH,
  ];
  let hasCurrentSettingsCatalog = false;
  try {
    const settingsCatalog = JSON.parse(
      fs.readFileSync(settingsCatalogPath, 'utf8')
    );
    hasCurrentSettingsCatalog =
      settingsCatalog.format === 'gdevelop-settings-catalog' &&
      settingsCatalog.formatVersion === PROJECT_SETTINGS_CATALOG_FORMAT_VERSION;
  } catch (error) {
    // Missing, invalid, or retired catalogs are regenerated below.
  }
  if (
    hasCurrentSettingsCatalog &&
    !fs.existsSync(retiredLayoutCatalogPath) &&
    generatedArtifactRelativePaths.every(relativePath =>
      fs.existsSync(path.join(projectRoot, ...relativePath.split('/')))
    )
  ) {
    return;
  }

  // A first open has no generated instruction catalog yet, so reconstruct the
  // project without compiling events, build isolated metadata for its local
  // extensions, and write every generated authoring artifact before reopening.
  const catalogSource = await openMultiFileProject(projectFile, {
    ignoreInstructionCatalog: true,
    skipEventsCompilation: true,
  });
  const catalogProject = gd.ProjectHelper.createNewGDJSProject();
  const additionalExtensions: Array<gdPlatformExtension> = [];

  try {
    unserializeFromJSObject(catalogProject, catalogSource);
    additionalExtensions.push(
      ...generateProjectAdditionalExtensions(catalogProject)
    );
    await writeProjectSourceCatalogs(catalogProject, projectRoot, {
      additionalExtensions,
    });
  } finally {
    additionalExtensions.forEach(extension => extension.delete());
    catalogProject.delete();
  }
};

const normalizeLegacyProjectWithCurrentSerializer = (
  legacyProject: Object
): Object => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  try {
    unserializeFromJSObject(project, legacyProject);
    return serializeToJSObject(project);
  } finally {
    project.delete();
  }
};

const readConstantsSource = async (projectRoot: string): Promise<Object> => {
  const constantsPath = path.join(projectRoot, 'constants.toml');
  if (!fs.existsSync(constantsPath)) {
    throw new Error(`The project is missing ${constantsPath}.`);
  }
  return parseConstantsFromToml(
    await fs.promises.readFile(constantsPath, 'utf8')
  );
};

const separateConstantsFromProject = (
  projectWithConstants: Object
): {| content: Object, constants: Object |} => {
  const { constants, ...content } = projectWithConstants;
  if (!constants || typeof constants !== 'object' || Array.isArray(constants)) {
    throw new Error('The project has invalid Constants.');
  }
  return { content, constants };
};

export const onOpenWithPicker = (): Promise<?FileMetadata> => {
  return openFilePicker({
    title: 'Open a project',
    properties: ['openFile'],
    message:
      'If you want to open your GDevelop 4 project, be sure to save it as a .json file',
    filters: [{ name: 'GDevelop project', extensions: ['gdevelop', 'json'] }],
    // $FlowFixMe[incompatible-type]
  }).then(filePath => (filePath ? { fileIdentifier: filePath } : null));
};

export const onOpen = (
  fileMetadata: FileMetadata
): Promise<{|
  content: Object,
  constants: Object,
  fileMetadata?: FileMetadata,
|}> => {
  const filePath = fileMetadata.fileIdentifier;
  const fileName = path.basename(filePath);
  if (fileName.toLowerCase() === MULTI_FILE_ENTRY_NAME) {
    return getLocalProjectLastModifiedDate(filePath).then(
      async lastModifiedDate => {
        await bootstrapProjectSourceCatalogs(filePath);
        const openedProject = separateConstantsFromProject(
          await openMultiFileProject(filePath)
        );
        return {
          ...openedProject,
          fileMetadata: {
            ...fileMetadata,
            ...(lastModifiedDate !== null ? { lastModifiedDate } : {}),
          },
        };
      }
    );
  }
  if (path.extname(filePath).toLowerCase() === '.gdevelop') {
    return Promise.reject(
      new MultiFileProjectError(
        'MULTIFILE_INVALID_ENTRY',
        `The multi-file entry must be named ${MULTI_FILE_ENTRY_NAME}.`
      )
    );
  }
  const projectPath = path.dirname(filePath);
  return fs.promises.readFile(filePath, 'utf8').then(legacySource => {
    return readJSONFile(filePath).then(object => {
      return unsplit(object, {
        getReferencePartialObject: referencePath => {
          return readJSONFile(path.join(projectPath, referencePath) + '.json');
        },
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
        // Migration must reconstruct the complete legacy reference tree before
        // ownership projection. Keep a finite guard against malicious cycles.
        maxUnsplitDepth: 100,
      }).then(async () => {
        const entryPath = path.join(projectPath, MULTI_FILE_ENTRY_NAME);
        if (fs.existsSync(entryPath)) {
          const migrationHash = await getLegacyMigrationSourceHash(entryPath);
          if (
            migrationHash &&
            migrationHash !== hashLegacySource(legacySource)
          ) {
            throw new Error(
              'The legacy JSON and migrated project.gdevelop have diverged. Open project.gdevelop or import the changed JSON into a different folder.'
            );
          }
          const lastModifiedDate = await getLocalProjectLastModifiedDate(
            entryPath
          );
          const openedProject = separateConstantsFromProject(
            await openMultiFileProject(entryPath)
          );
          return {
            ...openedProject,
            fileMetadata: {
              ...fileMetadata,
              fileIdentifier: entryPath,
              ...(lastModifiedDate !== null ? { lastModifiedDate } : {}),
            },
          };
        }
        const serializedContent = normalizeLegacyProjectWithCurrentSerializer(
          object
        );
        const instructionCatalogs = buildMigrationInstructionCatalogs(
          serializedContent
        );
        const instructionCatalog = instructionCatalogs.serializationCatalog;
        const content = normalizeLegacyProjectInstructionParameters(
          serializedContent,
          instructionCatalog
        );
        const constants = await readConstantsSource(projectPath);
        const migration = await migrateLegacyProject({
          legacyPath: filePath,
          legacySource,
          legacyProject: {
            ...content,
            constants,
          },
          decomposeOptions: {
            instructionParameterIndicesToIgnoreByType: getCatalogCodeOnlyParameterIndicesByType(
              instructionCatalog
            ),
            eventsDslOptions: {
              formatInstruction: createCatalogInstructionFormatter(
                instructionCatalog
              ),
            },
          },
          composeOptions: {
            compileOptions: {
              resolveInstruction: createCatalogInstructionResolver(
                instructionCatalog
              ),
            },
          },
        });
        await writeMigrationProjectSourceCatalogs(
          content,
          projectPath,
          instructionCatalogs
        );
        const lastModifiedDate = await getLocalProjectLastModifiedDate(
          migration.entryPath
        );
        return {
          content,
          constants,
          fileMetadata: {
            ...fileMetadata,
            fileIdentifier: migration.entryPath,
            ...(lastModifiedDate !== null ? { lastModifiedDate } : {}),
          },
        };
      });
    });
  });
};

export const getMultiFileAutoSavePath = (filePath: string): string =>
  path.join(
    path.dirname(filePath),
    '.gdevelop',
    'autosave',
    'current',
    MULTI_FILE_ENTRY_NAME
  );

export const getAutoSaveCreationDate = async (
  fileMetadata: FileMetadata,
  compareLastModified: boolean
): Promise<?number> => {
  const filePath = fileMetadata.fileIdentifier;
  const autoSavePath =
    path.basename(filePath).toLowerCase() === MULTI_FILE_ENTRY_NAME
      ? getMultiFileAutoSavePath(filePath)
      : filePath + '.autosave';
  if (fs.existsSync(autoSavePath)) {
    const autoSavedTime = fs.statSync(autoSavePath).mtime.getTime();
    if (!compareLastModified) {
      return autoSavedTime;
    }
    try {
      const saveTime = fs.statSync(filePath).mtime.getTime();
      // When comparing the last modified time, add a 5 seconds margin to avoid
      // showing the warning if the user has just saved the project, or if the
      // project has been decompressed from a zip file, causing the last modified
      // time to be the time of decompression.
      return autoSavedTime > saveTime + 5000 ? autoSavedTime : null;
    } catch (err) {
      console.error('Unable to compare *.autosave to project', err);
      return null;
    }
  }
  return null;
};

export const onGetAutoSave = (
  fileMetadata: FileMetadata
): Promise<{
  fileIdentifier: string,
  gameId?: string,
  lastModifiedDate?: number,
  name?: string,
  ownerId?: string,
  version?: string,
}> => {
  return Promise.resolve({
    ...fileMetadata,
    fileIdentifier:
      path.basename(fileMetadata.fileIdentifier).toLowerCase() ===
      MULTI_FILE_ENTRY_NAME
        ? getMultiFileAutoSavePath(fileMetadata.fileIdentifier)
        : fileMetadata.fileIdentifier + '.autosave',
  });
};
