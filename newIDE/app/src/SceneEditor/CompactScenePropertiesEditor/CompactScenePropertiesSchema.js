// @flow

import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import {
  type Schema,
  type Field,
} from '../../PropertiesEditor/PropertiesEditorSchema';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
  clampRgbComponent,
} from '../../Utils/ColorTransformer';

const getBackgroundColorField = ({
  i18n,
  onBackgroundColorChanged,
}: {|
  i18n: I18nType,
  onBackgroundColorChanged: () => void,
|}): Field => ({
  name: 'BackgroundColor',
  getLabel: () => i18n._(t`Background color`),
  valueType: 'color',
  getValue: (scene: gdLayout) =>
    rgbColorToRGBString({
      r: scene.getBackgroundColorRed(),
      b: scene.getBackgroundColorBlue(),
      g: scene.getBackgroundColorGreen(),
    }),
  setValue: (scene: gdLayout, newValue: string) => {
    const backgroundColor = rgbStringAndAlphaToRGBColor(newValue);
    scene.setBackgroundColor(
      backgroundColor ? clampRgbComponent(backgroundColor.r) : 0,
      backgroundColor ? clampRgbComponent(backgroundColor.g) : 0,
      backgroundColor ? clampRgbComponent(backgroundColor.b) : 0
    );
    onBackgroundColorChanged();
  },
  visibility: 'basic',
});

const getShouldStopSoundsOnStartupField = ({
  i18n,
}: {|
  i18n: I18nType,
|}): Field => ({
  name: 'ShouldStopSoundsOnStartup',
  getLabel: () =>
    i18n._(t`Stop music and sounds at the beginning of this scene`),
  valueType: 'boolean',
  getValue: (scene: gdLayout) => scene.stopSoundsOnStartup(),
  setValue: (scene: gdLayout, newValue: boolean) =>
    scene.setStopSoundsOnStartup(newValue),
  visibility: 'advanced',
});

const getResourcesPreloadingField = ({
  i18n,
}: {|
  i18n: I18nType,
|}): Field => ({
  name: 'ResourcesPreloading',
  getLabel: () => i18n._(t`Resources preloading`),
  valueType: 'string',
  getChoices: () => [
    {
      value: 'inherit',
      label: i18n._(t`Use the project setting`),
    },
    {
      value: 'at-startup',
      label: i18n._(t`Always preload at startup`),
    },
    {
      value: 'never',
      label: i18n._(t`Never preload`),
    },
  ],
  getValue: (scene: gdLayout) => scene.getResourcesPreloading(),
  setValue: (scene: gdLayout, newValue: string) =>
    scene.setResourcesPreloading(newValue),
  visibility: 'advanced',
});

const getResourcesUnloadingField = ({ i18n }: {| i18n: I18nType |}): Field => ({
  name: 'ResourcesUnloading',
  getLabel: () => i18n._(t`Resources unloading`),
  valueType: 'string',
  getChoices: () => [
    {
      value: 'inherit',
      label: i18n._(t`Use the project setting`),
    },
    {
      value: 'at-scene-exit',
      label: i18n._(t`Unload at scene exit`),
    },
    {
      value: 'never',
      label: i18n._(t`Never unload`),
    },
  ],
  getValue: (scene: gdLayout) => scene.getResourcesUnloading(),
  setValue: (scene: gdLayout, newValue: string) =>
    scene.setResourcesUnloading(newValue),
  visibility: 'advanced',
});

const getWindowTitleField = ({ i18n }: {| i18n: I18nType |}): Field => ({
  name: 'WindowTitle',
  getLabel: () => i18n._(t`Window title`),
  valueType: 'string',
  getValue: (scene: gdLayout) => scene.getWindowDefaultTitle(),
  setValue: (scene: gdLayout, newValue: string) =>
    scene.setWindowDefaultTitle(newValue),
  visibility: 'advanced',
});

export const makeSchema = ({
  i18n,
  onBackgroundColorChanged,
}: {|
  i18n: I18nType,
  onBackgroundColorChanged: () => void,
|}): Schema => {
  return [
    {
      name: 'BackgroundColor',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getBackgroundColorField({ i18n, onBackgroundColorChanged })],
    },
    {
      name: 'ShouldStopSoundsOnStartup',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getShouldStopSoundsOnStartupField({ i18n })],
    },
    {
      name: 'ResourcesPreloading',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getResourcesPreloadingField({ i18n })],
    },
    {
      name: 'ResourcesUnloading',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getResourcesUnloadingField({ i18n })],
    },
    {
      name: 'WindowTitle',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: [getWindowTitleField({ i18n })],
    },
  ];
};
