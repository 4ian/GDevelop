// @flow

import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import {
  type Schema,
  type Field,
  type FieldChoices,
} from '../../PropertiesEditor/PropertiesEditorSchema';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

const getFunctionTypeField = ({
  i18n,
  freezeEventsFunctionType,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  freezeEventsFunctionType: boolean,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'FunctionType',
  getLabel: () => i18n._(t`Function type`),
  valueType: 'number',
  getChoices: () => [
    {
      value: gd.EventsFunction.Action.toString(),
      label: i18n._(t`Action`),
    },
    {
      value: gd.EventsFunction.Condition.toString(),
      label: i18n._(t`Condition`),
    },
    {
      value: gd.EventsFunction.Expression.toString(),
      label: i18n._(t`Expression`),
    },
    {
      value: gd.EventsFunction.ExpressionAndCondition.toString(),
      label: i18n._(t`Expression and condition`),
    },
    {
      value: gd.EventsFunction.ActionWithOperator.toString(),
      label: i18n._(t`Action with operator`),
    },
  ],
  getValue: (eventsFunction: gdEventsFunction) =>
    eventsFunction.getFunctionType(),
  setValue: (eventsFunction: gdEventsFunction, newValue: number) => {
    // $FlowFixMe[incompatible-type]
    eventsFunction.setFunctionType(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated('type');
    }
  },
  visibility: 'basic',
  disabled: () => true,
});

const getGetterNameField = ({
  i18n,
  freezeEventsFunctionType,
  onConfigurationUpdated,
  eventsFunctionsContainer,
}: {|
  i18n: I18nType,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  freezeEventsFunctionType: boolean,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'GetterName',
  getLabel: () => i18n._(t`Related expression and condition`),
  valueType: 'string',
  getChoices: () =>
    eventsFunctionsContainer
      ? mapFor(
          0,
          eventsFunctionsContainer.getEventsFunctionsCount(),
          (i): FieldChoices | null => {
            const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(
              i
            );

            return eventsFunction.getFunctionType() ===
              gd.EventsFunction.ExpressionAndCondition
              ? {
                  value: eventsFunction.getName(),
                  label:
                    eventsFunction.getFullName() || eventsFunction.getName(),
                }
              : null;
          }
        ).filter(Boolean)
      : [],
  getValue: (eventsFunction: gdEventsFunction) =>
    eventsFunction.getGetterName(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    // $FlowFixMe[incompatible-type]
    eventsFunction.setGetterName(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated('type');
    }
  },
  visibility: 'basic',
});

const getFullNameField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'FullName',
  getLabel: () => i18n._(t`Displayed name`),
  getDescription: () => i18n._(t`Full name displayed in editor`),
  valueType: 'string',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.getFullName(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    eventsFunction.setFullName(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated();
    }
  },
  visibility: 'basic',
});

const getDescriptionField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'Description',
  getLabel: () => i18n._(t`Description`),
  getDescription: () => i18n._(t`Description displayed in editor`),
  valueType: 'multilinestring',
  getValue: (eventsFunction: gdEventsFunction) =>
    eventsFunction.getDescription(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    eventsFunction.setDescription(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated();
    }
  },
  visibility: 'basic',
});

const getComputedDescriptionField = ({
  i18n,
  getterFunction,
}: {|
  i18n: I18nType,
  getterFunction: gdEventsFunction | null,
|}): Field => ({
  name: 'Description',
  getLabel: () => i18n._(t`Description`),
  getDescription: () => i18n._(t`Description displayed in editor`),
  valueType: 'multilinestring',
  getValue: (eventsFunction: gdEventsFunction) =>
    getterFunction ? 'Change ' + getterFunction.getDescription() : '',
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {},
  visibility: 'basic',
  disabled: () => true,
});

const getSentenceField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'Sentence',
  getLabel: () => i18n._(t`Sentence`),
  getDescription: () => i18n._(t`Sentence in Events Sheet`),
  valueType: 'multilinestring',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.getSentence(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    eventsFunction.setSentence(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated();
    }
  },
  visibility: 'basic',
});

const getComputedSentenceField = ({
  i18n,
  getterFunction,
  hasObjectParameter,
}: {|
  i18n: I18nType,
  getterFunction: gdEventsFunction | null,
  hasObjectParameter: boolean,
|}): Field => ({
  name: 'Sentence',
  getLabel: () => i18n._(t`Sentence`),
  getDescription: () => i18n._(t`Sentence in Events Sheet`),
  valueType: 'multilinestring',
  getValue: (eventsFunction: gdEventsFunction) =>
    getterFunction
      ? 'Change ' +
        getterFunction.getSentence() +
        (hasObjectParameter ? ' of _PARAM0_' : '') +
        ': [...]'
      : '',
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {},
  visibility: 'basic',
  disabled: () => true,
});

const getHelpUrlField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'HelpUrl',
  getLabel: () => i18n._(t`Help page URL`),
  getDescription: () =>
    i18n._(
      t`Optional. Enter a full URL (starting with https://) to a help page. A help icon will appear next to the action/condition/expression title in the editor, allowing users to quickly access documentation.`
    ),
  valueType: 'string',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.getHelpUrl(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    eventsFunction.setHelpUrl(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated();
    }
  },
  visibility: 'advanced',
});

const getPrivateField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'Private',
  getLabel: () => i18n._(t`Hide in the events editor`),
  getDescription: () =>
    i18n._(
      t`When checked, this function will only be visible in the extension editor.`
    ),
  valueType: 'boolean',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.isPrivate(),
  setValue: (eventsFunction: gdEventsFunction, newValue: boolean) => {
    eventsFunction.setPrivate(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated('isPrivate');
    }
  },
  visibility: 'advanced',
});

const getAsynchronousField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'Asynchronous',
  getLabel: () => i18n._(t`Asynchronous`),
  getDescription: () =>
    i18n._(
      t`When checked, the actions and sub-events following it will wait for it to end. You should use other async actions like "wait" to schedule your actions and don't forget to use the action "End asynchronous function" to mark the end of the action.`
    ),
  valueType: 'boolean',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.isAsync(),
  setValue: (eventsFunction: gdEventsFunction, newValue: boolean) => {
    eventsFunction.setAsync(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated('isAsync');
    }
  },
  visibility: 'advanced',
});

const getDeprecatedField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'Deprecated',
  getLabel: () => i18n._(t`Deprecated`),
  getDescription: () =>
    i18n._(t`When checked, a warning is displayed in the events editor.`),
  valueType: 'boolean',
  getValue: (eventsFunction: gdEventsFunction) => eventsFunction.isDeprecated(),
  setValue: (eventsFunction: gdEventsFunction, newValue: boolean) => {
    eventsFunction.setDeprecated(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated('isDeprecated');
    }
  },
  visibility: 'advanced',
});
const getDeprecationMessageField = ({
  i18n,
  onConfigurationUpdated,
}: {|
  i18n: I18nType,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
|}): Field => ({
  name: 'DeprecationMessage',
  getLabel: () => i18n._(t`Deprecation message`),
  getDescription: () => i18n._(t`Example: Use "New Action Name" instead.`),
  valueType: 'multilinestring',
  getValue: (eventsFunction: gdEventsFunction) =>
    eventsFunction.getDeprecationMessage(),
  setValue: (eventsFunction: gdEventsFunction, newValue: string) => {
    eventsFunction.setDeprecationMessage(newValue);
    if (onConfigurationUpdated) {
      onConfigurationUpdated();
    }
  },
  visibility: 'advanced',
});

export const makeSchema = ({
  i18n,
  eventsFunctionsContainer,
  eventsFunction,
  eventsBasedBehavior,
  eventsBasedObject,
  onConfigurationUpdated,
  freezeEventsFunctionType,
}: {|
  i18n: I18nType,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  onConfigurationUpdated: ?(?ExtensionItemConfigurationAttribute) => void,
  freezeEventsFunctionType: boolean,
|}): Schema => {
  const type = eventsFunction.getFunctionType();

  const getterFunction =
    eventsFunctionsContainer &&
    type === gd.EventsFunction.ActionWithOperator &&
    eventsFunctionsContainer.hasEventsFunctionNamed(
      eventsFunction.getGetterName()
    )
      ? eventsFunctionsContainer.getEventsFunction(
          eventsFunction.getGetterName()
        )
      : null;

  const fields: Array<Field | null> = [
    {
      name: 'FunctionType',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [
        getFunctionTypeField({
          i18n,
          onConfigurationUpdated,
          freezeEventsFunctionType,
        }),
      ],
    },
    type === gd.EventsFunction.ActionWithOperator
      ? {
          name: 'GetterName',
          type: 'row',
          preventWrap: true,
          removeSpacers: true,
          children: [
            getGetterNameField({
              i18n,
              eventsFunctionsContainer,
              onConfigurationUpdated,
              freezeEventsFunctionType,
            }),
          ],
        }
      : {
          name: 'FullName',
          type: 'row',
          preventWrap: true,
          removeSpacers: true,
          children: [getFullNameField({ i18n, onConfigurationUpdated })],
        },
    type === gd.EventsFunction.ActionWithOperator
      ? getComputedDescriptionField({ i18n, getterFunction })
      : getDescriptionField({ i18n, onConfigurationUpdated }),
    type === gd.EventsFunction.Expression
      ? null
      : type === gd.EventsFunction.ActionWithOperator
      ? getComputedSentenceField({
          i18n,
          getterFunction,
          hasObjectParameter: !!eventsBasedBehavior || !!eventsBasedObject,
        })
      : getSentenceField({ i18n, onConfigurationUpdated }),
    {
      name: 'HelpUrl',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getHelpUrlField({ i18n, onConfigurationUpdated })],
    },
    {
      name: 'Private',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getPrivateField({ i18n, onConfigurationUpdated })],
    },
    {
      name: 'Asynchronous',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getAsynchronousField({ i18n, onConfigurationUpdated })],
    },
    {
      name: 'Deprecated',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getDeprecatedField({ i18n, onConfigurationUpdated })],
    },
    eventsFunction.isDeprecated()
      ? getDeprecationMessageField({ i18n, onConfigurationUpdated })
      : null,
  ];
  return fields.filter(Boolean);
};
