// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';

import { List, ListItem } from '../UI/List';
import ObjectSelector, {
  checkHasRequiredBehaviors,
} from '../ObjectsList/ObjectSelector';
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
  isObjectListLocked: boolean,
  isGlobalGroup?: boolean,
  objectNameFilter?: string => boolean,
  requiredBehaviorTypes?: Array<string>,
|};

const ObjectGroupEditor = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  groupObjectNames,
  onObjectAdded,
  onObjectRemoved,
  isObjectListLocked,
  isGlobalGroup,
  objectNameFilter,
  requiredBehaviorTypes,
}: Props): React.Node => {
  const [objectName, setObjectName] = React.useState<string>('');
  const isGlobalObject = React.useCallback(
    (objectName: string) =>
      !!globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName),
    [globalObjectsContainer]
  );
  const canUseObject = React.useCallback(
    (objectName: string) => {
      if (isGlobalGroup && !isGlobalObject(objectName)) return false;
      if (objectNameFilter && !objectNameFilter(objectName)) return false;
      return true;
    },
    [isGlobalGroup, isGlobalObject, objectNameFilter]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      if (!canUseObject(objectName)) return;
      if (
        !checkHasRequiredBehaviors({
          objectsContainersList: projectScopedContainersAccessor
            .get()
            .getObjectsContainersList(),
          objectName,
          requiredBehaviorTypes,
        })
      ) {
        return;
      }
      onObjectAdded(objectName);
      setObjectName('');
    },
    [
      canUseObject,
      onObjectAdded,
      projectScopedContainersAccessor,
      requiredBehaviorTypes,
    ]
  );

  const renderExplanation = () => {
    let type = null;
    if (groupObjectNames.length === 0) {
      return null;
    }
    const objectsContainersList = projectScopedContainersAccessor
      .get()
      .getObjectsContainersList();
    for (const objectName of groupObjectNames) {
      const objectType = objectsContainersList.getTypeOfObject(objectName);
      if (type === null || objectType === type) {
        type = objectType;
      } else {
        type = '';
      }
    }

    const message =
      type === '' ? (
        <>
          <Trans>
            This group contains objects of different kinds. You'll only be able
            to use actions, conditions and expressions common to all objects
            with this group.
          </Trans>
        </>
      ) : (
        <>
          <Trans>This group contains objects of the same kind</Trans> ({type}).{' '}
          <Trans>
            You can use actions, conditions and expressions related to this kind
            of objects in events with this group.
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
          return isObjectListLocked ? (
            <ListItem
              key={objectName}
              primaryText={objectName}
              leftIcon={icon}
            />
          ) : (
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
            hintText={
              isGlobalGroup
                ? requiredBehaviorTypes && requiredBehaviorTypes.length > 0
                  ? t`Choose a matching global object to add to the group`
                  : t`Choose a global object to add to the group`
                : requiredBehaviorTypes && requiredBehaviorTypes.length > 0
                ? t`Choose a matching object to add to the group`
                : t`Choose an object to add to the group`
            }
            fullWidth
            disabled={isObjectListLocked}
            objectNameFilter={canUseObject}
            requiredCapabilitiesBehaviorTypes={requiredBehaviorTypes}
          />
        </Column>
      </Paper>
    </ColumnStackLayout>
  );
};

export default ObjectGroupEditor;
