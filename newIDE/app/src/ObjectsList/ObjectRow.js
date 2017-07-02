import React from 'react';
import { ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconMenu from '../UI/Menu/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const styles = {
  objectName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  objectIcon: { borderRadius: 0 },
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
            enabled: !!this.props.onEditObject,
            click: () => this.props.onEditObject(object),
          },
        ]}
      />
    );
  }

  render() {
    const { project, object, style, freezeUpdate } = this.props;
    if (freezeUpdate) return null;

    const objectName = object.getName();
    return (
      <ListItem
        style={style}
        primaryText={<div style={styles.objectName}>{objectName}</div>}
        leftAvatar={
          <Avatar
            src={this.props.getThumbnail(project, object)}
            style={styles.objectIcon}
          />
        }
        rightIconButton={this._renderObjectMenu(object)}
        onTouchTap={() => this.props.onObjectSelected(objectName)}
      />
    );
  }
}
