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
  }
};

export default class ObjectRow extends React.Component {
  _renderObjectMenu(object) {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton onClick={e => e.preventDefault()}>
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
      // TODO: This will make the text field lose focus for some reasons.
      // setTimeout(() => { if (this.textField) this.textField.focus() }, 100);
    }
  }

  render() {
    const { project, object, style, freezeUpdate } = this.props;
    if (freezeUpdate) return null;

    const objectName = object.getName();
    return (
      <ListItem
        style={style}
        primaryText={
          this.props.editingName
            ? <TextField
                id="rename-object-field"
                ref={textField => this.textField = textField}
                defaultValue={objectName}
                onBlur={e => this.props.onRename(e.target.value)}
                style={styles.textField}
              />
            : <div style={styles.objectName}>{objectName}</div>
        }
        leftAvatar={
          <Avatar
            src={this.props.getThumbnail(project, object)}
            style={styles.objectIcon}
          />
        }
        rightIconButton={this._renderObjectMenu(object)}
        onClick={() => {
          if (this.props.onObjectSelected)
            this.props.onObjectSelected(objectName)
        }}
      />
    );
  }
}
