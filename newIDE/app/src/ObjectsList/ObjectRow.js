import React from 'react';
import { ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from '../UI/Menu/IconMenu';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const styles = {
  objectName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  objectIcon: { borderRadius: 0 },
  textField: {
    top: -16,
  },
  selectedBackground: {
    backgroundColor: '#4ab0e4', //TODO: Use theme color instead
  },
  selectedObjectName: {
    color: '#FFF',
  },
};

export default class ObjectRow extends React.Component {
  _renderObjectMenu(object) {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton
            onTouchTap={e =>
              e.preventDefault() /*Prevent bubbling the event to ListItem*/}
          >
            <MoreVertIcon />
          </IconButton>
        }
        menuTemplate={[
          {
            label: 'Edit object',
            enabled: !!this.props.onEdit,
            click: () => this.props.onEdit(object),
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
      setTimeout(
        () => {
          if (this.textField) this.textField.focus();
        },
        100
      );
    }
  }

  render() {
    const { project, object, selected, style } = this.props;

    const objectName = object.getName();
    const label = this.props.editingName
      ? <TextField
          id="rename-object-field"
          ref={textField => this.textField = textField}
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
      : <div
          style={
            selected
              ? { ...styles.objectName, ...styles.selectedObjectName }
              : styles.objectName
          }
        >
          {objectName}
        </div>;

    return (
      <ListItem
        style={selected ? { ...styles.selectedBackground, ...style } : style}
        primaryText={label}
        leftAvatar={
          <Avatar
            src={this.props.getThumbnail(project, object)}
            style={styles.objectIcon}
          />
        }
        rightIconButton={this._renderObjectMenu(object)}
        onTouchTap={() => {
          if (!this.props.onObjectSelected) return;
          if (this.props.editingName) return;

          this.props.onObjectSelected(selected ? '' : objectName);
        }}
      />
    );
  }
}
