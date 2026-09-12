// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Link from '../../UI/Link';
import { mapFor } from '../../Utils/MapFor';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import { isExtensionNameTaken } from '../../ProjectManager/EventFunctionExtensionNameVerifier';
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
} from '../index';
import { extractRequiredString, makeGenericFailure } from '../Utils';
import {
  getExtensionNames,
  getReadOnlyRejection,
  resolveScope,
} from '../Scope';
import {
  getSafeUniqueName,
  renamedMessage,
  listQuoted,
  getRequestedNewName,
} from './NameHelpers';
import { getObjectTypesUsingBehavior } from './CustomBehaviorFunctions';

const gd: libGDevelop = global.gd;

/** The settings of an extension, all read and written as strings. */
const EXTENSION_PROPERTY_NAMES = [
  'fullName',
  'shortDescription',
  'description',
  'category',
  'tags',
  'version',
  'author',
  'helpPath',
  'previewIconUrl',
  'iconUrl',
  'dimension',
];

const DEPENDENCY_TYPES = ['npm', 'cordova'];

/** A comma-separated list of tags into the tags of an extension. */
const setExtensionTags = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  tags: string
) => {
  const tagsVector = eventsFunctionsExtension.getTags();
  tagsVector.clear();
  tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '')
    .forEach(tag => tagsVector.push_back(tag));
};

const applyExtensionProperty = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  propertyName: string,
  newValue: string
) => {
  if (propertyName === 'fullName')
    eventsFunctionsExtension.setFullName(newValue);
  else if (propertyName === 'shortDescription')
    eventsFunctionsExtension.setShortDescription(newValue);
  else if (propertyName === 'description')
    eventsFunctionsExtension.setDescription(newValue);
  else if (propertyName === 'category')
    eventsFunctionsExtension.setCategory(newValue);
  else if (propertyName === 'tags')
    setExtensionTags(eventsFunctionsExtension, newValue);
  else if (propertyName === 'version')
    eventsFunctionsExtension.setVersion(newValue);
  else if (propertyName === 'author')
    eventsFunctionsExtension.setAuthor(newValue);
  else if (propertyName === 'helpPath')
    eventsFunctionsExtension.setHelpPath(newValue);
  else if (propertyName === 'previewIconUrl')
    eventsFunctionsExtension.setPreviewIconUrl(newValue);
  else if (propertyName === 'iconUrl')
    eventsFunctionsExtension.setIconUrl(newValue);
  else if (propertyName === 'dimension')
    eventsFunctionsExtension.setDimension(newValue);
};

/**
 * What would break if the extension was deleted: the extensions whose events
 * call it, and its object and behavior types still used in the project.
 */
const getExtensionUsages = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<string> => {
  const extensionName = eventsFunctionsExtension.getName();
  const usages: Array<string> = [];

  gd.UsedExtensionsFinder.findExtensionsDependentOn(
    project,
    eventsFunctionsExtension
  )
    .toJSArray()
    .filter(dependentExtensionName => dependentExtensionName !== extensionName)
    .forEach(dependentExtensionName =>
      usages.push(`extension "${dependentExtensionName}" uses it`)
    );

  const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
  mapFor(0, eventsBasedObjects.getCount(), index => {
    const objectType = `${extensionName}::${eventsBasedObjects
      .getAt(index)
      .getName()}`;
    if (gd.UsedObjectTypeFinder.scanProject(project, objectType)) {
      usages.push(`objects of type "${objectType}" exist`);
    }
  });

  const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
  mapFor(0, eventsBasedBehaviors.getCount(), index => {
    const eventsBasedBehavior = eventsBasedBehaviors.getAt(index);
    const objectTypes = getObjectTypesUsingBehavior(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
    if (objectTypes.length > 0) {
      usages.push(
        `behavior "${extensionName}::${eventsBasedBehavior.getName()}" is on objects of type ${listQuoted(
          objectTypes
        )}`
      );
    }
  });

  return usages;
};

// One entry of `changed_dependencies`, checked against the existing ones.
type PlannedDependencyChange = {|
  dependencyName: string,
  isNew: boolean,
  isDeleted: boolean,
  newName: string | null,
  dependencyType: string | null,
  exportName: string | null,
  version: string | null,
  extraSettings: { [string]: string } | null,
|};

type PlannedDependencyChanges =
  | {| success: true, changes: Array<PlannedDependencyChange> |}
  | {| success: false, message: string |};

const getDependencyNames = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<string> => {
  const dependencies = eventsFunctionsExtension.getAllDependencies();
  return mapFor(0, dependencies.size(), index =>
    dependencies.at(index).getName()
  );
};

const planDependencyChanges = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  rawChanges: Array<any>
): PlannedDependencyChanges => {
  // The names as they will be once the earlier entries of the call are applied.
  const dependencyNames = getDependencyNames(eventsFunctionsExtension);
  const changes: Array<PlannedDependencyChange> = [];

  for (const rawChange of rawChanges) {
    const dependencyName = SafeExtractor.extractStringProperty(
      rawChange,
      'dependency_name'
    );
    if (!dependencyName) {
      return {
        success: false,
        message:
          'Each entry of `changed_dependencies` needs a `dependency_name`: the name of the dependency to create, edit or delete.',
      };
    }
    const isExisting = dependencyNames.includes(dependencyName);

    if (
      SafeExtractor.extractBooleanProperty(rawChange, 'delete_this_dependency')
    ) {
      if (!isExisting) {
        return {
          success: false,
          message: `Dependency "${dependencyName}" not found: it cannot be deleted. Existing dependencies: ${listQuoted(
            dependencyNames
          )}.`,
        };
      }
      dependencyNames.splice(dependencyNames.indexOf(dependencyName), 1);
      changes.push({
        dependencyName,
        isNew: false,
        isDeleted: true,
        newName: null,
        dependencyType: null,
        exportName: null,
        version: null,
        extraSettings: null,
      });
      continue;
    }

    const dependencyType = SafeExtractor.extractStringProperty(
      rawChange,
      'type'
    );
    if (dependencyType !== null && !DEPENDENCY_TYPES.includes(dependencyType)) {
      return {
        success: false,
        message: `\`type\` of the dependency "${dependencyName}" must be ${listQuoted(
          DEPENDENCY_TYPES
        )} (got "${dependencyType}").`,
      };
    }
    if (!isExisting && dependencyType === null) {
      return {
        success: false,
        message: `Creating the dependency "${dependencyName}" needs a \`type\`: ${listQuoted(
          DEPENDENCY_TYPES
        )}.`,
      };
    }

    const rawExtraSettings = SafeExtractor.extractObjectProperty(
      rawChange,
      'extra_settings'
    );
    let extraSettings: { [string]: string } | null = null;
    if (rawExtraSettings) {
      const settings: { [string]: string } = {};
      extraSettings = settings;
      for (const settingName of Object.keys(rawExtraSettings)) {
        const settingValue = SafeExtractor.extractStringProperty(
          rawExtraSettings,
          settingName
        );
        if (settingValue === null) {
          return {
            success: false,
            message: `\`extra_settings.${settingName}\` of the dependency "${dependencyName}" must be a string.`,
          };
        }
        settings[settingName] = settingValue;
      }
    }

    const newName = SafeExtractor.extractStringProperty(rawChange, 'new_name');
    if (!isExisting) dependencyNames.push(dependencyName);
    if (newName) {
      dependencyNames.splice(dependencyNames.indexOf(dependencyName), 1);
      dependencyNames.push(newName);
    }
    changes.push({
      dependencyName,
      isNew: !isExisting,
      isDeleted: false,
      newName,
      dependencyType,
      exportName: SafeExtractor.extractStringProperty(rawChange, 'export_name'),
      version: SafeExtractor.extractStringProperty(rawChange, 'version'),
      extraSettings,
    });
  }

  return { success: true, changes };
};

const applyDependencyChanges = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  changes: Array<PlannedDependencyChange>
): {| messages: Array<string>, changedCount: number |} => {
  const messages: Array<string> = [];
  let changedCount = 0;

  for (const change of changes) {
    // The dependencies are found again by name: an earlier deletion or rename
    // of the same call may have moved them.
    const index = getDependencyNames(eventsFunctionsExtension).indexOf(
      change.dependencyName
    );
    if (change.isDeleted) {
      if (index !== -1) {
        eventsFunctionsExtension.removeDependencyAt(index);
        changedCount++;
      }
      messages.push(`Deleted the dependency "${change.dependencyName}".`);
      continue;
    }

    if (!change.isNew && index === -1) {
      // Planned against the simulated names, so this cannot happen.
      throw new Error(`Dependency "${change.dependencyName}" disappeared.`);
    }
    const dependency = change.isNew
      ? eventsFunctionsExtension.addDependency()
      : eventsFunctionsExtension.getAllDependencies().at(index);
    if (change.isNew) dependency.setName(change.dependencyName);

    const details: Array<string> = [];
    const { newName, dependencyType, exportName, version } = change;
    if (newName !== null) {
      dependency.setName(newName);
      details.push(`renamed to "${newName}"`);
    }
    if (dependencyType !== null) {
      dependency.setDependencyType(dependencyType);
      details.push(`type "${dependencyType}"`);
    }
    if (exportName !== null) {
      dependency.setExportName(exportName);
      details.push(`export name "${exportName}"`);
    }
    if (version !== null) {
      dependency.setVersion(version);
      details.push(`version "${version}"`);
    }
    if (change.extraSettings) {
      const extraSettings = change.extraSettings;
      for (const settingName of Object.keys(extraSettings)) {
        const propertyDescriptor = new gd.PropertyDescriptor(
          extraSettings[settingName]
        );
        dependency.setExtraSetting(settingName, propertyDescriptor);
        propertyDescriptor.delete();
      }
      details.push(`extra settings ${listQuoted(Object.keys(extraSettings))}`);
    }

    if (change.isNew || details.length > 0) changedCount++;
    messages.push(
      change.isNew
        ? `Added the dependency "${change.dependencyName}" (${details.join(
            ', '
          )}).`
        : `Dependency "${change.dependencyName}": ${
            details.length > 0 ? details.join(', ') : 'nothing to change'
          }.`
    );
  }

  return { messages, changedCount };
};

/** The extension to write into, or the failure to return to the caller. */
const getWritableExtension = (
  project: gdProject,
  extensionName: string
):
  | {| success: true, eventsFunctionsExtension: gdEventsFunctionsExtension |}
  | {| success: false, failure: EditorFunctionGenericOutput |} => {
  const resolvedScope = resolveScope(project, {
    type: 'extension',
    extension_name: extensionName,
  });
  if (resolvedScope.success === false) {
    return {
      success: false,
      failure: makeGenericFailure(resolvedScope.message),
    };
  }
  const readOnlyRejection = getReadOnlyRejection(resolvedScope);
  if (readOnlyRejection) {
    return {
      success: false,
      failure: makeGenericFailure(readOnlyRejection.message),
    };
  }
  const { eventsFunctionsExtension } = resolvedScope;
  if (!eventsFunctionsExtension) {
    throw new Error(`Internal error: ${resolvedScope.label} has no extension.`);
  }
  return { success: true, eventsFunctionsExtension };
};

export const createExtension: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    return {
      text: (
        <Trans>
          Created the extension{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenEventsFunctionsExtension(extension_name, {})
            }
          >
            {extension_name}
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onExtensionsModifiedOutsideEditor,
  }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const duplicated_extension_name = SafeExtractor.extractStringProperty(
      args,
      'duplicated_extension_name'
    );

    let sourceExtension: gdEventsFunctionsExtension | null = null;
    if (duplicated_extension_name) {
      if (
        !project.hasEventsFunctionsExtensionNamed(duplicated_extension_name)
      ) {
        return makeGenericFailure(
          `Extension to duplicate not found: "${duplicated_extension_name}". Existing extensions: ${listQuoted(
            getExtensionNames(project)
          )}. Omit \`duplicated_extension_name\` to create an empty extension.`
        );
      }
      sourceExtension = project.getEventsFunctionsExtension(
        duplicated_extension_name
      );
    }

    const extensionName = getSafeUniqueName(extension_name, name =>
      isExtensionNameTaken(name, project)
    );
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      extensionName,
      project.getEventsFunctionsExtensionsCount()
    );

    const messages: Array<string> = [];
    if (sourceExtension) {
      const sourceExtensionName = sourceExtension.getName();
      unserializeFromJSObject(
        eventsFunctionsExtension,
        serializeToJSObject(sourceExtension),
        'unserializeFrom',
        project
      );
      // Unserialization brought back the name and the origin of the source.
      eventsFunctionsExtension.setName(extensionName);
      eventsFunctionsExtension.setOrigin('', '');
      gd.WholeProjectRefactorer.updateExtensionNameInExtension(
        project,
        eventsFunctionsExtension,
        sourceExtensionName
      );
      messages.push(
        `Copied "${sourceExtensionName}" into "${extensionName}": the copy is yours to edit and never receives store updates. Everything it contains is now called "${extensionName}::<Name>".`
      );
    } else {
      messages.push(`Created the extension "${extensionName}".`);
    }

    // Explicit settings win over the copied ones.
    const explicitProperties = [
      { propertyName: 'fullName', argumentName: 'full_name' },
      { propertyName: 'shortDescription', argumentName: 'short_description' },
      { propertyName: 'description', argumentName: 'description' },
      { propertyName: 'category', argumentName: 'category' },
      { propertyName: 'tags', argumentName: 'tags' },
      { propertyName: 'author', argumentName: 'author' },
    ];
    for (const { propertyName, argumentName } of explicitProperties) {
      const value = SafeExtractor.extractStringProperty(args, argumentName);
      if (value !== null) {
        applyExtensionProperty(eventsFunctionsExtension, propertyName, value);
      }
    }
    // An extension with no full name is shown without a title in the editor.
    if (!eventsFunctionsExtension.getFullName()) {
      eventsFunctionsExtension.setFullName(extensionName);
    }

    const renameNotice = renamedMessage(extension_name, extensionName);
    if (renameNotice) messages.push(renameNotice);

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      needsCodeRegeneration: true,
    });

    return {
      success: true,
      message: messages.join(' '),
      extensionName,
    };
  },
  modifiesProject: true,
};

export const changeExtensionProperties: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    if (SafeExtractor.extractBooleanProperty(args, 'delete_this_extension')) {
      return { text: <Trans>Deleted the extension {extension_name}.</Trans> };
    }
    return {
      text: (
        <Trans>
          Changed the extension{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenEventsFunctionsExtension(extension_name, {})
            }
          >
            {extension_name}
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onExtensionsModifiedOutsideEditor,
    onProjectItemRenamedOutsideEditor,
    onWillDeleteExtensionItem,
  }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const writableExtension = getWritableExtension(project, extension_name);
    if (!writableExtension.success) return writableExtension.failure;
    const { eventsFunctionsExtension } = writableExtension;

    if (SafeExtractor.extractBooleanProperty(args, 'delete_this_extension')) {
      const usages = getExtensionUsages(project, eventsFunctionsExtension);
      if (
        usages.length > 0 &&
        !SafeExtractor.extractBooleanProperty(args, 'delete_even_if_used')
      ) {
        return makeGenericFailure(
          `Extension "${extension_name}" is still used: ${usages.join(
            ', '
          )}. Remove these usages first, or pass \`delete_even_if_used: true\` to delete it anyway (what used it becomes invalid).`
        );
      }
      await onWillDeleteExtensionItem({
        kind: 'extension',
        extensionName: extension_name,
      });
      project.removeEventsFunctionsExtension(extension_name);
      onExtensionsModifiedOutsideEditor({
        extensionNames: [extension_name],
        needsCodeRegeneration: true,
        deleted: true,
      });
      return {
        success: true,
        message:
          `Deleted the extension "${extension_name}".` +
          (usages.length > 0
            ? ` It was still used (${usages.join(
                ', '
              )}): what relied on it is now invalid.`
            : ''),
        extensionName: extension_name,
      };
    }

    // Everything is checked before anything is applied, so a refused entry
    // never leaves the extension half-changed.
    const propertyChanges: Array<{|
      propertyName: string,
      newValue: string,
    |}> = [];
    const rawPropertyChanges =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];
    for (const rawPropertyChange of rawPropertyChanges) {
      const propertyName = SafeExtractor.extractStringProperty(
        rawPropertyChange,
        'property_name'
      );
      const newValue = SafeExtractor.extractStringProperty(
        rawPropertyChange,
        'new_value'
      );
      if (!propertyName || !EXTENSION_PROPERTY_NAMES.includes(propertyName)) {
        return makeGenericFailure(
          `Unknown extension property: "${String(
            propertyName
          )}". Allowed properties: ${listQuoted(EXTENSION_PROPERTY_NAMES)}.`
        );
      }
      if (newValue === null) {
        return makeGenericFailure(
          `\`new_value\` of "${propertyName}" must be a string ("tags" is a comma-separated list).`
        );
      }
      propertyChanges.push({ propertyName, newValue });
    }

    const plannedDependencies = planDependencyChanges(
      eventsFunctionsExtension,
      SafeExtractor.extractArrayProperty(args, 'changed_dependencies') || []
    );
    if (!plannedDependencies.success) {
      return makeGenericFailure(plannedDependencies.message);
    }

    const requestedNewName = getRequestedNewName(args, extension_name);
    let newExtensionName = null;
    if (requestedNewName !== null) {
      newExtensionName = gd.Project.getSafeName(requestedNewName);
      if (isExtensionNameTaken(newExtensionName, project)) {
        return makeGenericFailure(
          `Name "${newExtensionName}" is already used by another extension: pick another \`new_name\`.`
        );
      }
    }

    const messages: Array<string> = [];
    for (const { propertyName, newValue } of propertyChanges) {
      applyExtensionProperty(eventsFunctionsExtension, propertyName, newValue);
      messages.push(`Set ${propertyName} to "${newValue}".`);
    }
    const dependencyResult = applyDependencyChanges(
      eventsFunctionsExtension,
      plannedDependencies.changes
    );
    messages.push(...dependencyResult.messages);

    if (newExtensionName) {
      gd.WholeProjectRefactorer.renameEventsFunctionsExtension(
        project,
        eventsFunctionsExtension,
        extension_name,
        newExtensionName
      );
      eventsFunctionsExtension.setName(newExtensionName);
      // Like the editor: a renamed extension is not the installed one anymore.
      eventsFunctionsExtension.setOrigin('', '');
      onProjectItemRenamedOutsideEditor({
        kind: 'extension',
        oldName: extension_name,
        newName: newExtensionName,
      });
      messages.push(
        `Renamed "${extension_name}" to "${newExtensionName}": everything it contains is now called "${newExtensionName}::<Name>".`
      );
    }

    const extensionName = newExtensionName || extension_name;
    const changedCount =
      propertyChanges.length +
      dependencyResult.changedCount +
      (newExtensionName ? 1 : 0);
    if (changedCount === 0) {
      return {
        success: true,
        message: `Nothing to change on the extension "${extensionName}": pass \`changed_properties\`, \`changed_dependencies\`, \`new_name\` or \`delete_this_extension\`.`,
        extensionName,
        nothingChanged: true,
      };
    }

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      // The settings alone don't change the generated code of the extension.
      needsCodeRegeneration:
        !!newExtensionName || dependencyResult.changedCount > 0,
    });

    return {
      success: true,
      message: messages.join(' '),
      extensionName,
    };
  },
  modifiesProject: true,
};
