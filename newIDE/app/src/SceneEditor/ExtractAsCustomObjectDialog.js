// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { enumerateEventsFunctionsExtensions } from '../ProjectManager/EnumerateProjectItems';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  suggestedName: string,
  onApply: (
    extensionName: string,
    eventsBasedObjectName: string,
    shouldRemoveSceneObjectWhenNoMoreInstance: boolean
  ) => void,
  onCancel: () => void,
|};

const CREATE_NEW_EXTENSION_PLACEHOLDER = '<create a new extension>';

const canCreateEventsBasedObject = (
  extensionName: string,
  eventsBasedObjectName: string
) =>
  gd.Project.isNameSafe(extensionName) &&
  gd.Project.isNameSafe(eventsBasedObjectName);

export default function ExtractAsCustomObjectDialog({
  project,
  suggestedName,
  onApply,
  onCancel,
}: Props) {
  const [extensionName, setExtensionName] = React.useState<string>('');
  const [isNewExtension, setNewExtension] = React.useState<boolean>(true);
  const [
    eventsBasedObjectName,
    setEventsBasedObjectName,
  ] = React.useState<string>(suggestedName);
  const [
    shouldRemoveSceneObjectWhenNoMoreInstance,
    setShouldRemoveSceneObjectWhenNoMoreInstance,
  ] = React.useState<boolean>(true);

  const eventsFunctionsExtensions = React.useMemo(
    () => enumerateEventsFunctionsExtensions(project),
    [project]
  );

  const apply = React.useCallback(
    () => {
      if (canCreateEventsBasedObject(extensionName, eventsBasedObjectName)) {
        onApply(
          extensionName,
          eventsBasedObjectName,
          shouldRemoveSceneObjectWhenNoMoreInstance
        );
      } else {
        onCancel();
      }
    },
    [
      eventsBasedObjectName,
      extensionName,
      onApply,
      onCancel,
      shouldRemoveSceneObjectWhenNoMoreInstance,
    ]
  );

  return (
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
          disabled={
            !canCreateEventsBasedObject(extensionName, eventsBasedObjectName)
          }
          onClick={apply}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          helpPagePath="/objects/custom-objects-prefab-template/"
          key="help"
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="sm"
      exceptionallyStillAllowRenderingInstancesEditors
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            Selected instances will be moved to a new custom object.
          </Trans>
        </Text>
        <ResponsiveLineStackLayout noMargin expand>
          <SelectField
            floatingLabelText={
              <Trans>Extension (storing the custom object)</Trans>
            }
            value={
              isNewExtension ? CREATE_NEW_EXTENSION_PLACEHOLDER : extensionName
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
            <SemiControlledTextField
              commitOnBlur
              value={extensionName}
              floatingLabelText={<Trans>New extension name</Trans>}
              onChange={(extensionName: string) =>
                setExtensionName(extensionName)
              }
              fullWidth
              errorText={
                project.hasEventsFunctionsExtensionNamed(extensionName) ? (
                  <Trans>
                    This name is already taken by another extension.
                  </Trans>
                ) : !gd.Project.isNameSafe(extensionName) ? (
                  <Trans>
                    This name is not valid. Only use alphanumeric characters
                    (0-9, a-z) and underscores.
                  </Trans>
                ) : (
                  undefined
                )
              }
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
          checked={shouldRemoveSceneObjectWhenNoMoreInstance}
          onCheck={(e, checked) =>
            setShouldRemoveSceneObjectWhenNoMoreInstance(checked)
          }
        />
      </ColumnStackLayout>
    </Dialog>
  );
}
