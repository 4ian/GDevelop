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

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));
const clampKernelSize = value => ([5, 7, 9, 11, 13, 15].includes(value)) ? value : 5;

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
    name: 'Blur',
    schema: [
      {
        name: 'blur',
        getLabel: () => 'blur',
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('blur'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('blur', newValue),
      },
      {
        name: 'quality',
        getLabel: () => 'quality ' + i18n._(t`(Number of render passes. High values cause lag.)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('quality'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('quality', newValue),
      },
      {
        name: 'resolution',
        getLabel: () => 'resolution',
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('resolution'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('resolution', newValue),
      },
      {
        name: 'kernelSize',
        getLabel: () => 'kernelSize ' + i18n._(t`(one of these values: 5, 7, 9, 11, 13, 15)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('kernelSize'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('kernelSize', clampKernelSize(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'blur',
        value: 8,
      },
      {
        name: 'quality',
        value: 1,
      },
      {
        name: 'resolution',
        value: 2,
      },
      {
        name: 'kernelSize',
        value: 5,
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
  {
    name: 'Noise',
    schema: [
      {
        name: 'noise',
        getLabel: () => 'noise ' + i18n._(t`(between 0 and 1)`),
        valueType: 'number',
        getValue: (effect: gdEffect) => effect.getParameter('noise'),
        setValue: (effect: gdEffect, newValue: number) =>
          effect.setParameter('noise', clampValue(newValue)),
      },
    ],
    parameterDefaultValues: [
      {
        name: 'noise',
        value: 0.5,
      },
    ],
  },
];
