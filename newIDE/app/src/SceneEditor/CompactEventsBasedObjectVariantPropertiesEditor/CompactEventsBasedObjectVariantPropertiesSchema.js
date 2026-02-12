// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import { type Schema } from '../../PropertiesEditor/PropertiesEditorSchema';
import { styles } from '.';
import Rectangle from '../../Utils/Rectangle';

import Object3d from '../../UI/CustomSvgIcons/Object3d';
import Object2d from '../../UI/CustomSvgIcons/Object2d';

const getFitToContentButton = ({
  i18n,
  eventsBasedObjectVariant,
  getContentAABB,
  onEventsBasedObjectChildrenEdited,
  forceUpdate,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  getContentAABB: () => Rectangle | null,
  onEventsBasedObjectChildrenEdited: () => void,
  forceUpdate: () => void,
|}) => ({
  label: i18n._(t`Fit to content`),
  nonFieldType: 'button',
  onClick: (instance: gdInitialInstance) => {
    const contentAABB = getContentAABB();
    if (!contentAABB) {
      return;
    }
    if (contentAABB.width() > 0) {
      eventsBasedObjectVariant.setAreaMinX(contentAABB.left);
      eventsBasedObjectVariant.setAreaMinY(contentAABB.top);
    }
    if (contentAABB.height() > 0) {
      eventsBasedObjectVariant.setAreaMaxX(contentAABB.right);
      eventsBasedObjectVariant.setAreaMaxY(contentAABB.bottom);
    }
    if (contentAABB.depth() > 0) {
      eventsBasedObjectVariant.setAreaMinZ(contentAABB.zMin);
      eventsBasedObjectVariant.setAreaMaxZ(contentAABB.zMax);
    }
    onEventsBasedObjectChildrenEdited();
    forceUpdate();
  },
  disabled: 'onValuesDifferent',
  getValue: () => '',
});

const getTitleRow = ({
  i18n,
  eventsBasedObject,
}: {|
  i18n: I18nType,
  eventsBasedObject: gdEventsBasedObject,
|}) => ({
  name: 'Variant',
  title: i18n._(t`Custom object variant`),
  renderLeftIcon: className =>
    eventsBasedObject.isRenderedIn3D() ? (
      <Object3d className={className} style={styles.icon} />
    ) : (
      <Object2d className={className} style={styles.icon} />
    ),
  getValue: (instance: gdInitialInstance) =>
    eventsBasedObject.getFullName() || eventsBasedObject.getName(),
  defaultValue: '',
  nonFieldType: 'title',
});

const getAreaMinXField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMinX',
  getLabel: () => i18n._(t`Left`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMinX(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMinX()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMinX(newValue);
    if (newValue > eventsBasedObjectVariant.getAreaMaxX()) {
      eventsBasedObjectVariant.setAreaMaxX(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

const getAreaMaxXField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMaxX',
  getLabel: () => i18n._(t`Right`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMaxX(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMaxX()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMaxX(newValue);
    if (newValue < eventsBasedObjectVariant.getAreaMinX()) {
      eventsBasedObjectVariant.setAreaMinX(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

const getAreaMinYField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMinY',
  getLabel: () => i18n._(t`Top`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMinY(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMinY()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMinY(newValue);
    if (newValue > eventsBasedObjectVariant.getAreaMaxY()) {
      eventsBasedObjectVariant.setAreaMaxY(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

const getAreaMaxYField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMaxY',
  getLabel: () => i18n._(t`Bottom`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMaxY(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMaxY()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMaxY(newValue);
    if (newValue < eventsBasedObjectVariant.getAreaMinY()) {
      eventsBasedObjectVariant.setAreaMinY(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

const getAreaMinZField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMinZ',
  getLabel: () => i18n._(t`Z min`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMinZ(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMinZ()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMinZ(newValue);
    if (newValue > eventsBasedObjectVariant.getAreaMaxZ()) {
      eventsBasedObjectVariant.setAreaMaxZ(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

const getAreaMaxZField = ({
  i18n,
  eventsBasedObjectVariant,
  forceUpdate,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  forceUpdate: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
|}) => ({
  name: 'AreaMaxZ',
  getLabel: () => i18n._(t`Z max`),
  valueType: 'number',
  getValue: () => eventsBasedObjectVariant.getAreaMaxZ(),
  setValue: (instance: gdInitialInstance, newValue: number) => {
    if (newValue === eventsBasedObjectVariant.getAreaMaxZ()) {
      return;
    }
    eventsBasedObjectVariant.setAreaMaxZ(newValue);
    if (newValue < eventsBasedObjectVariant.getAreaMinZ()) {
      eventsBasedObjectVariant.setAreaMinZ(newValue);
      forceUpdate();
    }
    onEventsBasedObjectChildrenEdited();
  },
});

export const makeSchema = ({
  i18n,
  forceUpdate,
  eventsBasedObject,
  eventsBasedObjectVariant,
  getContentAABB,
  onEventsBasedObjectChildrenEdited,
}: {|
  i18n: I18nType,
  forceUpdate: () => void,
  eventsBasedObject: gdEventsBasedObject,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  getContentAABB: () => Rectangle | null,
  onEventsBasedObjectChildrenEdited: () => void,
|}): Schema => {
  return [
    getTitleRow({ i18n, eventsBasedObject }),
    {
      name: 'Bounds',
      title: i18n._(t`Bounds`),
      nonFieldType: 'sectionTitle',
      getValue: undefined,
    },
    {
      name: 'AreaBoundX',
      type: 'row',
      preventWrap: true,
      children: [
        getAreaMinXField({
          i18n,
          eventsBasedObjectVariant,
          forceUpdate,
          onEventsBasedObjectChildrenEdited,
        }),
        getAreaMaxXField({
          i18n,
          eventsBasedObjectVariant,
          forceUpdate,
          onEventsBasedObjectChildrenEdited,
        }),
      ],
    },
    {
      name: 'AreaBoundY',
      type: 'row',
      preventWrap: true,
      children: [
        getAreaMinYField({
          i18n,
          eventsBasedObjectVariant,
          forceUpdate,
          onEventsBasedObjectChildrenEdited,
        }),
        getAreaMaxYField({
          i18n,
          eventsBasedObjectVariant,
          forceUpdate,
          onEventsBasedObjectChildrenEdited,
        }),
      ],
    },
    eventsBasedObject.isRenderedIn3D()
      ? {
          name: 'AreaBoundZ',
          type: 'row',
          preventWrap: true,
          children: [
            getAreaMinZField({
              i18n,
              eventsBasedObjectVariant,
              forceUpdate,
              onEventsBasedObjectChildrenEdited,
            }),
            getAreaMaxZField({
              i18n,
              eventsBasedObjectVariant,
              forceUpdate,
              onEventsBasedObjectChildrenEdited,
            }),
          ],
        }
      : null,
    getFitToContentButton({
      i18n,
      eventsBasedObjectVariant,
      getContentAABB,
      onEventsBasedObjectChildrenEdited,
      forceUpdate,
    }),
  ].filter(Boolean);
};
