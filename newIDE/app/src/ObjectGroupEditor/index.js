// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import Tooltip from '@material-ui/core/Tooltip';

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
import WarningIcon from '../UI/CustomSvgIcons/Warning';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { enumerateCommonFunctionsForObjectOrGroup } from './ObjectGroupCommonFunctions';

const styles = {
  objectSelector: { position: 'sticky', bottom: 0 },
  objectNameWithWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  warningIcon: {
    display: 'inline-flex',
    alignItems: 'center',
  },
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
  groupName?: string,
|};

type InnerProps = {|
  ...Props,
  i18n: I18nType,
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
  groupName,
  i18n,
}: InnerProps): React.Node => {
  const [objectName, setObjectName] = React.useState<string>('');
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
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

  const objectNamesWithoutCommonFunctions: Set<string> = React.useMemo(
    () => {
      if (!project || !groupName || !groupObjectNames.length)
        return new Set<string>();

      const commonFunctionKeys = new Set<string>(
        enumerateCommonFunctionsForObjectOrGroup({
          project,
          projectScopedContainersAccessor,
          globalObjectsContainer,
          objectsContainer,
          objectOrGroupName: groupName,
          i18n,
        }).map(commonFunction => commonFunction.key)
      );

      if (commonFunctionKeys.size === 0) {
        return new Set<string>(groupObjectNames);
      }

      return new Set<string>(
        groupObjectNames.filter(objectName => {
          const objectFunctionKeys = new Set<string>(
            enumerateCommonFunctionsForObjectOrGroup({
              project,
              projectScopedContainersAccessor,
              globalObjectsContainer,
              objectsContainer,
              objectOrGroupName: objectName,
              i18n,
            }).map(commonFunction => commonFunction.key)
          );

          for (const commonFunctionKey of commonFunctionKeys) {
            if (objectFunctionKeys.has(commonFunctionKey)) return false;
          }

          return true;
        })
      );
    },
    [
      groupName,
      groupObjectNames,
      project,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      i18n,
    ]
  );

  const renderObjectName = (objectName: string) => {
    if (!objectNamesWithoutCommonFunctions.has(objectName)) return objectName;

    return (
      <span style={styles.objectNameWithWarning}>
        <span>{objectName}</span>
        <Tooltip
          title={
            <Trans>
              This object has no functions listed in Common functions for this
              group.
            </Trans>
          }
        >
          <span style={styles.warningIcon}>
            <WarningIcon
              fontSize="small"
              style={{ color: gdevelopTheme.listItem.warningTextColor }}
            />
          </span>
        </Tooltip>
      </span>
    );
  };

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
              primaryText={renderObjectName(objectName)}
              leftIcon={icon}
            />
          ) : (
            <ListItem
              key={objectName}
              primaryText={renderObjectName(objectName)}
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

const ObjectGroupEditorWithI18n = (props: Props): React.Node => (
  <I18n>{({ i18n }) => <ObjectGroupEditor {...props} i18n={i18n} />}</I18n>
);

export default ObjectGroupEditorWithI18n;
