// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';

import { List, ListItem } from '../UI/List';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import { Column } from '../UI/Grid';
import ListIcon from '../UI/ListIcon';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import getObjectByName from '../Utils/GetObjectByName';
import Paper from '../UI/Paper';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
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
  onObjectGroupUpdated?: () => void,
|};

const ObjectGroupEditor = ({
  project,
  group,
  globalObjectsContainer,
  objectsContainer,
  onSizeUpdated,
  onObjectGroupUpdated,
}: Props) => {
  const [objectName, setObjectName] = React.useState<string>('');
  const objectsInGroup = group.getAllObjectsNames().toJSArray();

  const removeObject = (objectName: string) => {
    group.removeObject(objectName);

    if (onSizeUpdated) onSizeUpdated();
    if (onObjectGroupUpdated) onObjectGroupUpdated();
  };

  const addObject = (objectName: string) => {
    group.addObject(objectName);
    setObjectName('');
    if (onSizeUpdated) onSizeUpdated();
    if (onObjectGroupUpdated) onObjectGroupUpdated();
  };

  const renderExplanation = () => {
    let type = undefined;
    if (objectsInGroup.length === 0) {
      return null;
    }
    objectsInGroup.forEach(objectName => {
      const objectType = gd.getTypeOfObject(
        globalObjectsContainer,
        objectsContainer,
        objectName,
        false
      );
      if (type === undefined || objectType === type) type = objectType;
      else type = '';
    });

    const message =
      type === '' ? (
        <>
          <Trans>
            This group contains objects of different kinds. You'll only be able
            to use actions and conditions common to all objects with this group.
          </Trans>{' '}
          <Trans>
            Variables declared in all objects of the group will be visible in
            event expressions.
          </Trans>
        </>
      ) : (
        <>
          <Trans>
            This group contains objects of the same kind ({type}). You can use
            actions and conditions related to this kind of objects in events
            with this group.
          </Trans>{' '}
          <Trans>
            Variables declared in all objects of the group will be visible in
            event expressions.
          </Trans>
        </>
      );

    return <AlertMessage kind="info">{message}</AlertMessage>;
  };

  return (
    <ColumnStackLayout noMargin>
      {renderExplanation()}
      <List>
        {group
          .getAllObjectsNames()
          .toJSArray()
          .map(objectName => {
            let object = getObjectByName(
              globalObjectsContainer,
              objectsContainer,
              objectName
            );
            const icon =
              project && object ? (
                <ListIcon
                  iconSize={24}
                  src={ObjectsRenderingService.getThumbnail(
                    project,
                    object.getConfiguration()
                  )}
                />
              ) : null;
            return (
              <ListItem
                key={objectName}
                primaryText={objectName}
                displayRemoveButton
                onRemove={() => removeObject(objectName)}
                leftIcon={icon}
              />
            );
          })}
      </List>
      <Paper style={styles.objectSelector} background="medium">
        <Column noMargin>
          <ObjectSelector
            project={project}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            value={objectName}
            excludedObjectOrGroupNames={objectsInGroup}
            onChange={setObjectName}
            onChoose={addObject}
            openOnFocus
            noGroups
            hintText={t`Choose an object to add to the group`}
            fullWidth
          />
        </Column>
      </Paper>
    </ColumnStackLayout>
  );
};

export default ObjectGroupEditor;
