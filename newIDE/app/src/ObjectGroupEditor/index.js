// @flow
import { t } from '@lingui/macro';

import * as React from 'react';
import { List, ListItem } from '../UI/List';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import EmptyMessage from '../UI/EmptyMessage';
import { Column } from '../UI/Grid';
import { Paper } from '@material-ui/core';
const gd: libGDevelop = global.gd;

const styles = {
  objectSelector: { position: 'sticky', bottom: 0 },
};

type Props = {|
  project: ?gdProject,
  group: gdObjectGroup,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  onSizeUpdated?: () => void,
|};

const ObjectGroupEditor = ({
  project,
  group,
  globalObjectsContainer,
  objectsContainer,
  onSizeUpdated,
}: Props) => {
  const [newObjectName, setNewObjectName] = React.useState<string>('');

  const removeObject = (objectName: string) => {
    group.removeObject(objectName);

    if (onSizeUpdated) onSizeUpdated();
  };

  const addObject = (objectName: string) => {
    group.addObject(objectName);
    setNewObjectName('');
    if (onSizeUpdated) onSizeUpdated();
  };

  const renderExplanation = () => {
    let type = undefined;
    group
      .getAllObjectsNames()
      .toJSArray()
      .forEach((objectName) => {
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
  };

  return (
    <Column>
      <div>
        {renderExplanation()}
        <List>
          {group
            .getAllObjectsNames()
            .toJSArray()
            .map((objectName) => {
              return (
                <ListItem
                  key={objectName}
                  primaryText={objectName}
                  displayRemoveButton
                  onRemove={() => removeObject(objectName)}
                />
              );
            })}
        </List>
      </div>
      <Paper style={styles.objectSelector}>
        <Column>
          <ObjectSelector
            project={project}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            value={newObjectName}
            onChange={setNewObjectName}
            onChoose={addObject}
            openOnFocus
            noGroups
            hintText={t`Choose an object to add to the group`}
            fullWidth
          />
        </Column>
      </Paper>
    </Column>
  );
};

export default ObjectGroupEditor;
