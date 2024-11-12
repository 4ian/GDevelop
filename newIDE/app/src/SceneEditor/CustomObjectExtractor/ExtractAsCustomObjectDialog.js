// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';
import Checkbox from '../../UI/Checkbox';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { enumerateEventsFunctionsExtensions } from '../../ProjectManager/EnumerateProjectItems';
import getObjectByName from '../../Utils/GetObjectByName';
import AlertMessage from '../../UI/AlertMessage';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialInstances: gdInitialInstancesContainer,
  selectedInstances: Array<gdInitialInstance>,
  onApply: (
    extensionName: string,
    isNewExtension: boolean,
    eventsBasedObjectName: string,
    shouldRemoveSceneObjectsWhenNoMoreInstance: boolean
  ) => void,
  onCancel: () => void,
|};

const CREATE_NEW_EXTENSION_PLACEHOLDER = '<create a new extension>';

export default function ExtractAsCustomObjectDialog({
  project,
  globalObjectsContainer,
  objectsContainer,
  initialInstances,
  selectedInstances,
  onApply,
  onCancel,
}: Props) {
  const [extensionName, setExtensionName] = React.useState<string>('');
  const [isNewExtension, setNewExtension] = React.useState<boolean>(true);
  const [
    eventsBasedObjectName,
    setEventsBasedObjectName,
  ] = React.useState<string>('');
  const [
    shouldRemoveSceneObjectsWhenNoMoreInstance,
    setShouldRemoveSceneObjectsWhenNoMoreInstance,
  ] = React.useState<boolean>(true);

  const eventsFunctionsExtensions = React.useMemo(
    () => enumerateEventsFunctionsExtensions(project),
    [project]
  );

  const canRemoveSceneObjects = React.useMemo(
    () => {
      const selectedInstanceCountPerObject = new Map<string, number>();
      for (const selectedInstance of selectedInstances) {
        const objectName = selectedInstance.getObjectName();
        let selectedInstanceCount =
          selectedInstanceCountPerObject.get(objectName) || 0;
        selectedInstanceCount++;
        selectedInstanceCountPerObject.set(objectName, selectedInstanceCount);
      }
      for (const [
        objectName,
        selectedInstanceCount,
      ] of selectedInstanceCountPerObject) {
        if (
          initialInstances.isInstancesCountOfObjectGreaterThan(
            objectName,
            selectedInstanceCount
          )
        ) {
          return false;
        }
      }
      return true;
    },
    [initialInstances, selectedInstances]
  );

  const has2DAnd3D = React.useMemo(
    () => {
      let has2D = false;
      let has3D = false;
      for (const selectedInstance of selectedInstances) {
        const objectName = selectedInstance.getObjectName();
        const object = getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          objectName
        );
        if (object) {
          const objectMetadata = gd.MetadataProvider.getObjectMetadata(
            project.getCurrentPlatform(),
            object.getType()
          );
          has2D = has2D || !objectMetadata.isRenderedIn3D();
          has3D = has3D || objectMetadata.isRenderedIn3D();
          if (has2D && has3D) {
            return true;
          }
        }
      }
      return false;
    },
    [globalObjectsContainer, objectsContainer, project, selectedInstances]
  );

  const apply = React.useCallback(
    (i18n: I18nType) => {
      if (has2DAnd3D) {
        onCancel();
      } else {
        onApply(
          extensionName || i18n._(t`UntitledExtension`),
          isNewExtension,
          eventsBasedObjectName || i18n._(t`MyObject`),
          canRemoveSceneObjects && shouldRemoveSceneObjectsWhenNoMoreInstance
        );
      }
    },
    [
      has2DAnd3D,
      onCancel,
      onApply,
      extensionName,
      isNewExtension,
      eventsBasedObjectName,
      canRemoveSceneObjects,
      shouldRemoveSceneObjectsWhenNoMoreInstance,
    ]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Extract as a custom object</Trans>}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              primary={false}
              onClick={onCancel}
            />,
            <DialogPrimaryButton
              key="apply"
              label={<Trans>Move instances</Trans>}
              primary={true}
              onClick={() => apply(i18n)}
              disabled={has2DAnd3D}
            />,
          ]}
          secondaryActions={[
            <HelpButton
              helpPagePath="/objects/custom-objects-prefab-template/"
              key="help"
            />,
          ]}
          onRequestClose={onCancel}
          onApply={() => apply(i18n)}
          open
          maxWidth="sm"
        >
          <ColumnStackLayout noMargin>
            <Text>
              <Trans>
                Selected instances will be moved to a new custom object.
              </Trans>
            </Text>
            {has2DAnd3D ? (
              <AlertMessage kind="error">
                <Trans>
                  Custom objects can't contain both 2D or 3D.
                  <br />
                  Please select either 2D instances or 3D instances.
                </Trans>
              </AlertMessage>
            ) : null}
            <ResponsiveLineStackLayout noMargin expand noResponsiveLandscape>
              <SelectField
                floatingLabelText={
                  <Trans>Extension (storing the custom object)</Trans>
                }
                value={
                  isNewExtension
                    ? CREATE_NEW_EXTENSION_PLACEHOLDER
                    : extensionName
                }
                onChange={(e, i, extensionName) => {
                  if (extensionName === CREATE_NEW_EXTENSION_PLACEHOLDER) {
                    setNewExtension(true);
                    setExtensionName('');
                  } else {
                    setNewExtension(false);
                    setExtensionName(extensionName);
                  }
                }}
                fullWidth
              >
                {eventsFunctionsExtensions.map(eventsFunctionsExtension => (
                  <SelectOption
                    key={eventsFunctionsExtension.getName()}
                    value={eventsFunctionsExtension.getName()}
                    label={
                      eventsFunctionsExtension.getFullName() ||
                      eventsFunctionsExtension.getName()
                    }
                  />
                ))}
                <SelectOption
                  value={CREATE_NEW_EXTENSION_PLACEHOLDER}
                  label={t`<Create a New Extension>`}
                />
              </SelectField>
              {isNewExtension ? (
                <TextField
                  floatingLabelText={<Trans>New extension name</Trans>}
                  fullWidth
                  value={extensionName}
                  onChange={(e, value) => setExtensionName(value)}
                />
              ) : null}
            </ResponsiveLineStackLayout>
            <TextField
              floatingLabelText={<Trans>Custom object name</Trans>}
              fullWidth
              value={eventsBasedObjectName}
              onChange={(e, value) => setEventsBasedObjectName(value)}
            />
            <Checkbox
              label={<Trans>Remove objects from the scene list</Trans>}
              checked={
                canRemoveSceneObjects &&
                shouldRemoveSceneObjectsWhenNoMoreInstance
              }
              onCheck={(e, checked) =>
                setShouldRemoveSceneObjectsWhenNoMoreInstance(checked)
              }
              disabled={!canRemoveSceneObjects}
            />
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}
