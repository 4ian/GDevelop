// @flow
import React, { Component } from 'react';
import IconButton from '../IconButton';
import FilterList from '@material-ui/icons/FilterList';
import ElementWithMenu from '../Menu/ElementWithMenu';

const styles = {
  container: {
    padding: 0,
    width: 32,
    height: 32,
  },
};

type Props = {
  buildMenuTemplate: () => Array<any>,
};

export default class TagsButton extends Component<Props, {||}> {
  render() {
    return (
      <ElementWithMenu
        element={
          <IconButton style={styles.container}>
            <FilterList htmlColor="white" />
          </IconButton>
        }
        buildMenuTemplate={this.props.buildMenuTemplate}
      />
    );
  }
}
