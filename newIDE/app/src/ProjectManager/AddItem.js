import React from 'react';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';
import EmptyMessage from '../UI/EmptyMessage';

const styles = {
  item: { height: 48 },
  message: {padding: 0},
}

export const makeAddItem = Item => ({ onClick, primaryText }) => {
  return (
    <Item
      primaryText={<EmptyMessage style={styles.message}>{primaryText}</EmptyMessage>}
      style={styles.item}
      rightIconButton={
        <IconButton>
          <Add onClick={onClick}/>
        </IconButton>
      }
      onEdit={onClick}
    />
  );
};
