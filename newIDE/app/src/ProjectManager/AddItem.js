import React from 'react';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';

const style = { height: 48 };

export const makeAddItem = Item => ({ onClick }) => {
  return (
    <Item
      primaryText=""
      style={style}
      rightIconButton={
        <IconButton>
          <Add onClick={onClick}/>
        </IconButton>
      }
      onEdit={onClick}
    />
  );
};
