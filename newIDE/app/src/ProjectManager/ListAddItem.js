import React from 'react';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';

const style = { height: 48 };

export default ({ onClick }) => {
  return (
    <ListItem
      key={'add-scene'}
      primaryText=""
      style={style}
      rightIconButton={
        <IconButton>
          <Add />
        </IconButton>
      }
      onClick={onClick}
    />
  );
};
