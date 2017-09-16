import React from 'react';
import { ListItem } from 'material-ui/List';
import IconMenu from '../UI/Menu/IconMenu';
import ListIcon from '../UI/ListIcon';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const styles = {
  container: {
    borderTop: '1px solid #e0e0e0', //TODO: Use theme color instead
  },
  objectName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: -16,
  },
  selectedBackgroundColor: '#4ab0e4', //TODO: Use theme color instead
  selectedObjectNameColor: '#FFF',
};

export default class ObjectRow extends React.Component {
  _renderObjectMenu(object) {
    return (
      <IconMenu
        ref={iconMenu => this._iconMenu = iconMenu}
        iconButtonElement={
          <IconButton
            onClick={e =>
              e.stopPropagation() /*Prevent bubbling the event to ListItem*/}
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
            label: 'Edit object variables',
            enabled: !!this.props.onEditVariables,
            click: () => this.props.onEditVariables(),
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

  _onContextMenu = event => {
    if (this._iconMenu) this._iconMenu.open(event);
  };

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
          style={{
            ...styles.objectName,
            color: selected ? styles.selectedObjectNameColor : undefined,
          }}
        >
          {objectName}
        </div>;

    const itemStyle = {
      ...styles.container,
      backgroundColor: selected ? styles.selectedBackgroundColor : undefined,
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
