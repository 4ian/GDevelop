import React from 'react';
import { ListItem } from 'material-ui/List';
import IconMenu from '../UI/Menu/IconMenu';
import IconButton from '../UI/IconButton';
import TextField from '../UI/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';

type Props = {|
  group: gdObjectGroup,
  style: Object,
  onEdit: ?(gdObjectGroup) => void,
  onEditName: () => void,
  onDelete: () => void,
  onRename: string => void,
  editingName: boolean,
  isGlobalGroup: boolean,
|};

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

export default class ThemableGroupRow extends React.Component<Props, {||}> {
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
            label: 'Set as Global group',
            enabled: !this.props.isGlobalGroup,
            click: () => this.props.onSetAsGlobalGroup(),
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
    const { group, style, isGlobalGroup } = this.props;

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
      <div
        style={{
          ...styles.groupName,
          fontStyle: isGlobalGroup ? 'italic' : undefined,
          fontWeight: isGlobalGroup ? 'bold' : 'normal',
        }}
      >
        {groupName}
      </div>
    );

    return (
      <ThemeConsumer>
        {muiTheme => (
          <ListItem
            style={{
              borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
              ...style,
            }}
            onContextMenu={this._onContextMenu}
            primaryText={label}
            rightIconButton={this._renderGroupMenu(group)}
            onClick={() => {
              // It's essential to discard clicks when editing the name,
              // to avoid weird opening of an editor when clicking on the
              // text field.
              if (!this.props.editingName) this.props.onEdit(group);
            }}
          />
        )}
      </ThemeConsumer>
    );
  }
}
