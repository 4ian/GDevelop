// @flow
import * as React from 'react';
import { ListItem } from '../List';
import ListIcon from '../ListIcon';
import TextField, {
  noMarginTextFieldInListItemTopOffset,
  type TextFieldInterface,
} from '../TextField';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../KeyboardShortcuts/InteractionKeys';
import { textEllipsisStyle } from '../TextEllipsis';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import Text from '../Text';

const styles = {
  textField: {
    top: noMarginTextFieldInListItemTopOffset,
    fontSize: 12,
  },
};

const LEFT_MOUSE_BUTTON = 0;

type Props<Item> = {|
  item: Item,
  itemName: string,
  id?: ?string,
  data?: HTMLDataset,
  isBold: boolean,
  onRename: string => void,
  editingName: boolean,
  getThumbnail?: () => string,
  renderItemLabel?: () => React.Node,
  selected: boolean,
  onItemSelected: (?Item) => void,
  errorStatus: '' | 'error' | 'warning',
  buildMenuTemplate: () => Array<MenuItemTemplate>,
  onEdit?: ?(Item) => void,
  hideMenuButton: boolean,
  scaleUpItemIconWhenSelected?: boolean,
|};

function ItemRow<Item>({
  item,
  itemName,
  id,
  data,
  isBold,
  onRename,
  editingName,
  getThumbnail,
  renderItemLabel,
  selected,
  onItemSelected,
  errorStatus,
  buildMenuTemplate,
  onEdit,
  hideMenuButton,
  scaleUpItemIconWhenSelected,
}: Props<Item>) {
  const textFieldRef = React.useRef<?TextFieldInterface>(null);
  const shouldDiscardChanges = React.useRef<boolean>(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      if (editingName) {
        shouldDiscardChanges.current = false;
        const timeoutId = setTimeout(() => {
          if (textFieldRef.current) textFieldRef.current.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    },
    [editingName]
  );

  const label = editingName ? (
    <TextField
      id="rename-item-field"
      margin="none"
      ref={textFieldRef}
      defaultValue={itemName}
      onBlur={e => {
        onRename(
          shouldDiscardChanges.current ? itemName : e.currentTarget.value
        );
      }}
      onKeyPress={event => {
        if (shouldValidate(event)) {
          if (textFieldRef.current) textFieldRef.current.blur();
        }
      }}
      onKeyUp={event => {
        if (shouldCloseOrCancel(event)) {
          const { current: currentTextField } = textFieldRef;
          if (currentTextField) {
            shouldDiscardChanges.current = true;
            currentTextField.blur();
          }
        }
      }}
      fullWidth
      style={styles.textField}
    />
  ) : (
    <div
      title={typeof itemName === 'string' ? itemName : undefined}
      style={{
        ...textEllipsisStyle,
        color: selected ? gdevelopTheme.listItem.selectedTextColor : undefined,
        fontStyle: isBold ? 'italic' : undefined,
        fontWeight: isBold ? 'bold' : 'normal',
      }}
    >
      {renderItemLabel ? (
        renderItemLabel()
      ) : (
        <Text noMargin size="body-small">
          {itemName}
        </Text>
      )}
    </div>
  );

  const itemStyle = {
    backgroundColor: selected
      ? errorStatus === ''
        ? gdevelopTheme.listItem.selectedBackgroundColor
        : errorStatus === 'error'
        ? gdevelopTheme.listItem.selectedErrorBackgroundColor
        : gdevelopTheme.listItem.selectedWarningBackgroundColor
      : undefined,
    color:
      errorStatus === ''
        ? undefined
        : errorStatus === 'error'
        ? gdevelopTheme.listItem.errorTextColor
        : gdevelopTheme.listItem.warningTextColor,
  };

  const leftIcon = getThumbnail ? (
    <ListIcon
      iconSize={24}
      src={getThumbnail()}
      cssAnimation={
        scaleUpItemIconWhenSelected && selected
          ? 'scale-and-jiggle 0.8s forwards'
          : ''
      }
    />
  ) : null;

  return (
    <ListItem
      style={{ ...itemStyle }}
      primaryText={label}
      leftIcon={leftIcon}
      displayMenuButton={!hideMenuButton}
      rightIconColor={
        selected
          ? gdevelopTheme.listItem.selectedRightIconColor
          : gdevelopTheme.listItem.rightIconColor
      }
      buildMenuTemplate={buildMenuTemplate}
      onClick={() => {
        if (!onItemSelected) return;
        if (editingName) return;

        onItemSelected(selected ? null : item);
      }}
      onDoubleClick={event => {
        if (event.button !== LEFT_MOUSE_BUTTON) return;
        if (!onEdit) return;
        if (editingName) return;

        onItemSelected(null);
        onEdit(item);
      }}
      id={id}
      data={data}
    />
  );
}

export default ItemRow;
