// @flow
import * as React from 'react';
import { ListItem } from '../List';
import ListIcon from '../ListIcon';
import TextField, { noMarginTextFieldInListItemTopOffset } from '../TextField';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import { shouldValidate } from '../KeyboardShortcuts/InteractionKeys';
import { textEllipsisStyle } from '../TextEllipsis';
import GDevelopThemeContext from '../Theme/ThemeContext';

const styles = {
  textField: {
    top: noMarginTextFieldInListItemTopOffset,
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
  connectIconDragSource?: ?(React.Element<any>) => ?React.Node,
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
  connectIconDragSource,
}: Props<Item>) {
  const [textField, setTextField] = React.useState<?TextField>(null);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      if (editingName) {
        const timeoutId = setTimeout(() => {
          if (textField) textField.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    },
    [editingName, textField]
  );

  const label = editingName ? (
    <TextField
      id="rename-item-field"
      margin="none"
      ref={textField => setTextField(textField)}
      defaultValue={itemName}
      onBlur={e => onRename(e.currentTarget.value)}
      onKeyPress={event => {
        if (shouldValidate(event)) {
          if (textField) textField.blur();
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
      {renderItemLabel ? renderItemLabel() : itemName}
    </div>
  );

  const itemStyle = {
    borderBottom: `1px solid ${gdevelopTheme.listItem.separatorColor}`,
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
      leftIcon={
        connectIconDragSource && leftIcon
          ? connectIconDragSource(<div>{leftIcon}</div>)
          : leftIcon
      }
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
