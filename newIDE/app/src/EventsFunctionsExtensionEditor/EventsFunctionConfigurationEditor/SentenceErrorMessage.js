// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { mapFor } from '../../Utils/MapFor';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';

const gd: libGDevelop = global.gd;

export const getSentenceErrorText = (
  i18n: I18nType,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunction: gdEventsFunction
): any | string | void => {
  const sentence = eventsFunction.getSentence();
  if (!sentence)
    return i18n._(
      t`Enter the sentence that will be displayed in the events sheet`
    );

  const parametersIndexOffset = eventsBasedBehavior
    ? ParametersIndexOffsets.BehaviorFunction
    : eventsBasedObject
    ? ParametersIndexOffsets.ObjectFunction
    : ParametersIndexOffsets.FreeFunction;

  const type = eventsFunction.getFunctionType();
  const param0isImplicit =
    (eventsBasedBehavior || eventsBasedObject) &&
    type === gd.EventsFunction.ExpressionAndCondition;
  const missingParameters = mapFor(
    0,
    eventsFunction.getParameters().getParametersCount(),
    index => {
      const parameter = eventsFunction.getParameters().getParameterAt(index);

      if (parameter.getValueTypeMetadata().isBehavior()) {
        // Behaviors are usually not shown in sentences.
        return null;
      }
      if (index === 0 && param0isImplicit) {
        return null;
      }

      const expectedString = `_PARAM${index + parametersIndexOffset}_`;
      if (sentence.indexOf(expectedString) === -1) return expectedString;

      return null;
    }
  ).filter(Boolean);

  const parametersLength = eventsFunction.getParameters().getParametersCount();
  const paramsMatches = sentence.matchAll(/_PARAM(\d+)_/g);
  const nonExpectedParameters = [];
  for (const paramsMatch of paramsMatches) {
    const paramIndex = parseInt(paramsMatch[1], 10);
    if (
      paramIndex - parametersIndexOffset >= parametersLength ||
      paramIndex - parametersIndexOffset < 0
    ) {
      nonExpectedParameters.push(paramsMatch[0]);
    }
  }

  if (missingParameters.length || nonExpectedParameters.length) {
    return [
      missingParameters.length
        ? i18n._(t`The sentence is probably missing this/these parameter(s):`) +
          ' ' +
          missingParameters.join(', ')
        : null,
      nonExpectedParameters.length
        ? i18n._(t`The sentence displays one or more wrongs parameters:`) +
          ' ' +
          nonExpectedParameters.join(', ')
        : null,
    ]
      .filter(Boolean)
      .join(' - ');
  }

  return undefined;
};
