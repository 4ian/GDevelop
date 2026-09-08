// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Link from '../../UI/Link';
import { mapFor } from '../../Utils/MapFor';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  type EditorFunction,
  type EditorFunctionGenericOutput,
} from '../index';
import { extractRequiredString, makeGenericFailure } from '../Utils';
import {
  getExtensionNames,
  getNamedVariantNames,
  getReadOnlyRejection,
  resolveScope,
} from '../Scope';
import {
  getSafeUniqueName,
  parseBoolean,
  parseNumber,
  renamedMessage,
  listQuoted,
  getRequestedNewName,
} from './NameHelpers';
import { applyPropertyChanges, type PropertyChange } from './PropertyChanges';

const gd: libGDevelop = global.gd;

export const VARIANT_RENAME_REJECTED_MESSAGE =
  'Renaming a variant is not supported yet: create a variant with `duplicated_from_variant_name` set to the old name, then delete the old one (the objects using it fall back to the default variant).';

const STRING_SETTING_NAMES = [
  'fullName',
  'description',
  'defaultName',
  'assetStoreTag',
];
const BOOLEAN_SETTING_NAMES = [
  'isRenderedIn3D',
  'isAnimatable',
  'isTextContainer',
  'isInnerAreaFollowingParentSize',
  'isPrivate',
];
const NUMBER_SETTING_NAMES = [
  'areaMinX',
  'areaMinY',
  'areaMinZ',
  'areaMaxX',
  'areaMaxY',
  'areaMaxZ',
];
const ALL_SETTING_NAMES = [
  ...STRING_SETTING_NAMES,
  ...BOOLEAN_SETTING_NAMES,
  ...NUMBER_SETTING_NAMES,
];
// Settings that only change what the user reads: the generated code is the same.
const METADATA_ONLY_SETTING_NAMES = [
  'fullName',
  'description',
  'defaultName',
  'assetStoreTag',
];

const getCustomObjectNames = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<string> => {
  const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
  return mapFor(0, eventsBasedObjects.getCount(), index =>
    eventsBasedObjects.getAt(index).getName()
  );
};

const getChildObjectNames = (
  eventsBasedObject: gdEventsBasedObject
): Array<string> => {
  const objects = eventsBasedObject.getObjects();
  return mapFor(0, objects.getObjectsCount(), index =>
    objects.getObjectAt(index).getName()
  );
};

const applyStringSetting = (
  eventsBasedObject: gdEventsBasedObject,
  settingName: string,
  value: string
) => {
  if (settingName === 'fullName') eventsBasedObject.setFullName(value);
  else if (settingName === 'description')
    eventsBasedObject.setDescription(value);
  else if (settingName === 'defaultName')
    eventsBasedObject.setDefaultName(value);
  else if (settingName === 'assetStoreTag')
    eventsBasedObject.setAssetStoreTag(value);
};

const applyBooleanSetting = (
  eventsBasedObject: gdEventsBasedObject,
  settingName: string,
  value: boolean
) => {
  if (settingName === 'isRenderedIn3D')
    eventsBasedObject.markAsRenderedIn3D(value);
  else if (settingName === 'isAnimatable')
    eventsBasedObject.markAsAnimatable(value);
  else if (settingName === 'isTextContainer')
    eventsBasedObject.markAsTextContainer(value);
  else if (settingName === 'isInnerAreaFollowingParentSize')
    eventsBasedObject.markAsInnerAreaFollowingParentSize(value);
  else if (settingName === 'isPrivate') eventsBasedObject.setPrivate(value);
};

const applyNumberSetting = (
  eventsBasedObject: gdEventsBasedObject,
  settingName: string,
  value: number
) => {
  if (settingName === 'areaMinX') eventsBasedObject.setAreaMinX(value);
  else if (settingName === 'areaMinY') eventsBasedObject.setAreaMinY(value);
  else if (settingName === 'areaMinZ') eventsBasedObject.setAreaMinZ(value);
  else if (settingName === 'areaMaxX') eventsBasedObject.setAreaMaxX(value);
  else if (settingName === 'areaMaxY') eventsBasedObject.setAreaMaxY(value);
  else if (settingName === 'areaMaxZ') eventsBasedObject.setAreaMaxZ(value);
};

// One entry of `changed_settings`, with its value already read and checked.
type PlannedSettingChange = {|
  settingName: string,
  stringValue: string | null,
  booleanValue: boolean | null,
  numberValue: number | null,
|};

type PlannedSettingChanges =
  | {| success: true, changes: Array<PlannedSettingChange> |}
  | {| success: false, message: string |};

const planSettingChanges = (rawChanges: Array<any>): PlannedSettingChanges => {
  const changes: Array<PlannedSettingChange> = [];
  for (const rawChange of rawChanges) {
    const settingName = SafeExtractor.extractStringProperty(
      rawChange,
      'setting_name'
    );
    if (!settingName || !ALL_SETTING_NAMES.includes(settingName)) {
      return {
        success: false,
        message: `Unknown custom object setting: "${String(
          settingName
        )}". Allowed settings: ${listQuoted(ALL_SETTING_NAMES)}.`,
      };
    }
    const rawValue = rawChange ? rawChange.new_value : undefined;
    if (STRING_SETTING_NAMES.includes(settingName)) {
      const stringValue = SafeExtractor.extractStringProperty(
        rawChange,
        'new_value'
      );
      if (stringValue === null) {
        return {
          success: false,
          message: `\`new_value\` of "${settingName}" must be a string.`,
        };
      }
      changes.push({
        settingName,
        stringValue,
        booleanValue: null,
        numberValue: null,
      });
    } else if (BOOLEAN_SETTING_NAMES.includes(settingName)) {
      const parsedBoolean = parseBoolean(rawValue, settingName);
      if (!parsedBoolean.success) {
        return { success: false, message: parsedBoolean.message };
      }
      changes.push({
        settingName,
        stringValue: null,
        booleanValue: parsedBoolean.value,
        numberValue: null,
      });
    } else {
      const parsedNumber = parseNumber(rawValue, settingName);
      if (!parsedNumber.success) {
        return { success: false, message: parsedNumber.message };
      }
      changes.push({
        settingName,
        stringValue: null,
        booleanValue: null,
        numberValue: parsedNumber.value,
      });
    }
  }
  return { success: true, changes };
};

const applySettingChanges = (
  eventsBasedObject: gdEventsBasedObject,
  changes: Array<PlannedSettingChange>
): Array<string> =>
  changes.map(change => {
    const { settingName, stringValue, booleanValue } = change;
    if (stringValue !== null) {
      applyStringSetting(eventsBasedObject, settingName, stringValue);
      return `Set ${settingName} to "${stringValue}".`;
    }
    if (booleanValue !== null) {
      applyBooleanSetting(eventsBasedObject, settingName, booleanValue);
      return `Set ${settingName} to ${String(booleanValue)}.`;
    }
    const numberValue = change.numberValue || 0;
    applyNumberSetting(eventsBasedObject, settingName, numberValue);
    return `Set ${settingName} to ${numberValue}.`;
  });

// One entry of `changed_variants`: creates or deletes one named variant.
type PlannedVariantChange = {|
  requestedName: string,
  finalName: string,
  isDeleted: boolean,
  // null when an empty variant is asked for, "" for the default variant.
  duplicatedFromVariantName: string | null,
|};

type PlannedVariantChanges =
  | {| success: true, changes: Array<PlannedVariantChange> |}
  | {| success: false, message: string |};

const planVariantChanges = (
  eventsBasedObject: gdEventsBasedObject,
  rawChanges: Array<any>
): PlannedVariantChanges => {
  const variantNames = new Set(getNamedVariantNames(eventsBasedObject));
  const changes: Array<PlannedVariantChange> = [];

  for (const rawChange of rawChanges) {
    const variantName = SafeExtractor.extractStringProperty(
      rawChange,
      'variant_name'
    );
    if (variantName === null) {
      return {
        success: false,
        message:
          'Each entry of `changed_variants` needs a `variant_name`: the name of the variant to create or delete.',
      };
    }
    if (SafeExtractor.extractStringProperty(rawChange, 'new_name') !== null) {
      return { success: false, message: VARIANT_RENAME_REJECTED_MESSAGE };
    }

    if (
      SafeExtractor.extractBooleanProperty(rawChange, 'delete_this_variant')
    ) {
      if (variantName === '') {
        return {
          success: false,
          message:
            'The default variant cannot be deleted: it is the custom object itself. Pass the name of a named variant.',
        };
      }
      if (!variantNames.has(variantName)) {
        return {
          success: false,
          message: `Variant "${variantName}" not found: it cannot be deleted. Existing variants: ${listQuoted(
            Array.from(variantNames)
          )}.`,
        };
      }
      variantNames.delete(variantName);
      changes.push({
        requestedName: variantName,
        finalName: variantName,
        isDeleted: true,
        duplicatedFromVariantName: null,
      });
      continue;
    }

    if (variantName === '') {
      return {
        success: false,
        message:
          '`variant_name` must be the name of the variant to create ("" is the default variant, which always exists).',
      };
    }
    if (variantName.includes('::')) {
      return {
        success: false,
        message: `A variant name cannot contain "::": rename "${variantName}".`,
      };
    }
    const duplicatedFromVariantName = SafeExtractor.extractStringProperty(
      rawChange,
      'duplicated_from_variant_name'
    );
    // Checked against the variants as they will be once the earlier entries of
    // the call are applied (a variant deleted above cannot be copied).
    if (
      duplicatedFromVariantName !== null &&
      duplicatedFromVariantName !== '' &&
      !variantNames.has(duplicatedFromVariantName)
    ) {
      return {
        success: false,
        message: `Variant to duplicate not found: "${duplicatedFromVariantName}" ("" is the default variant). Existing variants: ${listQuoted(
          Array.from(variantNames)
        )}.`,
      };
    }
    const finalName = newNameGenerator(
      variantName,
      name => variantNames.has(name) || name === ''
    );
    variantNames.add(finalName);
    changes.push({
      requestedName: variantName,
      finalName,
      isDeleted: false,
      duplicatedFromVariantName,
    });
  }

  return { success: true, changes };
};

const copyArea = (
  source: gdEventsBasedObjectVariant,
  target: gdEventsBasedObjectVariant
) => {
  target.setAreaMinX(source.getAreaMinX());
  target.setAreaMinY(source.getAreaMinY());
  target.setAreaMinZ(source.getAreaMinZ());
  target.setAreaMaxX(source.getAreaMaxX());
  target.setAreaMaxY(source.getAreaMaxY());
  target.setAreaMaxZ(source.getAreaMaxZ());
};

/** Add one named variant: a copy of another one, or an empty one. */
const createVariant = (
  project: gdProject,
  eventsBasedObject: gdEventsBasedObject,
  plannedVariant: PlannedVariantChange
) => {
  const variants = eventsBasedObject.getVariants();
  const defaultVariant = eventsBasedObject.getDefaultVariant();
  const newVariant = variants.insertNewVariant(
    plannedVariant.finalName,
    variants.getVariantsCount()
  );

  const { duplicatedFromVariantName } = plannedVariant;
  if (duplicatedFromVariantName !== null) {
    if (
      duplicatedFromVariantName !== '' &&
      !variants.hasVariantNamed(duplicatedFromVariantName)
    ) {
      // Planned against the simulated names, so this cannot happen.
      throw new Error(`Variant "${duplicatedFromVariantName}" disappeared.`);
    }
    const sourceVariant =
      duplicatedFromVariantName === ''
        ? defaultVariant
        : variants.getVariant(duplicatedFromVariantName);
    unserializeFromJSObject(
      newVariant,
      serializeToJSObject(sourceVariant),
      'unserializeFrom',
      project
    );
    // Unserialization brought back the name and the asset store ids of the
    // source: the copy is not that asset anymore.
    newVariant.setName(plannedVariant.finalName);
    newVariant.setAssetStoreAssetId('');
    newVariant.setAssetStoreOriginalName('');
    return;
  }

  copyArea(defaultVariant, newVariant);
  if (newVariant.getLayers().getLayersCount() === 0) {
    newVariant.getLayers().insertNewLayer('', 0);
  }
};

/**
 * The custom object to write into, or the failure to return to the caller
 * (unknown extension or object, or an extension installed from the store).
 */
const getWritableCustomObject = (
  project: gdProject,
  extensionName: string,
  customObjectName: string
):
  | {|
      success: true,
      eventsFunctionsExtension: gdEventsFunctionsExtension,
      eventsBasedObject: gdEventsBasedObject,
    |}
  | {| success: false, failure: EditorFunctionGenericOutput |} => {
  const resolvedScope = resolveScope(project, {
    type: 'custom_object',
    extension_name: extensionName,
    custom_object_name: customObjectName,
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
  const { eventsFunctionsExtension, eventsBasedObject } = resolvedScope;
  if (!eventsFunctionsExtension || !eventsBasedObject) {
    throw new Error(
      `Internal error: ${resolvedScope.label} has no custom object.`
    );
  }
  return { success: true, eventsFunctionsExtension, eventsBasedObject };
};

export const createCustomObject: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const custom_object_name = extractRequiredString(
      args,
      'custom_object_name'
    );
    return {
      text: (
        <Trans>
          Created the custom object{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenCustomObjectEditor(
                extension_name,
                custom_object_name,
                ''
              )
            }
          >
            {custom_object_name}
          </Link>{' '}
          in {extension_name}.
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
    const custom_object_name = extractRequiredString(
      args,
      'custom_object_name'
    );

    const resolvedScope = resolveScope(project, {
      type: 'extension',
      extension_name,
    });
    if (resolvedScope.success === false)
      return makeGenericFailure(resolvedScope.message);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeGenericFailure(readOnlyRejection.message);
    const eventsFunctionsExtension = resolvedScope.eventsFunctionsExtension;
    if (!eventsFunctionsExtension) {
      throw new Error(
        `Internal error: ${resolvedScope.label} has no extension.`
      );
    }

    const duplicated_custom_object_name = SafeExtractor.extractStringProperty(
      args,
      'duplicated_custom_object_name'
    );
    const duplicated_from_extension_name = SafeExtractor.extractStringProperty(
      args,
      'duplicated_from_extension_name'
    );
    if (duplicated_from_extension_name && !duplicated_custom_object_name) {
      return makeGenericFailure(
        '`duplicated_from_extension_name` needs `duplicated_custom_object_name`: it says which extension the custom object to copy comes from.'
      );
    }

    let sourceEventsBasedObject: gdEventsBasedObject | null = null;
    let sourceExtensionName = extension_name;
    if (duplicated_custom_object_name) {
      sourceExtensionName = duplicated_from_extension_name || extension_name;
      if (!project.hasEventsFunctionsExtensionNamed(sourceExtensionName)) {
        return makeGenericFailure(
          `Extension to copy from not found: "${sourceExtensionName}". Existing extensions: ${listQuoted(
            getExtensionNames(project)
          )}.`
        );
      }
      const sourceExtension = project.getEventsFunctionsExtension(
        sourceExtensionName
      );
      if (
        !sourceExtension
          .getEventsBasedObjects()
          .has(duplicated_custom_object_name)
      ) {
        return makeGenericFailure(
          `Custom object to duplicate not found: "${duplicated_custom_object_name}" in extension "${sourceExtensionName}". Existing custom objects: ${listQuoted(
            getCustomObjectNames(sourceExtension)
          )}.`
        );
      }
      sourceEventsBasedObject = sourceExtension
        .getEventsBasedObjects()
        .get(duplicated_custom_object_name);
    }

    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    const customObjectName = getSafeUniqueName(custom_object_name, name =>
      eventsBasedObjects.has(name)
    );
    const eventsBasedObject = eventsBasedObjects.insertNew(
      customObjectName,
      eventsBasedObjects.getCount()
    );

    const messages: Array<string> = [];
    if (sourceEventsBasedObject) {
      const sourceObjectName = sourceEventsBasedObject.getName();
      unserializeFromJSObject(
        eventsBasedObject,
        serializeToJSObject(sourceEventsBasedObject),
        'unserializeFrom',
        project
      );
      // Unserialization brought back the name of the source.
      eventsBasedObject.setName(customObjectName);
      if (sourceExtensionName !== extension_name) {
        gd.WholeProjectRefactorer.updateExtensionNameInEventsBasedObject(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          sourceExtensionName
        );
      }
      if (sourceObjectName !== customObjectName) {
        gd.WholeProjectRefactorer.updateObjectNameInEventsBasedObject(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          sourceObjectName
        );
      }
      messages.push(
        `Copied "${sourceExtensionName}::${sourceObjectName}" into "${extension_name}::${customObjectName}".`
      );
    } else {
      messages.push(
        `Created the custom object "${extension_name}::${customObjectName}".`
      );
    }

    const stringArguments = [
      { settingName: 'fullName', argumentName: 'full_name' },
      { settingName: 'description', argumentName: 'description' },
      { settingName: 'defaultName', argumentName: 'default_name' },
    ];
    for (const { settingName, argumentName } of stringArguments) {
      const value = SafeExtractor.extractStringProperty(args, argumentName);
      if (value !== null) {
        applyStringSetting(eventsBasedObject, settingName, value);
      }
    }
    const booleanArguments = [
      { settingName: 'isRenderedIn3D', argumentName: 'is_3d' },
      { settingName: 'isAnimatable', argumentName: 'is_animatable' },
      { settingName: 'isTextContainer', argumentName: 'is_text_container' },
      {
        settingName: 'isInnerAreaFollowingParentSize',
        argumentName: 'is_inner_area_following_parent_size',
      },
      { settingName: 'isPrivate', argumentName: 'is_private' },
    ];
    for (const { settingName, argumentName } of booleanArguments) {
      const value = SafeExtractor.extractBooleanProperty(args, argumentName);
      if (value !== null) {
        applyBooleanSetting(eventsBasedObject, settingName, value);
      }
    }
    const area = SafeExtractor.extractObjectProperty(args, 'area');
    if (area) {
      const areaBounds = [
        { settingName: 'areaMinX', fieldName: 'minX' },
        { settingName: 'areaMinY', fieldName: 'minY' },
        { settingName: 'areaMinZ', fieldName: 'minZ' },
        { settingName: 'areaMaxX', fieldName: 'maxX' },
        { settingName: 'areaMaxY', fieldName: 'maxY' },
        { settingName: 'areaMaxZ', fieldName: 'maxZ' },
      ];
      for (const { settingName, fieldName } of areaBounds) {
        const value = SafeExtractor.extractNumberProperty(area, fieldName);
        if (value !== null) {
          applyNumberSetting(eventsBasedObject, settingName, value);
        }
      }
    }
    if (!eventsBasedObject.getFullName()) {
      eventsBasedObject.setFullName(customObjectName);
    }

    // Children are always put on a layer: a custom object without one can't
    // hold any instance.
    if (eventsBasedObject.getLayers().getLayersCount() === 0) {
      eventsBasedObject.getLayers().insertNewLayer('', 0);
    }
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const renameNotice = renamedMessage(custom_object_name, customObjectName);
    if (renameNotice) messages.push(renameNotice);

    onExtensionsModifiedOutsideEditor({
      extensionNames: [extension_name],
      needsCodeRegeneration: true,
    });

    return {
      success: true,
      message: messages.join(' '),
      extensionName: extension_name,
      customObjectName,
      objectType: `${extension_name}::${customObjectName}`,
    };
  },
  modifiesProject: true,
};

export const changeCustomObject: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const extension_name = extractRequiredString(args, 'extension_name');
    const custom_object_name = extractRequiredString(
      args,
      'custom_object_name'
    );
    if (
      SafeExtractor.extractBooleanProperty(args, 'delete_this_custom_object')
    ) {
      return {
        text: (
          <Trans>
            Deleted the custom object {extension_name}::{custom_object_name}.
          </Trans>
        ),
      };
    }
    return {
      text: (
        <Trans>
          Changed the custom object{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenCustomObjectEditor(
                extension_name,
                custom_object_name,
                ''
              )
            }
          >
            {custom_object_name}
          </Link>{' '}
          in {extension_name}.
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
    const custom_object_name = extractRequiredString(
      args,
      'custom_object_name'
    );
    const writableCustomObject = getWritableCustomObject(
      project,
      extension_name,
      custom_object_name
    );
    if (!writableCustomObject.success) return writableCustomObject.failure;
    const {
      eventsFunctionsExtension,
      eventsBasedObject,
    } = writableCustomObject;
    const objectType = `${extension_name}::${custom_object_name}`;

    if (
      SafeExtractor.extractBooleanProperty(args, 'delete_this_custom_object')
    ) {
      const isUsed = gd.UsedObjectTypeFinder.scanProject(project, objectType);
      if (
        isUsed &&
        !SafeExtractor.extractBooleanProperty(args, 'delete_even_if_used')
      ) {
        return makeGenericFailure(
          `Custom object "${objectType}" is still used: objects of this type exist in the project (in a scene, in the global objects or as a child of another custom object). Delete them first, or pass \`delete_even_if_used: true\` to delete it anyway (those objects become invalid).`
        );
      }
      await onWillDeleteExtensionItem({
        kind: 'custom-object',
        extensionName: extension_name,
        objectName: custom_object_name,
      });
      eventsFunctionsExtension
        .getEventsBasedObjects()
        .remove(custom_object_name);
      onExtensionsModifiedOutsideEditor({
        extensionNames: [extension_name],
        needsCodeRegeneration: true,
      });
      return {
        success: true,
        message:
          `Deleted the custom object "${objectType}".` +
          (isUsed
            ? ' The objects that were using this type are now invalid: replace or delete them.'
            : ''),
        extensionName: extension_name,
        customObjectName: custom_object_name,
        objectType,
        // The declared output always lists the variants: none after a deletion.
        variantNames: [],
      };
    }

    // Everything is checked before anything is applied, so a refused entry
    // never leaves the custom object half-changed.
    const plannedSettings = planSettingChanges(
      SafeExtractor.extractArrayProperty(args, 'changed_settings') || []
    );
    if (!plannedSettings.success) {
      return makeGenericFailure(plannedSettings.message);
    }
    const plannedVariants = planVariantChanges(
      eventsBasedObject,
      SafeExtractor.extractArrayProperty(args, 'changed_variants') || []
    );
    if (!plannedVariants.success) {
      return makeGenericFailure(plannedVariants.message);
    }
    const childObjectNames =
      SafeExtractor.extractStringArrayProperty(
        args,
        'forward_child_object_functions'
      ) || [];
    for (const childObjectName of childObjectNames) {
      if (!eventsBasedObject.getObjects().hasObjectNamed(childObjectName)) {
        return makeGenericFailure(
          `Child object "${childObjectName}" not found in "${objectType}": \`forward_child_object_functions\` takes the names of its child objects. Existing child objects: ${listQuoted(
            getChildObjectNames(eventsBasedObject)
          )}.`
        );
      }
    }
    const requestedNewName = getRequestedNewName(args, custom_object_name);
    let newCustomObjectName = null;
    if (requestedNewName !== null) {
      newCustomObjectName = gd.Project.getSafeName(requestedNewName);
      if (
        eventsFunctionsExtension
          .getEventsBasedObjects()
          .has(newCustomObjectName)
      ) {
        return makeGenericFailure(
          `Name "${newCustomObjectName}" is already used by another custom object of "${extension_name}": pick another \`new_name\`.`
        );
      }
    }

    const messages: Array<string> = [];
    let changedCount = 0;

    // The properties are applied first: they validate themselves and either
    // apply everything or nothing.
    const propertyChanges: Array<PropertyChange> =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];
    if (propertyChanges.length > 0) {
      const propertiesResult = applyPropertyChanges({
        project,
        eventsFunctionsExtension,
        owner: 'object',
        entity: eventsBasedObject,
        propertiesContainer: eventsBasedObject.getPropertyDescriptors(),
        changes: propertyChanges,
      });
      if (!propertiesResult.success) {
        return makeGenericFailure(propertiesResult.message);
      }
      messages.push(...propertiesResult.messages);
      changedCount += propertiesResult.changedCount;
    }

    messages.push(
      ...applySettingChanges(eventsBasedObject, plannedSettings.changes)
    );
    changedCount += plannedSettings.changes.length;

    let hasCreatedVariant = false;
    for (const plannedVariant of plannedVariants.changes) {
      if (plannedVariant.isDeleted) {
        await onWillDeleteExtensionItem({
          kind: 'custom-object-variant',
          extensionName: extension_name,
          objectName: custom_object_name,
          variantName: plannedVariant.finalName,
        });
        gd.WholeProjectRefactorer.removeEventsBasedObjectVariant(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          plannedVariant.finalName
        );
        messages.push(
          `Deleted the variant "${
            plannedVariant.finalName
          }": the objects using it are back on the default variant.`
        );
      } else {
        createVariant(project, eventsBasedObject, plannedVariant);
        hasCreatedVariant = true;
        messages.push(
          plannedVariant.duplicatedFromVariantName === null
            ? `Created the empty variant "${plannedVariant.finalName}".`
            : `Created the variant "${plannedVariant.finalName}" as a copy of ${
                plannedVariant.duplicatedFromVariantName === ''
                  ? 'the default variant'
                  : `"${plannedVariant.duplicatedFromVariantName}"`
              }.`
        );
        const renameNotice = renamedMessage(
          plannedVariant.requestedName,
          plannedVariant.finalName
        );
        if (renameNotice) messages.push(renameNotice);
      }
      changedCount++;
    }
    if (hasCreatedVariant) {
      // A new variant must hold the same children as the custom object.
      gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
        project,
        eventsBasedObject
      );
    }

    for (const childObjectName of childObjectNames) {
      gd.ChildObjectForwardFunctionGenerator.generateChildObjectForwardFunctions(
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        childObjectName
      );
      changedCount++;
      messages.push(
        `Added the functions forwarding the ones of the child object "${childObjectName}".`
      );
    }

    if (newCustomObjectName) {
      gd.WholeProjectRefactorer.renameEventsBasedObject(
        project,
        eventsFunctionsExtension,
        custom_object_name,
        newCustomObjectName
      );
      eventsBasedObject.setName(newCustomObjectName);
      onProjectItemRenamedOutsideEditor({
        kind: 'custom-object',
        extensionName: extension_name,
        oldName: custom_object_name,
        newName: newCustomObjectName,
      });
      changedCount++;
      messages.push(
        `Renamed "${objectType}" to "${extension_name}::${newCustomObjectName}": the objects using it follow.`
      );
    }

    const customObjectName = newCustomObjectName || custom_object_name;
    const finalObjectType = `${extension_name}::${customObjectName}`;
    if (changedCount === 0) {
      return {
        success: true,
        message: `Nothing to change on the custom object "${finalObjectType}": pass \`changed_settings\`, \`changed_properties\`, \`changed_variants\`, \`forward_child_object_functions\`, \`new_name\` or \`delete_this_custom_object\`.`,
        extensionName: extension_name,
        customObjectName,
        objectType: finalObjectType,
        variantNames: getNamedVariantNames(eventsBasedObject),
        nothingChanged: true,
      };
    }

    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const onlyMetadataChanged =
      propertyChanges.length === 0 &&
      plannedVariants.changes.length === 0 &&
      childObjectNames.length === 0 &&
      !newCustomObjectName &&
      plannedSettings.changes.every(change =>
        METADATA_ONLY_SETTING_NAMES.includes(change.settingName)
      );
    onExtensionsModifiedOutsideEditor({
      extensionNames: [extension_name],
      needsCodeRegeneration: !onlyMetadataChanged,
    });

    return {
      success: true,
      message: messages.join(' '),
      extensionName: extension_name,
      customObjectName,
      objectType: finalObjectType,
      variantNames: getNamedVariantNames(eventsBasedObject),
    };
  },
  modifiesProject: true,
};
