import React from 'react';
import { ListItem } from 'material-ui/List';
import IconMenu from '../UI/Menu/IconMenu';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  groupName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: -16,
  },
};

class ThemableGroupRow extends React.Component {
  _renderGroupMenu(group) {
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
            label: 'Edit group',
            click: () => this.props.onEdit(group),
          },
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
    const { group, style, muiTheme } = this.props;

    const groupName = group.getName();
    const label = this.props.editingName ? (
      <TextField
        id="rename-object-field"
        ref={textField => (this.textField = textField)}
        defaultValue={groupName}
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
      <div style={styles.groupName}>{groupName}</div>
    );

    const itemStyle = {
      borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
    };

    return (
      <ListItem
        style={{ ...itemStyle, ...style }}
        onContextMenu={this._onContextMenu}
        primaryText={label}
        rightIconButton={this._renderGroupMenu(group)}
        onClick={() => {
          this.props.onEdit(group);
        }}
      />
    );
  }
}

const GroupRow = muiThemeable()(ThemableGroupRow);
export default GroupRow;
