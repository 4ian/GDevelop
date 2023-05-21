// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { mapVector } from '../Utils/MapFor';
import { getFreeFunctionCodeName } from '.';
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
  const fullName =
    eventsFunctionsExtension.getFullName() ||
    eventsFunctionsExtension.getName();
  extension
    .setExtensionInformation(
      eventsFunctionsExtension.getName(),
      fullName,
      eventsFunctionsExtension.getDescription(),
      eventsFunctionsExtension.getAuthor(),
      ''
    )
    .setExtensionHelpPath(eventsFunctionsExtension.getHelpPath())
    .setIconUrl(eventsFunctionsExtension.getIconUrl());

  if (fullName) {
    extension
      .addInstructionOrExpressionGroupMetadata(fullName)
      .setIcon(eventsFunctionsExtension.getIconUrl());
  }

  if (eventsFunctionsExtension.getCategory())
    extension.setCategory(eventsFunctionsExtension.getCategory());

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
  const behaviorMetadata = extension
    .addEventsBasedBehavior(
      eventsBasedBehavior.getName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      eventsBasedBehavior.getDescription(),
      '',
      getExtensionIconUrl(extension)
    )
    .setObjectType(eventsBasedBehavior.getObjectType());

  if (eventsBasedBehavior.isPrivate()) behaviorMetadata.setPrivate();

  return behaviorMetadata;
};

/**
 * Declare the object for the given
 * events based object.
 */
export const declareObjectMetadata = (
  i18n: I18nType,
  extension: gdPlatformExtension,
  eventsBasedObject: gdEventsBasedObject
): gdObjectMetadata => {
  const objectMetadata = extension
    .addEventsBasedObject(
      eventsBasedObject.getName(),
      eventsBasedObject.getFullName() || eventsBasedObject.getName(),
      eventsBasedObject.getDescription(),
      getExtensionIconUrl(extension)
    )
    // TODO Change the metadata model to only set a category on the extension.
    // If an extension has behavior or object across several categories,
    // we can assume it's not scoped correctly.
    // Note: We shouldn't rely on gdPlatformExtension but this line will
    // be removed soon.
    .setCategoryFullName(extension.getCategory());

  // TODO EBO Use full type to identify object to avoid collision.
  // Objects are identified by their name alone.
  const objectType = eventsBasedObject.getName();

  objectMetadata
    .addScopedAction(
      'Width',
      i18n._('Width'),
      i18n._('Change the width of an object.'),
      i18n._('the width'),
      i18n._('Size'),
      'res/actions/scaleWidth24_black.png',
      'res/actions/scale_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setWidth')
    .setGetter('getWidth');

  // Deprecated
  objectMetadata
    .addAction(
      'Width',
      i18n._('Width'),
      i18n._('Change the width of an object.'),
      i18n._('the width'),
      i18n._('Size'),
      'res/actions/scaleWidth24_black.png',
      'res/actions/scale_black.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setWidth')
    .setGetter('getWidth');

  objectMetadata
    .addScopedAction(
      'Height',
      i18n._('Height'),
      i18n._('Change the height of an object.'),
      i18n._('the height'),
      i18n._('Size'),
      'res/actions/scaleHeight24_black.png',
      'res/actions/scale_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setHeight')
    .setGetter('getHeight');

  // Deprecated
  objectMetadata
    .addAction(
      'Height',
      i18n._('Height'),
      i18n._('Change the height of an object.'),
      i18n._('the height'),
      i18n._('Size'),
      'res/actions/scaleHeight24_black.png',
      'res/actions/scale_black.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setHeight')
    .setGetter('getHeight');

  objectMetadata
    .addScopedAction(
      'Scale',
      i18n._('Scale'),
      i18n._('Modify the scale of the specified object.'),
      i18n._('the scale'),
      i18n._('Size'),
      'res/actions/scale24_black.png',
      'res/actions/scale_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setScale')
    .setGetter('getScale');

  // Deprecated
  objectMetadata
    .addAction(
      'Scale',
      i18n._('Scale'),
      i18n._('Modify the scale of the specified object.'),
      i18n._('the scale'),
      i18n._('Size'),
      'res/actions/scale24_black.png',
      'res/actions/scale_black.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardOperatorParameters(
      'number',
      gd.ParameterOptions.makeNewOptions()
    )
    .markAsAdvanced()
    .getCodeExtraInformation()
    .setFunctionName('setScale')
    .setGetter('getScale');

  objectMetadata
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleX',
      i18n._('Scale on X axis'),
      i18n._("the width's scale of an object"),
      i18n._("the width's scale"),
      i18n._('Size'),
      'res/actions/scaleWidth24_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .markAsAdvanced()
    .setFunctionName('setScaleX')
    .setGetter('getScaleX');

  objectMetadata
    .addExpressionAndConditionAndAction(
      'number',
      'ScaleY',
      i18n._('Scale on Y axis'),
      i18n._("the height's scale of an object"),
      i18n._("the height's scale"),
      i18n._('Size'),
      'res/actions/scaleHeight24_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .markAsAdvanced()
    .setFunctionName('setScaleY')
    .setGetter('getScaleY');

  objectMetadata
    .addScopedAction(
      'FlipX',
      i18n._('Flip the object horizontally'),
      i18n._('Flip the object horizontally'),
      i18n._('Flip horizontally _PARAM0_: _PARAM1_'),
      i18n._('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .addParameter('yesorno', i18n._('Activate flipping'))
    .markAsSimple()
    .getCodeExtraInformation()
    .setFunctionName('flipX');

  // Deprecated
  objectMetadata
    .addAction(
      'FlipX',
      i18n._('Flip the object horizontally'),
      i18n._('Flip the object horizontally'),
      i18n._('Flip horizontally _PARAM0_: _PARAM1_'),
      i18n._('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .addParameter('yesorno', i18n._('Activate flipping'))
    .markAsSimple()
    .getCodeExtraInformation()
    .setFunctionName('flipX');

  objectMetadata
    .addScopedAction(
      'FlipY',
      i18n._('Flip the object vertically'),
      i18n._('Flip the object vertically'),
      i18n._('Flip vertically _PARAM0_: _PARAM1_'),
      i18n._('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .addParameter('yesorno', i18n._('Activate flipping'))
    .markAsSimple()
    .getCodeExtraInformation()
    .setFunctionName('flipY');

  objectMetadata
    .addAction(
      'FlipY',
      i18n._('Flip the object vertically'),
      i18n._('Flip the object vertically'),
      i18n._('Flip vertically _PARAM0_: _PARAM1_'),
      i18n._('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .addParameter('yesorno', i18n._('Activate flipping'))
    .markAsSimple()
    .getCodeExtraInformation()
    .setFunctionName('flipY');

  objectMetadata
    .addScopedCondition(
      'FlippedX',
      i18n._('Horizontally flipped'),
      i18n._('Check if the object is horizontally flipped'),
      i18n._('_PARAM0_ is horizontally flipped'),
      i18n._('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .getCodeExtraInformation()
    .setFunctionName('isFlippedX');

  // Deprecated
  objectMetadata
    .addCondition(
      'FlippedX',
      i18n._('Horizontally flipped'),
      i18n._('Check if the object is horizontally flipped'),
      i18n._('_PARAM0_ is horizontally flipped'),
      i18n._('Effects'),
      'res/actions/flipX24.png',
      'res/actions/flipX.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .getCodeExtraInformation()
    .setFunctionName('isFlippedX');

  objectMetadata
    .addScopedCondition(
      'FlippedY',
      i18n._('Vertically flipped'),
      i18n._('Check if the object is vertically flipped'),
      i18n._('_PARAM0_ is vertically flipped'),
      i18n._('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .getCodeExtraInformation()
    .setFunctionName('isFlippedY');

  // Deprecated
  objectMetadata
    .addCondition(
      'FlippedY',
      i18n._('Vertically flipped'),
      i18n._('Check if the object is vertically flipped'),
      i18n._('_PARAM0_ is vertically flipped'),
      i18n._('Effects'),
      'res/actions/flipY24.png',
      'res/actions/flipY.png'
    )
    .setHidden()
    .addParameter('object', i18n._('Object'), objectType)
    .getCodeExtraInformation()
    .setFunctionName('isFlippedY');

  objectMetadata
    .addExpressionAndConditionAndAction(
      'number',
      'Opacity',
      i18n._('Opacity'),
      i18n._(
        'the opacity of an object, between 0 (fully transparent) to 255 (opaque)'
      ),
      i18n._('the opacity'),
      i18n._('Visibility'),
      'res/conditions/opacity24.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
    .setFunctionName('setOpacity')
    .setGetter('getOpacity');

  return objectMetadata;
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
 * Check if the name of the function is the name of a lifecycle function (for events-based objects),
 * that will be called automatically by the game engine.
 */
export const isObjectLifecycleEventsFunction = (functionName: string) => {
  return (
    ['onCreated', 'doStepPostEvents', 'onDestroy', 'onHotReloading'].indexOf(
      functionName
    ) !== -1
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

const removeTrailingDot = (description: string): string => {
  return description.endsWith('.')
    ? description.slice(0, description.length - 1)
    : description;
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
export const declareInstructionOrExpressionMetadata = (
  extension: gdPlatformExtension,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsFunction: gdEventsFunction
):
  | gdInstructionMetadata
  | gdExpressionMetadata
  | gdMultipleInstructionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    if (eventsFunction.getExpressionType().isNumber()) {
      return extension.addExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() || '',
        getExtensionIconUrl(extension)
      );
    } else {
      return extension.addStrExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() || '',
        getExtensionIconUrl(extension)
      );
    }
  } else if (functionType === gd.EventsFunction.ExpressionAndCondition) {
    return extension.addExpressionAndCondition(
      gd.ValueTypeMetadata.getPrimitiveValueType(
        eventsFunction.getExpressionType().getName()
      ),
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      removeTrailingDot(eventsFunction.getDescription()) ||
        eventsFunction.getFullName(),
      // An operator and an operand are inserted before user parameters.
      shiftSentenceParamIndexes(eventsFunction.getSentence(), 2),
      eventsFunction.getGroup() || '',
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.ActionWithOperator) {
    const getterFunction = eventsFunctionsExtension.hasEventsFunctionNamed(
      eventsFunction.getGetterName()
    )
      ? eventsFunctionsExtension.getEventsFunction(
          eventsFunction.getGetterName()
        )
      : null;
    const action = extension.addAction(
      eventsFunction.getName(),
      (getterFunction && getterFunction.getFullName()) ||
        eventsFunction.getName(),
      'Change ' +
        ((getterFunction && getterFunction.getDescription()) ||
          eventsFunction.getFullName()),
      // An operator and an operand are inserted before user parameters.
      getterFunction
        ? shiftSentenceParamIndexes(getterFunction.getSentence(), 2)
        : '',
      (getterFunction && getterFunction.getGroup()) || '',
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
    if (getterFunction) {
      action
        .getCodeExtraInformation()
        .setManipulatedType(
          gd.ValueTypeMetadata.getPrimitiveValueType(
            getterFunction.getExpressionType().getName()
          )
        )
        // TODO Use an helper method
        .setGetter(
          getFreeFunctionCodeName(eventsFunctionsExtension, getterFunction)
        );
    }
    return action;
  } else if (functionType === gd.EventsFunction.Condition) {
    return extension.addCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunction.getGroup() || '',
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  } else {
    return extension.addAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunction.getGroup() || '',
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  }
};

export const shiftSentenceParamIndexes = (
  sentence: string,
  offset: number
): string => {
  const parameterIndexesStrings = sentence.match(/_PARAM\d+_/g);
  if (!parameterIndexesStrings) {
    return sentence;
  }
  const parameterIndexes = parameterIndexesStrings.map(indexString =>
    Number.parseInt(
      indexString.substring('_PARAM'.length, indexString.length - '_'.length)
    )
  );
  const sentenceElements = sentence.split(/_PARAM\d+_/);
  let shiftedSentence = '';
  for (let index = 0; index < parameterIndexes.length; index++) {
    shiftedSentence +=
      sentenceElements[index] +
      '_PARAM' +
      (parameterIndexes[index] + offset) +
      '_';
  }
  const sentenceIsEndingWithAnElement =
    sentenceElements.length > parameterIndexes.length;
  if (sentenceIsEndingWithAnElement) {
    shiftedSentence += sentenceElements[sentenceElements.length - 1];
  }
  return shiftedSentence;
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
):
  | gdInstructionMetadata
  | gdExpressionMetadata
  | gdMultipleInstructionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    if (eventsFunction.getExpressionType().isNumber()) {
      return behaviorMetadata.addExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() ||
          eventsBasedBehavior.getFullName() ||
          eventsBasedBehavior.getName(),
        getExtensionIconUrl(extension)
      );
    } else {
      return behaviorMetadata.addStrExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() ||
          eventsBasedBehavior.getFullName() ||
          eventsBasedBehavior.getName(),
        getExtensionIconUrl(extension)
      );
    }
  } else if (functionType === gd.EventsFunction.ExpressionAndCondition) {
    return behaviorMetadata.addExpressionAndCondition(
      gd.ValueTypeMetadata.getPrimitiveValueType(
        eventsFunction.getExpressionType().getName()
      ),
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      removeTrailingDot(eventsFunction.getDescription()) ||
        eventsFunction.getFullName(),
      // An operator and an operand are inserted before user parameters.
      shiftSentenceParamIndexes(eventsFunction.getSentence(), 2),
      eventsFunction.getGroup() ||
        eventsBasedBehavior.getFullName() ||
        eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.ActionWithOperator) {
    const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
    const getterFunction = eventsFunctionsContainer.hasEventsFunctionNamed(
      eventsFunction.getGetterName()
    )
      ? eventsFunctionsContainer.getEventsFunction(
          eventsFunction.getGetterName()
        )
      : null;
    const action = behaviorMetadata.addScopedAction(
      eventsFunction.getName(),
      (getterFunction && getterFunction.getFullName()) ||
        eventsFunction.getName(),
      'Change ' +
        ((getterFunction && getterFunction.getDescription()) ||
          eventsFunction.getFullName()),
      // An operator and an operand are inserted before user parameters.
      getterFunction
        ? shiftSentenceParamIndexes(getterFunction.getSentence(), 2)
        : '',
      (getterFunction && getterFunction.getGroup()) ||
        eventsBasedBehavior.getFullName() ||
        eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
    if (getterFunction) {
      action
        .getCodeExtraInformation()
        .setManipulatedType(
          gd.ValueTypeMetadata.getPrimitiveValueType(
            getterFunction.getExpressionType().getName()
          )
        )
        .setGetter(getterFunction.getName());
    }
    return action;
  } else if (functionType === gd.EventsFunction.Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    return behaviorMetadata.addScopedCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunction.getGroup() ||
        eventsBasedBehavior.getFullName() ||
        eventsBasedBehavior.getName(),
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
      eventsFunction.getGroup() ||
        eventsBasedBehavior.getFullName() ||
        eventsBasedBehavior.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  }
};

/**
 * Declare the instruction (action/condition) or expression for the given
 * object events function.
 */
export const declareObjectInstructionOrExpressionMetadata = (
  extension: gdPlatformExtension,
  objectMetadata: gdObjectMetadata,
  eventsBasedObject: gdEventsBasedObject,
  eventsFunction: gdEventsFunction
):
  | gdInstructionMetadata
  | gdExpressionMetadata
  | gdMultipleInstructionMetadata => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    if (eventsFunction.getExpressionType().isNumber()) {
      return objectMetadata.addExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() ||
          eventsBasedObject.getFullName() ||
          eventsBasedObject.getName(),
        getExtensionIconUrl(extension)
      );
    } else {
      return objectMetadata.addStrExpression(
        eventsFunction.getName(),
        eventsFunction.getFullName() || eventsFunction.getName(),
        eventsFunction.getDescription() || eventsFunction.getFullName(),
        eventsFunction.getGroup() ||
          eventsBasedObject.getFullName() ||
          eventsBasedObject.getName(),
        getExtensionIconUrl(extension)
      );
    }
  } else if (functionType === gd.EventsFunction.ExpressionAndCondition) {
    return objectMetadata.addExpressionAndCondition(
      gd.ValueTypeMetadata.getPrimitiveValueType(
        eventsFunction.getExpressionType().getName()
      ),
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      removeTrailingDot(eventsFunction.getDescription()) ||
        eventsFunction.getFullName(),
      // An operator and an operand are inserted before user parameters.
      shiftSentenceParamIndexes(eventsFunction.getSentence(), 2),
      eventsFunction.getGroup() ||
        eventsBasedObject.getFullName() ||
        eventsBasedObject.getName(),
      getExtensionIconUrl(extension)
    );
  } else if (functionType === gd.EventsFunction.ActionWithOperator) {
    const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
    const getterFunction = eventsFunctionsContainer.hasEventsFunctionNamed(
      eventsFunction.getGetterName()
    )
      ? eventsFunctionsContainer.getEventsFunction(
          eventsFunction.getGetterName()
        )
      : null;
    const action = objectMetadata.addScopedAction(
      eventsFunction.getName(),
      (getterFunction && getterFunction.getFullName()) ||
        eventsFunction.getName(),
      'Change ' +
        ((getterFunction && getterFunction.getDescription()) ||
          eventsFunction.getFullName()),
      // An operator and an operand are inserted before user parameters.
      getterFunction
        ? shiftSentenceParamIndexes(getterFunction.getSentence(), 2)
        : '',
      (getterFunction && getterFunction.getGroup()) ||
        eventsBasedObject.getFullName() ||
        eventsBasedObject.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
    if (getterFunction) {
      action
        .getCodeExtraInformation()
        .setManipulatedType(
          gd.ValueTypeMetadata.getPrimitiveValueType(
            getterFunction.getExpressionType().getName()
          )
        )
        .setGetter(getterFunction.getName());
    }
    return action;
  } else if (functionType === gd.EventsFunction.Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // objects (that can totally have functions with the same name).
    return objectMetadata.addScopedCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunction.getGroup() ||
        eventsBasedObject.getFullName() ||
        eventsBasedObject.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  } else {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // objects (that can totally have functions with the same name).
    return objectMetadata.addScopedAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunction.getGroup() ||
        eventsBasedObject.getFullName() ||
        eventsBasedObject.getName(),
      getExtensionIconUrl(extension),
      getExtensionIconUrl(extension)
    );
  }
};

type gdInstructionOrExpressionMetadata =
  | gdInstructionMetadata
  | gdExpressionMetadata
  | gdMultipleInstructionMetadata;

const getStringifiedExtraInfo = (property: gdPropertyDescriptor) => {
  return property.getType() === 'Choice'
    ? JSON.stringify(property.getExtraInfo().toJSArray())
    : '';
};

const uncapitalizedFirstLetter = (string: string): string =>
  string.length < 1
    ? string
    : string.substring(0, 1).toLowerCase() + string.substring(1);

const declarePropertyInstructionAndExpression = (
  i18n: I18nType,
  extension: gdPlatformExtension,
  entityMetadata: gdBehaviorMetadata | gdObjectMetadata,
  eventsBasedEntity: gdEventsBasedBehavior | gdEventsBasedObject,
  property: gdNamedPropertyDescriptor,
  propertyLabel: string,
  expressionName: string,
  conditionName: string,
  actionName: string,
  toggleActionName: string,
  setterName: string,
  getterName: string,
  toggleFunctionName: string,
  valueParameterIndex: number,
  addObjectAndBehaviorParameters: <T: gdInstructionOrExpressionMetadata>(
    instructionOrExpression: T
  ) => T
): void => {
  const propertyType = property.getType();

  const uncapitalizedLabel = uncapitalizedFirstLetter(
    property.getLabel() || property.getName()
  );
  if (propertyType === 'Boolean') {
    addObjectAndBehaviorParameters(
      entityMetadata.addScopedCondition(
        conditionName,
        propertyLabel,
        i18n._(t`Check the property value for "${uncapitalizedLabel}".`),
        i18n._(t`Property "${uncapitalizedLabel}" of _PARAM0_ is true`),
        eventsBasedEntity.getFullName() || eventsBasedEntity.getName(),
        getExtensionIconUrl(extension),
        getExtensionIconUrl(extension)
      )
    )
      .getCodeExtraInformation()
      .setFunctionName(getterName);

    addObjectAndBehaviorParameters(
      entityMetadata.addScopedAction(
        actionName,
        propertyLabel,
        i18n._(t`Update the property value for "${uncapitalizedLabel}".`),
        i18n._(
          t`Set property value for "${uncapitalizedLabel}" of _PARAM0_ to _PARAM${valueParameterIndex}_`
        ),
        eventsBasedEntity.getFullName() || eventsBasedEntity.getName(),
        getExtensionIconUrl(extension),
        getExtensionIconUrl(extension)
      )
    )
      .addParameter('yesorno', i18n._(t`New value to set`), '', false)
      .getCodeExtraInformation()
      .setFunctionName(setterName);

    addObjectAndBehaviorParameters(
      entityMetadata.addScopedAction(
        toggleActionName,
        i18n._(t`Toggle ${propertyLabel}`),
        i18n._(t`Toggle the property value for "${uncapitalizedLabel}".`) +
          '\n' +
          i18n._(
            `If it was true, it will become false, and if it was false it will become true.`
          ),
        i18n._(t`Toggle property "${uncapitalizedLabel}" of _PARAM0_`),
        eventsBasedEntity.getFullName() || eventsBasedEntity.getName(),
        getExtensionIconUrl(extension),
        getExtensionIconUrl(extension)
      )
    )
      .getCodeExtraInformation()
      .setFunctionName(toggleFunctionName);
  } else {
    const typeExtraInfo = getStringifiedExtraInfo(property);
    const parameterOptions = gd.ParameterOptions.makeNewOptions();
    if (typeExtraInfo) parameterOptions.setTypeExtraInfo(typeExtraInfo);
    addObjectAndBehaviorParameters(
      entityMetadata.addExpressionAndConditionAndAction(
        gd.ValueTypeMetadata.convertPropertyTypeToValueType(propertyType),
        expressionName,
        propertyLabel,
        i18n._(t`the property value for the ${uncapitalizedLabel}`),
        i18n._(t`the property value for the ${uncapitalizedLabel}`),
        eventsBasedEntity.getFullName() || eventsBasedEntity.getName(),
        getExtensionIconUrl(extension)
      )
    )
      .useStandardParameters(
        gd.ValueTypeMetadata.convertPropertyTypeToValueType(propertyType),
        parameterOptions
      )
      .setFunctionName(setterName)
      .setGetter(getterName);
  }
};

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
    instructionOrExpression
      .addParameter(
        'object',
        'Object',
        '', // See below for adding the extra information
        false
      )
      // Manually add the "extra info" without relying on addParameter
      // as this method is prefixing the value passed with the extension namespace (this
      // was done to ease extension declarations when dealing with object).
      .setParameterExtraInfo(eventsBasedBehavior.getObjectType());

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
    if (propertyType === 'Behavior') {
      // Required behaviors don't need accessors and mutators.
      return;
    }

    const propertyName = property.getName();
    const propertyLabel = i18n._(
      t`${property.getLabel() || propertyName} property`
    );
    const expressionName = gd.EventsBasedBehavior.getPropertyExpressionName(
      propertyName
    );
    const conditionName = gd.EventsBasedBehavior.getPropertyConditionName(
      propertyName
    );
    const actionName = gd.EventsBasedBehavior.getPropertyActionName(
      propertyName
    );
    const toggleActionName = gd.EventsBasedBehavior.getPropertyToggleActionName(
      propertyName
    );
    const setterName = gd.BehaviorCodeGenerator.getBehaviorPropertySetterName(
      propertyName
    );
    const getterName = gd.BehaviorCodeGenerator.getBehaviorPropertyGetterName(
      propertyName
    );
    const toggleFunctionName = gd.BehaviorCodeGenerator.getBehaviorPropertyToggleFunctionName(
      propertyName
    );

    declarePropertyInstructionAndExpression(
      i18n,
      extension,
      behaviorMetadata,
      eventsBasedBehavior,
      property,
      propertyLabel,
      expressionName,
      conditionName,
      actionName,
      toggleActionName,
      setterName,
      getterName,
      toggleFunctionName,
      2,
      addObjectAndBehaviorParameters
    );
  });

  mapVector(eventsBasedBehavior.getSharedPropertyDescriptors(), property => {
    const propertyName = property.getName();
    const propertyLabel = i18n._(
      t`${property.getLabel() || propertyName} shared property`
    );
    const expressionName = gd.EventsBasedBehavior.getSharedPropertyExpressionName(
      propertyName
    );
    const conditionName = gd.EventsBasedBehavior.getSharedPropertyConditionName(
      propertyName
    );
    const actionName = gd.EventsBasedBehavior.getSharedPropertyActionName(
      propertyName
    );
    const toggleActionName = gd.EventsBasedBehavior.getSharedPropertyToggleActionName(
      propertyName
    );
    const setterName = gd.BehaviorCodeGenerator.getBehaviorSharedPropertySetterName(
      propertyName
    );
    const getterName = gd.BehaviorCodeGenerator.getBehaviorSharedPropertyGetterName(
      propertyName
    );
    const toggleFunctionName = gd.BehaviorCodeGenerator.getBehaviorSharedPropertyToggleFunctionName(
      propertyName
    );

    declarePropertyInstructionAndExpression(
      i18n,
      extension,
      behaviorMetadata,
      eventsBasedBehavior,
      property,
      propertyLabel,
      expressionName,
      conditionName,
      actionName,
      toggleActionName,
      setterName,
      getterName,
      toggleFunctionName,
      2,
      addObjectAndBehaviorParameters
    );
  });
};

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based object.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
export const declareObjectPropertiesInstructionAndExpressions = (
  i18n: I18nType,
  extension: gdPlatformExtension,
  objectMetadata: gdObjectMetadata,
  eventsBasedObject: gdEventsBasedObject
): void => {
  const addObjectParameter = <T: gdInstructionOrExpressionMetadata>(
    instructionOrExpression: T
  ): T => {
    // By convention, first parameter is always the object:
    instructionOrExpression.addParameter(
      'object',
      'Object',
      eventsBasedObject.getName(),
      false
    );

    // All property actions/conditions/expressions are private, meaning
    // they can only be used from the object events.
    instructionOrExpression.setPrivate();

    return instructionOrExpression;
  };

  mapVector(eventsBasedObject.getPropertyDescriptors(), property => {
    const propertyName = property.getName();
    const propertyLabel = i18n._(
      t`${property.getLabel() || propertyName} property`
    );
    const expressionName = gd.EventsBasedObject.getPropertyExpressionName(
      propertyName
    );
    const conditionName = gd.EventsBasedObject.getPropertyConditionName(
      propertyName
    );
    const actionName = gd.EventsBasedObject.getPropertyActionName(propertyName);
    const toggleActionName = gd.EventsBasedObject.getPropertyToggleActionName(
      propertyName
    );
    const getterName = gd.ObjectCodeGenerator.getObjectPropertyGetterName(
      propertyName
    );
    const setterName = gd.ObjectCodeGenerator.getObjectPropertySetterName(
      propertyName
    );
    const toggleFunctionName = gd.ObjectCodeGenerator.getObjectPropertyToggleFunctionName(
      propertyName
    );

    declarePropertyInstructionAndExpression(
      i18n,
      extension,
      objectMetadata,
      eventsBasedObject,
      property,
      propertyLabel,
      expressionName,
      conditionName,
      actionName,
      toggleActionName,
      setterName,
      getterName,
      toggleFunctionName,
      1,
      addObjectParameter
    );
  });
};

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based object.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
export const declareObjectInternalInstructions = (
  i18n: I18nType,
  extension: gdPlatformExtension,
  objectMetadata: gdObjectMetadata,
  eventsBasedObject: gdEventsBasedObject
): void => {
  // TODO EBO Use full type to identify object to avoid collision.
  // Objects are identified by their name alone.
  const objectType = eventsBasedObject.getName();

  objectMetadata
    .addScopedAction(
      'SetRotationCenter',
      i18n._('Center of rotation'),
      i18n._(
        'Change the center of rotation of an object relatively to the object origin.'
      ),
      i18n._('Change the center of rotation of _PARAM0_ to _PARAM1_, _PARAM2_'),
      i18n._('Angle'),
      'res/actions/position24_black.png',
      'res/actions/position_black.png'
    )
    .addParameter('object', i18n._('Object'), objectType)
    .addParameter('number', i18n._('X position'))
    .addParameter('number', i18n._('Y position'))
    .markAsAdvanced()
    .setPrivate()
    .setFunctionName('setRotationCenter');
};

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
export const declareEventsFunctionParameters = (
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsFunction: gdEventsFunction,
  instructionOrExpression:
    | gdInstructionMetadata
    | gdExpressionMetadata
    | gdMultipleInstructionMetadata,
  userDefinedFirstParameterIndex: number
) => {
  const addParameter = (parameter: gdParameterMetadata) => {
    if (!parameter.isCodeOnly()) {
      instructionOrExpression
        .addParameter(
          parameter.getType(),
          parameter.getDescription(),
          '', // See below for adding the extra information
          parameter.isOptional()
        )
        // Manually add the "extra info" without relying on addParameter (or addCodeOnlyParameter)
        // as these methods are prefixing the value passed with the extension namespace (this
        // was done to ease extension declarations when dealing with object).
        .setParameterExtraInfo(parameter.getExtraInfo());
      instructionOrExpression.setParameterLongDescription(
        parameter.getLongDescription()
      );
      instructionOrExpression.setDefaultValue(parameter.getDefaultValue());
    } else {
      instructionOrExpression.addCodeOnlyParameter(
        parameter.getType(),
        parameter.getExtraInfo()
      );
    }
  };

  const functionType = eventsFunction.getFunctionType();
  const getterFunction = eventsFunctionsContainer.hasEventsFunctionNamed(
    eventsFunction.getGetterName()
  )
    ? eventsFunctionsContainer.getEventsFunction(eventsFunction.getGetterName())
    : null;
  // This is used instead of getParametersForEvents because the Value parameter
  // is already add by useStandardOperatorParameters.
  const parameters = (functionType === gd.EventsFunction.ActionWithOperator &&
  getterFunction
    ? getterFunction
    : eventsFunction
  ).getParameters();

  mapVector(
    parameters,
    (parameter: gdParameterMetadata, index: number) =>
      index < userDefinedFirstParameterIndex && addParameter(parameter)
  );

  if (functionType === gd.EventsFunction.ExpressionAndCondition) {
    const options = gd.ParameterOptions.makeNewOptions();
    if (eventsFunction) {
      const extraInfo = eventsFunction.getExpressionType().getExtraInfo();
      if (extraInfo) options.setTypeExtraInfo(extraInfo);
    }
    // $FlowExpectedError[incompatible-cast]
    (instructionOrExpression: gdMultipleInstructionMetadata).useStandardParameters(
      eventsFunction ? eventsFunction.getExpressionType().getName() : 'string',
      options
    );
  } else if (functionType === gd.EventsFunction.ActionWithOperator) {
    const options = gd.ParameterOptions.makeNewOptions();
    if (getterFunction) {
      const extraInfo = getterFunction.getExpressionType().getExtraInfo();
      if (extraInfo) options.setTypeExtraInfo(extraInfo);
    }
    // $FlowExpectedError[incompatible-cast]
    (instructionOrExpression: gdInstructionMetadata).useStandardOperatorParameters(
      getterFunction ? getterFunction.getExpressionType().getName() : 'string',
      options
    );
  }

  mapVector(
    parameters,
    (parameter: gdParameterMetadata, index: number) =>
      index >= userDefinedFirstParameterIndex && addParameter(parameter)
  );

  // By convention, latest parameter is always the eventsFunctionContext of the calling function
  // (if any).
  instructionOrExpression.addCodeOnlyParameter('eventsFunctionContext', '');
};
