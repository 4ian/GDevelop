// @flow
import React, { Component } from 'react';
import IconButton from '../IconButton';
import FilterList from 'material-ui/svg-icons/content/filter-list';
import IconMenu from '../Menu/IconMenu';

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
      <IconMenu
        iconButtonElement={
          <IconButton style={styles.container}>
            <FilterList color="white" />
          </IconButton>
        }
        buildMenuTemplate={this.props.buildMenuTemplate}
      />
    );
  }
}
