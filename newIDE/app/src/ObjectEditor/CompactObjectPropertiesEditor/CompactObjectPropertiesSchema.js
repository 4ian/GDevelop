// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { styles } from '.';
import Object3d from '../../UI/CustomSvgIcons/Object3d';
import Object2d from '../../UI/CustomSvgIcons/Object2d';
import { type Schema, type SectionTitle } from '../../CompactPropertiesEditor';

const getTitleRow = ({
  i18n,
  is3DObject,
}: {|
  i18n: I18nType,
  is3DObject: boolean,
|}) => ({
  name: 'Title',
  type: 'row',
  preventWrap: true,
  children: [
    {
      name: 'Object',
      title: i18n._(t`Object`),
      renderLeftIcon: className =>
        is3DObject ? (
          <Object3d className={className} style={styles.icon} />
        ) : (
          <Object2d className={className} style={styles.icon} />
        ),
      getValue: ({
        object,
      }: {
        object: gdObject,
        objectConfiguration: gdObjectConfiguration,
      }) => object.getName(),
      nonFieldType: 'title',
      defaultValue: i18n._(t`Different objects`),
    },
  ],
});

export const makeObjectSchema = ({
  is3DObject,
  i18n,
}: {|
  is3DObject: boolean,
  i18n: I18nType,
|}): Schema => {
  return [getTitleRow({ i18n, is3DObject })];
};
