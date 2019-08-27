// @flow
import React from 'react';
import { ListItem } from '../List';
import ListIcon from '../ListIcon';
import TextField, { noMarginTextFieldInListItemTopOffset } from '../TextField';
import { type Item } from '.';
import ThemeConsumer from '../Theme/ThemeConsumer';

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

type Props = {
  index: number,
  item: Item,
  onRename: string => void,
  editingName: boolean,
  getThumbnail?: () => string,
  selected: true,
  onItemSelected: (?Item) => void,
  errorStatus: '' | 'error' | 'warning',
  buildMenuTemplate: () => Array<any>,
  style: Object,
};

class ItemRow extends React.Component<Props, *> {
  textField: ?TextField;

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  render() {
    const { item, selected, style, getThumbnail, errorStatus } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => {
          const itemName = item.getName();
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

          return (
            <ListItem
              style={{ ...itemStyle, ...style }}
              primaryText={label}
              leftIcon={
                getThumbnail && <ListIcon iconSize={32} src={getThumbnail()} />
              }
              displayMenuButton
              buildMenuTemplate={this.props.buildMenuTemplate}
              onClick={() => {
                if (!this.props.onItemSelected) return;
                if (this.props.editingName) return;

                this.props.onItemSelected(selected ? null : item);
              }}
            />
          );
        }}
      </ThemeConsumer>
    );
  }
}

export default ItemRow;
