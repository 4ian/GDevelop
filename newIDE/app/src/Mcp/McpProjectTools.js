// @flow
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import optionalRequire from '../Utils/OptionalRequire';
import { scanProjectForValidationErrors } from '../Utils/EventsValidationScanner';
import { lintExtensionFunctionEvents } from './McpExtensionTools';
import { validateProjectJavaScriptAuthoring } from '../ProjectsStorage/JavaScriptAuthoringApi';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const hasOwn = (object: any, propertyName: string): boolean =>
  !!object &&
  typeof object === 'object' &&
  Object.keys(object).includes(propertyName);

// In-memory project snapshots for a coarse transaction/rollback (#10). A build
// can snapshot before a multi-step edit and restore on failure. Session-scoped
// (lost on reload); each snapshot stores the full serialized project JSON.
const projectSnapshots: {
  [string]: { json: string, createdLabel: string },
} = {};
let nextSnapshotId = 1;

export const snapshotProject = (project: gdProject, args: Object): Object => {
  const element = new gd.SerializerElement();
  project.serializeTo(element);
  const json = gd.Serializer.toJSON(element);
  element.delete();
  const label =
    getStringWithAliases(args || {}, ['label', 'name']) ||
    `snapshot-${nextSnapshotId}`;
  const id = `snapshot-${nextSnapshotId++}`;
  projectSnapshots[id] = { json, createdLabel: label };
  return {
    success: true,
    snapshotId: id,
    label,
    bytes: json.length,
    note:
      'Project snapshotted in memory. Restore with restore_project_snapshot { snapshot_id } if a later step fails. Snapshots are session-scoped (lost on reload) and are NOT a disk save — use gdevelop_save_project_and_wait to persist.',
  };
};

export const restoreProjectSnapshot = (
  project: gdProject,
  args: Object
): Object => {
  const id = getStringWithAliases(args || {}, ['snapshot_id', 'snapshotId']);
  if (!id || !projectSnapshots[id]) {
    throw new Error(
      `Unknown snapshot_id "${id || ''}". Available: ${Object.keys(
        projectSnapshots
      ).join(', ') || '(none)'}.`
    );
  }
  const { json, createdLabel } = projectSnapshots[id];
  const element = gd.Serializer.fromJSON(json);
  project.unserializeFrom(element);
  element.delete();
  return {
    success: true,
    snapshotId: id,
    label: createdLabel,
    note:
      'Project restored in memory from the snapshot. Open scene editors may hold stale references — if the editor UI looks wrong, reopen the affected scene tab. Re-inspect with read_serialized_scene to confirm state. This did not touch disk.',
  };
};

const parseJsonPointer = (pointer: string): Array<string> => {
  if (pointer === '') return [];
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) {
    throw new Error(`JSON patch path must start with "/": "${pointer}".`);
  }
  return pointer
    .slice(1)
    .split('/')
    .map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'));
};

const assertSafePathParts = (parts: Array<string>) => {
  parts.forEach(part => {
    if (
      part === '__proto__' ||
      part === 'constructor' ||
      part === 'prototype'
    ) {
      throw new Error(`Unsafe JSON patch path segment: "${part}".`);
    }
  });
};

const getPatchTarget = (
  document: any,
  pointer: string
): {| container: any, key: string |} => {
  const parts = parseJsonPointer(pointer);
  assertSafePathParts(parts);
  if (!parts.length) {
    throw new Error('Patching the scoped root object is not supported.');
  }

  let container = document;
  for (let index = 0; index < parts.length - 1; index++) {
    const part = parts[index];
    if (Array.isArray(container)) {
      const arrayIndex = Number(part);
      if (
        !Number.isInteger(arrayIndex) ||
        arrayIndex < 0 ||
        arrayIndex >= container.length
      ) {
        throw new Error(`Invalid array index in patch path: "${pointer}".`);
      }
      container = container[arrayIndex];
    } else if (
      container &&
      typeof container === 'object' &&
      hasOwn(container, part)
    ) {
      container = container[part];
    } else {
      throw new Error(`Patch path does not exist: "${pointer}".`);
    }
  }

  return {
    container,
    key: parts[parts.length - 1],
  };
};

const valuesAreJsonEqual = (left: any, right: any): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

const applySinglePatchOperation = (document: any, operation: Object) => {
  if (!operation || typeof operation !== 'object') {
    throw new Error('Patch operations must be objects.');
  }
  const op = getStringWithAliases(operation, ['op']) || '';
  const pointer = getStringWithAliases(operation, ['path']) || '';
  if (!op) throw new Error('Patch operation is missing op.');
  if (!pointer) throw new Error('Patch operation is missing path.');

  const { container, key } = getPatchTarget(document, pointer);
  if (Array.isArray(container)) {
    if (op === 'add' && key === '-') {
      container.push(operation.value);
      return;
    }
    const arrayIndex = Number(key);
    if (!Number.isInteger(arrayIndex) || arrayIndex < 0) {
      throw new Error(`Invalid array index in patch path: "${pointer}".`);
    }
    if (op === 'add') {
      if (arrayIndex > container.length) {
        throw new Error(`Array add index out of bounds: "${pointer}".`);
      }
      container.splice(arrayIndex, 0, operation.value);
      return;
    }
    if (arrayIndex >= container.length) {
      throw new Error(`Array index out of bounds: "${pointer}".`);
    }
    if (op === 'replace') {
      container[arrayIndex] = operation.value;
      return;
    }
    if (op === 'remove') {
      container.splice(arrayIndex, 1);
      return;
    }
    if (op === 'test') {
      if (!valuesAreJsonEqual(container[arrayIndex], operation.value)) {
        throw new Error(`JSON patch test failed at "${pointer}".`);
      }
      return;
    }
  } else if (container && typeof container === 'object') {
    if (op === 'add' || op === 'replace') {
      if (op === 'replace' && !hasOwn(container, key)) {
        throw new Error(`Patch replace path does not exist: "${pointer}".`);
      }
      container[key] = operation.value;
      return;
    }
    if (op === 'remove') {
      if (!hasOwn(container, key)) {
        throw new Error(`Patch remove path does not exist: "${pointer}".`);
      }
      delete container[key];
      return;
    }
    if (op === 'test') {
      if (!hasOwn(container, key)) {
        throw new Error(`Patch test path does not exist: "${pointer}".`);
      }
      if (!valuesAreJsonEqual(container[key], operation.value)) {
        throw new Error(`JSON patch test failed at "${pointer}".`);
      }
      return;
    }
  }

  throw new Error(`Unsupported JSON patch operation: "${op}".`);
};

const readJsonFile = (project: gdProject, file: string): any => {
  if (!fs) throw new Error('Filesystem access is not available.');
  const projectFile = project.getProjectFile();
  const resolvedFile =
    path && !path.isAbsolute(file) && projectFile
      ? path.resolve(path.dirname(projectFile), file)
      : file;
  if (!fs.existsSync(resolvedFile)) {
    throw new Error(
      `File not found: "${file}"${
        resolvedFile !== file ? ` (resolved to "${resolvedFile}")` : ''
      }.`
    );
  }
  return JSON.parse(fs.readFileSync(resolvedFile, 'utf8'));
};

const getPatchOperations = (
  project: gdProject,
  args: Object
): Array<Object> => {
  if (Array.isArray(args.patch)) return args.patch;
  if (typeof args.patch === 'string') {
    const parsedPatch = JSON.parse(args.patch);
    if (!Array.isArray(parsedPatch)) {
      throw new Error('patch string must contain a JSON patch array.');
    }
    return parsedPatch;
  }
  const patchFile = getStringWithAliases(args || {}, [
    'patch_file',
    'patchFile',
  ]);
  if (patchFile) {
    const parsedPatch = readJsonFile(project, patchFile);
    if (!Array.isArray(parsedPatch)) {
      throw new Error('patch_file must contain a JSON patch array.');
    }
    return parsedPatch;
  }
  throw new Error('Missing patch array, patch string, or patch_file.');
};

const getNamedArrayIndex = (
  items: any,
  name: string,
  label: string
): number => {
  if (!Array.isArray(items)) {
    throw new Error(`Serialized project is missing ${label} array.`);
  }
  const index = items.findIndex(item => item && item.name === name);
  if (index === -1) throw new Error(`${label} not found: "${name}".`);
  return index;
};

const getScopedPatchTarget = (
  serializedProject: Object,
  args: Object
): {| target: Object, scope: string, scopeRootPath: string |} => {
  const scope = String(args.scope || 'project')
    .trim()
    .toLowerCase();
  if (!scope || scope === 'project') {
    return {
      target: serializedProject,
      scope: 'project',
      scopeRootPath: '',
    };
  }

  if (scope === 'scene' || scope === 'layout') {
    const sceneName = getStringWithAliases(args, ['scene_name', 'sceneName']);
    if (!sceneName) throw new Error('scope "scene" requires scene_name.');
    const layoutIndex = getNamedArrayIndex(
      serializedProject.layouts,
      sceneName,
      'scene/layout'
    );
    return {
      target: serializedProject.layouts[layoutIndex],
      scope: 'scene',
      scopeRootPath: `/layouts/${layoutIndex}`,
    };
  }

  const extensionName = getStringWithAliases(args, [
    'extension_name',
    'extensionName',
  ]);
  if (!extensionName) {
    throw new Error(`scope "${scope}" requires extension_name.`);
  }
  const extensionIndex = getNamedArrayIndex(
    serializedProject.eventsFunctionsExtensions,
    extensionName,
    'events-functions extension'
  );
  const extension = serializedProject.eventsFunctionsExtensions[extensionIndex];
  if (scope === 'extension') {
    return {
      target: extension,
      scope: 'extension',
      scopeRootPath: `/eventsFunctionsExtensions/${extensionIndex}`,
    };
  }

  if (scope === 'extension_object' || scope === 'object') {
    const objectName = getStringWithAliases(args, [
      'object_name',
      'objectName',
      'parent_name',
      'parentName',
    ]);
    if (!objectName) {
      throw new Error(`scope "${scope}" requires object_name.`);
    }
    const objectIndex = getNamedArrayIndex(
      extension.eventsBasedObjects,
      objectName,
      'events-based object'
    );
    return {
      target: extension.eventsBasedObjects[objectIndex],
      scope: 'extension_object',
      scopeRootPath: `/eventsFunctionsExtensions/${extensionIndex}/eventsBasedObjects/${objectIndex}`,
    };
  }

  if (scope === 'extension_function' || scope === 'function') {
    const parentKind = String(args.parent_kind || 'extension')
      .trim()
      .toLowerCase();
    const functionName = getStringWithAliases(args, [
      'function_name',
      'functionName',
    ]);
    if (!functionName) {
      throw new Error(`scope "${scope}" requires function_name.`);
    }
    let container = extension.eventsFunctions;
    let scopeRootPath = `/eventsFunctionsExtensions/${extensionIndex}/eventsFunctions`;
    if (parentKind === 'object') {
      const parentName = getStringWithAliases(args, [
        'parent_name',
        'parentName',
      ]);
      if (!parentName)
        throw new Error('parent_kind "object" requires parent_name.');
      const objectIndex = getNamedArrayIndex(
        extension.eventsBasedObjects,
        parentName,
        'events-based object'
      );
      container = extension.eventsBasedObjects[objectIndex].eventsFunctions;
      scopeRootPath = `/eventsFunctionsExtensions/${extensionIndex}/eventsBasedObjects/${objectIndex}/eventsFunctions`;
    } else if (parentKind === 'behavior') {
      const parentName = getStringWithAliases(args, [
        'parent_name',
        'parentName',
      ]);
      if (!parentName)
        throw new Error('parent_kind "behavior" requires parent_name.');
      const behaviorIndex = getNamedArrayIndex(
        extension.eventsBasedBehaviors,
        parentName,
        'events-based behavior'
      );
      container = extension.eventsBasedBehaviors[behaviorIndex].eventsFunctions;
      scopeRootPath = `/eventsFunctionsExtensions/${extensionIndex}/eventsBasedBehaviors/${behaviorIndex}/eventsFunctions`;
    }
    const functionIndex = getNamedArrayIndex(
      container,
      functionName,
      'events function'
    );
    return {
      target: container[functionIndex],
      scope: 'extension_function',
      scopeRootPath: `${scopeRootPath}/${functionIndex}`,
    };
  }

  throw new Error(
    `Unsupported project patch scope "${scope}". Use project, scene, extension, extension_object, or extension_function.`
  );
};

const getProjectSceneNames = (serializedProject: Object): Array<string> =>
  Array.isArray(serializedProject.layouts)
    ? serializedProject.layouts
        .map(layout =>
          layout && typeof layout.name === 'string' ? layout.name : null
        )
        .filter(Boolean)
    : [];

const summarizeProjectSemanticDiff = (
  beforeProject: Object,
  afterProject: Object,
  changedPaths: Array<string>
): Object => {
  const beforeSceneNames = getProjectSceneNames(beforeProject);
  const afterSceneNames = getProjectSceneNames(afterProject);
  const beforeExtensions = Array.isArray(
    beforeProject.eventsFunctionsExtensions
  )
    ? beforeProject.eventsFunctionsExtensions.map(extension => extension.name)
    : [];
  const afterExtensions = Array.isArray(afterProject.eventsFunctionsExtensions)
    ? afterProject.eventsFunctionsExtensions.map(extension => extension.name)
    : [];

  return {
    changedPaths,
    sceneCountBefore: beforeSceneNames.length,
    sceneCountAfter: afterSceneNames.length,
    addedScenes: afterSceneNames.filter(
      name => !beforeSceneNames.includes(name)
    ),
    removedScenes: beforeSceneNames.filter(
      name => !afterSceneNames.includes(name)
    ),
    extensionCountBefore: beforeExtensions.length,
    extensionCountAfter: afterExtensions.length,
    addedExtensions: afterExtensions.filter(
      name => !beforeExtensions.includes(name)
    ),
    removedExtensions: beforeExtensions.filter(
      name => !afterExtensions.includes(name)
    ),
  };
};

const collectExtensionFunctionLintResults = (
  project: gdProject,
  includeGeneratedCode: boolean
): Array<Object> => {
  const results: Array<Object> = [];
  for (
    let extensionIndex = 0;
    extensionIndex < project.getEventsFunctionsExtensionsCount();
    extensionIndex++
  ) {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
    const extensionName = extension.getName();
    const collectContainer = (
      parentKind: string,
      parentName: ?string,
      container: gdEventsFunctionsContainer
    ) => {
      for (
        let functionIndex = 0;
        functionIndex < container.getEventsFunctionsCount();
        functionIndex++
      ) {
        const eventsFunction = container.getEventsFunctionAt(functionIndex);
        try {
          const result = lintExtensionFunctionEvents(project, {
            extension_name: extensionName,
            parent_kind: parentKind,
            parent_name: parentName || undefined,
            function_name: eventsFunction.getName(),
            require_root_groups: false,
            include_generated_code: includeGeneratedCode,
            // Store extensions are reviewed, versioned dependencies and can
            // intentionally retain hidden legacy instructions for backwards
            // compatibility. Still compile and parse their generated code,
            // while reserving semantic authoring lint for local extensions.
            generated_code_only:
              extension.getOriginName() === 'gdevelop-extension-store',
          });
          if (!result.valid) results.push(result);
        } catch (error) {
          results.push({
            success: true,
            valid: false,
            extensionName,
            parentKind,
            parentName,
            functionName: eventsFunction.getName(),
            errors: [
              {
                severity: 'error',
                type: 'extension-function-validation-exception',
                error: error && error.message ? error.message : String(error),
              },
            ],
          });
        }
      }
    };

    collectContainer('extension', null, extension.getEventsFunctions());

    const behaviors = extension.getEventsBasedBehaviors();
    for (let index = 0; index < behaviors.getCount(); index++) {
      const behavior = behaviors.getAt(index);
      collectContainer(
        'behavior',
        behavior.getName(),
        behavior.getEventsFunctions()
      );
    }

    const objects = extension.getEventsBasedObjects();
    for (let index = 0; index < objects.getCount(); index++) {
      const object = objects.getAt(index);
      collectContainer('object', object.getName(), object.getEventsFunctions());
    }
  }
  return results;
};

export const validateSerializedProject = (
  serializedProject: Object,
  args: Object = {}
): Object => {
  // $FlowFixMe[invalid-constructor]
  const validationProject = new gd.ProjectHelper.createNewGDJSProject();
  try {
    unserializeFromJSObject(validationProject, serializedProject);
    // Round-trip serialization catches late serializer crashes and normalizes
    // the same path the editor will use after a sync/apply.
    serializeToJSObject(validationProject);
    const projectValidationErrors = scanProjectForValidationErrors(
      validationProject
    );
    const extensionLintFailures =
      args.include_generated_code === false
        ? []
        : collectExtensionFunctionLintResults(validationProject, true);
    const extensionErrors: Array<Object> = [];
    extensionLintFailures.forEach(result => {
      if (Array.isArray(result.errors)) {
        result.errors.forEach(error =>
          extensionErrors.push({
            ...error,
            extensionName: result.extensionName,
            parentKind: result.parentKind,
            parentName: result.parentName,
            functionName: result.functionName,
          })
        );
      }
    });
    const javascriptAuthoring = validateProjectJavaScriptAuthoring({
      serializedProject,
      sourceFiles: args.javascript_source_files,
      runtimeApiDeclaration: args.runtime_api_declaration,
      projectApiDeclaration: args.project_api_declaration,
    });
    const errors = [
      ...projectValidationErrors.map(error => ({
        severity: 'error',
        ...error,
      })),
      ...extensionErrors,
      ...javascriptAuthoring.errors,
    ].filter(error => error.severity === 'error' || !error.severity);
    return {
      success: true,
      valid: errors.length === 0,
      projectName: validationProject.getName(),
      projectUuid: validationProject.getProjectUuid(),
      sceneNames: getProjectSceneNames(serializedProject),
      projectValidationErrors,
      extensionLintFailures,
      javascriptAuthoring,
      errors,
      generatedCodePreflight:
        args.include_generated_code === false ? 'skipped' : 'checked',
      validationScope: {
        projectUnserialization: 'checked',
        projectSerializationRoundTrip: 'checked',
        projectValidation: 'checked',
        extensionGeneratedCode:
          args.include_generated_code === false ? 'skipped' : 'checked',
        javascriptAuthoringApi: 'checked',
        runtimeGameplaySemantics: 'not-verified',
      },
      runtimeSemanticsVerified: false,
      runtimeVerificationRecommendation:
        'Runtime verification is required for extension actions that create, delete, pick, or mutate objects. Launch a paused preview and use run_frames with targeted object inspection.',
    };
  } catch (error) {
    return {
      success: true,
      valid: false,
      validationScope: {
        projectUnserialization: 'failed',
        projectSerializationRoundTrip: 'not-checked',
        projectValidation: 'not-checked',
        extensionGeneratedCode: 'not-checked',
        javascriptAuthoringApi: 'not-checked',
        runtimeGameplaySemantics: 'not-verified',
      },
      runtimeSemanticsVerified: false,
      errors: [
        {
          severity: 'error',
          type: 'project-unserialize-failed',
          error: error && error.message ? error.message : String(error),
        },
      ],
    };
  } finally {
    validationProject.delete();
  }
};

export const validateCurrentProjectJson = (
  project: gdProject,
  args: Object = {}
): Object => {
  const serializedProject = serializeToJSObject(project);
  const validation = validateSerializedProject(serializedProject, args);
  return {
    ...validation,
    validationMode: 'current-editor-project',
    projectFile: project.getProjectFile()
      ? project.getProjectFile()
      : undefined,
    note:
      'Validated the currently open in-memory project by serializing it and unserializing it through GDevelop. No project data was modified.',
  };
};

export const applyValidatedProjectJsonPatch = (
  project: gdProject,
  args: Object = {}
): Object => {
  const patch = getPatchOperations(project, args);
  const beforeSerializedProject = serializeToJSObject(project);
  const patchedSerializedProject = JSON.parse(
    JSON.stringify(beforeSerializedProject)
  );
  const scopedTarget = getScopedPatchTarget(patchedSerializedProject, args);
  patch.forEach(operation =>
    applySinglePatchOperation(scopedTarget.target, operation)
  );

  const validation = validateSerializedProject(patchedSerializedProject, args);
  if (!validation.valid) {
    return {
      success: false,
      valid: false,
      dryRun: !!args.dry_run,
      validation,
      patchOperations: patch.length,
      changedPaths: patch.map(operation => operation.path),
      note:
        'Patch was applied only to a temporary serialized project. Validation failed, so the editor project was not modified.',
    };
  }

  const summaryOnly = !!(args.summary_only || args.summaryOnly);
  const semanticDiff = summarizeProjectSemanticDiff(
    beforeSerializedProject,
    patchedSerializedProject,
    patch.map(operation =>
      scopedTarget.scopeRootPath
        ? `${scopedTarget.scopeRootPath}${operation.path}`
        : operation.path
    )
  );

  if (args.dry_run === true) {
    return {
      success: true,
      valid: true,
      dryRun: true,
      scope: scopedTarget.scope,
      scopeRootPath: scopedTarget.scopeRootPath,
      patchOperations: patch.length,
      semanticDiff,
      validation,
      serializedProject: summaryOnly ? undefined : patchedSerializedProject,
      note:
        'Patch validated on a temporary serialized project only. The editor project was not modified.',
    };
  }

  const snapshot = snapshotProject(project, {
    label:
      getStringWithAliases(args, [
        'snapshot_label',
        'snapshotLabel',
        'label',
      ]) || 'before-validated-project-json-patch',
  });
  try {
    unserializeFromJSObject(project, patchedSerializedProject);
  } catch (error) {
    restoreProjectSnapshot(project, { snapshot_id: snapshot.snapshotId });
    throw error;
  }

  return {
    success: true,
    valid: true,
    dryRun: false,
    scope: scopedTarget.scope,
    scopeRootPath: scopedTarget.scopeRootPath,
    patchOperations: patch.length,
    semanticDiff,
    validation,
    snapshot,
    shouldSave: !!args.save,
    serializedProject: summaryOnly ? undefined : serializeToJSObject(project),
    note:
      'Validated patch was applied to the editor project model. Save only after reviewing the semantic diff; pass save:true to let the MCP bridge save after a successful apply.',
  };
};

export const syncEditorFromValidatedProjectJson = (
  project: gdProject,
  args: Object = {}
): Object => {
  const projectFile = project.getProjectFile()
    ? project.getProjectFile()
    : null;
  if (!projectFile) {
    throw new Error('The current project has no project file path.');
  }
  if (!fs) throw new Error('Filesystem access is not available.');
  const diskSerializedProject = JSON.parse(
    fs.readFileSync(projectFile, 'utf8')
  );
  const validation = validateSerializedProject(diskSerializedProject, args);
  const beforeSerializedProject = serializeToJSObject(project);
  const semanticDiff = summarizeProjectSemanticDiff(
    beforeSerializedProject,
    diskSerializedProject,
    []
  );
  const wouldOverwriteCurrentMemory = !valuesAreJsonEqual(
    beforeSerializedProject,
    diskSerializedProject
  );
  if (!validation.valid) {
    return {
      success: false,
      valid: false,
      dryRun: !!args.dry_run,
      projectFile,
      wouldOverwriteCurrentMemory,
      validation,
      semanticDiff,
      note:
        'Saved project JSON did not validate through GDevelop. The editor project was not reloaded.',
    };
  }

  if (args.dry_run === true) {
    return {
      success: true,
      valid: true,
      dryRun: true,
      projectFile,
      wouldOverwriteCurrentMemory,
      validation,
      semanticDiff,
      note:
        'Saved project JSON validated. Dry run only; the editor project was not reloaded.',
    };
  }

  const snapshot = snapshotProject(project, {
    label: 'before-sync-editor-from-validated-project-json',
  });
  try {
    unserializeFromJSObject(project, diskSerializedProject);
    project.setProjectFile(projectFile);
  } catch (error) {
    restoreProjectSnapshot(project, { snapshot_id: snapshot.snapshotId });
    throw error;
  }

  return {
    success: true,
    valid: true,
    dryRun: false,
    projectFile,
    wouldOverwriteCurrentMemory,
    validation,
    semanticDiff,
    snapshot,
    note:
      'Saved project JSON validated and was loaded into the editor project model. Any unsaved in-memory differences were replaced; use the snapshot id to roll back during this session.',
  };
};

const getStringWithAliases = (
  args: Object,
  names: Array<string>
): string | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'string') return value;
  }
  return null;
};

const getBooleanWithAliases = (
  args: Object,
  names: Array<string>
): boolean | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'boolean') return value;
  }
  return null;
};

const getNumberWithAliases = (
  args: Object,
  names: Array<string>
): number | null => {
  for (const name of names) {
    const value = args && args[name];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
};

const staticDataPlaceholderRegex = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;

const isPlainObject = (value: any): boolean =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const parseStaticDataRoot = (value: any, label: string): Object => {
  const parsedValue =
    typeof value === 'string' ? JSON.parse(value || '{}') : value;
  if (!isPlainObject(parsedValue)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsedValue;
};

const readProjectStaticData = (project: gdProject): Object => {
  const projectWithStaticData: any = project;
  const json =
    typeof projectWithStaticData.getStaticDataJson === 'function'
      ? projectWithStaticData.getStaticDataJson()
      : '{}';
  return parseStaticDataRoot(json || '{}', 'Project static data');
};

const writeProjectStaticData = (project: gdProject, staticData: Object) => {
  const projectWithStaticData: any = project;
  if (typeof projectWithStaticData.setStaticDataJson !== 'function') {
    throw new Error('This GDevelop build does not expose static data writes.');
  }
  projectWithStaticData.setStaticDataJson(JSON.stringify(staticData));
};

const normalizeStaticDataPlaceholderPath = (
  placeholderPath: string
): string => {
  const match = staticDataPlaceholderRegex.exec(placeholderPath || '');
  if (!match) {
    throw new Error(
      'Static Data paths must use placeholder syntax such as {{cards.sunflower.price}}.'
    );
  }
  const normalizedPath = match[1].trim();
  if (!normalizedPath) {
    throw new Error('Static Data placeholder path cannot be empty.');
  }
  return normalizedPath;
};

const parseStaticDataPlaceholderPath = (
  placeholderPath: string
): Array<string | number> => {
  const path = normalizeStaticDataPlaceholderPath(placeholderPath);
  const segments: Array<string | number> = [];
  let current = '';
  let index = 0;

  const pushCurrent = () => {
    if (current !== '') {
      segments.push(current);
      current = '';
    }
  };

  while (index < path.length) {
    const character = path[index];

    if (character === '.') {
      pushCurrent();
      index++;
      continue;
    }

    if (character === '[') {
      pushCurrent();
      index++;
      while (index < path.length && /\s/.test(path[index])) index++;

      if (path[index] === '"' || path[index] === "'") {
        const quote = path[index];
        index++;
        let quotedSegment = '';
        while (index < path.length && path[index] !== quote) {
          if (path[index] === '\\' && index + 1 < path.length) {
            index++;
          }
          quotedSegment += path[index];
          index++;
        }
        if (path[index] === quote) index++;
        while (index < path.length && /\s/.test(path[index])) index++;
        if (path[index] === ']') index++;
        segments.push(quotedSegment);
        continue;
      }

      let bracketSegment = '';
      while (index < path.length && path[index] !== ']') {
        bracketSegment += path[index];
        index++;
      }
      if (path[index] === ']') index++;
      bracketSegment = bracketSegment.trim();
      if (/^\d+$/.test(bracketSegment)) {
        segments.push(parseInt(bracketSegment, 10));
      } else if (bracketSegment !== '') {
        segments.push(bracketSegment);
      }
      continue;
    }

    current += character;
    index++;
  }

  pushCurrent();

  if (!segments.length) {
    throw new Error('Static Data placeholder path cannot be empty.');
  }
  return segments;
};

const getStaticDataPathArg = (args: Object): string => {
  const placeholderPath = getStringWithAliases(args || {}, [
    'placeholder_path',
    'placeholderPath',
    'path',
  ]);
  if (!placeholderPath) {
    throw new Error('Missing placeholder_path.');
  }
  return placeholderPath;
};

const getStaticDataValueAtPath = (
  staticData: Object,
  segments: Array<string | number>
): {| exists: boolean, value?: any |} => {
  let current: any = staticData;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      if (
        typeof segment !== 'number' ||
        segment < 0 ||
        segment >= current.length
      ) {
        return { exists: false };
      }
      current = current[segment];
      continue;
    }
    if (current && typeof current === 'object') {
      const key = String(segment);
      if (!hasOwn(current, key)) return { exists: false };
      current = current[key];
      continue;
    }
    return { exists: false };
  }
  return { exists: true, value: current };
};

const setStaticDataValueAtPath = (
  staticData: Object,
  segments: Array<string | number>,
  value: any
) => {
  let current: any = staticData;
  for (let index = 0; index < segments.length - 1; index++) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];

    if (Array.isArray(current)) {
      if (typeof segment !== 'number' || segment < 0) {
        throw new Error(
          'Array static data paths must use non-negative indexes.'
        );
      }
      if (!hasOwn(current, String(segment)) || current[segment] === null) {
        current[segment] = typeof nextSegment === 'number' ? [] : {};
      }
      if (typeof current[segment] !== 'object') {
        throw new Error(
          `Static Data path segment "${String(
            segment
          )}" is not an object or array.`
        );
      }
      current = current[segment];
      continue;
    } else if (!current || typeof current !== 'object') {
      throw new Error(
        `Static Data path cannot create a child under non-object segment "${String(
          segment
        )}".`
      );
    }

    const key = String(segment);
    if (!hasOwn(current, key) || current[key] === null) {
      current[key] = typeof nextSegment === 'number' ? [] : {};
    }
    if (typeof current[key] !== 'object') {
      throw new Error(
        `Static Data path segment "${String(
          segment
        )}" is not an object or array.`
      );
    }
    current = current[key];
  }

  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    if (typeof lastSegment !== 'number' || lastSegment < 0) {
      throw new Error('Array static data paths must use non-negative indexes.');
    }
    current[lastSegment] = value;
    return;
  }
  if (!current || typeof current !== 'object') {
    throw new Error('Static Data path parent is not an object.');
  }
  current[String(lastSegment)] = value;
};

const deleteStaticDataValueAtPath = (
  staticData: Object,
  segments: Array<string | number>
): {| deleted: boolean, previousValue?: any |} => {
  const parentSegments = segments.slice(0, -1);
  const lastSegment = segments[segments.length - 1];
  const parentResult = parentSegments.length
    ? getStaticDataValueAtPath(staticData, parentSegments)
    : { exists: true, value: staticData };
  if (!parentResult.exists) return { deleted: false };

  const parent: any = parentResult.value;
  if (Array.isArray(parent)) {
    if (
      typeof lastSegment !== 'number' ||
      lastSegment < 0 ||
      lastSegment >= parent.length
    ) {
      return { deleted: false };
    }
    const previousValue = parent[lastSegment];
    parent.splice(lastSegment, 1);
    return { deleted: true, previousValue };
  }

  if (!parent || typeof parent !== 'object') return { deleted: false };
  const key = String(lastSegment);
  if (!hasOwn(parent, key)) return { deleted: false };
  const previousValue = parent[key];
  delete parent[key];
  return { deleted: true, previousValue };
};

const getStaticDataInputValue = (args: Object): any => {
  if (hasOwn(args || {}, 'value_json')) {
    return JSON.parse(String(args.value_json));
  }
  if (hasOwn(args || {}, 'valueJson')) {
    return JSON.parse(String(args.valueJson));
  }
  if (hasOwn(args || {}, 'value')) return args.value;
  throw new Error('Missing value or value_json.');
};

const getStaticDataRootFromArgs = (args: Object): Object => {
  if (hasOwn(args || {}, 'static_data')) {
    return parseStaticDataRoot(args.static_data, 'static_data');
  }
  if (hasOwn(args || {}, 'staticData')) {
    return parseStaticDataRoot(args.staticData, 'staticData');
  }
  if (hasOwn(args || {}, 'static_data_json')) {
    return parseStaticDataRoot(args.static_data_json, 'static_data_json');
  }
  if (hasOwn(args || {}, 'staticDataJson')) {
    return parseStaticDataRoot(args.staticDataJson, 'staticDataJson');
  }
  throw new Error('Missing static_data or static_data_json.');
};

export const summarizeStaticData = (project: gdProject): Object => {
  const staticData = readProjectStaticData(project);
  const topLevelKeys = Object.keys(staticData);
  const placeholderExamples: Array<string> = [];
  const collectPlaceholders = (value: any, path: string) => {
    if (placeholderExamples.length >= 12) return;
    if (isPlainObject(value)) {
      const keys = Object.keys(value);
      if (!keys.length && path) placeholderExamples.push(`{{${path}}}`);
      keys.forEach(key =>
        collectPlaceholders(value[key], path ? `${path}.${key}` : key)
      );
      return;
    }
    if (Array.isArray(value)) {
      if (!value.length && path) placeholderExamples.push(`{{${path}}}`);
      value.forEach((item, index) =>
        collectPlaceholders(item, `${path}[${index}]`)
      );
      return;
    }
    if (path) placeholderExamples.push(`{{${path}}}`);
  };
  topLevelKeys.forEach(key => collectPlaceholders(staticData[key], key));
  return {
    topLevelKeyCount: topLevelKeys.length,
    topLevelKeys,
    placeholderExamples,
  };
};

export const getStaticData = (
  project: gdProject,
  args: Object = {}
): Object => {
  const staticData = readProjectStaticData(project);
  const placeholderPath = getStringWithAliases(args || {}, [
    'placeholder_path',
    'placeholderPath',
    'path',
  ]);
  if (placeholderPath) {
    const normalizedPath = normalizeStaticDataPlaceholderPath(placeholderPath);
    const segments = parseStaticDataPlaceholderPath(placeholderPath);
    const result = getStaticDataValueAtPath(staticData, segments);
    return {
      success: true,
      placeholderPath: `{{${normalizedPath}}}`,
      path: normalizedPath,
      exists: result.exists,
      value: result.value,
    };
  }

  return {
    success: true,
    summary: summarizeStaticData(project),
    staticData,
    staticDataJson: JSON.stringify(staticData, null, 2),
  };
};

export const setStaticData = (
  project: gdProject,
  args: Object = {}
): Object => {
  const staticData = getStaticDataRootFromArgs(args);
  const previousSummary = summarizeStaticData(project);
  writeProjectStaticData(project, staticData);
  return {
    success: true,
    didModifyProject: true,
    previousSummary,
    summary: summarizeStaticData(project),
    staticData: args.include_static_data === true ? staticData : undefined,
    note:
      'Static Data was replaced in the editor project model. Persist it with gdevelop_save_project_and_wait.',
  };
};

export const setStaticDataValue = (
  project: gdProject,
  args: Object = {}
): Object => {
  const placeholderPath = getStaticDataPathArg(args);
  const normalizedPath = normalizeStaticDataPlaceholderPath(placeholderPath);
  const segments = parseStaticDataPlaceholderPath(placeholderPath);
  const staticData = readProjectStaticData(project);
  const previous = getStaticDataValueAtPath(staticData, segments);
  const value = getStaticDataInputValue(args);
  setStaticDataValueAtPath(staticData, segments, value);
  writeProjectStaticData(project, staticData);
  return {
    success: true,
    didModifyProject: true,
    placeholderPath: `{{${normalizedPath}}}`,
    path: normalizedPath,
    previousExists: previous.exists,
    previousValue: previous.value,
    value,
    note:
      'Static Data value was updated in the editor project model. Persist it with gdevelop_save_project_and_wait.',
  };
};

export const deleteStaticDataValue = (
  project: gdProject,
  args: Object = {}
): Object => {
  const placeholderPath = getStaticDataPathArg(args);
  const normalizedPath = normalizeStaticDataPlaceholderPath(placeholderPath);
  const segments = parseStaticDataPlaceholderPath(placeholderPath);
  const staticData = readProjectStaticData(project);
  const deletion = deleteStaticDataValueAtPath(staticData, segments);
  if (deletion.deleted) writeProjectStaticData(project, staticData);
  return {
    success: true,
    didModifyProject: deletion.deleted,
    placeholderPath: `{{${normalizedPath}}}`,
    path: normalizedPath,
    deleted: deletion.deleted,
    previousValue: deletion.previousValue,
    note: deletion.deleted
      ? 'Static Data value was deleted in the editor project model. Persist it with gdevelop_save_project_and_wait.'
      : 'Static Data value did not exist; the project was not modified.',
  };
};

const summarizeProjectProperties = (project: gdProject): Object => ({
  name: project.getName(),
  firstLayout: project.getFirstLayout(),
  gameResolutionWidth: project.getGameResolutionWidth(),
  gameResolutionHeight: project.getGameResolutionHeight(),
  adaptGameResolutionAtRuntime: project.getAdaptGameResolutionAtRuntime(),
  minFPS: project.getMinimumFPS(),
  maxFPS: project.getMaximumFPS(),
  orientation: project.getOrientation(),
  scaleMode: project.getScaleMode(),
});

const setFirstLayoutValue = (
  project: gdProject,
  sceneName: string,
  changes: Array<Object>
) => {
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }
  const previousValue = project.getFirstLayout();
  project.setFirstLayout(sceneName);
  changes.push({
    property: 'firstLayout',
    previousValue,
    newValue: sceneName,
  });
};

export const setFirstLayout = (project: gdProject, args: Object): Object => {
  const sceneName =
    getStringWithAliases(args || {}, ['scene_name', 'sceneName']) || '';
  if (!sceneName) {
    throw new Error('Missing scene_name.');
  }

  const changes: Array<Object> = [];
  setFirstLayoutValue(project, sceneName, changes);

  return {
    success: true,
    changes,
    // Read back the in-memory value so the caller can confirm it stuck.
    verifiedFirstLayout: project.getFirstLayout(),
    note:
      'The startup scene is set on the in-memory project. Persist it with gdevelop_save_project_and_wait; if a later inspection shows firstLayout empty on disk, re-run this then save again.',
    project: summarizeProjectProperties(project),
  };
};

export const setProjectProperties = (
  project: gdProject,
  args: Object
): Object => {
  const changes: Array<Object> = [];

  const projectName = getStringWithAliases(args || {}, [
    'project_name',
    'projectName',
    'name',
  ]);
  if (projectName !== null) {
    const previousValue = project.getName();
    project.setName(projectName);
    changes.push({
      property: 'name',
      previousValue,
      newValue: projectName,
    });
  }

  const firstLayout = getStringWithAliases(args || {}, [
    'first_layout',
    'firstLayout',
    'scene_name',
    'sceneName',
  ]);
  if (firstLayout !== null) {
    setFirstLayoutValue(project, firstLayout, changes);
  }

  const resolutionWidth = getNumberWithAliases(args || {}, [
    'game_resolution_width',
    'gameResolutionWidth',
    'window_width',
    'windowWidth',
  ]);
  const resolutionHeight = getNumberWithAliases(args || {}, [
    'game_resolution_height',
    'gameResolutionHeight',
    'window_height',
    'windowHeight',
  ]);
  if (resolutionWidth !== null || resolutionHeight !== null) {
    const previousWidth = project.getGameResolutionWidth();
    const previousHeight = project.getGameResolutionHeight();
    const newWidth = resolutionWidth !== null ? resolutionWidth : previousWidth;
    const newHeight =
      resolutionHeight !== null ? resolutionHeight : previousHeight;
    project.setGameResolutionSize(newWidth, newHeight);
    changes.push({
      property: 'gameResolutionSize',
      previousValue: { width: previousWidth, height: previousHeight },
      newValue: { width: newWidth, height: newHeight },
    });
  }

  const adaptGameResolutionAtRuntime = getBooleanWithAliases(args || {}, [
    'adapt_game_resolution_at_runtime',
    'adaptGameResolutionAtRuntime',
  ]);
  if (adaptGameResolutionAtRuntime !== null) {
    const previousValue = project.getAdaptGameResolutionAtRuntime();
    project.setAdaptGameResolutionAtRuntime(adaptGameResolutionAtRuntime);
    changes.push({
      property: 'adaptGameResolutionAtRuntime',
      previousValue,
      newValue: adaptGameResolutionAtRuntime,
    });
  }

  const minFPS = getNumberWithAliases(args || {}, ['min_fps', 'minFPS']);
  if (minFPS !== null) {
    const previousValue = project.getMinimumFPS();
    project.setMinimumFPS(minFPS);
    changes.push({
      property: 'minFPS',
      previousValue,
      newValue: minFPS,
    });
  }

  const maxFPS = getNumberWithAliases(args || {}, ['max_fps', 'maxFPS']);
  if (maxFPS !== null) {
    const previousValue = project.getMaximumFPS();
    project.setMaximumFPS(maxFPS);
    changes.push({
      property: 'maxFPS',
      previousValue,
      newValue: maxFPS,
    });
  }

  const orientation = getStringWithAliases(args || {}, ['orientation']);
  if (orientation !== null) {
    const previousValue = project.getOrientation();
    project.setOrientation(orientation);
    changes.push({
      property: 'orientation',
      previousValue,
      newValue: orientation,
    });
  }

  const scaleMode = getStringWithAliases(args || {}, [
    'scale_mode',
    'scaleMode',
  ]);
  if (scaleMode !== null) {
    const previousValue = project.getScaleMode();
    project.setScaleMode(scaleMode);
    changes.push({
      property: 'scaleMode',
      previousValue,
      newValue: scaleMode,
    });
  }

  if (!changes.length) {
    throw new Error('No supported project properties were provided.');
  }

  return {
    success: true,
    changes,
    project: summarizeProjectProperties(project),
    serializedProject:
      args && args.include_serialized_project
        ? serializeToJSObject(project)
        : undefined,
  };
};
