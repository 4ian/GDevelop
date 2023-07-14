// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import IconButton from '../IconButton';
import ElementWithMenu from '../Menu/ElementWithMenu';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import Filter from '../CustomSvgIcons/Filter';

const styles = {
  mediumContainer: {
    padding: 0,
    width: 32,
    height: 32,
  },
  smallContainer: {
    padding: 0,
    width: 16,
    height: 16,
  },
  icon: {
    width: 16,
    height: 16,
  },
};

type Props = {|
  buildMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
  size?: 'small',
|};

export default function TagsButton(props: Props) {
  return (
    <ElementWithMenu
      element={
        <IconButton
          style={
            props.size === 'small'
              ? styles.smallContainer
              : styles.mediumContainer
          }
        >
          <Filter htmlColor="inherit" style={styles.icon} />
        </IconButton>
      }
      buildMenuTemplate={props.buildMenuTemplate}
    />
  );
}
