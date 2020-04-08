// @flow
import * as React from 'react';
import { ListItem } from '../List';
import ListIcon from '../ListIcon';
import TextField, { noMarginTextFieldInListItemTopOffset } from '../TextField';
import ThemeConsumer from '../Theme/ThemeConsumer';
import { type MenuItemTemplate } from '../Menu/Menu.flow';

const styles = {
  itemName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
};

const LEFT_MOUSE_BUTTON = 0;

type Props<Item> = {
  item: Item,
  itemName: string,
  isBold: boolean,
  onRename: string => void,
  editingName: boolean,
  getThumbnail?: () => string,
  selected: boolean,
  onItemSelected: (?Item) => void,
  errorStatus: '' | 'error' | 'warning',
  buildMenuTemplate: () => Array<MenuItemTemplate>,
  onEdit?: ?(Item) => void,
  hideMenuButton: boolean,
  connectIconDragSource?: ?(React.Element<any>) => ?React.Node,
};

class ItemRow<Item> extends React.Component<Props<Item>> {
  textField: ?TextField;

  componentDidUpdate(prevProps: Props<Item>) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  render() {
    const {
      item,
      itemName,
      isBold,
      selected,
      getThumbnail,
      errorStatus,
      onEdit,
      onItemSelected,
      hideMenuButton,
      connectIconDragSource,
    } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => {
          const label = this.props.editingName ? (
            <TextField
              id="rename-item-field"
              margin="none"
              ref={textField => (this.textField = textField)}
              defaultValue={itemName}
              onBlur={e => this.props.onRename(e.currentTarget.value)}
              onKeyPress={event => {
                if (event.charCode === 13) {
                  // enter key pressed
                  if (this.textField) this.textField.blur();
                }
              }}
              fullWidth
              style={styles.textField}
            />
          ) : (
            <div
              style={{
                ...styles.itemName,
                color: selected
                  ? muiTheme.listItem.selectedTextColor
                  : undefined,
                fontStyle: isBold ? 'italic' : undefined,
                fontWeight: isBold ? 'bold' : 'normal',
              }}
            >
              {itemName}
            </div>
          );

          const itemStyle = {
            borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
            backgroundColor: selected
              ? errorStatus === ''
                ? muiTheme.listItem.selectedBackgroundColor
                : errorStatus === 'error'
                ? muiTheme.listItem.selectedErrorBackgroundColor
                : muiTheme.listItem.selectedWarningBackgroundColor
              : undefined,
            color:
              errorStatus === ''
                ? undefined
                : errorStatus === 'error'
                ? muiTheme.listItem.errorTextColor
                : muiTheme.listItem.warningTextColor,
          };

          const leftIcon = getThumbnail ? (
            <ListIcon iconSize={32} src={getThumbnail()} />
          ) : null;

          return (
            <ListItem
              style={{ ...itemStyle }}
              primaryText={label}
              leftIcon={
                connectIconDragSource && leftIcon
                  ? connectIconDragSource(<div>{leftIcon}</div>)
                  : leftIcon
              }
              displayMenuButton={!hideMenuButton}
              buildMenuTemplate={this.props.buildMenuTemplate}
              onClick={() => {
                if (!onItemSelected) return;
                if (this.props.editingName) return;

                onItemSelected(selected ? null : item);
              }}
              onDoubleClick={event => {
                if (event.button !== LEFT_MOUSE_BUTTON) return;
                if (!onEdit) return;
                if (this.props.editingName) return;

                onItemSelected(null);
                onEdit(item);
              }}
            />
          );
        }}
      </ThemeConsumer>
    );
  }
}

export default ItemRow;
