// @flow
import { type SerializedExtension } from '../GDevelopServices/Extension';

/**
 * The parts of an extension that users can choose to keep from their project
 * when the extension is replaced by a new version.
 */
export type ExtensionMemberKind =
  | 'extension-settings'
  | 'function'
  | 'behavior'
  | 'object'
  | 'object-children';

export type ExtensionMemberDifferentPart =
  | 'configuration'
  | 'variables'
  | 'events'
  | 'parameters'
  | 'properties'
  | 'functions'
  | 'children';

export type ExtensionMemberSource = 'project' | 'new-version';

export type ExtensionMemberDifference = {|
  key: string,
  kind: ExtensionMemberKind,
  name: string,
  /**
   * - `changed`: the member is in both versions, with differences.
   * - `only-in-project`: the member is not in the new version. It was either
   *   added in the project or removed from the new version.
   */
  status: 'changed' | 'only-in-project',
  differentParts: Array<ExtensionMemberDifferentPart>,
|};

export type ExtensionReferenceProblem = {|
  memberKey: string,
  referencedMemberKey: string,
  /**
   * - `removed`: the referenced member is not in the updated extension.
   * - `different-signature`: the referenced member has different parameters
   *   or properties than the ones the member was made for.
   * - `missing-children`: the logic of an object uses children that are not
   *   in the children kept for this object.
   */
  problem: 'removed' | 'different-signature' | 'missing-children',
  missingChildNames: Array<string>,
  /** The source of the referenced member that solves the problem. */
  fixingSource: ExtensionMemberSource,
|};

/** A serialized `gdEventsFunctionsExtension` (or one of its parts). */
type SerializedContent = { [string]: any };

type ExtensionMember = {|
  key: string,
  kind: ExtensionMemberKind,
  name: string,
  content: SerializedContent,
|};

const EXTENSION_SETTINGS_KEY = 'extension-settings';

/** Fields of an extension that are not part of its settings. */
const extensionNonSettingsFields = [
  'name',
  'version',
  'changelog',
  'gdevelopVersion',
  'origin',
  'requiredExtensions',
  'eventsFunctions',
  'eventsFunctionsFolderStructure',
  'eventsBasedBehaviors',
  'eventsBasedObjects',
];

/** Fields of a custom object that are stored in its default variant. */
const objectChildrenFields = [
  'areaMinX',
  'areaMinY',
  'areaMinZ',
  'areaMaxX',
  'areaMaxY',
  'areaMaxZ',
  'objects',
  'objectsFolderStructure',
  'objectsGroups',
  'layers',
  'instances',
  'editionSettings',
  'assetStoreAssetId',
  'assetStoreOriginalName',
];

/** Fields that change without changing what the extension does. */
const fieldsIgnoredInComparison = [
  'eventsFunctionsFolderStructure',
  'propertiesFolderStructure',
  'objectsFolderStructure',
  'editionSettings',
];

const pickFields = (
  content: SerializedContent,
  fields: Array<string>
): SerializedContent => {
  const pickedContent: SerializedContent = {};
  for (const field of fields) {
    if (content[field] !== undefined) pickedContent[field] = content[field];
  }
  return pickedContent;
};

const omitFields = (
  content: SerializedContent,
  fields: Array<string>
): SerializedContent => {
  const remainingContent: SerializedContent = {};
  for (const field of Object.keys(content)) {
    if (!fields.includes(field)) remainingContent[field] = content[field];
  }
  return remainingContent;
};

const isEmptyValue = (value: any): boolean =>
  value === undefined ||
  value === null ||
  value === false ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

/**
 * Sort object keys and remove empty values, so that the same content
 * serialized by different versions of GDevelop (which may omit default values
 * or order fields differently) is considered identical.
 */
const canonicalize = (value: any): any => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  const canonicalValue: SerializedContent = {};
  for (const key of Object.keys(value).sort()) {
    if (fieldsIgnoredInComparison.includes(key)) continue;
    const canonicalChild = canonicalize(value[key]);
    if (!isEmptyValue(canonicalChild)) canonicalValue[key] = canonicalChild;
  }
  return canonicalValue;
};

const areEqual = (a: any, b: any): boolean =>
  JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));

const getExtensionMembers = (
  serializedExtension: SerializedContent
): Map<string, ExtensionMember> => {
  const members = new Map<string, ExtensionMember>();
  const addMember = (
    kind: ExtensionMemberKind,
    name: string,
    content: SerializedContent
  ) => {
    const key = kind === 'extension-settings' ? kind : `${kind}:${name}`;
    members.set(key, { key, kind, name, content });
  };
  addMember(
    'extension-settings',
    '',
    omitFields(serializedExtension, extensionNonSettingsFields)
  );
  for (const eventsFunction of serializedExtension.eventsFunctions || []) {
    addMember('function', eventsFunction.name, eventsFunction);
  }
  for (const eventsBasedBehavior of serializedExtension.eventsBasedBehaviors ||
    []) {
    addMember('behavior', eventsBasedBehavior.name, eventsBasedBehavior);
  }
  for (const eventsBasedObject of serializedExtension.eventsBasedObjects ||
    []) {
    addMember(
      'object',
      eventsBasedObject.name,
      omitFields(eventsBasedObject, objectChildrenFields)
    );
    addMember(
      'object-children',
      eventsBasedObject.name,
      pickFields(eventsBasedObject, objectChildrenFields)
    );
  }
  return members;
};

const differentPartsByFieldByKind: {
  [ExtensionMemberKind]: { [string]: ExtensionMemberDifferentPart },
} = {
  'extension-settings': {
    globalVariables: 'variables',
    sceneVariables: 'variables',
  },
  function: {
    events: 'events',
    parameters: 'parameters',
    objectGroups: 'parameters',
  },
  behavior: {
    eventsFunctions: 'functions',
    propertyDescriptors: 'properties',
    sharedPropertyDescriptors: 'properties',
  },
  object: {
    eventsFunctions: 'functions',
    propertyDescriptors: 'properties',
  },
  'object-children': {},
};

const differentPartsDisplayOrder: Array<ExtensionMemberDifferentPart> = [
  'parameters',
  'properties',
  'events',
  'functions',
  'variables',
  'children',
  'configuration',
];

const getDifferentParts = (
  kind: ExtensionMemberKind,
  projectContent: SerializedContent,
  newVersionContent: SerializedContent
): Array<ExtensionMemberDifferentPart> => {
  if (kind === 'object-children') return ['children'];
  const differentPartsByField = differentPartsByFieldByKind[kind];
  const differentParts = new Set<ExtensionMemberDifferentPart>();
  const fields = new Set([
    ...Object.keys(projectContent),
    ...Object.keys(newVersionContent),
  ]);
  for (const field of fields) {
    if (!areEqual(projectContent[field], newVersionContent[field])) {
      differentParts.add(differentPartsByField[field] || 'configuration');
    }
  }
  return differentPartsDisplayOrder.filter(differentPart =>
    differentParts.has(differentPart)
  );
};

/**
 * List the parts of an extension of the project that are different in a new
 * version of this extension, so that users can choose to keep them.
 * Parts that are only in the new version are not listed: they are always added.
 */
export const getExtensionMemberDifferences = (
  projectSerializedExtension: SerializedContent,
  newSerializedExtension: SerializedContent
): Array<ExtensionMemberDifference> => {
  const projectMembers = getExtensionMembers(projectSerializedExtension);
  const newVersionMembers = getExtensionMembers(newSerializedExtension);
  const differences: Array<ExtensionMemberDifference> = [];
  for (const projectMember of projectMembers.values()) {
    const { key, kind, name, content } = projectMember;
    const newVersionMember = newVersionMembers.get(key);
    if (!newVersionMember) {
      // The children of an object only in the project are kept with it.
      if (kind === 'object-children') continue;
      differences.push({
        key,
        kind,
        name,
        status: 'only-in-project',
        differentParts: [],
      });
    } else if (!areEqual(content, newVersionMember.content)) {
      differences.push({
        key,
        kind,
        name,
        status: 'changed',
        differentParts: getDifferentParts(
          kind,
          content,
          newVersionMember.content
        ),
      });
    }
  }
  return differences;
};

const getObjectChildrenKey = (objectKey: string) =>
  'object-children:' + objectKey.substring('object:'.length);

/**
 * The children of an object that is only in the project are kept with it, as
 * they are not listed separately.
 */
const getKeptMemberKeysWithChildren = (
  keptMemberKeys: Set<string>,
  newVersionMembers: Map<string, ExtensionMember>
): Set<string> => {
  const keptMemberKeysWithChildren = new Set(keptMemberKeys);
  for (const key of keptMemberKeys) {
    if (key.startsWith('object:') && !newVersionMembers.has(key)) {
      keptMemberKeysWithChildren.add(getObjectChildrenKey(key));
    }
  }
  return keptMemberKeysWithChildren;
};

const mergeVariables = (
  projectVariables: ?Array<SerializedContent>,
  newVersionVariables: ?Array<SerializedContent>
): Array<SerializedContent> => {
  const mergedVariables = [...(projectVariables || [])];
  for (const newVersionVariable of newVersionVariables || []) {
    if (
      !mergedVariables.some(
        variable => variable.name === newVersionVariable.name
      )
    ) {
      mergedVariables.push(newVersionVariable);
    }
  }
  return mergedVariables;
};

const replaceOrAddByName = (
  elements: Array<SerializedContent>,
  element: SerializedContent
): Array<SerializedContent> => {
  const index = elements.findIndex(({ name }) => name === element.name);
  if (index === -1) return [...elements, element];
  return elements.map((existingElement, existingIndex) =>
    existingIndex === index ? element : existingElement
  );
};

/**
 * Find the path of the folder containing a function in a serialized folder
 * structure (`{ folderName, children }` for folders, `{ functionName }` for
 * functions).
 */
const findFunctionFolderPath = (
  folder: SerializedContent,
  functionName: string
): Array<string> | null => {
  for (const child of folder.children || []) {
    if (child.functionName === functionName) return [];
    if (child.children) {
      const path = findFunctionFolderPath(child, functionName);
      if (path) return [child.folderName, ...path];
    }
  }
  return null;
};

const removeFunctionFromFolders = (
  folder: SerializedContent,
  functionName: string
) => {
  if (!folder.children) return;
  folder.children = folder.children.filter(
    child => child.functionName !== functionName
  );
  folder.children.forEach(child =>
    removeFunctionFromFolders(child, functionName)
  );
};

const getOrCreateFolder = (
  rootFolder: SerializedContent,
  path: Array<string>
): SerializedContent => {
  let folder = rootFolder;
  for (const folderName of path) {
    folder.children = folder.children || [];
    let childFolder = folder.children.find(
      child => child.children && child.folderName === folderName
    );
    if (!childFolder) {
      childFolder = { folderName, children: [] };
      folder.children.push(childFolder);
    }
    folder = childFolder;
  }
  return folder;
};

const areSamePaths = (pathA: Array<string>, pathB: Array<string>) =>
  pathA.length === pathB.length &&
  pathA.every((folderName, index) => folderName === pathB[index]);

/**
 * Put the free functions kept from the project in the folders they have in the
 * project. Otherwise, they would not be in the folders of the new version, or
 * be in a different folder than their group.
 */
const getFolderStructureWithKeptFunctions = (
  projectFolderStructure: ?SerializedContent,
  newVersionFolderStructure: ?SerializedContent,
  keptFunctionNames: Array<string>
): ?SerializedContent => {
  if (!projectFolderStructure || !newVersionFolderStructure) {
    return newVersionFolderStructure;
  }
  const folderStructure = JSON.parse(JSON.stringify(newVersionFolderStructure));
  for (const functionName of keptFunctionNames) {
    const projectPath = findFunctionFolderPath(
      projectFolderStructure,
      functionName
    );
    if (!projectPath) continue;
    const currentPath = findFunctionFolderPath(folderStructure, functionName);
    if (currentPath && areSamePaths(currentPath, projectPath)) continue;
    removeFunctionFromFolders(folderStructure, functionName);
    getOrCreateFolder(folderStructure, projectPath).children.push({
      functionName,
    });
  }
  return folderStructure;
};

/**
 * Build the new version of an extension where the chosen members are kept
 * from the project.
 */
export const getMergedSerializedExtension = (
  projectSerializedExtension: SerializedContent,
  newSerializedExtension: SerializedContent,
  keptMemberKeys: Set<string>
): SerializedExtension => {
  // Nested contents are never modified: they are replaced.
  let mergedExtension: SerializedContent = { ...newSerializedExtension };
  const projectMembers = getExtensionMembers(projectSerializedExtension);
  const allKeptMemberKeys = getKeptMemberKeysWithChildren(
    keptMemberKeys,
    getExtensionMembers(newSerializedExtension)
  );

  if (allKeptMemberKeys.has(EXTENSION_SETTINGS_KEY)) {
    for (const field of Object.keys(mergedExtension)) {
      if (!extensionNonSettingsFields.includes(field)) {
        delete mergedExtension[field];
      }
    }
    mergedExtension = {
      ...mergedExtension,
      ...omitFields(projectSerializedExtension, extensionNonSettingsFields),
    };
    // Variables used by the new version of the functions must exist.
    mergedExtension.globalVariables = mergeVariables(
      projectSerializedExtension.globalVariables,
      newSerializedExtension.globalVariables
    );
    mergedExtension.sceneVariables = mergeVariables(
      projectSerializedExtension.sceneVariables,
      newSerializedExtension.sceneVariables
    );
  }

  for (const key of allKeptMemberKeys) {
    const projectMember = projectMembers.get(key);
    if (!projectMember) continue;
    const { kind, name, content } = projectMember;
    if (kind === 'function') {
      mergedExtension.eventsFunctions = replaceOrAddByName(
        mergedExtension.eventsFunctions || [],
        content
      );
    } else if (kind === 'behavior') {
      mergedExtension.eventsBasedBehaviors = replaceOrAddByName(
        mergedExtension.eventsBasedBehaviors || [],
        content
      );
    } else if (kind === 'object' || kind === 'object-children') {
      // Replace either the logic or the children of the object.
      const eventsBasedObjects = mergedExtension.eventsBasedObjects || [];
      const mergedObject =
        eventsBasedObjects.find(
          eventsBasedObject => eventsBasedObject.name === name
        ) || {};
      const replacedFields = Object.keys(mergedObject).filter(field =>
        kind === 'object-children'
          ? objectChildrenFields.includes(field)
          : !objectChildrenFields.includes(field)
      );
      mergedExtension.eventsBasedObjects = replaceOrAddByName(
        eventsBasedObjects,
        { ...omitFields(mergedObject, replacedFields), ...content, name }
      );
    }
  }
  const keptFunctionNames = [...allKeptMemberKeys]
    .filter(key => key.startsWith('function:'))
    .map(key => key.substring('function:'.length));
  if (keptFunctionNames.length > 0) {
    mergedExtension.eventsFunctionsFolderStructure = getFolderStructureWithKeptFunctions(
      projectSerializedExtension.eventsFunctionsFolderStructure,
      newSerializedExtension.eventsFunctionsFolderStructure,
      keptFunctionNames
    );
  }
  // Deep copy so that the result shares nothing with the given extensions.
  const mergedSerializedExtension: SerializedExtension = JSON.parse(
    JSON.stringify(mergedExtension)
  );
  return mergedSerializedExtension;
};

const getParameterSignatures = (parameters: ?Array<SerializedContent>) =>
  (parameters || []).map(({ name, type, supplementaryInformation }) => ({
    name,
    type,
    supplementaryInformation,
  }));

const getPropertySignatures = (properties: ?Array<SerializedContent>) =>
  (properties || []).map(({ name, type }) => ({ name, type }));

const getFunctionSignature = (eventsFunction: SerializedContent) => ({
  name: eventsFunction.name,
  functionType: eventsFunction.functionType,
  expressionType: eventsFunction.expressionType,
  getterName: eventsFunction.getterName,
  parameters: getParameterSignatures(eventsFunction.parameters),
});

/** What other members rely on when they use this member. */
const getMemberSignature = (member: ExtensionMember): any => {
  const { kind, content } = member;
  if (kind === 'function') return getFunctionSignature(content);
  if (kind === 'behavior' || kind === 'object') {
    return {
      objectType: content.objectType,
      properties: getPropertySignatures(content.propertyDescriptors),
      sharedProperties: getPropertySignatures(
        content.sharedPropertyDescriptors
      ),
      functions: (content.eventsFunctions || []).map(getFunctionSignature),
    };
  }
  return null;
};

const getChildNames = (member: ?ExtensionMember): Array<string> =>
  member ? (member.content.objects || []).map(({ name }) => name) : [];

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get the names of the members of the extension used in a content, from the
 * types of the instructions, expressions, parameters, objects and behaviors
 * (`Extension::Member` or `Extension::Member::Function`).
 */
const getReferencedMemberNames = (
  extensionName: string,
  content: SerializedContent
): Set<string> => {
  const typeRegExp = new RegExp(
    escapeRegExp(extensionName + '::') + '([A-Za-z0-9_]+)',
    'g'
  );
  const referencedMemberNames = new Set<string>();
  for (const match of JSON.stringify(content).matchAll(typeRegExp)) {
    referencedMemberNames.add(match[1]);
  }
  return referencedMemberNames;
};

/** Members that can be used by other members, through their type. */
const isReferenceable = (member: ExtensionMember) =>
  member.kind === 'function' ||
  member.kind === 'behavior' ||
  member.kind === 'object';

/**
 * Find the members of the updated extension that use another member that is
 * removed or that is from the other version with a different signature.
 * Members are found by searching for their type (`Extension::Member`) in
 * instructions, expressions, parameters and children.
 */
export const getExtensionReferenceProblems = (
  projectSerializedExtension: SerializedContent,
  newSerializedExtension: SerializedContent,
  keptMemberKeys: Set<string>
): Array<ExtensionReferenceProblem> => {
  const extensionName = newSerializedExtension.name;
  const membersBySource: {
    [ExtensionMemberSource]: Map<string, ExtensionMember>,
  } = {
    project: getExtensionMembers(projectSerializedExtension),
    'new-version': getExtensionMembers(newSerializedExtension),
  };
  const allKeptMemberKeys = getKeptMemberKeysWithChildren(
    keptMemberKeys,
    membersBySource['new-version']
  );
  const getFinalSource = (key: string): ExtensionMemberSource | null =>
    allKeptMemberKeys.has(key) && membersBySource.project.has(key)
      ? 'project'
      : membersBySource['new-version'].has(key)
      ? 'new-version'
      : null;
  const allMemberKeys = new Set([
    ...membersBySource.project.keys(),
    ...membersBySource['new-version'].keys(),
  ]);

  const problems: Array<ExtensionReferenceProblem> = [];
  for (const key of allMemberKeys) {
    const source = getFinalSource(key);
    if (!source) continue;
    const member = membersBySource[source].get(key);
    if (!member || member.kind === 'extension-settings') continue;
    const otherSource = source === 'project' ? 'new-version' : 'project';
    const otherMember = membersBySource[otherSource].get(key);
    // A member identical in both versions works with both versions of the
    // members it uses.
    if (otherMember && areEqual(member.content, otherMember.content)) continue;

    const referencedMemberNames = getReferencedMemberNames(
      extensionName,
      member.content
    );
    for (const referencedMember of membersBySource[source].values()) {
      if (
        !isReferenceable(referencedMember) ||
        !referencedMemberNames.has(referencedMember.name) ||
        referencedMember.key === key ||
        (member.kind === 'object-children' &&
          referencedMember.key === 'object:' + member.name)
      ) {
        continue;
      }

      const referencedMemberSource = getFinalSource(referencedMember.key);
      const finalReferencedMember = referencedMemberSource
        ? membersBySource[referencedMemberSource].get(referencedMember.key)
        : null;
      if (!finalReferencedMember) {
        problems.push({
          memberKey: key,
          referencedMemberKey: referencedMember.key,
          problem: 'removed',
          missingChildNames: [],
          fixingSource: source,
        });
      } else if (
        referencedMemberSource !== source &&
        !areEqual(
          getMemberSignature(referencedMember),
          getMemberSignature(finalReferencedMember)
        )
      ) {
        problems.push({
          memberKey: key,
          referencedMemberKey: referencedMember.key,
          problem: 'different-signature',
          missingChildNames: [],
          fixingSource: source,
        });
      }
    }

    if (member.kind === 'object') {
      const childrenKey = getObjectChildrenKey(key);
      const childrenSource = getFinalSource(childrenKey);
      if (childrenSource && childrenSource !== source) {
        const keptChildNames = getChildNames(
          membersBySource[childrenSource].get(childrenKey)
        );
        const missingChildNames = getChildNames(
          membersBySource[source].get(childrenKey)
        ).filter(childName => !keptChildNames.includes(childName));
        if (missingChildNames.length > 0) {
          problems.push({
            memberKey: key,
            referencedMemberKey: childrenKey,
            problem: 'missing-children',
            missingChildNames,
            fixingSource: source,
          });
        }
      }
    }
  }
  return problems;
};

/**
 * - `added`: only in the new version.
 * - `removed`: only in the project.
 * - `modified`: in both versions, with differences.
 */
export type ExtensionItemChange = 'added' | 'removed' | 'modified';

/** The value of a field of a part of an extension (null when not set). */
export type ExtensionFieldValue = string | number | boolean | null;

export type ExtensionMemberChangeDetails = {|
  /** The name shown to users: the full name, if any. */
  displayName: string,
  /** The type of a function (Action, Condition, Expression...). */
  functionType: string | null,
  /** Fields holding a text, a number or a boolean that are different. */
  fieldChanges: Array<{|
    field: string,
    projectValue: ExtensionFieldValue,
    newVersionValue: ExtensionFieldValue,
  |}>,
  /** Parameters, properties, functions, children or variables that differ. */
  itemChanges: Array<{|
    part: ExtensionMemberDifferentPart,
    name: string,
    change: ExtensionItemChange,
  |}>,
  /** The number of events of a function, in both versions. */
  eventsCount: {| project: number, newVersion: number |} | null,
|};

const getItemsByPart = (
  kind: ExtensionMemberKind,
  content: SerializedContent
): Array<{|
  part: ExtensionMemberDifferentPart,
  items: Array<SerializedContent>,
|}> => {
  switch (kind) {
    case 'extension-settings':
      return [
        {
          part: 'variables',
          items: [
            ...(content.globalVariables || []),
            ...(content.sceneVariables || []),
          ],
        },
      ];
    case 'function':
      return [{ part: 'parameters', items: content.parameters || [] }];
    case 'behavior':
    case 'object':
      return [
        {
          part: 'properties',
          items: [
            ...(content.propertyDescriptors || []),
            ...(content.sharedPropertyDescriptors || []),
          ],
        },
        { part: 'functions', items: content.eventsFunctions || [] },
      ];
    case 'object-children':
      return [{ part: 'children', items: content.objects || [] }];
    default:
      return [];
  }
};

const countEvents = (events: ?Array<SerializedContent>): number =>
  (events || []).reduce(
    (count, event) => count + 1 + countEvents(event.events),
    0
  );

const getFieldValue = (value: any): ExtensionFieldValue =>
  value === undefined ? null : value;

const isFieldValue = (value: any): boolean =>
  value === undefined ||
  value === null ||
  ['string', 'number', 'boolean'].includes(typeof value);

/** Describe what is different in a member between the project and the new version. */
export const getExtensionMemberChangeDetails = (
  projectSerializedExtension: SerializedContent,
  newSerializedExtension: SerializedContent,
  memberKey: string
): ExtensionMemberChangeDetails => {
  const projectMembers = getExtensionMembers(projectSerializedExtension);
  const newVersionMembers = getExtensionMembers(newSerializedExtension);
  const projectMember = projectMembers.get(memberKey);
  const newVersionMember = newVersionMembers.get(memberKey);
  const member = newVersionMember || projectMember;
  if (!member) {
    throw new Error(`Unknown extension member: ${memberKey}`);
  }
  const { kind, content } = member;
  // The children of an object are displayed with the name of the object.
  const namedMember =
    kind === 'object-children'
      ? newVersionMembers.get('object:' + member.name) ||
        projectMembers.get('object:' + member.name) ||
        member
      : member;
  const details: ExtensionMemberChangeDetails = {
    displayName:
      (kind === 'extension-settings'
        ? newSerializedExtension.fullName
        : namedMember.content.fullName) || member.name,
    functionType: kind === 'function' ? content.functionType || null : null,
    fieldChanges: [],
    itemChanges: [],
    eventsCount: null,
  };
  if (!projectMember || !newVersionMember) return details;

  const projectContent = projectMember.content;
  const newVersionContent = newVersionMember.content;
  const fields = new Set([
    ...Object.keys(projectContent),
    ...Object.keys(newVersionContent),
  ]);
  for (const field of fields) {
    const projectValue = projectContent[field];
    const newVersionValue = newVersionContent[field];
    if (
      field !== 'name' &&
      isFieldValue(projectValue) &&
      isFieldValue(newVersionValue) &&
      !areEqual(projectValue, newVersionValue)
    ) {
      details.fieldChanges.push({
        field,
        projectValue: getFieldValue(projectValue),
        newVersionValue: getFieldValue(newVersionValue),
      });
    }
  }

  const newVersionItemsByPart = getItemsByPart(kind, newVersionContent);
  getItemsByPart(kind, projectContent).forEach(({ part, items }, index) => {
    const newVersionItems = newVersionItemsByPart[index].items;
    for (const newVersionItem of newVersionItems) {
      const projectItem = items.find(item => item.name === newVersionItem.name);
      if (!projectItem) {
        details.itemChanges.push({
          part,
          name: newVersionItem.name,
          change: 'added',
        });
      } else if (!areEqual(projectItem, newVersionItem)) {
        details.itemChanges.push({
          part,
          name: newVersionItem.name,
          change: 'modified',
        });
      }
    }
    for (const projectItem of items) {
      if (!newVersionItems.some(item => item.name === projectItem.name)) {
        details.itemChanges.push({
          part,
          name: projectItem.name,
          change: 'removed',
        });
      }
    }
  });

  if (kind === 'function') {
    const projectEventsCount = countEvents(projectContent.events);
    const newVersionEventsCount = countEvents(newVersionContent.events);
    if (!areEqual(projectContent.events, newVersionContent.events)) {
      details.eventsCount = {
        project: projectEventsCount,
        newVersion: newVersionEventsCount,
      };
    }
  }
  return details;
};
