// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import ObjectTypeSelector from '../ObjectTypeSelector';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import Checkbox from '../UI/Checkbox';
import { type ExtensionItemConfigurationAttribute } from '../EventsFunctionsExtensionEditor';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Window from '../Utils/Window';

const gd: libGDevelop = global.gd;

const isDev = Window.isDev();

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  unsavedChanges?: ?UnsavedChanges,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
|};

export default function EventsBasedBehaviorEditor({
  project,
  eventsFunctionsExtension,
  eventsBasedBehavior,
  unsavedChanges,
  onConfigurationUpdated,
}: Props) {
  const forceUpdate = useForceUpdate();

  const onChange = React.useCallback(
    () => {
      if (unsavedChanges) {
        unsavedChanges.triggerUnsavedChanges();
      }
      forceUpdate();
    },
    [forceUpdate, unsavedChanges]
  );

  // An array containing all the object types that are using the behavior
  const allObjectTypes: Array<string> = React.useMemo(
    () =>
      gd.WholeProjectRefactorer.getAllObjectTypesUsingEventsBasedBehavior(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior
      )
        .toNewVectorString()
        .toJSArray(),
    [project, eventsFunctionsExtension, eventsBasedBehavior]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout expand noMargin>
          <DismissableAlertMessage
            identifier="events-based-behavior-explanation"
            kind="info"
          >
            <Trans>
              This is the configuration of your behavior. Make sure to choose a
              proper internal name as it's hard to change it later. Enter a
              description explaining what the behavior is doing to the object.
            </Trans>
          </DismissableAlertMessage>
          <TextField
            floatingLabelText={<Trans>Internal Name</Trans>}
            value={eventsBasedBehavior.getName()}
            disabled
            fullWidth
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Name displayed in editor</Trans>}
            value={eventsBasedBehavior.getFullName()}
            onChange={text => {
              eventsBasedBehavior.setFullName(text);
              onChange();
            }}
            fullWidth
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Description</Trans>}
            helperMarkdownText={i18n._(
              t`Explain what the behavior is doing to the object. Start with a verb when possible.`
            )}
            value={eventsBasedBehavior.getDescription()}
            onChange={text => {
              eventsBasedBehavior.setDescription(text);
              onChange();
            }}
            multiline
            fullWidth
            rows={3}
          />
          <ObjectTypeSelector
            floatingLabelText={
              <Trans>Object on which this behavior can be used</Trans>
            }
            project={project}
            value={eventsBasedBehavior.getObjectType()}
            onChange={(objectType: string) => {
              eventsBasedBehavior.setObjectType(objectType);
              onChange();
            }}
            allowedObjectTypes={
              allObjectTypes.length === 0
                ? undefined /* Allow anything as the behavior is not used */
                : allObjectTypes.length === 1
                ? [
                    '',
                    allObjectTypes[0],
                  ] /* Allow only the type of the objects using the behavior */
                : [
                    '',
                  ] /* More than one type of object are using the behavior. Only "any object" can be used on this behavior */
            }
          />
          {allObjectTypes.length > 1 && (
            <AlertMessage kind="info">
              <Trans>
                This behavior is being used by multiple types of objects. Thus,
                you can't restrict its usage to any particular object type. All
                the object types using this behavior are listed here:
                {allObjectTypes.join(', ')}
              </Trans>
            </AlertMessage>
          )}
          {isDev && (
            <SelectField
              floatingLabelText={
                <Trans>Visibility in quick customization dialog</Trans>
              }
              value={eventsBasedBehavior.getQuickCustomizationVisibility()}
              onChange={(e, i, valueString: string) => {
                // $FlowFixMe
                const value: QuickCustomization_Visibility = valueString;
                eventsBasedBehavior.setQuickCustomizationVisibility(value);
                onChange();
              }}
              fullWidth
            >
              <SelectOption
                value={gd.QuickCustomization.Default}
                label={t`Default (visible)`}
              />
              <SelectOption
                value={gd.QuickCustomization.Visible}
                label={t`Always visible`}
              />
              <SelectOption
                value={gd.QuickCustomization.Hidden}
                label={t`Hidden`}
              />
            </SelectField>
          )}
          <Checkbox
            label={<Trans>Private</Trans>}
            checked={eventsBasedBehavior.isPrivate()}
            onCheck={(e, checked) => {
              eventsBasedBehavior.setPrivate(checked);
              if (onConfigurationUpdated) onConfigurationUpdated('isPrivate');
              onChange();
            }}
            tooltipOrHelperText={
              eventsBasedBehavior.isPrivate() ? (
                <Trans>
                  This behavior won't be visible in the scene and events
                  editors.
                </Trans>
              ) : (
                <Trans>
                  This behavior will be visible in the scene and events editors.
                </Trans>
              )
            }
          />
          {eventsBasedBehavior
            .getEventsFunctions()
            .getEventsFunctionsCount() === 0 && (
            <DismissableAlertMessage
              identifier="empty-events-based-behavior-explanation"
              kind="info"
            >
              <Trans>
                Once you're done, start adding some functions to the behavior.
                Then, test the behavior by adding it to an object in a scene.
              </Trans>
            </DismissableAlertMessage>
          )}
          <Line noMargin>
            <HelpButton
              key="help"
              helpPagePath="/behaviors/events-based-behaviors"
            />
          </Line>
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
