import React from 'react';
import { ListItem } from 'material-ui/List';
import IconMenu from '../UI/Menu/IconMenu';
import ListIcon from '../UI/ListIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Clipboard from '../Utils/Clipboard';
import { CLIPBOARD_KIND } from './ClipboardKind';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  objectName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: -16,
  },
};

class ThemableObjectRow extends React.Component {
  _renderObjectMenu(object) {
    return (
      <IconMenu
        ref={iconMenu => (this._iconMenu = iconMenu)}
        iconButtonElement={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        buildMenuTemplate={() => [
          {
            label: 'Edit object',
            enabled: !!this.props.onEdit,
            click: () => this.props.onEdit(object),
          },
          {
            label: 'Edit object variables',
            enabled: !!this.props.onEditVariables,
            click: () => this.props.onEditVariables(),
          },
          { type: 'separator' },
          {
            label: 'Rename',
            enabled: !!this.props.onEdit,
            click: () => this.props.onEditName(),
          },
          {
            label: 'Delete',
            enabled: !!this.props.onEdit,
            click: () => this.props.onDelete(),
          },
          { type: 'separator' },
          {
            label: 'Add a new object...',
            click: () => this.props.onAddNewObject(),
          },
          { type: 'separator' },
          {
            label: 'Copy',
            click: () => this.props.onCopyObject(),
          },
          {
            label: 'Cut',
            click: () => this.props.onCutObject(),
          },
          {
            label: 'Paste',
            enabled: Clipboard.has(CLIPBOARD_KIND),
            click: () => this.props.onPaste(),
          },
        ]}
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
    const { project, object, selected, style, muiTheme } = this.props;

    const objectName = object.getName();
    const label = this.props.editingName ? (
      <TextField
        id="rename-object-field"
        ref={textField => (this.textField = textField)}
        defaultValue={objectName}
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
          ...styles.objectName,
          color: selected ? muiTheme.listItem.selectedTextColor : undefined,
        }}
      >
        {objectName}
      </div>
    );

    const itemStyle = {
      borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
      backgroundColor: selected
        ? muiTheme.listItem.selectedBackgroundColor
        : undefined,
    };

    return (
      <ListItem
        style={{ ...itemStyle, ...style }}
        onContextMenu={this._onContextMenu}
        primaryText={label}
        leftIcon={<ListIcon src={this.props.getThumbnail(project, object)} />}
        rightIconButton={this._renderObjectMenu(object)}
        onClick={() => {
          if (!this.props.onObjectSelected) return;
          if (this.props.editingName) return;

          this.props.onObjectSelected(selected ? '' : objectName);
        }}
      />
    );
  }
}

const ObjectRow = muiThemeable()(ThemableObjectRow);
export default ObjectRow;
