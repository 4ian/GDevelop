import React from 'react';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add';
import EmptyMessage from '../UI/EmptyMessage';

const styles = {
  item: { height: 48 },
  message: { padding: 0 },
};

/**
 * An Higher-order component that create an item that must be put at the
 * end of a list to allow the user to add a new item.
 * @param Item The component to wrap. Should act as a material-ui ListItem.
 */
export const makeAddItem = Item => ({
  onClick,
  primaryText,
  style,
  ...rest
}) => {
  return (
    <Item
      primaryText={
        <EmptyMessage style={styles.message}>{primaryText}</EmptyMessage>
      }
      style={{ ...styles.item, ...style }}
      rightIconButton={
        <IconButton>
          <Add
            onClick={event => {
              event.stopPropagation();
              onClick();
            }}
          />
        </IconButton>
      }
      onClick={onClick}
      {...rest}
    />
  );
};
