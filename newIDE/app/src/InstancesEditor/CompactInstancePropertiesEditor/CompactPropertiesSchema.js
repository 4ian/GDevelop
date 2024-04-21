// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import { type Schema, type SectionTitle } from '../../CompactPropertiesEditor';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import { styles } from '.';

import Layers from '../../UI/CustomSvgIcons/Layers';
import LetterX from '../../UI/CustomSvgIcons/LetterX';
import LetterY from '../../UI/CustomSvgIcons/LetterY';
import LetterH from '../../UI/CustomSvgIcons/LetterH';
import LetterW from '../../UI/CustomSvgIcons/LetterW';
import LetterD from '../../UI/CustomSvgIcons/LetterD';
import LetterZ from '../../UI/CustomSvgIcons/LetterZ';
import Instance from '../../UI/CustomSvgIcons/Instance';
import Link from '../../UI/CustomSvgIcons/Link';
import Unlink from '../../UI/CustomSvgIcons/Unlink';
import RemoveCircle from '../../UI/CustomSvgIcons/RemoveCircle';
import Lock from '../../UI/CustomSvgIcons/Lock';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';
import Restore from '../../UI/CustomSvgIcons/Restore';
import Object3d from '../../UI/CustomSvgIcons/Object3d';
import Object2d from '../../UI/CustomSvgIcons/Object2d';
import RotateX from '../../UI/CustomSvgIcons/RotateX';
import RotateY from '../../UI/CustomSvgIcons/RotateY';
import RotateZ from '../../UI/CustomSvgIcons/RotateZ';

/**
 * Applies ratio to value without intermediary value to avoid precision issues.
 */
const applyRatio = ({
  oldReferenceValue,
  newReferenceValue,
  valueToApplyTo,
}: {|
  oldReferenceValue: number,
  newReferenceValue: number,
  valueToApplyTo: number,
|}) => {
  return (newReferenceValue / oldReferenceValue) * valueToApplyTo;
};

const getEditObjectButton = ({
  i18n,
  onEditObjectByName,
  is3DInstance,
}: {|
  i18n: I18nType,
  onEditObjectByName: (name: string) => void,
  is3DInstance: boolean,
|}) => ({
  label: i18n._(t`Edit object`),
  disabled: 'onValuesDifferent',
  nonFieldType: 'button',
  getIcon: is3DInstance
    ? props => <Object3d {...props} />
    : props => <Object2d {...props} />,
  getValue: (instance: gdInitialInstance) => instance.getObjectName(),
  onClick: (instance: gdInitialInstance) =>
    onEditObjectByName(instance.getObjectName()),
});

const getRotationXAndRotationYFields = ({ i18n }: {| i18n: I18nType |}) => [
  {
    name: 'Rotation X',
    getLabel: () => i18n._(t`Rotation (X)`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getRotationX(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setRotationX(newValue),
    renderLeftIcon: className => <RotateX className={className} />,
  },
  {
    name: 'Rotation Y',
    getLabel: () => i18n._(t`Rotation (Y)`),
    valueType: 'number',
    getValue: (instance: gdInitialInstance) => instance.getRotationY(),
    setValue: (instance: gdInitialInstance, newValue: number) =>
      instance.setRotationY(newValue),
    renderLeftIcon: className => <RotateY className={className} />,
  },
];
const getRotationZField = ({ i18n }: {| i18n: I18nType |}) => ({
  name: 'Angle',
  getLabel: () => i18n._(t`Rotation (Z)`),
  valueType: 'number',
  getValue: (instance: gdInitialInstance) => instance.getAngle(),
  setValue: (instance: gdInitialInstance, newValue: number) =>
    instance.setAngle(newValue),
  renderLeftIcon: className => <RotateZ className={className} />,
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
      name: 'Instance',
      title: i18n._(t`Instance`),
      renderLeftIcon: className => (
        <Instance className={className} style={styles.icon} />
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
          <RemoveCircle style={styles.icon} />
        ) : value === 'locked' ? (
          <Lock style={styles.icon} />
        ) : (
          <LockOpen style={styles.icon} />
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
    const shouldKeepRatio = instance.shouldKeepRatio();
    const newWidth = Math.max(newValue, 0);
    if (shouldKeepRatio) {
      const initialWidth = getInstanceWidth(instance) || 1;
      instance.setCustomWidth(newWidth);
      instance.setCustomHeight(
        applyRatio({
          oldReferenceValue: initialWidth,
          newReferenceValue: newWidth,
          valueToApplyTo: getInstanceHeight(instance),
        })
      );
      instance.setCustomDepth(
        applyRatio({
          oldReferenceValue: initialWidth,
          newReferenceValue: newWidth,
          valueToApplyTo: getInstanceDepth(instance),
        })
      );
    } else {
      instance.setCustomWidth(newWidth);
      instance.setCustomHeight(getInstanceHeight(instance));
      instance.setCustomDepth(getInstanceDepth(instance));
    }

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <LetterW className={className} />,
  getEndAdornmentIcon: className => <Restore className={className} />,
  onClickEndAdornment: (instance: gdInitialInstance) => {
    instance.setHasCustomSize(false);
    instance.setHasCustomDepth(false);
    forceUpdate();
  },
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
    const shouldKeepRatio = instance.shouldKeepRatio();
    const newHeight = Math.max(newValue, 0);
    if (shouldKeepRatio) {
      const initialHeight = getInstanceHeight(instance) || 1;
      instance.setCustomWidth(
        applyRatio({
          oldReferenceValue: initialHeight,
          newReferenceValue: newHeight,
          valueToApplyTo: getInstanceWidth(instance),
        })
      );
      instance.setCustomHeight(newHeight);
      instance.setCustomDepth(
        applyRatio({
          oldReferenceValue: initialHeight,
          newReferenceValue: newHeight,
          valueToApplyTo: getInstanceDepth(instance),
        })
      );
    } else {
      instance.setCustomWidth(getInstanceWidth(instance));
      instance.setCustomHeight(newHeight);
      instance.setCustomDepth(getInstanceDepth(instance));
    }

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <LetterH className={className} />,
  getEndAdornmentIcon: className => <Restore className={className} />,
  onClickEndAdornment: (instance: gdInitialInstance) => {
    instance.setHasCustomSize(false);
    instance.setHasCustomDepth(false);
    forceUpdate();
  },
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
    const shouldKeepRatio = instance.shouldKeepRatio();
    const newDepth = Math.max(newValue, 0);
    if (shouldKeepRatio) {
      const initialDepth = getInstanceDepth(instance) || 1;
      instance.setCustomWidth(
        applyRatio({
          oldReferenceValue: initialDepth,
          newReferenceValue: newDepth,
          valueToApplyTo: getInstanceWidth(instance),
        })
      );
      instance.setCustomHeight(
        applyRatio({
          oldReferenceValue: initialDepth,
          newReferenceValue: newDepth,
          valueToApplyTo: getInstanceHeight(instance),
        })
      );
      instance.setCustomDepth(newDepth);
    } else {
      instance.setCustomWidth(getInstanceWidth(instance));
      instance.setCustomHeight(getInstanceHeight(instance));
      instance.setCustomDepth(newDepth);
    }

    // This must be done after reading the size.
    instance.setHasCustomSize(true);
    instance.setHasCustomDepth(true);
    forceUpdate();
  },
  renderLeftIcon: className => <LetterD className={className} />,
  getEndAdornmentIcon: className => <Restore className={className} />,
  onClickEndAdornment: (instance: gdInitialInstance) => {
    instance.setHasCustomSize(false);
    instance.setHasCustomDepth(false);
    forceUpdate();
  },
});
const getKeepRatioField = ({
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
  name: 'Keep ratio',
  getLabel: () => i18n._(t`Keep ratio`),
  valueType: 'enumIcon',
  isHighlighted: value => value,
  renderIcon: value =>
    value ? <Link style={styles.icon} /> : <Unlink style={styles.icon} />,
  getValue: (instance: gdInitialInstance) => instance.shouldKeepRatio(),
  setValue: (instance: gdInitialInstance, newValue: boolean) =>
    instance.setShouldKeepRatio(newValue),
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
      getEditObjectButton({ i18n, onEditObjectByName, is3DInstance }),
      {
        name: 'Position',
        type: 'row',
        preventWrap: true,
        removeSpacers: true,
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
            name: 'Keep ratio column',
            nonFieldType: 'verticalCenterWithBar',
            child: getKeepRatioField({
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
        removeSpacers: true,
        children: getRotationXAndRotationYFields({ i18n }),
      },
      getRotationZField({ i18n }),
    ];
  }

  return [
    getTitleRow({ i18n }),
    getEditObjectButton({ i18n, onEditObjectByName, is3DInstance }),
    {
      name: 'Position',
      type: 'row',
      preventWrap: true,
      removeSpacers: true,
      children: getXAndYFields({ i18n }),
    },
    getZOrderField({ i18n }),
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
          ],
        },
        {
          name: 'Keep ratio column',
          nonFieldType: 'verticalCenterWithBar',
          child: getKeepRatioField({
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
      removeSpacers: true,
      children: [getRotationZField({ i18n })],
    },
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
  const contentSectionTitle: SectionTitle = {
    nonFieldType: 'sectionTitle',
    name: 'Content',
    title: 'Content',
    getValue: undefined,
  };
  if (animationFieldIndex === -1) {
    if (newSchema.length > 0) {
      newSchema.unshift(contentSectionTitle);
    }
    return newSchema;
  }

  const [animationField] = newSchema.splice(animationFieldIndex, 1);

  const firstFields: Schema = [
    {
      name: 'Animation',
      type: 'row',
      title: i18n._(t`Animation`),
      // $FlowIgnore - We are confident the animation field is not a row or a column.
      children: [{ ...animationField, hideLabel: true }],
    },
  ];
  if (newSchema.length > 0) {
    firstFields.push(contentSectionTitle);
  }
  newSchema.unshift(...firstFields);
  return newSchema;
};
