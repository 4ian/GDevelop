// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { mapVector } from '../Utils/MapFor';
import {
  enumerateNamedPropertyDescriptorsList,
  toGdPropertyDescriptor,
} from './EnumerateProperties';
const gd: libGDevelop = global.gd;

// This file contains the logic to declare extension metadata from
// events functions or events based behaviors.
// These are basically adapters from EventsFunctionsExtension, and children, to a
// real extension declaration (like in `JsExtension.js` or `Extension.cpp` files).

/**
 * Declare an extension from an events based extension.
 */
export const declareExtension = (
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  extension
    .setExtensionInformation(
      eventsFunctionsExtension.getName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      eventsFunctionsExtension.getDescription(),
      eventsFunctionsExtension.getAuthor(),
      ''
    )
    .setExtensionHelpPath(eventsFunctionsExtension.getHelpPath())
    .setIconUrl(eventsFunctionsExtension.getIconUrl());

  declareExtensionDependencies(extension, eventsFunctionsExtension);
};

/**
 * Declare the dependencies of an extension from an events based extension.
 */
export const declareExtensionDependencies = (
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) =>
  mapVector<gdDependencyMetadata, void>(
    eventsFunctionsExtension.getAllDependencies(),
    dependency => extension.addDependency().copyFrom(dependency)
  );

const getExtensionIconUrl = (extension: gdPlatformExtension) => {
  return extension.getIconUrl() || 'res/function24.png';
};

/**
 * Declare the behavior for the given
 * events based behavior.
 */
export const declareBehaviorMetadata = (
  extension: gdPlatformExtension,
  eventsBasedBehavior: gdEventsBasedBehavior
): gdBehaviorMetadata => {
  const generatedBehavior = new gd.BehaviorJsImplementation();

  // We enumerate the properties of the behavior from a list of gdNamedPropertyDescriptor
  // to an array of JavaScript objects. This is important to ensure that the functions
  // below are not keeping any reference to eventsBasedBehavior.
  //
  // We could in theory keep a reference to eventsBasedBehavior, and avoid using
  // `enumerateNamedPropertyDescriptorsList` and `toGdPropertyDescriptor`.
  // This should be safe as if eventsBasedBehavior is deleted (i.e: the behavior
  // is removed from its extension), then the extension will be re-generated.
  //
  // In practice, we don't want to risk keeping this references, because if at some point
  // we delete the eventsBasedBehavior and forget to remove the extension, then the
  // extension will use a deleted object and crash the app. Instead, we convert the
  // properties to an array of JavaScript objects, so that we're guaranteed that the
  // lifetime of these properties is the same as the lifetime of these functions (i.e:
  // we use the JS garbage collector).
  const enumeratedProperties = enumerateNamedPropertyDescriptorsList(
    eventsBasedBehavior.getPropertyDescriptors()
  );

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.updateProperty = function(
    behaviorContent: gdSerializerElement,
    propertyName: string,
    newValue: string
  ) {
    const enumeratedProperty = enumeratedProperties.find(
      enumeratedProperty => enumeratedProperty.name === propertyName
    );
    if (!enumeratedProperty) return false;

    const element = behaviorContent.addChild(propertyName);
    const propertyType: string = enumeratedProperty.type;

    if (
      propertyType === 'String' ||
      propertyType === 'Choice' ||
      propertyType === 'Color' ||
      propertyType === 'Behavior'
    ) {
      element.setStringValue(newValue);
    } else if (propertyType === 'Number') {
      element.setDoubleValue(parseFloat(newValue));
    } else if (propertyType === 'Boolean') {
      element.setBoolValue(newValue === '1');
    }

    return true;
  };

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.getProperties = function(behaviorContent) {
    var behaviorProperties = new gd.MapStringPropertyDescriptor();

    enumeratedProperties.forEach(enumeratedProperty => {
      const propertyName = enumeratedProperty.name;
      const propertyType = enumeratedProperty.type;
      const newProperty = toGdPropertyDescriptor(
        enumeratedProperty,
        behaviorProperties.getOrCreate(propertyName)
      );

      if (behaviorContent.hasChild(propertyName)) {
        if (
          propertyType === 'String' ||
          propertyType === 'Choice' ||
          propertyType === 'Color' ||
          propertyType === 'Behavior'
        ) {
          newProperty.setValue(
            behaviorContent.getChild(propertyName).getStringValue()
          );
        } else if (propertyType === 'Number') {
          newProperty.setValue(
            '' + behaviorContent.getChild(propertyName).getDoubleValue()
          );
        } else if (propertyType === 'Boolean') {
          newProperty.setValue(
            behaviorContent.getChild(propertyName).getBoolValue()
              ? 'true'
              : 'false'
          );
        }
      } else {
        // No value was serialized for this property. `newProperty`
        // will have the default value coming from `enumeratedProperty`.
      }
    });

    return behaviorProperties;
  };

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.initializeContent = function(behaviorContent) {
    enumeratedProperties.forEach(enumeratedProperty => {
      const element = behaviorContent.addChild(enumeratedProperty.name);
      const propertyType: string = enumeratedProperty.type;

      if (
        propertyType === 'String' ||
        propertyType === 'Choice' ||
        propertyType === 'Color' ||
        propertyType === 'Behavior'
      ) {
        element.setStringValue(enumeratedProperty.value);
      } else if (propertyType === 'Number') {
        element.setDoubleValue(parseFloat(enumeratedProperty.value) || 0);
      } else if (propertyType === 'Boolean') {
        element.setBoolValue(enumeratedProperty.value === 'true');
      }
    });
  };

  return extension
    .addBehavior(
      eventsBasedBehavior.getName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      eventsBasedBehavior.getName(), // Default name is the name
      eventsBasedBehavior.getDescription(),
      '',
      getExtensionIconUrl(extension),
      eventsBasedBehavior.getName(), // Class name is the name, actually unused
      generatedBehavior,
      new gd.BehaviorsSharedData()
    )
    .setObjectType(eventsBasedBehavior.getObjectType());
};

/**
 * Check if the name of the function is the name of a lifecycle function (for events-based behaviors),
 * that will be called automatically by the game engine.
 */
export const isBehaviorLifecycleEventsFunction = (functionName: string) => {
  return (
    [
      'onCreated',
      'onActivate',
      'onDeActivate',
      'doStepPreEvents',
      'doStepPostEvents',
      'onDestroy',
      // Compatibility with GD <= 5.0 beta 75
      'onOwnerRemovedFromScene',
      // end of compatibility code
    ].indexOf(functionName) !== -1
  );
};

/**
 * Check if the name of the function is the name of a lifecycle function (for events-based extensions),
 * that will be called automatically by the game engine.
 */
export const isExtensionLifecycleEventsFunction = (functionName: string) => {
  return gd.EventsFunctionsExtension.isExtensionLifecycleEventsFunction(
    functionName
  );
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
export const declareInstructionOrExpressionMetadata = (
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction
): gdInstructionMetadata | gdExpressionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return extension.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return extension.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    return extension.addCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  } else {
    return extension.addAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  }
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
export const declareBehaviorInstructionOrExpressionMetadata = (
  extension: gdPlatformExtension,
  behaviorMetadata: gdBehaviorMetadata,
  eventsBasedBehavior: gdEventsBasedBehavior,
  eventsFunction: gdEventsFunction
): gdInstructionMetadata | gdExpressionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return behaviorMetadata.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return behaviorMetadata.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    return behaviorMetadata.addScopedCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  } else {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    return behaviorMetadata.addScopedAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  }
};

type gdInstructionOrExpressionMetadata =
  | gdInstructionMetadata
  | gdExpressionMetadata;

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based behavior.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
export const declareBehaviorPropertiesInstructionAndExpressions = (
  i18n: I18nType,
  extension: gdPlatformExtension,
  behaviorMetadata: gdBehaviorMetadata,
  eventsBasedBehavior: gdEventsBasedBehavior
): void => {
  const addObjectAndBehaviorParameters = <T: gdInstructionOrExpressionMetadata>(
    instructionOrExpression: T
  ): T => {
    // By convention, first parameter is always the object:
    instructionOrExpression.addParameter(
      'object',
      'Object',
      '', // See below for adding the extra information
      false
    );

    // Manually add the "extra info" without relying on addParameter
    // as this method is prefixing the value passed with the extension namespace (this
    // was done to ease extension declarations when dealing with object).
    instructionOrExpression
      .getParameter(instructionOrExpression.getParametersCount() - 1)
      .setExtraInfo(eventsBasedBehavior.getObjectType());

    // By convention, second parameter is always the behavior:
    instructionOrExpression.addParameter(
      'behavior',
      'Behavior',
      eventsBasedBehavior.getName(),
      false
    );

    // All property actions/conditions/expressions are private, meaning
    // they can only be used from the behavior events.
    instructionOrExpression.setPrivate();

    return instructionOrExpression;
  };

  mapVector(eventsBasedBehavior.getPropertyDescriptors(), property => {
    const propertyType = property.getType();
    const propertyName = property.getName();
    const getterName = gd.BehaviorCodeGenerator.getBehaviorPropertyGetterName(
      propertyName
    );
    const setterName = gd.BehaviorCodeGenerator.getBehaviorPropertySetterName(
      propertyName
    );
    const propertyLabel =
      property.getLabel() || i18n._(t`${propertyName} property`);

    if (propertyType === 'String' || propertyType === 'Choice') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addStrExpression(
          gd.EventsBasedBehavior.getPropertyExpressionName(propertyName),
          propertyLabel,
          propertyLabel,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension)
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          i18n._(t`Compare the content of ${propertyLabel}`),
          i18n._(t`the property ${propertyName}`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .useStandardRelationalOperatorParameters('string')
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          i18n._(t`Change the content of ${propertyLabel}`),
          i18n._(t`the property ${propertyName}`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .useStandardOperatorParameters('string')
        .getCodeExtraInformation()
        .setFunctionName(setterName)
        .setManipulatedType('string')
        .setGetter(getterName);
    } else if (propertyType === 'Number') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addExpression(
          gd.EventsBasedBehavior.getPropertyExpressionName(propertyName),
          propertyLabel,
          propertyLabel,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension)
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          i18n._(t`Compare the value of ${propertyLabel}`),
          i18n._(t`the property ${propertyName}`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .useStandardRelationalOperatorParameters('number')
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          i18n._(t`Change the value of ${propertyLabel}`),
          i18n._(t`the property ${propertyName}`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .useStandardOperatorParameters('number')
        .getCodeExtraInformation()
        .setFunctionName(setterName)
        .setGetter(getterName);
    } else if (propertyType === 'Boolean') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          i18n._(t`Check the value of ${propertyLabel}`),
          i18n._(t`Property ${propertyName} of _PARAM0_ is true`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          i18n._(t`Update the value of ${propertyLabel}`),
          i18n._(t`Set property ${propertyName} of _PARAM0_ to _PARAM2_`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .addParameter('yesorno', i18n._(t`New value to set`), '', false)
        .getCodeExtraInformation()
        .setFunctionName(setterName);
    } else if (propertyType === 'Color') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          i18n._(t`Check the color ${propertyLabel}`),
          i18n._(t`Color ${propertyName}`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .useStandardRelationalOperatorParameters('color')
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          i18n._(t`Update the color of ${propertyLabel}`),
          i18n._(t`Change color ${propertyName} of _PARAM0_ to _PARAM2_`),
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          getExtensionIconUrl(extension),
          getExtensionIconUrl(extension)
        )
      )
        .addParameter('color', i18n._(t`New color to set`), '', false)
        .getCodeExtraInformation()
        .setFunctionName(setterName);
    }
  });
};

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
export const declareEventsFunctionParameters = (
  eventsFunction: gdEventsFunction,
  instructionOrExpression: gdInstructionMetadata | gdExpressionMetadata
) => {
  mapVector(
    eventsFunction.getParameters(),
    (parameter: gdParameterMetadata) => {
      if (!parameter.isCodeOnly()) {
        instructionOrExpression.addParameter(
          parameter.getType(),
          parameter.getDescription(),
          '', // See below for adding the extra information
          parameter.isOptional()
        );
        instructionOrExpression.setParameterLongDescription(
          parameter.getLongDescription()
        );
      } else {
        instructionOrExpression.addCodeOnlyParameter(
          parameter.getType(),
          '' // See below for adding the extra information
        );
      }
      // Manually add the "extra info" without relying on addParameter (or addCodeOnlyParameter)
      // as these methods are prefixing the value passed with the extension namespace (this
      // was done to ease extension declarations when dealing with object).
      instructionOrExpression
        .getParameter(instructionOrExpression.getParametersCount() - 1)
        .setExtraInfo(parameter.getExtraInfo());
    }
  );

  // By convention, latest parameter is always the eventsFunctionContext of the calling function
  // (if any).
  instructionOrExpression.addCodeOnlyParameter('eventsFunctionContext', '');
};
