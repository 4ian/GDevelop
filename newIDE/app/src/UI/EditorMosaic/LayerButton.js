// @flow
import React, { Component } from 'react';
import { type I18n as I18nType } from '@lingui/core';
import IconButton from '../IconButton';
import Layers from '@material-ui/icons/Layers';
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

export default class LayerButton extends Component<Props, {||}> {
  render() {
    return (
      <ElementWithMenu
        element={
          <IconButton style={styles.container}>
            <Layers htmlColor="white" style={styles.icon} />
          </IconButton>
        }
        buildMenuTemplate={this.props.buildMenuTemplate}
      />
    );
  }
}
