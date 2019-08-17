import React from 'react';
import { ListItem } from 'material-ui/List';
import IconMenu from '../Menu/IconMenu';
import ListIcon from '../ListIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { type Item } from '.';

const styles = {
  itemName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: -16,
  },
};

type Props = {
  index: number,
  item: Item,
  onRename: string => void,
  editingName: boolean,
  getThumbnail?: () => string,
  selected: true,
  onItemSelected: () => void,
  errorStatus: '' | 'error' | 'warning',
  buildMenuTemplate: () => Array<any>,
};

class ThemableItemRow extends React.Component<Props, *> {
  _renderItemMenu(item) {
    return (
      <IconMenu
        ref={iconMenu => (this._iconMenu = iconMenu)}
        iconButtonElement={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        buildMenuTemplate={this.props.buildMenuTemplate}
      />
    );
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  _onContextMenu = event => {
    if (this._iconMenu) this._iconMenu.open(event);
  };

  render() {
    const {
      item,
      selected,
      style,
      getThumbnail,
      errorStatus,
      muiTheme,
    } = this.props;

    const itemName = item.getName();
    const label = this.props.editingName ? (
      <TextField
        id="rename-item-field"
        ref={textField => (this.textField = textField)}
        defaultValue={itemName}
        onBlur={e => this.props.onRename(e.target.value)}
        onKeyPress={event => {
          if (event.charCode === 13) {
            // enter key pressed
            this.textField.blur();
          }
        }}
        fullWidth
        style={styles.textField}
      />
    ) : (
      <div
        style={{
          ...styles.itemName,
          color: selected ? muiTheme.listItem.selectedTextColor : undefined,
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
        onContextMenu={this._onContextMenu}
        primaryText={label}
        leftIcon={
          getThumbnail && <ListIcon iconSize={32} src={getThumbnail()} />
        }
        rightIconButton={this._renderItemMenu(item)}
        onClick={() => {
          if (!this.props.onItemSelected) return;
          if (this.props.editingName) return;

          this.props.onItemSelected(selected ? null : item);
        }}
      />
    );
  }
}

const ItemRow = muiThemeable()(ThemableItemRow);
export default ItemRow;
