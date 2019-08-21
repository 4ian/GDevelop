// @flow
import { type Schema } from '../PropertiesEditor';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

type EffectDefaultValue = {| name: string, value: number |};

export type EffectDescription = {|
  name: string,
  schema: Schema,
  parameterDefaultValues: Array<EffectDefaultValue>,
|};

const clampValue = value => Math.max(0, Math.min(1, value));

export const getAllEffectDescriptions = (
  i18n: I18nType
): Array<EffectDescription> => [
  {
    name: 'Sepia',
    schema: [
      {
        name: 'opacity',
        getLabel: () => 'opacity ' + i18n._(t`(between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('opacity'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('opacity', clampValue(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'opacity',
        value: 1,
      },
    ],
  },
  {
    name: 'BlackAndWhite',
    schema: [
      {
        name: 'opacity',
        getLabel: () => 'opacity ' + i18n._(t`(between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('opacity'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('opacity', clampValue(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'opacity',
        value: 1,
      },
    ],
  },
  {
    name: 'Night',
    schema: [
      {
        name: 'opacity',
        getLabel: () => 'opacity ' + i18n._(t`(between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('opacity'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('opacity', clampValue(newValue)),
      },
      {
        name: 'intensity',
        getLabel: () => 'intensity ' + i18n._(t` (between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('intensity'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('intensity', clampValue(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'opacity',
        value: 0.5,
      },
      {
        name: 'intensity',
        value: 0.5,
      },
    ],
  },
  {
    name: 'LightNight',
    schema: [
      {
        name: 'opacity',
        getLabel: () => 'opacity ' + i18n._(t`(between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('opacity'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('opacity', clampValue(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'opacity',
        value: 1,
      },
    ],
  },
];
