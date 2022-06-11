// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import IconButton from '../IconButton';
import FilterList from '@material-ui/icons/FilterList';
import ElementWithMenu from '../Menu/ElementWithMenu';
import { type MenuItemTemplate } from '../Menu/Menu.flow';

const styles = {
  container: {
    padding: 0,
    width: 32,
    height: 32,
  },
  icon: {
    width: 16,
    height: 16,
  },
};

type Props = {|
  buildMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
|};

export default function TagsButton(props: Props) {
  return (
    <ElementWithMenu
      element={
        <IconButton style={styles.container}>
          <FilterList htmlColor="inherit" style={styles.icon} />
        </IconButton>
      }
      buildMenuTemplate={props.buildMenuTemplate}
    />
  );
}
