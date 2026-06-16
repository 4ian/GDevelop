// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import { List, ListItem } from '../UI/List';
import CompactObjectSelector from '../ObjectsList/CompactObjectSelector';
import ListIcon from '../UI/ListIcon';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import getObjectByName from '../Utils/GetObjectByName';
import { ColumnStackLayout } from '../UI/Layout';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import CompactPropertiesEditorRowField from '../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import CompactTextField from '../UI/CompactTextField';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  groupObjectNames: Array<string>,
  onSizeUpdated?: () => void,
  onObjectGroupUpdated?: () => void,
  onObjectAdded: (objectName: string) => void,
  onObjectRemoved: (objectName: string) => void,
  isObjectListLocked: boolean,
|};

const CompactObjectGroupEditor = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  groupObjectNames,
  onObjectAdded,
  onObjectRemoved,
  isObjectListLocked,
}: Props): React.Node => {
  const [objectName, setObjectName] = React.useState<string>('');

  const addObject = React.useCallback(
    (objectName: string) => {
      onObjectAdded(objectName);
      setObjectName('');
    },
    [onObjectAdded]
  );

  const type = React.useMemo(
    () => {
      let type = null;
      for (const objectName of groupObjectNames) {
        const objectType = projectScopedContainersAccessor
          .get()
          .getObjectsContainersList()
          .getTypeOfObject(objectName);
        if (type === null || objectType === type) {
          type = objectType;
        } else {
          return 'Object';
        }
      }
      if (!type) {
        return null;
      }
      const objectMetadata = gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        type
      );
      return objectMetadata.getFullName();
    },
    [groupObjectNames, project, projectScopedContainersAccessor]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          {type ? (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Inferred type`)}
              markdownDescription={
                type === 'Object'
                  ? i18n._(
                      t`This group contains objects of different kinds. You'll only be able to use actions and conditions common to all objects with this group.`
                    )
                  : i18n._(
                      t`This group contains objects of the same kind (${type}). You can use actions and conditions related to this kind of objects in events with this group.`
                    )
              }
              field={
                <CompactTextField value={type} onChange={() => {}} disabled />
              }
            />
          ) : null}
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
                    iconSize={20}
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
          <CompactObjectSelector
            id="add-object-to-group"
            label=""
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            value={objectName}
            excludedObjectOrGroupNames={groupObjectNames}
            onChange={setObjectName}
            onChoose={addObject}
            noGroups
            hintText={t`Choose an object to add to the group`}
            fullWidth
            disabled={isObjectListLocked}
          />
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default CompactObjectGroupEditor;
