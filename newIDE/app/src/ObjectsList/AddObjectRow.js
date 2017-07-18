import React from 'react';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';

export default class ObjectRow extends React.Component {
  render() {
    const { style, onAdd } = this.props;
    return (
      <ListItem
        style={style}
        primaryText=""
        rightIconButton={
          <IconButton onClick={onAdd}>
            <Add />
          </IconButton>
        }
        onClick={onAdd}
      />
    );
  }
}
