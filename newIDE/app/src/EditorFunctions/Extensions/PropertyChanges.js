// @flow
import { mapFor } from '../../Utils/MapFor';
import {
  getSafeUniqueName,
  parseBoolean,
  renamedMessage,
  listQuoted,
} from './NameHelpers';

const gd: libGDevelop = global.gd;

/**
 * Where the properties live: the properties of a custom object, the properties
 * of a custom behavior, or its shared properties (one value for all the
 * objects of a scene using the behavior).
 */
export type PropertyOwner = 'object' | 'behavior' | 'behavior-shared';

export type PropertyChoiceSpec = {| value: string, label?: string |};

/** One entry of `changed_properties`: creates, edits or deletes one property. */
export type PropertyChange = {|
  property_name: string,
  new_name?: string,
  delete_this_property?: boolean,
  type?: string,
  label?: string,
  description?: string,
  group?: string,
  default_value?: string,
  extra_info?: string,
  choices?: Array<PropertyChoiceSpec | string> | string,
  hidden?: boolean | string,
  advanced?: boolean | string,
  deprecated?: boolean | string,
  measurement_unit?: string,
  generate_getter_and_setter?: boolean | string,
|};

export type PropertyChangesResult =
  | {| success: true, changedCount: number, messages: Array<string> |}
  | {| success: false, message: string |};

type CommonOptions = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  propertiesContainer: gdPropertiesContainer,
  changes: Array<PropertyChange>,
|};

export type PropertyChangesOptions =
  | {| ...CommonOptions, owner: 'object', entity: gdEventsBasedObject |}
  | {| ...CommonOptions, owner: 'behavior', entity: gdEventsBasedBehavior |}
  | {|
      ...CommonOptions,
      owner: 'behavior-shared',
      entity: gdEventsBasedBehavior,
    |};

// The types offered by the properties editor, per owner.
const COMMON_PROPERTY_TYPES = [
  'Number',
  'String',
  'Boolean',
  'Choice',
  'NumberWithChoices',
  'Color',
  'MultilineString',
  'Resource',
];

export const getAllowedPropertyTypes = (
  owner: PropertyOwner
): Array<string> => {
  if (owner === 'object') return [...COMMON_PROPERTY_TYPES, 'LeaderboardId'];
  if (owner === 'behavior') {
    return [
      ...COMMON_PROPERTY_TYPES,
      'Layer',
      'ObjectAnimationName',
      'KeyboardKey',
      'Behavior',
    ];
  }
  return [...COMMON_PROPERTY_TYPES, 'Layer'];
};

const OWNER_LABELS: { [PropertyOwner]: string } = {
  object: 'a custom object property',
  behavior: 'a custom behavior property',
  'behavior-shared': 'a custom behavior shared property',
};

const CHOICE_TYPES = ['Choice', 'NumberWithChoices'];

// Names kept for the serialization of the properties themselves.
const PROTECTED_PROPERTY_NAMES = ['name', 'type'];

const getPropertyNames = (
  propertiesContainer: gdPropertiesContainer
): Array<string> =>
  mapFor(0, propertiesContainer.getCount(), index =>
    propertiesContainer.getAt(index).getName()
  );

const getMeasurementUnitNames = (): Array<string> =>
  mapFor(0, gd.MeasurementUnit.getDefaultMeasurementUnitsCount(), index =>
    gd.MeasurementUnit.getDefaultMeasurementUnitAtIndex(index).getName()
  );

const setExtraInfoString = (
  property: gdNamedPropertyDescriptor,
  value: string
) => {
  const vectorString = new gd.VectorString();
  vectorString.push_back(value);
  property.setExtraInfo(vectorString);
  vectorString.delete();
};

const getExtraInfoString = (property: gdNamedPropertyDescriptor): string => {
  const extraInfo = property.getExtraInfo();
  return extraInfo.size() > 0 ? extraInfo.at(0) : '';
};

const capitalizeFirstLetter = (name: string): string =>
  name.charAt(0).toUpperCase() + name.slice(1);

// The refactorings and generators to run, which depend on the owner of the
// properties.
type PropertyOperations = {|
  renameProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  canGenerateGetterAndSetter: (property: gdNamedPropertyDescriptor) => boolean,
  generateGetterAndSetter: (property: gdNamedPropertyDescriptor) => void,
|};

const makePropertyOperations = (
  options: PropertyChangesOptions
): PropertyOperations => {
  const { project, eventsFunctionsExtension } = options;
  if (options.owner === 'object') {
    const eventsBasedObject = options.entity;
    return {
      renameProperty: (oldName, newName) =>
        gd.WholeProjectRefactorer.renameEventsBasedObjectProperty(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          oldName,
          newName
        ),
      onPropertyTypeChanged: propertyName =>
        gd.WholeProjectRefactorer.changeEventsBasedObjectPropertyType(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          propertyName
        ),
      canGenerateGetterAndSetter: property =>
        gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
          eventsBasedObject,
          property
        ),
      generateGetterAndSetter: property =>
        gd.PropertyFunctionGenerator.generateObjectGetterAndSetter(
          project,
          eventsFunctionsExtension,
          eventsBasedObject,
          property
        ),
    };
  }
  const eventsBasedBehavior = options.entity;
  const isSharedProperties = options.owner === 'behavior-shared';
  return {
    renameProperty: (oldName, newName) =>
      isSharedProperties
        ? gd.WholeProjectRefactorer.renameEventsBasedBehaviorSharedProperty(
            project,
            eventsFunctionsExtension,
            eventsBasedBehavior,
            oldName,
            newName
          )
        : gd.WholeProjectRefactorer.renameEventsBasedBehaviorProperty(
            project,
            eventsFunctionsExtension,
            eventsBasedBehavior,
            oldName,
            newName
          ),
    onPropertyTypeChanged: propertyName => {
      // No refactorer for shared properties: nothing else refers to their type.
      if (isSharedProperties) return;
      gd.WholeProjectRefactorer.changeEventsBasedBehaviorPropertyType(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        propertyName
      );
    },
    canGenerateGetterAndSetter: property =>
      gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
        eventsBasedBehavior,
        property
      ),
    generateGetterAndSetter: property =>
      gd.PropertyFunctionGenerator.generateBehaviorGetterAndSetter(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        property,
        isSharedProperties
      ),
  };
};

// A change checked against the properties: what to do once every change of the
// call has been validated.
type PlannedPropertyChange = {|
  change: PropertyChange,
  isNew: boolean,
  currentName: string,
  finalName: string,
  isDeleted: boolean,
  type: string | null,
  choices: Array<PropertyChoiceSpec> | null,
  hidden: boolean | null,
  advanced: boolean | null,
  deprecated: boolean | null,
  generateGetterAndSetter: boolean,
  renameNotice: string | null,
|};

const makeFailure = (
  message: string
): {| success: false, message: string |} => ({ success: false, message });

type ParsedChoices =
  | {| success: true, choices: Array<PropertyChoiceSpec> |}
  | {| success: false, message: string |};

const parseChoices = (
  rawChoices: Array<PropertyChoiceSpec | string> | string,
  propertyName: string
): ParsedChoices => {
  if (typeof rawChoices === 'string') {
    return {
      success: true,
      choices: rawChoices
        .split(',')
        .map(value => value.trim())
        .filter(value => value !== '')
        .map(value => ({ value })),
    };
  }
  if (!Array.isArray(rawChoices)) {
    return {
      success: false,
      message:
        `\`choices\` of "${propertyName}" must be a comma-separated string ` +
        `("Small,Medium") or a list of { value, label } objects.`,
    };
  }
  const choices: Array<PropertyChoiceSpec> = [];
  for (const rawChoice of rawChoices) {
    if (typeof rawChoice === 'string') {
      if (rawChoice.trim() !== '') choices.push({ value: rawChoice.trim() });
      continue;
    }
    if (
      !rawChoice ||
      typeof rawChoice !== 'object' ||
      typeof rawChoice.value !== 'string'
    ) {
      return {
        success: false,
        message:
          `Each choice of "${propertyName}" must be a string or an object ` +
          `like { value: "small", label: "Small" }.`,
      };
    }
    choices.push(
      typeof rawChoice.label === 'string'
        ? { value: rawChoice.value, label: rawChoice.label }
        : { value: rawChoice.value }
    );
  }
  return { success: true, choices };
};

/**
 * Create, edit and delete the properties of a custom object or behavior.
 * Every change is checked first: nothing is applied when one of them is
 * refused, so a call never leaves the properties half-changed.
 */
export const applyPropertyChanges = (
  options: PropertyChangesOptions
): PropertyChangesResult => {
  const { owner, propertiesContainer, changes } = options;
  const allowedTypes = getAllowedPropertyTypes(owner);
  const existingNames = new Set(getPropertyNames(propertiesContainer));
  // The type of the properties created or renamed by an earlier entry of the
  // same call (they are not in the container yet).
  const plannedTypes: Map<string, string> = new Map();
  const plannedChanges: Array<PlannedPropertyChange> = [];

  for (const change of changes) {
    const {
      new_name: requestedNewName,
      type: requestedType,
      extra_info: requestedExtraInfo,
      choices: requestedChoices,
      measurement_unit: requestedMeasurementUnit,
    } = change;
    const propertyName =
      typeof change.property_name === 'string'
        ? change.property_name.trim()
        : '';
    if (!propertyName) {
      return makeFailure(
        'Each entry of `changed_properties` needs a `property_name`: the name of the property to create, edit or delete.'
      );
    }
    const isExisting = existingNames.has(propertyName);

    if (change.delete_this_property) {
      if (!isExisting) {
        return makeFailure(
          `Property "${propertyName}" not found: it cannot be deleted. Existing properties: ${listQuoted(
            Array.from(existingNames)
          )}.`
        );
      }
      existingNames.delete(propertyName);
      plannedChanges.push({
        change,
        isNew: false,
        currentName: propertyName,
        finalName: propertyName,
        isDeleted: true,
        type: null,
        choices: null,
        hidden: null,
        advanced: null,
        deprecated: null,
        generateGetterAndSetter: false,
        renameNotice: null,
      });
      continue;
    }

    // The type of the property once the change is applied.
    let type = null;
    if (requestedType !== undefined) {
      if (
        typeof requestedType !== 'string' ||
        !allowedTypes.includes(requestedType)
      ) {
        return makeFailure(
          `Type "${String(requestedType)}" is not allowed for ${
            OWNER_LABELS[owner]
          }. Allowed types: ${listQuoted(allowedTypes)}.`
        );
      }
      type = requestedType;
    }
    const existingProperty =
      isExisting && propertiesContainer.has(propertyName)
        ? propertiesContainer.get(propertyName)
        : null;
    const finalType =
      type ||
      plannedTypes.get(propertyName) ||
      (existingProperty && existingProperty.getType()) ||
      'Number';

    if (
      finalType === 'Behavior' &&
      !requestedExtraInfo &&
      (!existingProperty || getExtraInfoString(existingProperty) === '')
    ) {
      return makeFailure(
        `A "Behavior" property needs \`extra_info\` with the type of the required behavior, like "MyExtension::MyBehavior".`
      );
    }

    let choices = null;
    if (requestedChoices !== undefined) {
      if (!CHOICE_TYPES.includes(finalType)) {
        return makeFailure(
          `\`choices\` can only be given for a "Choice" or "NumberWithChoices" property, but "${propertyName}" is of type "${finalType}": pass \`type\` too.`
        );
      }
      const parsedChoices = parseChoices(requestedChoices, propertyName);
      if (!parsedChoices.success) return makeFailure(parsedChoices.message);
      choices = parsedChoices.choices;
    }

    if (
      requestedExtraInfo !== undefined &&
      typeof requestedExtraInfo !== 'string'
    ) {
      return makeFailure(
        `\`extra_info\` of "${propertyName}" must be a string: the required behavior type for a "Behavior" property, the resource kind ("json", "image"...) for a "Resource" property.`
      );
    }

    if (requestedMeasurementUnit !== undefined) {
      if (
        typeof requestedMeasurementUnit !== 'string' ||
        !gd.MeasurementUnit.hasDefaultMeasurementUnitNamed(
          requestedMeasurementUnit
        )
      ) {
        return makeFailure(
          `Measurement unit "${String(
            requestedMeasurementUnit
          )}" does not exist. Existing measurement units: ${listQuoted(
            getMeasurementUnitNames()
          )}.`
        );
      }
    }

    const booleanFields = [
      { value: change.hidden, name: 'hidden' },
      { value: change.advanced, name: 'advanced' },
      { value: change.deprecated, name: 'deprecated' },
      {
        value: change.generate_getter_and_setter,
        name: 'generate_getter_and_setter',
      },
    ];
    const parsedBooleans: Array<boolean | null> = [];
    for (const booleanField of booleanFields) {
      if (booleanField.value === undefined) {
        parsedBooleans.push(null);
        continue;
      }
      const parsedBoolean = parseBoolean(booleanField.value, booleanField.name);
      if (!parsedBoolean.success) return makeFailure(parsedBoolean.message);
      parsedBooleans.push(parsedBoolean.value);
    }
    const [
      hidden,
      advanced,
      deprecated,
      generateGetterAndSetter,
    ] = parsedBooleans;

    // The name of the property once the change is applied.
    let finalName = propertyName;
    let renameNotice = null;
    if (!isExisting) {
      finalName = getSafeUniqueName(
        propertyName,
        name =>
          existingNames.has(name) || PROTECTED_PROPERTY_NAMES.includes(name)
      );
      renameNotice = renamedMessage(propertyName, finalName);
      existingNames.add(finalName);
    } else if (requestedNewName !== undefined) {
      if (
        typeof requestedNewName !== 'string' ||
        requestedNewName.trim() === ''
      ) {
        return makeFailure(
          `\`new_name\` of "${propertyName}" must be a non-empty name.`
        );
      }
      const newName = requestedNewName.trim();
      finalName = getSafeUniqueName(
        newName,
        name =>
          (name !== propertyName && existingNames.has(name)) ||
          PROTECTED_PROPERTY_NAMES.includes(name)
      );
      renameNotice = renamedMessage(newName, finalName);
      existingNames.delete(propertyName);
      existingNames.add(finalName);
    }
    plannedTypes.delete(propertyName);
    plannedTypes.set(finalName, finalType);

    plannedChanges.push({
      change,
      isNew: !isExisting,
      currentName: propertyName,
      finalName,
      isDeleted: false,
      type,
      choices,
      hidden,
      advanced,
      deprecated,
      generateGetterAndSetter: !!generateGetterAndSetter,
      renameNotice,
    });
  }

  return applyPlannedChanges(options, plannedChanges);
};

const applyPlannedChanges = (
  options: PropertyChangesOptions,
  plannedChanges: Array<PlannedPropertyChange>
): PropertyChangesResult => {
  const { propertiesContainer } = options;
  const operations = makePropertyOperations(options);
  const messages: Array<string> = [];
  let changedCount = 0;

  for (const plannedChange of plannedChanges) {
    const { change, currentName, finalName } = plannedChange;
    const {
      extra_info: extraInfo,
      label,
      description,
      group,
      default_value: defaultValue,
      measurement_unit: measurementUnit,
    } = change;
    const { choices, hidden, advanced, deprecated } = plannedChange;

    if (plannedChange.isDeleted) {
      propertiesContainer.remove(currentName);
      changedCount++;
      messages.push(
        `Deleted property "${currentName}": the events and expressions still reading or setting it are now invalid - update them, or create the property again.`
      );
      continue;
    }

    const details: Array<string> = [];
    let property;
    if (plannedChange.isNew) {
      property = propertiesContainer.insertNew(
        finalName,
        propertiesContainer.getCount()
      );
      property.setType(plannedChange.type || 'Number');
      details.push(`type "${property.getType()}"`);
    } else {
      property = propertiesContainer.get(currentName);
      if (finalName !== currentName) {
        operations.renameProperty(currentName, finalName);
        property.setName(finalName);
        details.push(`renamed from "${currentName}"`);
      }
      const type = plannedChange.type;
      if (type && type !== property.getType()) {
        property.setType(type);
        operations.onPropertyTypeChanged(finalName);
        details.push(`type set to "${type}"`);
      }
    }

    if (
      property.getType() === 'Resource' &&
      extraInfo === undefined &&
      getExtraInfoString(property) === ''
    ) {
      setExtraInfoString(property, 'json');
    }
    if (typeof extraInfo === 'string') {
      setExtraInfoString(property, extraInfo);
      details.push(`extra info "${extraInfo}"`);
    }
    if (choices) {
      property.clearChoices();
      for (const choice of choices) {
        property.addChoice(choice.value, choice.label || choice.value);
      }
      details.push(`${choices.length} choices`);
    }
    if (typeof label === 'string') {
      property.setLabel(label);
      details.push('label');
    }
    if (typeof description === 'string') {
      property.setDescription(description);
      details.push('description');
    }
    if (typeof group === 'string') {
      property.setGroup(group);
      details.push('group');
    }
    if (typeof defaultValue === 'string') {
      property.setValue(defaultValue);
      details.push(`default value "${defaultValue}"`);
    }
    if (hidden !== null) {
      property.setHidden(hidden);
      details.push(hidden ? 'hidden' : 'visible');
    }
    if (advanced !== null) {
      property.setAdvanced(advanced);
      details.push(advanced ? 'advanced' : 'not advanced');
    }
    if (deprecated !== null) {
      property.setDeprecated(deprecated);
      details.push(deprecated ? 'deprecated' : 'not deprecated');
    }
    if (typeof measurementUnit === 'string') {
      property.setMeasurementUnit(
        gd.MeasurementUnit.getDefaultMeasurementUnitByName(measurementUnit)
      );
      details.push(`measurement unit "${measurementUnit}"`);
    }
    if (property.getType() === 'Behavior' && property.isHidden()) {
      // A required behavior is picked on the object in the editor: hiding it
      // would leave it empty.
      property.setHidden(false);
      details.push('visible (a required behavior is always shown)');
    }

    if (details.length > 0) {
      changedCount++;
      messages.push(
        plannedChange.isNew
          ? `Created property "${finalName}" (${details.join(', ')}).`
          : `Property "${finalName}": ${details.join(', ')}.`
      );
    }
    if (plannedChange.renameNotice) messages.push(plannedChange.renameNotice);

    if (plannedChange.generateGetterAndSetter) {
      if (operations.canGenerateGetterAndSetter(property)) {
        operations.generateGetterAndSetter(property);
        changedCount++;
        messages.push(
          `Generated the functions "${capitalizeFirstLetter(
            finalName
          )}" and "Set${capitalizeFirstLetter(finalName)}" for "${finalName}".`
        );
      } else {
        messages.push(
          `No getter and setter generated for "${finalName}": functions named "${capitalizeFirstLetter(
            finalName
          )}" or "Set${capitalizeFirstLetter(
            finalName
          )}" already exist, or the type "${property.getType()}" is not a number, a string or a boolean.`
        );
      }
    }
  }

  return { success: true, changedCount, messages };
};
