// @flow

import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { type Schema } from '../../CompactPropertiesEditor';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';

const defaultCameraBehaviorChoices = [
  {
    value: 'do-nothing',
    label: t`Keep centered (best for game content)`,
  },
  {
    value: 'top-left-anchored-if-never-moved',
    label: t`Keep top-left corner fixed (best for content that can extend)`,
  },
];
const getDefaultCameraBehaviorField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Default camera behavior',
  getLabel: () => i18n._(t`Default camera behavior`),
  valueType: 'string',
  getChoices: () => defaultCameraBehaviorChoices,
  getValue: (layer: gdLayer) => layer.getDefaultCameraBehavior(),
  setValue: (layer: gdLayer, newValue: string) =>
    layer.setDefaultCameraBehavior(newValue),
});

const renderingTypeChoices = [
  {
    value: '',
    label: t`Display both 2D and 3D objects (default)`,
  },
  {
    value: '2d',
    label: t`Force display only 2D objects`,
  },
  {
    value: '3d',
    label: t`Force display only 3D objects`,
  },
  {
    value: '2d+3d',
    label: t`Force display both 2D and 3D objects`,
  },
];
const getRenderingTypeField = ({
  i18n,
  forceUpdate,
}: {|
  i18n: I18nType,
  forceUpdate: () => void,
|}) => ({
  name: 'Rendering type',
  getLabel: () => i18n._(t`Rendering type`),
  valueType: 'string',
  getChoices: () => renderingTypeChoices,
  getValue: (layer: gdLayer) => layer.getRenderingType(),
  setValue: (layer: gdLayer, newValue: string) => {
    layer.setRenderingType(newValue);
    forceUpdate();
  },
});

const cameraTypeChoices = [
  {
    value: 'perspective',
    label: t`Perspective camera`,
  },
  {
    value: 'orthographic',
    label: t`Orthographic camera`,
  },
];
const getCameraTypeField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Camera type',
  getLabel: () => i18n._(t`Camera type`),
  valueType: 'string',
  getChoices: () => cameraTypeChoices,
  getValue: (layer: gdLayer) => layer.getCameraType(),
  // TODO checkNearPlaneDistanceError
  setValue: (layer: gdLayer, newValue: string) => layer.setCameraType(newValue),
});

const getCamera3DFieldOfViewField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Field of view',
  getLabel: () => i18n._(t`Field of view (in degrees)`),
  valueType: 'number',
  getValue: (layer: gdLayer) => layer.getCamera3DFieldOfView(),
  // TODO onChangeCamera3DFieldOfView
  setValue: (layer: gdLayer, newValue: number) =>
    layer.setCamera3DFieldOfView(newValue),
  disabled: (layers: Array<gdLayer>) =>
    layers[0] && layers[0].getCameraType() !== 'perspective',
});

const getNearPlaneDistanceField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Near plane distance',
  getLabel: () => i18n._(t`Near plane distance`),
  valueType: 'number',
  getValue: (layer: gdLayer) => layer.getCamera3DNearPlaneDistance(),
  // TODO onChangeCamera3DNearPlaneDistance
  setValue: (layer: gdLayer, newValue: number) =>
    layer.setCamera3DNearPlaneDistance(newValue),
});

const getFarPlaneDistanceField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Far plane distance',
  getLabel: () => i18n._(t`Far plane distance`),
  valueType: 'number',
  getValue: (layer: gdLayer) => layer.getCamera3DFarPlaneDistance(),
  // TODO onChangeCamera3DNearPlaneDistance
  setValue: (layer: gdLayer, newValue: number) =>
    layer.setCamera3DFarPlaneDistance(newValue),
});

const getCamera2DPlaneMaxDrawingDistanceField = ({
  i18n,
}: {|
  i18n: I18nType,
|}) => ({
  name: 'Maximum 2D drawing distance',
  getLabel: () => i18n._(t`Maximum 2D drawing distance`),
  valueType: 'number',
  getValue: (layer: gdLayer) => layer.getCamera2DPlaneMaxDrawingDistance(),
  // TODO onChangeCamera2DPlaneMaxDrawingDistance
  setValue: (layer: gdLayer, newValue: number) =>
    layer.setCamera2DPlaneMaxDrawingDistance(newValue),
});

const getFollowingBaseLayerCameraField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Automatically follow the base layer',
  getLabel: () => i18n._(t`Automatically follow the base layer.`),
  valueType: 'boolean',
  getValue: (layer: gdLayer) => layer.isFollowingBaseLayerCamera(),
  setValue: (layer: gdLayer, newValue: boolean) =>
    layer.setFollowBaseLayerCamera(newValue),
});

const getAmbientLightColorField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Ambient light color',
  getLabel: () => i18n._(t`Ambient light color`),
  valueType: 'color',
  getValue: (layer: gdLayer) =>
    rgbColorToRGBString({
      r: layer.getAmbientLightColorRed(),
      g: layer.getAmbientLightColorGreen(),
      b: layer.getAmbientLightColorBlue(),
    }),
  setValue: (layer: gdLayer, newColor: string) => {
    const currentRgbColor = {
      r: layer.getAmbientLightColorRed(),
      g: layer.getAmbientLightColorGreen(),
      b: layer.getAmbientLightColorBlue(),
    };
    const newRgbColor = rgbStringAndAlphaToRGBColor(newColor);
    if (
      newRgbColor &&
      (newRgbColor.r !== currentRgbColor.r ||
        newRgbColor.g !== currentRgbColor.g ||
        newRgbColor.b !== currentRgbColor.b)
    ) {
      layer.setAmbientLightColor(newRgbColor.r, newRgbColor.g, newRgbColor.b);
    }
  },
});

export const makeSchema = ({
  i18n,
  forceUpdate,
  onEditLayer,
  layersContainer,
}: {|
  i18n: I18nType,
  forceUpdate: () => void,
  onEditLayer: (layer: gdLayer) => void,
  layersContainer: gdLayersContainer,
|}): Schema => {
  return [
    getDefaultCameraBehaviorField({ i18n }),
    {
      name: 'Not a lighting layer',
      type: 'column',
      isHidden: layers => layers[0] && layers[0].isLightingLayer(),
      children: [
        getRenderingTypeField({ i18n, forceUpdate }),
        {
          name: 'Optional 3D settings',
          type: 'column',
          isHidden: layers =>
            layers[0] && layers[0].getRenderingType() === '2d',
          children: [
            {
              name: '3D settings',
              title: i18n._(t`3D settings`),
              nonFieldType: 'sectionTitle',
              getValue: undefined,
            },
            getCameraTypeField({ i18n }),
            getCamera3DFieldOfViewField({ i18n }),
            getNearPlaneDistanceField({ i18n }),
            getFarPlaneDistanceField({ i18n }),
            getCamera2DPlaneMaxDrawingDistanceField({ i18n }),
          ],
        },
      ],
    },
    {
      name: 'Optional lighting layer settings',
      type: 'column',
      isHidden: layers => layers[0] && !layers[0].isLightingLayer(),
      children: [
        {
          name: 'Lighting settings',
          title: i18n._(t`Lighting settings`),
          nonFieldType: 'sectionTitle',
          getValue: undefined,
        },
        getFollowingBaseLayerCameraField({ i18n }),
        getAmbientLightColorField({ i18n }),
      ],
    },
  ].filter(Boolean);
};
