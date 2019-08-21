import React from 'react';
import IconButton from './IconButton';
import Add from 'material-ui/svg-icons/content/add';
import Search from 'material-ui/svg-icons/action/search';
import EmptyMessage from './EmptyMessage';
// No i18n in this file

const styles = {
  item: { height: 48 },
  message: { padding: 0 },
};

export const makeCommonItem = (Item, Icon) => ({
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
          <Icon
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

/**
 * An Higher-order component that create an item that must be put at the
 * end of a list to allow the user to add a new item.
 * @param Item The component to wrap. Should act as a material-ui ListItem.
 */
export const makeAddItem = Item => makeCommonItem(Item, Add);

/**
 * An Higher-order component that create an item that must be put at the
 * end of a list to allow the user to add a new item.
 * @param Item The component to wrap. Should act as a material-ui ListItem.
 */
export const makeSearchItem = Item => makeCommonItem(Item, Search);
