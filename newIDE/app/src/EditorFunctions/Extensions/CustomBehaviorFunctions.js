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
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
} from '../index';
import {
  type ExtensionsOutsideEditorChanges,
  type WillDeleteExtensionItemChanges,
} from '../OutsideEditorChanges';
import { extractRequiredString, makeGenericFailure } from '../Utils';
import {
  getExtensionNames,
  getReadOnlyRejection,
  resolveScope,
} from '../Scope';
import { applyPropertyChanges, type PropertyChange } from './PropertyChanges';
import {
  getEnumSettingValue,
  getSafeUniqueName,
  parseBoolean,
  readOptionalBoolean,
  renamedMessage,
  listQuoted,
  getRequestedNewName,
} from './NameHelpers';

const gd: libGDevelop = global.gd;

// The settings of a custom behavior, and the ones that only change what is
// shown in the editor (no generated code depends on them).
const BEHAVIOR_SETTING_NAMES = [
  'fullName',
  'description',
  'objectType',
  'isPrivate',
  'quickCustomizationVisibility',
];
const METADATA_ONLY_SETTING_NAMES = ['fullName', 'description'];
const QUICK_CUSTOMIZATION_VISIBILITIES = ['default', 'visible', 'hidden'];

const getBehaviorNames = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<string> => {
  const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
  return mapFor(0, behaviors.getCount(), index =>
    behaviors.getAt(index).getName()
  );
};

const getBehaviorType = (extensionName: string, behaviorName: string): string =>
  `${extensionName}::${behaviorName}`;

/**
 * The extension of a call, or the failure explaining what to pass: the
 * behavior functions take an `extension_name` rather than a scope.
 */
const resolveExtensionOfCall = (
  project: gdProject,
  extensionName: string
):
  | {| success: true, eventsFunctionsExtension: gdEventsFunctionsExtension |}
  | {| success: false, message: string |} => {
  const resolvedScope = resolveScope(project, {
    type: 'extension',
    extension_name: extensionName,
  });
  if (!resolvedScope.success) return resolvedScope;
  const readOnlyRejection = getReadOnlyRejection(resolvedScope);
  if (readOnlyRejection) return readOnlyRejection;
  const { eventsFunctionsExtension } = resolvedScope;
  if (!eventsFunctionsExtension) {
    return {
      success: false,
      message: `Extension "${extensionName}" not found. Existing extensions: ${listQuoted(
        getExtensionNames(project)
      )}.`,
    };
  }
  return { success: true, eventsFunctionsExtension };
};

const getEventsBasedBehaviorOfCall = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  behaviorName: string
):
  | {| success: true, eventsBasedBehavior: gdEventsBasedBehavior |}
  | {| success: false, message: string |} => {
  const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
  if (!behaviors.has(behaviorName)) {
    return {
      success: false,
      message: `Custom behavior "${behaviorName}" not found in extension "${eventsFunctionsExtension.getName()}". Existing custom behaviors: ${listQuoted(
        getBehaviorNames(eventsFunctionsExtension)
      )}.`,
    };
  }
  return { success: true, eventsBasedBehavior: behaviors.get(behaviorName) };
};

/**
 * Copy a behavior of any extension (including one from the store) into
 * `eventsFunctionsExtension`, renaming what its own functions refer to.
 */
const duplicateEventsBasedBehavior = ({
  project,
  eventsFunctionsExtension,
  sourceExtension,
  sourceBehavior,
  newBehaviorName,
}: {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  sourceExtension: gdEventsFunctionsExtension,
  sourceBehavior: gdEventsBasedBehavior,
  newBehaviorName: string,
|}): gdEventsBasedBehavior => {
  const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
  const serializedBehavior = serializeToJSObject(sourceBehavior);
  const eventsBasedBehavior = behaviors.insertNew(
    newBehaviorName,
    behaviors.getCount()
  );
  unserializeFromJSObject(
    eventsBasedBehavior,
    serializedBehavior,
    'unserializeFrom',
    project
  );
  eventsBasedBehavior.setName(newBehaviorName);
  if (sourceExtension.getName() !== eventsFunctionsExtension.getName()) {
    gd.WholeProjectRefactorer.updateExtensionNameInEventsBasedBehavior(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      sourceExtension.getName()
    );
  }
  if (sourceBehavior.getName() !== newBehaviorName) {
    gd.WholeProjectRefactorer.updateBehaviorNameInEventsBasedBehavior(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      sourceBehavior.getName()
    );
  }
  return eventsBasedBehavior;
};

/** The shared data of the scenes must follow a behavior with shared properties. */
const updateSharedDataIfNeeded = (
  project: gdProject,
  eventsBasedBehavior: gdEventsBasedBehavior
) => {
  if (eventsBasedBehavior.getSharedPropertyDescriptors().getCount() > 0) {
    gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
  }
};

/**
 * Run `visitObject` on every object of the project: the global ones, the ones
 * of each scene and the children of every custom object (all their variants).
 */
const forEachObjectOfProject = (
  project: gdProject,
  visitObject: (object: gdObject) => void
) => {
  const visitObjectsContainer = (objectsContainer: gdObjectsContainer) => {
    for (let index = 0; index < objectsContainer.getObjectsCount(); index++) {
      visitObject(objectsContainer.getObjectAt(index));
    }
  };
  visitObjectsContainer(project.getObjects());
  for (let index = 0; index < project.getLayoutsCount(); index++) {
    visitObjectsContainer(project.getLayoutAt(index).getObjects());
  }
  for (
    let index = 0;
    index < project.getEventsFunctionsExtensionsCount();
    index++
  ) {
    const eventsBasedObjects = project
      .getEventsFunctionsExtensionAt(index)
      .getEventsBasedObjects();
    for (
      let objectIndex = 0;
      objectIndex < eventsBasedObjects.getCount();
      objectIndex++
    ) {
      const eventsBasedObject = eventsBasedObjects.getAt(objectIndex);
      visitObjectsContainer(eventsBasedObject.getObjects());
      const variants = eventsBasedObject.getVariants();
      for (
        let variantIndex = 0;
        variantIndex < variants.getVariantsCount();
        variantIndex++
      ) {
        visitObjectsContainer(variants.getVariantAt(variantIndex).getObjects());
      }
    }
  }
};

/** Remove every behavior of this type from the objects of the project. */
const removeBehaviorFromAllObjects = (
  project: gdProject,
  behaviorType: string
): number => {
  let removedCount = 0;
  forEachObjectOfProject(project, object => {
    object
      .getAllBehaviorNames()
      .toJSArray()
      .forEach(behaviorName => {
        if (object.getBehavior(behaviorName).getTypeName() !== behaviorType)
          return;
        object.removeBehavior(behaviorName);
        removedCount++;
      });
  });
  return removedCount;
};

/** The object types using the behavior, as `getAllObjectTypesUsingEventsBasedBehavior` reports them. */
export const getObjectTypesUsingBehavior = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior
): Array<string> =>
  // `toNewVectorString` returns a static temporary: never delete it.
  gd.WholeProjectRefactorer.getAllObjectTypesUsingEventsBasedBehavior(
    project,
    eventsFunctionsExtension,
    eventsBasedBehavior
  )
    .toNewVectorString()
    .toJSArray();

// ---------------------------------------------------------------------------
// create_custom_behavior
// ---------------------------------------------------------------------------

export const createCustomBehavior: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const custom_behavior_name = extractRequiredString(
      args,
      'custom_behavior_name'
    );

    return {
      text: (
        <Trans>
          Create the behavior <b>{custom_behavior_name}</b> in extension{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenEventsFunctionsExtension(extension_name, {
                behaviorName: custom_behavior_name,
              })
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
  }): Promise<EditorFunctionGenericOutput> => {
    const extensionName = extractRequiredString(args, 'extension_name');
    const requestedBehaviorName = extractRequiredString(
      args,
      'custom_behavior_name'
    );
    const duplicatedBehaviorName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_custom_behavior_name'
    );
    const duplicatedFromExtensionName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_from_extension_name'
    );

    const extensionResult = resolveExtensionOfCall(project, extensionName);
    if (!extensionResult.success)
      return makeGenericFailure(extensionResult.message);
    const { eventsFunctionsExtension } = extensionResult;
    const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

    const parsedIsPrivate = readOptionalBoolean(args, 'is_private');
    if (!parsedIsPrivate.success)
      return makeGenericFailure(parsedIsPrivate.message);

    const behaviorName = getSafeUniqueName(
      requestedBehaviorName,
      name => name === '' || behaviors.has(name)
    );
    const messages = [];
    const renameNotice = renamedMessage(requestedBehaviorName, behaviorName);
    if (renameNotice) messages.push(renameNotice);

    let eventsBasedBehavior;
    if (duplicatedBehaviorName) {
      const sourceExtensionName = duplicatedFromExtensionName || extensionName;
      if (!project.hasEventsFunctionsExtensionNamed(sourceExtensionName)) {
        return makeGenericFailure(
          `Extension "${sourceExtensionName}" not found: it cannot be the source of the copy. Existing extensions: ${listQuoted(
            getExtensionNames(project)
          )}.`
        );
      }
      const sourceExtension = project.getEventsFunctionsExtension(
        sourceExtensionName
      );
      const sourceBehaviors = sourceExtension.getEventsBasedBehaviors();
      if (!sourceBehaviors.has(duplicatedBehaviorName)) {
        return makeGenericFailure(
          `Custom behavior "${duplicatedBehaviorName}" not found in extension "${sourceExtensionName}": it cannot be copied. Existing custom behaviors there: ${listQuoted(
            getBehaviorNames(sourceExtension)
          )}.`
        );
      }
      eventsBasedBehavior = duplicateEventsBasedBehavior({
        project,
        eventsFunctionsExtension,
        sourceExtension,
        sourceBehavior: sourceBehaviors.get(duplicatedBehaviorName),
        newBehaviorName: behaviorName,
      });
      messages.push(
        `Copied "${getBehaviorType(
          sourceExtensionName,
          duplicatedBehaviorName
        )}" with its properties and functions.`
      );
    } else {
      eventsBasedBehavior = behaviors.insertNew(
        behaviorName,
        behaviors.getCount()
      );
    }

    const fullName = SafeExtractor.extractStringProperty(args, 'full_name');
    if (fullName !== null) eventsBasedBehavior.setFullName(fullName);
    const description = SafeExtractor.extractStringProperty(
      args,
      'description'
    );
    if (description !== null) eventsBasedBehavior.setDescription(description);
    const objectType = SafeExtractor.extractStringProperty(args, 'object_type');
    if (objectType !== null) eventsBasedBehavior.setObjectType(objectType);
    if (parsedIsPrivate.value !== null)
      eventsBasedBehavior.setPrivate(parsedIsPrivate.value);

    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedBehavior
    );
    updateSharedDataIfNeeded(project, eventsBasedBehavior);

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      needsCodeRegeneration: true,
    });

    const behaviorType = getBehaviorType(extensionName, behaviorName);
    const finalObjectType = eventsBasedBehavior.getObjectType();
    return {
      success: true,
      message: [
        `Created the custom behavior "${behaviorType}"${
          finalObjectType
            ? ` for objects of type "${finalObjectType}"`
            : ' for any object'
        }.`,
        ...messages,
        `Add functions to it with create_custom_function (scope { type: "custom_behavior", extension_name: "${extensionName}", custom_behavior_name: "${behaviorName}" }), properties with change_custom_behavior, and put it on objects with add_behavior (behavior_type "${behaviorType}").`,
      ].join(' '),
      extensionName,
      customBehaviorName: behaviorName,
      behaviorType,
    };
  },
  modifiesProject: true,
};

// ---------------------------------------------------------------------------
// change_custom_behavior
// ---------------------------------------------------------------------------

// A setting checked against the behavior: `apply` returns what changed, or
// null when the behavior already had this value.
type PlannedBehaviorSetting = {|
  settingName: string,
  apply: () => string | null,
|};

const planBehaviorSettings = (
  eventsBasedBehavior: gdEventsBasedBehavior,
  changedSettings: Array<any>
):
  | {| success: true, plannedSettings: Array<PlannedBehaviorSetting> |}
  | {| success: false, message: string |} => {
  const plannedSettings: Array<PlannedBehaviorSetting> = [];
  for (const changedSetting of changedSettings) {
    const settingName = SafeExtractor.extractStringProperty(
      changedSetting,
      'setting_name'
    );
    if (!settingName || !BEHAVIOR_SETTING_NAMES.includes(settingName)) {
      return {
        success: false,
        message: `Setting "${settingName ||
          ''}" does not exist on a custom behavior. Settings you can change: ${listQuoted(
          BEHAVIOR_SETTING_NAMES
        )} (properties are changed with \`changed_properties\`).`,
      };
    }
    const newValue = changedSetting ? changedSetting.new_value : undefined;

    if (settingName === 'isPrivate') {
      const parsedValue = parseBoolean(newValue, settingName);
      if (!parsedValue.success)
        return { success: false, message: parsedValue.message };
      const isPrivate = parsedValue.value;
      plannedSettings.push({
        settingName,
        apply: () => {
          if (eventsBasedBehavior.isPrivate() === isPrivate) return null;
          eventsBasedBehavior.setPrivate(isPrivate);
          return `${settingName} set to ${String(isPrivate)}`;
        },
      });
      continue;
    }
    if (settingName === 'quickCustomizationVisibility') {
      const parsedValue = getEnumSettingValue(
        newValue,
        QUICK_CUSTOMIZATION_VISIBILITIES,
        settingName
      );
      if (!parsedValue.success)
        return { success: false, message: parsedValue.message };
      const visibilityName = parsedValue.value;
      const visibility =
        visibilityName === 'visible'
          ? gd.QuickCustomization.Visible
          : visibilityName === 'hidden'
          ? gd.QuickCustomization.Hidden
          : gd.QuickCustomization.Default;
      plannedSettings.push({
        settingName,
        apply: () => {
          if (
            eventsBasedBehavior.getQuickCustomizationVisibility() === visibility
          )
            return null;
          eventsBasedBehavior.setQuickCustomizationVisibility(visibility);
          return `${settingName} set to "${visibilityName}"`;
        },
      });
      continue;
    }

    if (typeof newValue !== 'string') {
      return {
        success: false,
        message: `\`new_value\` of "${settingName}" must be a string (use "" to clear it).`,
      };
    }
    const stringValue = newValue;
    plannedSettings.push({
      settingName,
      apply: () => {
        if (settingName === 'fullName') {
          if (eventsBasedBehavior.getFullName() === stringValue) return null;
          eventsBasedBehavior.setFullName(stringValue);
        } else if (settingName === 'description') {
          if (eventsBasedBehavior.getDescription() === stringValue) return null;
          eventsBasedBehavior.setDescription(stringValue);
        } else {
          if (eventsBasedBehavior.getObjectType() === stringValue) return null;
          eventsBasedBehavior.setObjectType(stringValue);
        }
        return `${settingName} set to "${stringValue}"`;
      },
    });
  }
  return { success: true, plannedSettings };
};

const deleteCustomBehavior = async ({
  project,
  eventsFunctionsExtension,
  eventsBasedBehavior,
  isForced,
  onExtensionsModifiedOutsideEditor,
  onWillDeleteExtensionItem,
}: {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  isForced: boolean,
  onExtensionsModifiedOutsideEditor: (
    changes: ExtensionsOutsideEditorChanges
  ) => void,
  onWillDeleteExtensionItem: (
    changes: WillDeleteExtensionItemChanges
  ) => Promise<void>,
|}): Promise<EditorFunctionGenericOutput> => {
  const extensionName = eventsFunctionsExtension.getName();
  const behaviorName = eventsBasedBehavior.getName();
  const behaviorType = getBehaviorType(extensionName, behaviorName);
  const objectTypes = getObjectTypesUsingBehavior(
    project,
    eventsFunctionsExtension,
    eventsBasedBehavior
  );
  if (objectTypes.length > 0 && !isForced) {
    return makeGenericFailure(
      `Custom behavior "${behaviorType}" is used by objects of type ${listQuoted(
        objectTypes
      )}: deleting it would leave them with an unknown behavior. Remove it from these objects first, or pass \`delete_even_if_used: true\` to delete it and remove it from every object using it.`
    );
  }

  const removedCount = removeBehaviorFromAllObjects(project, behaviorType);
  await onWillDeleteExtensionItem({
    kind: 'custom-behavior',
    extensionName,
    behaviorName,
  });
  eventsFunctionsExtension.getEventsBasedBehaviors().remove(behaviorName);
  onExtensionsModifiedOutsideEditor({
    extensionNames: [extensionName],
    needsCodeRegeneration: true,
  });

  return {
    success: true,
    message: `Deleted the custom behavior "${behaviorType}"${
      removedCount > 0
        ? `, and removed it from ${removedCount} object(s) of the project`
        : ''
    }. The events using its actions, conditions and expressions are now invalid: update them.`,
    extensionName,
    customBehaviorName: behaviorName,
    behaviorType,
  };
};

export const changeCustomBehavior: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const custom_behavior_name = extractRequiredString(
      args,
      'custom_behavior_name'
    );
    const isDeleted = !!SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_custom_behavior'
    );

    const behaviorLink = (
      <Link
        href="#"
        onClick={() =>
          editorCallbacks.onOpenEventsFunctionsExtension(extension_name, {
            behaviorName: custom_behavior_name,
          })
        }
      >
        {custom_behavior_name}
      </Link>
    );

    return {
      text: isDeleted ? (
        <Trans>
          Delete the behavior <b>{custom_behavior_name}</b> of extension{' '}
          {extension_name}.
        </Trans>
      ) : (
        <Trans>
          Update the behavior {behaviorLink} of extension {extension_name}.
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
    ensureExtensionsUpToDate,
  }): Promise<EditorFunctionGenericOutput> => {
    const extensionName = extractRequiredString(args, 'extension_name');
    const behaviorName = extractRequiredString(args, 'custom_behavior_name');

    const extensionResult = resolveExtensionOfCall(project, extensionName);
    if (!extensionResult.success)
      return makeGenericFailure(extensionResult.message);
    const { eventsFunctionsExtension } = extensionResult;
    const behaviorResult = getEventsBasedBehaviorOfCall(
      eventsFunctionsExtension,
      behaviorName
    );
    if (!behaviorResult.success)
      return makeGenericFailure(behaviorResult.message);
    const { eventsBasedBehavior } = behaviorResult;

    if (
      SafeExtractor.extractBooleanProperty(args, 'delete_this_custom_behavior')
    ) {
      return deleteCustomBehavior({
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        isForced: !!SafeExtractor.extractBooleanProperty(
          args,
          'delete_even_if_used'
        ),
        onExtensionsModifiedOutsideEditor,
        onWillDeleteExtensionItem,
      });
    }

    // Everything is checked before anything is applied: a refused change never
    // leaves the behavior half-changed.
    const changedSettings =
      SafeExtractor.extractArrayProperty(args, 'changed_settings') || [];
    const plannedSettingsResult = planBehaviorSettings(
      eventsBasedBehavior,
      changedSettings
    );
    if (!plannedSettingsResult.success)
      return makeGenericFailure(plannedSettingsResult.message);

    const newName = getRequestedNewName(args, behaviorName);
    let finalBehaviorName = behaviorName;
    if (newName !== null) {
      finalBehaviorName = gd.Project.getSafeName(newName);
      if (
        eventsFunctionsExtension
          .getEventsBasedBehaviors()
          .has(finalBehaviorName)
      ) {
        return makeGenericFailure(
          `Name "${finalBehaviorName}" is already used by another custom behavior of extension "${extensionName}". Existing custom behaviors: ${listQuoted(
            getBehaviorNames(eventsFunctionsExtension)
          )}. Pass a free name in \`new_name\`.`
        );
      }
    }

    const messages: Array<string> = [];
    let changedCount = 0;
    let needsCodeRegeneration = false;

    for (const plannedSetting of plannedSettingsResult.plannedSettings) {
      const detail = plannedSetting.apply();
      if (!detail) continue;
      changedCount++;
      messages.push(`${detail}.`);
      if (!METADATA_ONLY_SETTING_NAMES.includes(plannedSetting.settingName)) {
        needsCodeRegeneration = true;
      }
    }

    const changedProperties: Array<PropertyChange> =
      (SafeExtractor.extractArrayProperty(args, 'changed_properties'): any) ||
      [];
    const changedSharedProperties: Array<PropertyChange> =
      (SafeExtractor.extractArrayProperty(
        args,
        'changed_shared_properties'
      ): any) || [];

    if (changedProperties.length > 0) {
      const propertiesResult = applyPropertyChanges({
        project,
        eventsFunctionsExtension,
        owner: 'behavior',
        entity: eventsBasedBehavior,
        propertiesContainer: eventsBasedBehavior.getPropertyDescriptors(),
        changes: changedProperties,
      });
      if (!propertiesResult.success)
        return makeGenericFailure(propertiesResult.message);
      changedCount += propertiesResult.changedCount;
      messages.push(...propertiesResult.messages);
      if (propertiesResult.changedCount > 0) needsCodeRegeneration = true;
    }
    if (changedSharedProperties.length > 0) {
      const sharedPropertiesResult = applyPropertyChanges({
        project,
        eventsFunctionsExtension,
        owner: 'behavior-shared',
        entity: eventsBasedBehavior,
        propertiesContainer: eventsBasedBehavior.getSharedPropertyDescriptors(),
        changes: changedSharedProperties,
      });
      if (!sharedPropertiesResult.success)
        return makeGenericFailure(sharedPropertiesResult.message);
      changedCount += sharedPropertiesResult.changedCount;
      messages.push(...sharedPropertiesResult.messages);
      if (sharedPropertiesResult.changedCount > 0) {
        needsCodeRegeneration = true;
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
      }
    }

    const hasPropertyChanges =
      changedProperties.length > 0 || changedSharedProperties.length > 0;
    if (hasPropertyChanges || changedSettings.length > 0) {
      // The implicit `Object` parameter of every function carries the object
      // type of the behavior, and the properties may have changed its
      // required behaviors.
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        eventsFunctionsExtension,
        eventsBasedBehavior
      );
    }

    if (finalBehaviorName !== behaviorName) {
      gd.WholeProjectRefactorer.renameEventsBasedBehavior(
        project,
        eventsFunctionsExtension,
        behaviorName,
        finalBehaviorName
      );
      eventsBasedBehavior.setName(finalBehaviorName);
      changedCount++;
      needsCodeRegeneration = true;
      messages.push(
        `Renamed to "${getBehaviorType(extensionName, finalBehaviorName)}": ` +
          `the objects using it and the events calling its functions were updated.`
      );
      const requestedNewName = newName || finalBehaviorName;
      const renameNotice = renamedMessage(requestedNewName, finalBehaviorName);
      if (renameNotice) messages.push(renameNotice);
      onProjectItemRenamedOutsideEditor({
        kind: 'custom-behavior',
        oldName: behaviorName,
        newName: finalBehaviorName,
        extensionName,
      });
    }

    const behaviorType = getBehaviorType(extensionName, finalBehaviorName);
    if (changedCount === 0) {
      return {
        success: true,
        message: [
          `Nothing changed on the custom behavior "${behaviorType}": it already had these values.`,
          ...messages,
          'Pass `changed_settings`, `changed_properties`, `changed_shared_properties`, `new_name` or `delete_this_custom_behavior` to change something.',
        ].join(' '),
        extensionName,
        customBehaviorName: finalBehaviorName,
        behaviorType,
        nothingChanged: true,
      };
    }

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extensionName],
      needsCodeRegeneration,
    });

    if (hasPropertyChanges) {
      // The objects using the behavior may need new required behaviors: this
      // can only be fixed once the extension is regenerated.
      await ensureExtensionsUpToDate();
      try {
        gd.WholeProjectRefactorer.fixInvalidRequiredBehaviorProperties(project);
      } catch (error) {
        // The extension has no generated metadata yet: nothing to fix.
      }
    }

    return {
      success: true,
      message: `Custom behavior "${behaviorType}": ${messages.join(' ')}`,
      extensionName,
      customBehaviorName: finalBehaviorName,
      behaviorType,
    };
  },
  modifiesProject: true,
};
