// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import axios from 'axios';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { mapFor } from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  isURL,
  renameResourcesInProject,
} from '../ResourcesList/ResourceUtils';
import { getExample, listAllExamples } from '../Utils/GDevelopServices/Example';
import {
  type EditorFunction,
  type LaunchFunctionOptionsWithProject,
} from './index';
import { makeGenericFailure } from './Utils';

const gd: libGDevelop = global.gd;

const loadExampleProject = async (
  slug: string
): Promise<{| projectJson: Object, projectFileUrl: string |} | null> => {
  const { exampleShortHeaders } = await listAllExamples();
  const exampleShortHeader = exampleShortHeaders.find(
    header => header.slug === slug
  );
  if (!exampleShortHeader) return null;
  const { projectFileUrl } = await getExample(exampleShortHeader);
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const response = await axios.get(projectFileUrl);
  return { projectJson: response.data, projectFileUrl };
};

const collectStrings = (value: any, strings: Set<string>) => {
  if (typeof value === 'string') strings.add(value);
  else if (Array.isArray(value))
    value.forEach(item => collectStrings(item, strings));
  else if (value && typeof value === 'object')
    Object.keys(value).forEach(key => collectStrings(value[key], strings));
};

/**
 * The names that serialized parts of a project can refer to: their strings
 * (an external layout or events name), and the words in them (the objects and
 * variables named in expressions).
 */
const getUsedNames = (serializedParts: Array<any>): Set<string> => {
  const strings = new Set<string>();
  serializedParts.forEach(part => collectStrings(part, strings));
  const names = new Set<string>();
  strings.forEach(string => {
    names.add(string.replace(/^"(.*)"$/, '$1'));
    string.split(/[^\p{L}\p{N}_]+/u).forEach(word => names.add(word));
  });
  return names;
};

/** The extensions named in object, behavior and instruction types (`Extension::...`). */
const getUsedExtensionNames = (
  serializedParts: Array<any>,
  extensionNames: Array<string>
): Array<string> => {
  const text = JSON.stringify(serializedParts);
  return extensionNames.filter(name =>
    new RegExp(`(^|[^\\w])${name}::`).test(text)
  );
};

const getFileName = (file: string): string => {
  const path = file.split(/[?#]/)[0];
  const fileName = path.slice(path.lastIndexOf('/') + 1);
  try {
    return decodeURIComponent(fileName);
  } catch (error) {
    return fileName;
  }
};

/**
 * The resources of the example get the full URL of their file, and a new
 * name when the project has another resource with the same name.
 */
const prepareExampleResources = (
  project: gdProject,
  example: gdProject,
  projectFileUrl: string
) => {
  const exampleResources = example.getResourcesManager();
  const projectResources = project.getResourcesManager();
  const newNames: { [string]: string } = {};
  exampleResources
    .getAllResourceNames()
    .toJSArray()
    .forEach(name => {
      const resource = exampleResources.getResource(name);
      if (resource.getFile() && !isURL(resource.getFile()))
        resource.setFile(new URL(resource.getFile(), projectFileUrl).href);
      if (!projectResources.hasResource(name)) return;
      const projectResource = projectResources.getResource(name);
      if (
        projectResource.getKind() === resource.getKind() &&
        getFileName(projectResource.getFile()) ===
          getFileName(resource.getFile())
      )
        return;
      const extensionIndex = name.lastIndexOf('.');
      const extension = extensionIndex > 0 ? name.slice(extensionIndex) : '';
      newNames[name] =
        newNameGenerator(
          name.slice(0, name.length - extension.length),
          newName =>
            projectResources.hasResource(newName + extension) ||
            exampleResources.hasResource(newName + extension)
        ) + extension;
    });
  Object.keys(newNames).forEach(name =>
    exampleResources.getResource(name).setName(newNames[name])
  );
  renameResourcesInProject(example, newNames);
};

/** Copies the resources the project uses that only the example has. */
const copyMissingResources = (
  project: gdProject,
  example: gdProject
): Array<string> => {
  const projectResources = project.getResourcesManager();
  const exampleResources = example.getResourcesManager();
  const copiedNames: Array<string> = [];
  let missingNames;
  // Repeated, as a resource can refer to others (like a tilemap to its tileset).
  do {
    const resourcesInUse = new gd.ResourcesInUseHelper(projectResources);
    gd.ResourceExposer.exposeWholeProjectResources(project, resourcesInUse);
    missingNames = resourcesInUse
      .getAllResources()
      .toJSArray()
      .filter(
        name =>
          !projectResources.hasResource(name) &&
          exampleResources.hasResource(name)
      );
    resourcesInUse.delete();
    missingNames.forEach(name =>
      projectResources.addResource(exampleResources.getResource(name))
    );
    copiedNames.push(...missingNames);
  } while (missingNames.length);
  return copiedNames;
};

/** The external events and layouts of the scene: associated to it, or named in its events. */
const getLinkedExternalItems = (
  example: gdProject,
  sceneName: string
): {|
  externalEventsList: Array<gdExternalEvents>,
  externalLayouts: Array<gdExternalLayout>,
|} => {
  const serializedScene = serializeToJSObject(example.getLayout(sceneName));
  const externalEventsNames = mapFor(0, example.getExternalEventsCount(), i =>
    example.getExternalEventsAt(i).getName()
  );
  const getUsedNamesWith = (linkedNames: Array<string>) =>
    getUsedNames([
      serializedScene,
      ...linkedNames.map(name =>
        serializeToJSObject(example.getExternalEvents(name))
      ),
    ]);
  // Recursive, as external events can link other external events.
  const linkExternalEvents = (linkedNames: Array<string>): Array<string> => {
    const usedNames = getUsedNamesWith(linkedNames);
    const newlyLinkedNames = externalEventsNames.filter(
      name =>
        !linkedNames.includes(name) &&
        (usedNames.has(name) ||
          example.getExternalEvents(name).getAssociatedLayout() === sceneName)
    );
    return newlyLinkedNames.length
      ? linkExternalEvents([...linkedNames, ...newlyLinkedNames])
      : linkedNames;
  };
  const linkedNames = linkExternalEvents([]);
  const usedNames = getUsedNamesWith(linkedNames);
  return {
    externalEventsList: linkedNames.map(name =>
      example.getExternalEvents(name)
    ),
    externalLayouts: mapFor(0, example.getExternalLayoutsCount(), i =>
      example.getExternalLayoutAt(i)
    ).filter(
      externalLayout =>
        usedNames.has(externalLayout.getName()) ||
        externalLayout.getAssociatedLayout() === sceneName
    ),
  };
};

/** A name free in the project, that no other item of the example has. */
const makeUniqueName = (
  name: string,
  ownName: string,
  isTakenInProject: string => boolean,
  isTakenInExample: string => boolean
): string =>
  newNameGenerator(
    name,
    newName =>
      isTakenInProject(newName) ||
      (newName !== ownName && isTakenInExample(newName))
  );

/** Gives the external items names free in the project, in the example (before they are copied). */
const renameExternalItems = (
  project: gdProject,
  example: gdProject,
  externalEventsList: Array<gdExternalEvents>,
  externalLayouts: Array<gdExternalLayout>
) => {
  externalEventsList.forEach(externalEvents => {
    const name = externalEvents.getName();
    const newName = makeUniqueName(
      name,
      name,
      name => project.hasExternalEventsNamed(name),
      name => example.hasExternalEventsNamed(name)
    );
    gd.WholeProjectRefactorer.renameExternalEvents(example, name, newName);
    externalEvents.setName(newName);
  });
  externalLayouts.forEach(externalLayout => {
    const name = externalLayout.getName();
    const newName = makeUniqueName(
      name,
      name,
      name => project.hasExternalLayoutNamed(name),
      name => example.hasExternalLayoutNamed(name)
    );
    gd.WholeProjectRefactorer.renameExternalLayout(example, name, newName);
    externalLayout.setName(newName);
  });
};

/** The global objects and groups of the example that the scene uses. */
const getUsedGlobalObjectsAndGroups = (
  example: gdProject,
  exampleScene: gdLayout,
  usedNames: Set<string>
): {| globalObjects: Array<gdObject>, globalGroups: Array<gdObjectGroup> |} => {
  const objects = example.getObjects();
  const groups = objects.getObjectGroups();
  const globalGroups = mapFor(0, groups.count(), i => groups.getAt(i)).filter(
    group => usedNames.has(group.getName())
  );
  const groupObjectNames = globalGroups.flatMap(group =>
    group.getAllObjectsNames().toJSArray()
  );
  const globalObjects = mapFor(0, objects.getObjectsCount(), i =>
    objects.getObjectAt(i)
  ).filter(
    object =>
      (usedNames.has(object.getName()) ||
        groupObjectNames.includes(object.getName())) &&
      !exampleScene.getObjects().hasObjectNamed(object.getName())
  );
  return { globalObjects, globalGroups };
};

/**
 * Installs the extensions of the example used by the copied parts (and by
 * these extensions) that the project does not have.
 */
const installUsedExtensions = async (
  project: gdProject,
  example: gdProject,
  serializedParts: Array<any>,
  conflicts: Array<string>,
  {
    onExtensionsModifiedOutsideEditor,
    ensureExtensionsUpToDate,
    onExtensionInstalled,
  }: LaunchFunctionOptionsWithProject
): Promise<Array<string>> => {
  const exampleExtensionNames = mapFor(
    0,
    example.getEventsFunctionsExtensionsCount(),
    i => example.getEventsFunctionsExtensionAt(i).getName()
  );
  const usedExtensionNames = new Set(
    getUsedExtensionNames(serializedParts, exampleExtensionNames)
  );
  // Iterating a Set also visits what is added to it while iterating.
  usedExtensionNames.forEach(name =>
    getUsedExtensionNames(
      [serializeToJSObject(example.getEventsFunctionsExtension(name))],
      exampleExtensionNames
    ).forEach(usedName => usedExtensionNames.add(usedName))
  );
  const installedExtensionNames = [...usedExtensionNames].filter(name => {
    if (!project.hasEventsFunctionsExtensionNamed(name)) return true;
    const projectVersion = project
      .getEventsFunctionsExtension(name)
      .getVersion();
    const exampleVersion = example
      .getEventsFunctionsExtension(name)
      .getVersion();
    if (projectVersion !== exampleVersion)
      conflicts.push(
        `the project's extension "${name}" (${projectVersion}) was kept, the example has ${exampleVersion}`
      );
    return false;
  });
  if (!installedExtensionNames.length) return [];

  const serializedExtensions = gd.Serializer.fromJSObject(
    installedExtensionNames.map(name =>
      serializeToJSObject(example.getEventsFunctionsExtension(name))
    )
  );
  project.unserializeAndInsertExtensionsFrom(serializedExtensions);
  serializedExtensions.delete();
  onExtensionsModifiedOutsideEditor({
    extensionNames: installedExtensionNames,
    needsCodeRegeneration: true,
  });
  await ensureExtensionsUpToDate();
  onExtensionInstalled(installedExtensionNames);
  return installedExtensionNames;
};

/** Copies the global variables of the example that the copied parts use. */
const copyUsedGlobalVariables = (
  project: gdProject,
  example: gdProject,
  usedNames: Set<string>,
  conflicts: Array<string>
): Array<string> => {
  const exampleVariables = example.getVariables();
  const projectVariables = project.getVariables();
  return mapFor(0, exampleVariables.count(), i =>
    exampleVariables.getNameAt(i)
  ).filter(name => {
    if (!usedNames.has(name)) return false;
    const variable = exampleVariables.get(name);
    if (!projectVariables.has(name)) {
      projectVariables.insert(name, variable, projectVariables.count());
      return true;
    }
    if (
      JSON.stringify(serializeToJSObject(projectVariables.get(name))) !==
      JSON.stringify(serializeToJSObject(variable))
    )
      conflicts.push(
        `the project's global variable "${name}" was kept, it differs from the example's one`
      );
    return false;
  });
};

export const copyFromExample: EditorFunction = {
  renderForEditor: ({ args }) => {
    const example = SafeExtractor.extractStringProperty(args, 'example') || '';
    const scene = SafeExtractor.extractStringProperty(args, 'scene') || '';
    return {
      text: (
        <Trans>
          Copy the scene {scene} of the example {example}.
        </Trans>
      ),
    };
  },
  launchFunction: async options => {
    const { project, args, attachmentsForResources } = options;
    const exampleSlug = SafeExtractor.extractStringProperty(args, 'example');
    const sceneName = SafeExtractor.extractStringProperty(args, 'scene');
    if (!exampleSlug || !sceneName)
      return makeGenericFailure(
        '`example` (the slug of an example, as given by `search`) and `scene` (the name of one of its scenes) are required. Nothing was copied.'
      );
    let loadedExample;
    try {
      loadedExample = await loadExampleProject(exampleSlug);
    } catch (error) {
      return makeGenericFailure(
        `Could not download the example "${exampleSlug}" (${
          error.message
        }). Nothing was copied.`
      );
    }
    if (!loadedExample)
      return makeGenericFailure(
        `There is no example "${exampleSlug}" in the examples library: give the slug of an example exactly as given by \`search\`. Nothing was copied.`
      );

    const example = gd.ProjectHelper.createNewGDJSProject();
    try {
      unserializeFromJSObject(example, loadedExample.projectJson);
      if (!example.hasLayoutNamed(sceneName))
        return makeGenericFailure(
          `The example "${exampleSlug}" has no scene "${sceneName}". Its scenes: ${mapFor(
            0,
            example.getLayoutsCount(),
            i => `"${example.getLayoutAt(i).getName()}"`
          ).join(', ')}. Nothing was copied.`
        );

      // Everything copied is first renamed in the example, where the
      // refactorings update what refers to it.
      const newSceneName = makeUniqueName(
        SafeExtractor.extractStringProperty(args, 'new_scene_name') ||
          sceneName,
        sceneName,
        name => project.hasLayoutNamed(name),
        name => example.hasLayoutNamed(name)
      );
      gd.WholeProjectRefactorer.renameLayout(example, sceneName, newSceneName);
      const exampleScene = example.getLayout(sceneName);
      exampleScene.setName(newSceneName);
      const { externalEventsList, externalLayouts } = getLinkedExternalItems(
        example,
        newSceneName
      );
      renameExternalItems(
        project,
        example,
        externalEventsList,
        externalLayouts
      );
      prepareExampleResources(project, example, loadedExample.projectFileUrl);

      const serializedParts = [
        serializeToJSObject(exampleScene),
        ...externalEventsList.map(item => serializeToJSObject(item)),
        ...externalLayouts.map(item => serializeToJSObject(item)),
      ];
      const usedNames = getUsedNames(serializedParts);
      const { globalObjects, globalGroups } = getUsedGlobalObjectsAndGroups(
        example,
        exampleScene,
        usedNames
      );
      const conflicts = [];
      const installedExtensionNames = await installUsedExtensions(
        project,
        example,
        [
          ...serializedParts,
          ...globalObjects.map(object => serializeToJSObject(object)),
        ],
        conflicts,
        options
      );

      const copyInto = (copy: gdSerializable, original: gdSerializable) =>
        unserializeFromJSObject(
          copy,
          serializeToJSObject(original),
          'unserializeFrom',
          project
        );
      const scene = project.insertNewLayout(
        newSceneName,
        project.getLayoutsCount()
      );
      copyInto(scene, exampleScene);
      const sceneObjects = scene.getObjects();
      globalObjects.forEach(globalObject =>
        copyInto(
          sceneObjects.insertNewObject(
            project,
            globalObject.getType(),
            globalObject.getName(),
            sceneObjects.getObjectsCount()
          ),
          globalObject
        )
      );
      globalGroups.forEach(group =>
        sceneObjects
          .getObjectGroups()
          .insert(group, sceneObjects.getObjectGroups().count())
      );
      scene.updateBehaviorsSharedData(project);
      externalEventsList.forEach(externalEvents =>
        copyInto(
          project.insertNewExternalEvents(
            externalEvents.getName(),
            project.getExternalEventsCount()
          ),
          externalEvents
        )
      );
      externalLayouts.forEach(externalLayout =>
        copyInto(
          project.insertNewExternalLayout(
            externalLayout.getName(),
            project.getExternalLayoutsCount()
          ),
          externalLayout
        )
      );
      const copiedVariableNames = copyUsedGlobalVariables(
        project,
        example,
        usedNames,
        conflicts
      );
      const copiedResourceNames = copyMissingResources(project, example);
      if (copiedResourceNames.length)
        await attachmentsForResources.storeResourceFiles();

      const objectNames = mapFor(0, sceneObjects.getObjectsCount(), i =>
        sceneObjects.getObjectAt(i).getName()
      );
      const objectNamesAlsoGlobal = objectNames.filter(name =>
        project.getObjects().hasObjectNamed(name)
      );
      if (objectNamesAlsoGlobal.length)
        conflicts.push(
          `the project has global objects named like objects of the new scene (${objectNamesAlsoGlobal.join(
            ', '
          )}): the new scene uses its own objects`
        );
      const lines = [
        `Copied the scene "${sceneName}" of the example "${exampleSlug}" as the new scene "${newSceneName}": ${scene
          .getInitialInstances()
          .getInstancesCount()} instances, ${scene.getLayersCount()} layers, ${scene
          .getEvents()
          .getEventsCount()} events, ${copiedResourceNames.length} resources.`,
        `Objects (${objectNames.length}): ${objectNames.join(', ')}.`,
      ];
      if (globalObjects.length)
        lines.push(
          `Global objects of the example, now objects of the scene: ${globalObjects
            .map(object => object.getName())
            .join(', ')}.`
        );
      if (externalLayouts.length)
        lines.push(
          `External layouts: ${externalLayouts
            .map(item => item.getName())
            .join(', ')}.`
        );
      if (externalEventsList.length)
        lines.push(
          `External events: ${externalEventsList
            .map(item => item.getName())
            .join(', ')}.`
        );
      if (copiedVariableNames.length)
        lines.push(`Global variables: ${copiedVariableNames.join(', ')}.`);
      if (installedExtensionNames.length)
        lines.push(
          `Extensions installed: ${installedExtensionNames
            .map(
              name =>
                `${name} ${project
                  .getEventsFunctionsExtension(name)
                  .getVersion()}`
            )
            .join(', ')}.`
        );
      if (conflicts.length) lines.push(`Conflicts: ${conflicts.join('; ')}.`);
      return {
        success: true,
        message: lines.join('\n'),
        meta: { newSceneNames: [newSceneName] },
      };
    } finally {
      example.delete();
    }
  },
  modifiesProject: true,
};
