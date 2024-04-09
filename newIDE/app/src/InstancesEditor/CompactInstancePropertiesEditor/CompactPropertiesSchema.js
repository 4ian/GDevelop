// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import { type Schema } from '../../CompactPropertiesEditor';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import enumerateLayers from '../../LayersList/EnumerateLayers';

import Angle from '../../UI/CustomSvgIcons/Angle';
import Layers from '../../UI/CustomSvgIcons/Layers';
import LetterX from '../../UI/CustomSvgIcons/LetterX';
import LetterY from '../../UI/CustomSvgIcons/LetterY';
import LetterH from '../../UI/CustomSvgIcons/LetterH';
import LetterW from '../../UI/CustomSvgIcons/LetterW';
import Depth from '../../UI/CustomSvgIcons/Depth';
import LetterZ from '../../UI/CustomSvgIcons/LetterZ';
import Instance from '../../UI/CustomSvgIcons/Instance';
import Link from '../../UI/CustomSvgIcons/Link';
import Unlink from '../../UI/CustomSvgIcons/Unlink';
import RemoveCircle from '../../UI/CustomSvgIcons/RemoveCircle';
import Lock from '../../UI/CustomSvgIcons/Lock';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';

const getEditObjectButton = ({
  i18n,
  onEditObjectByName,
}: {|
  i18n: I18nType,
  onEditObjectByName: (name: string) => void,
|}) => ({
  label: i18n._(t`Edit object`),
  disabled: 'onValuesDifferent',
  nonFieldType: 'button',
  getValue: (instance: gdInitialInstance) => instance.getObjectName(),
  onClick: (instance: gdInitialInstance) =>
    onEditObjectByName(instance.getObjectName()),
});

const getRotationXAndRotationYFields = ({ i18n }: {| i18n: I18nType |}) => [
  {
    name: 'RotationX',
    getLabel: () => i18n._(t`Rotation (X)`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getRotationX(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setRotationX(newValue),
    renderLeftIcon: className => <LetterX className={className} />,
  },
  {
    name: 'RotationY',
    getLabel: () => i18n._(t`Rotation (Y)`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getRotationY(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setRotationY(newValue),
    renderLeftIcon: className => <LetterY className={className} />,
  },
];
const getRotationZField = ({
  i18n,
  label,
  Icon,
}: {|
  i18n: I18nType,
  label: MessageDescriptor,
  Icon: React.ComponentType<any>,
|}) => ({
  name: 'Angle',
  getLabel: () => i18n._(label),
  valueType: 'number',
  getValue: (instance: gdInitialInstance) => instance.getAngle(),
  setValue: (instance: gdInitialInstance, newValue: number) =>
    instance.setAngle(newValue),
  renderLeftIcon: className => <Icon className={className} />,
});
const getXAndYFields = ({ i18n }: {| i18n: I18nType |}): Schema => [
  {
    name: 'X',
    getLabel: () => i18n._(t`X`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getX(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setX(newValue),
    renderLeftIcon: className => <LetterX className={className} />,
  },
  {
    name: 'Y',
    getLabel: () => i18n._(t`Y`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getY(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setY(newValue),
    renderLeftIcon: className => <LetterY className={className} />,
  },
];
const getZField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Z',
  getLabel: () => i18n._(t`Z`),
  valueType: 'number',
  getValue: (instance: gdInitialInstance) => instance.getZ(),
  setValue: (instance: gdInitialInstance, newValue: number) =>
    instance.setZ(newValue),
  renderLeftIcon: className => <LetterZ className={className} />,
});
const getLayerField = ({
  i18n,
  layout,
}: {|
  i18n: I18nType,
  layout: gdLayout,
|}) => ({
  name: 'Layer',
  getLabel: () => i18n._(t`Layer`),
  valueType: 'string',
  getChoices: () => enumerateLayers(layout),
  getValue: (instance: gdInitialInstance) => instance.getLayer(),
  setValue: (instance: gdInitialInstance, newValue: string) =>
    instance.setLayer(newValue),
  renderLeftIcon: className => <Layers className={className} />,
});
const getZOrderField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Z Order',
  getLabel: () => i18n._(t`Z Order`),
  valueType: 'number',
  getValue: (instance: gdInitialInstance) => instance.getZOrder(),
  setValue: (instance: gdInitialInstance, newValue: number) =>
    instance.setZOrder(newValue),
  renderLeftIcon: className => <LetterZ className={className} />,
});

const getTitleRow = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Title',
  type: 'row',
  preventWrap: true,
  children: [
    {
      name: i18n._(t`Instance`),
      renderLeftIcon: className => (
        <Instance className={className} fontSize="small" />
      ),
      getValue: (instance: gdInitialInstance) => instance.getObjectName(),
      nonFieldType: 'title',
      defaultValue: i18n._(t`Different objects`),
    },
    {
      name: 'Lock instance',
      getLabel: (instance: gdInitialInstance) =>
        instance.isSealed()
          ? i18n._(t`Free instance`)
          : instance.isLocked()
          ? i18n._(t`Prevent selection in the editor`)
          : i18n._(t`Lock position/angle in the editor`),
      valueType: 'enumIcon',
      renderIcon: value =>
        value === 'sealed' ? (
          <RemoveCircle fontSize="small" />
        ) : value === 'locked' ? (
          <Lock fontSize="small" />
        ) : (
          <LockOpen fontSize="small" />
        ),
      isHighlighted: value => value === 'locked' || value === 'sealed',
      getValue: (instance: gdInitialInstance) =>
        instance.isSealed()
          ? 'sealed'
          : instance.isLocked()
          ? 'locked'
          : 'free',
      setValue: (instance: gdInitialInstance, newValue: boolean) => {
        if (instance.isSealed()) {
          instance.setSealed(false);
          instance.setLocked(false);
          return;
        }
        if (instance.isLocked()) {
          instance.setSealed(true);
          return;
        }
        instance.setLocked(true);
      },
    },
  ],
});

const getWidthField = ({
  i18n,
  getInstanceWidth,
  getInstanceHeight,
  getInstanceDepth,
  forceUpdate,
}: {|
  i18n: I18nType,
  getInstanceWidth: gdInitialInstance => number,
  getInstanceHeight: gdInitialInstance => number,
  getInstanceDepth: gdInitialInstance => number,
  forceUpdate: () => void,
|}) => ({
  name: 'Width',
  getLabel: () => i18n._(t`Width`),
  valueType: 'number',
  getValue: getInstanceWidth,
  setValue: (instance: gdInitialInstance, newValue: number) => {
    instance.setCustomWidth(Math.max(newValue, 0));
    instance.setCustomHeight(getInstanceHeight(instance));
    instance.setCustomDepth(getInstanceDepth(instance));

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <LetterW className={className} />,
});
const getHeightField = ({
  i18n,
  getInstanceWidth,
  getInstanceHeight,
  getInstanceDepth,
  forceUpdate,
}: {|
  i18n: I18nType,
  getInstanceWidth: gdInitialInstance => number,
  getInstanceHeight: gdInitialInstance => number,
  getInstanceDepth: gdInitialInstance => number,
  forceUpdate: () => void,
|}) => ({
  name: 'Height',
  getLabel: () => i18n._(t`Height`),
  valueType: 'number',
  getValue: getInstanceHeight,
  setValue: (instance: gdInitialInstance, newValue: number) => {
    instance.setCustomWidth(getInstanceWidth(instance));
    instance.setCustomHeight(Math.max(newValue, 0));
    instance.setCustomDepth(getInstanceDepth(instance));

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <LetterH className={className} />,
});
const getDepthField = ({
  i18n,
  getInstanceWidth,
  getInstanceHeight,
  getInstanceDepth,
  forceUpdate,
}: {|
  i18n: I18nType,
  getInstanceWidth: gdInitialInstance => number,
  getInstanceHeight: gdInitialInstance => number,
  getInstanceDepth: gdInitialInstance => number,
  forceUpdate: () => void,
|}) => ({
  name: 'Depth',
  getLabel: () => i18n._(t`Depth`),
  valueType: 'number',
  getValue: getInstanceDepth,
  setValue: (instance: gdInitialInstance, newValue: number) => {
    instance.setCustomWidth(getInstanceWidth(instance));
    instance.setCustomHeight(getInstanceHeight(instance));
    instance.setCustomDepth(Math.max(newValue, 0));

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <Depth className={className} />,
});
const getCustomSizeField = ({
  i18n,
  getInstanceWidth,
  getInstanceHeight,
  getInstanceDepth,
  forceUpdate,
}: {|
  i18n: I18nType,
  getInstanceWidth: gdInitialInstance => number,
  getInstanceHeight: gdInitialInstance => number,
  getInstanceDepth: gdInitialInstance => number,
  forceUpdate: () => void,
|}) => ({
  name: 'Custom size',
  getLabel: () => i18n._(t`Custom size`),
  valueType: 'enumIcon',
  isHighlighted: value => value,
  renderIcon: value =>
    value ? <Link fontSize="small" /> : <Unlink fontSize="small" />,
  getValue: (instance: gdInitialInstance) => instance.hasCustomSize(),
  setValue: (instance: gdInitialInstance, newValue: boolean) => {
    if (
      instance.getCustomHeight() === 0 &&
      instance.getCustomWidth() === 0 &&
      instance.getCustomDepth() === 0
    ) {
      // The instance custom dimensions have never been set before.
      // To avoid setting setting all the dimensions to 0 when enabling
      // the instance custom size flag, the current instance dimensions are used.
      instance.setCustomWidth(getInstanceWidth(instance));
      instance.setCustomHeight(getInstanceHeight(instance));
      instance.setCustomDepth(getInstanceDepth(instance));
    }
    instance.setHasCustomSize(newValue);
    instance.setHasCustomDepth(newValue);
    forceUpdate();
  },
});

export const makeSchema = ({
  is3DInstance,
  i18n,
  forceUpdate,
  onEditObjectByName,
  onGetInstanceSize,
  layout,
}: {|
  is3DInstance: boolean,
  i18n: I18nType,
  forceUpdate: () => void,
  onEditObjectByName: (name: string) => void,
  onGetInstanceSize: gdInitialInstance => [number, number, number],
  layout: gdLayout,
|}): Schema => {
  const getInstanceWidth = (instance: gdInitialInstance) =>
    instance.hasCustomSize()
      ? instance.getCustomWidth()
      : onGetInstanceSize(instance)[0];

  const getInstanceHeight = (instance: gdInitialInstance) =>
    instance.hasCustomSize()
      ? instance.getCustomHeight()
      : onGetInstanceSize(instance)[1];

  const getInstanceDepth = (instance: gdInitialInstance) =>
    instance.hasCustomDepth()
      ? instance.getCustomDepth()
      : onGetInstanceSize(instance)[2];

  if (is3DInstance) {
    return [
      getTitleRow({ i18n }),
      getEditObjectButton({ i18n, onEditObjectByName }),
      {
        name: 'Position',
        type: 'row',
        preventWrap: true,
        children: [...getXAndYFields({ i18n }), getZField({ i18n })],
      },
      {
        name: 'Size',
        type: 'row',
        preventWrap: true,
        children: [
          {
            name: 'Custom size',
            type: 'column',
            children: [
              getWidthField({
                i18n,
                getInstanceWidth,
                getInstanceHeight,
                getInstanceDepth,
                forceUpdate,
              }),
              getHeightField({
                i18n,
                getInstanceWidth,
                getInstanceHeight,
                getInstanceDepth,
                forceUpdate,
              }),
              getDepthField({
                i18n,
                getInstanceWidth,
                getInstanceHeight,
                getInstanceDepth,
                forceUpdate,
              }),
            ],
          },
          {
            name: 'verticalCenterCustomSize',
            nonFieldType: 'verticalCenterWithBar',
            child: getCustomSizeField({
              i18n,
              getInstanceWidth,
              getInstanceHeight,
              getInstanceDepth,
              forceUpdate,
            }),
          },
        ],
      },
      getLayerField({ i18n, layout }),
      {
        name: 'Rotation',
        type: 'row',
        title: i18n._(t`Rotation`),
        preventWrap: true,
        children: [
          ...getRotationXAndRotationYFields({ i18n }),
          getRotationZField({ i18n, label: t`Z`, Icon: LetterZ }),
        ],
      },
    ];
  }

  return [
    getTitleRow({ i18n }),
    getEditObjectButton({ i18n, onEditObjectByName }),
    {
      name: 'Position',
      type: 'row',
      preventWrap: true,
      children: getXAndYFields({ i18n }),
    },
    getZOrderField({ i18n }),
    {
      name: 'custom-size-row',
      type: 'row',
      preventWrap: true,
      children: [
        getWidthField({
          i18n,
          getInstanceWidth,
          getInstanceHeight,
          getInstanceDepth,
          forceUpdate,
        }),
        {
          name: 'height-and-custom-size',
          type: 'row',
          preventWrap: true,
          children: [
            getHeightField({
              i18n,
              getInstanceWidth,
              getInstanceHeight,
              getInstanceDepth,
              forceUpdate,
            }),
            getCustomSizeField({
              i18n,
              getInstanceWidth,
              getInstanceHeight,
              getInstanceDepth,
              forceUpdate,
            }),
          ],
        },
      ],
    },
    getRotationZField({ i18n, label: t`Angle`, Icon: Angle }),
    getLayerField({ i18n, layout }),
  ];
};

export const reorderInstanceSchemaForCustomProperties = (
  schema: Schema,
  i18n: I18nType
): Schema => {
  const newSchema = [...schema];
  const animationFieldIndex = newSchema.findIndex(
    field => field.name && field.name === 'animation'
  );
  if (animationFieldIndex === -1) return newSchema;

  const [animationField] = newSchema.splice(animationFieldIndex, 1);
  newSchema.unshift({
    name: 'Animation',
    type: 'row',
    title: i18n._(t`Animation`),
    children: [animationField],
  });
  return newSchema;
};
