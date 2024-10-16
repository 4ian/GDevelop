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
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const styles = {
  objectSelector: { position: 'sticky', bottom: 0 },
};

type Props = {|
  project: ?gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  groupObjectNames: Array<string>,
  onSizeUpdated?: () => void,
  onObjectGroupUpdated?: () => void,
  onObjectAdded: (objectName: string) => void,
  onObjectRemoved: (objectName: string) => void,
|};

const ObjectGroupEditor = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  groupObjectNames,
  onObjectAdded,
  onObjectRemoved,
}: Props) => {
  const [objectName, setObjectName] = React.useState<string>('');

  const addObject = React.useCallback(
    (objectName: string) => {
      onObjectAdded(objectName);
      setObjectName('');
    },
    [onObjectAdded]
  );

  const renderExplanation = () => {
    let type = undefined;
    if (groupObjectNames.length === 0) {
      return null;
    }
    groupObjectNames.forEach(objectName => {
      const objectType = projectScopedContainersAccessor
        .get()
        .getObjectsContainersList()
        .getTypeOfObject(objectName);
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
        {groupObjectNames.map(objectName => {
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
              onRemove={() => onObjectRemoved(objectName)}
              leftIcon={icon}
            />
          );
        })}
      </List>
      <Paper style={styles.objectSelector} background="medium">
        <Column noMargin>
          <ObjectSelector
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            value={objectName}
            excludedObjectOrGroupNames={groupObjectNames}
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
