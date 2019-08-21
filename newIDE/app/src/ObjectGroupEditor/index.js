// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import IconButton from '../UI/IconButton';
import Remove from 'material-ui/svg-icons/content/remove';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import EmptyMessage from '../UI/EmptyMessage';
import { Column } from '../UI/Grid';
const gd = global.gd;

type Props = {|
  project: ?gdProject,
  group: gdObjectGroup,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  onSizeUpdated?: () => void,
|};

type State = {|
  newObjectName: string,
|};

export default class ObjectGroupEditor extends React.Component<Props, State> {
  state = {
    newObjectName: '',
  };

  removeObject = (objectName: string) => {
    const { group, onSizeUpdated } = this.props;

    group.removeObject(objectName);

    this.forceUpdate();
    if (onSizeUpdated) onSizeUpdated();
  };

  addObject = (objectName: string) => {
    const { group, onSizeUpdated } = this.props;

    group.addObject(objectName);
    this.setState({
      newObjectName: '',
    });
    if (onSizeUpdated) onSizeUpdated();
  };

  _renderExplanation() {
    const { group, globalObjectsContainer, objectsContainer } = this.props;

    let type = undefined;
    group
      .getAllObjectsNames()
      .toJSArray()
      .forEach(objectName => {
        const objectType = gd.getTypeOfObject(
          globalObjectsContainer,
          objectsContainer,
          objectName,
          false
        );
        if (type === undefined || objectType === type) type = objectType;
        else type = '';
      });

    let message = '';
    if (type === undefined) {
      message = 'This group is empty';
    } else if (type === '') {
      message =
        "This group contains objects of different kinds. You'll only be able to use actions and conditions common to all objects with this group.";
    } else {
      message = `This group contains objects of the same kind (${type}). You can use actions and conditions related to this kind of objects in events with this group.`;
    }

    return <EmptyMessage>{message}</EmptyMessage>;
  }

  render() {
    const {
      project,
      group,
      globalObjectsContainer,
      objectsContainer,
    } = this.props;

    return (
      <div>
        {this._renderExplanation()}
        <List>
          {group
            .getAllObjectsNames()
            .toJSArray()
            .map(objectName => {
              return (
                <ListItem
                  key={objectName}
                  primaryText={objectName}
                  rightIconButton={
                    <IconButton onClick={() => this.removeObject(objectName)}>
                      <Remove />
                    </IconButton>
                  }
                />
              );
            })}
        </List>
        <Column>
          <ObjectSelector
            project={project}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            value={this.state.newObjectName}
            onChange={name => this.setState({ newObjectName: name })}
            onChoose={this.addObject}
            openOnFocus
            noGroups
            hintText={<Trans>Choose an object to add to the group</Trans>}
            fullWidth
          />
        </Column>
      </div>
    );
  }
}
