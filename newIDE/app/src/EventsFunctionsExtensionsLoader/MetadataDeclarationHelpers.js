// @flow
import { mapVector } from '../Utils/MapFor';
const gd = global.gd;

// This file contains the logic to declare extension metadata from
// events functions or events based behaviors.
// These are basically adapters from EventsFunctionsExtension, and children, to a
// real extension declaration.

/**
 * Declare an extension from an events based extension
 */
export const declareExtension = (
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  extension.setExtensionInformation(
    eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getFullName() ||
      eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getDescription(),
    '',
    ''
  );
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

  // For now, behavior is empty
  generatedBehavior.updateProperty = function(
    behaviorContent,
    propertyName,
    newValue
  ) {
    return false;
  };

  generatedBehavior.getProperties = function(behaviorContent) {
    var behaviorProperties = new gd.MapStringPropertyDescriptor();
    return behaviorProperties;
  };

  generatedBehavior.initializeContent = function(behaviorContent) {};

  return extension
    .addBehavior(
      eventsBasedBehavior.getName(),
      eventsBasedBehavior.getFullName(),
      eventsBasedBehavior.getName(), // Default name is the name
      eventsBasedBehavior.getDescription(),
      '',
      'res/function24.png',
      eventsBasedBehavior.getName(), // Class name is the name, actually unused
      generatedBehavior,
      new gd.BehaviorsSharedData()
    )
    .setObjectType(eventsBasedBehavior.getObjectType());
};

/**
 * Check if the name of the function is the name of a lifecycle function,
 * that will be called automatically by the game engine.
 */
export const isBehaviorLifecycleFunction = (functionName: string) => {
  return (
    [
      'onCreated',
      'onActivate',
      'onDeActivate',
      'doStepPreEvents',
      'doStepPostEvents',
      'onOwnerRemovedFromScene',
    ].indexOf(functionName) !== -1
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
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return extension.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    return extension.addCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  } else {
    return extension.addAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  }
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
export const declareBehaviorInstructionOrExpressionMetadata = (
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
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return behaviorMetadata.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      'res/function.png'
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
      'res/function.png',
      'res/function24.png'
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
      'res/function.png',
      'res/function24.png'
    );
  }
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
