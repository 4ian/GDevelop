// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import Checkbox from '../UI/Checkbox';
import HelpButton from '../UI/HelpButton';
import { Line } from '../UI/Grid';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';

const gd: libGDevelop = global.gd;

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
  unsavedChanges?: ?UnsavedChanges,
|};

export default function EventsBasedObjectEditor({
  eventsBasedObject,
  unsavedChanges,
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

  return (
    <ColumnStackLayout expand noMargin>
      <AlertMessage kind="warning">
        <Trans>
          The custom object editor is at a very early stage. A lot of features
          are missing or broken. Extensions written with it may no longer work
          in future GDevelop releases.
        </Trans>
      </AlertMessage>
      <DismissableAlertMessage
        identifier="events-based-object-explanation"
        kind="info"
      >
        <Trans>
          This is the configuration of your object. Make sure to choose a proper
          internal name as it's hard to change it later. Enter a description
          explaining how the object works.
        </Trans>
      </DismissableAlertMessage>
      <TextField
        floatingLabelText={<Trans>Internal Name</Trans>}
        value={eventsBasedObject.getName()}
        disabled
        fullWidth
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Name displayed in editor</Trans>}
        value={eventsBasedObject.getFullName()}
        onChange={text => {
          eventsBasedObject.setFullName(text);
          onChange();
        }}
        fullWidth
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Description</Trans>}
        floatingLabelFixed
        translatableHintText={t`The description of the object should explain what the object is doing, and, briefly, how to use it.`}
        value={eventsBasedObject.getDescription()}
        onChange={text => {
          eventsBasedObject.setDescription(text);
          onChange();
        }}
        multiline
        fullWidth
        rows={3}
      />
      <SemiControlledTextField
        commitOnBlur
        floatingLabelText={<Trans>Default name for created objects</Trans>}
        value={
          eventsBasedObject.getDefaultName() || eventsBasedObject.getName()
        }
        onChange={newName => {
          eventsBasedObject.setDefaultName(gd.Project.getSafeName(newName));
          onChange();
        }}
        fullWidth
      />
      <Checkbox
        label={<Trans>Use 3D rendering</Trans>}
        checked={eventsBasedObject.isRenderedIn3D()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsRenderedIn3D(checked);
          onChange();
        }}
      />
      <Checkbox
        label={<Trans>Has animations</Trans>}
        checked={eventsBasedObject.isAnimatable()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsAnimatable(checked);
          onChange();
        }}
      />
      <Checkbox
        label={<Trans>Contains text</Trans>}
        checked={eventsBasedObject.isTextContainer()}
        onCheck={(e, checked) => {
          eventsBasedObject.markAsTextContainer(checked);
          onChange();
        }}
      />
      {eventsBasedObject.getEventsFunctions().getEventsFunctionsCount() ===
        0 && (
        <DismissableAlertMessage
          identifier="empty-events-based-object-explanation"
          kind="info"
        >
          <Trans>
            Once you're done, start adding some functions to the object. Then,
            test the object by adding it to a scene.
          </Trans>
        </DismissableAlertMessage>
      )}
      <Line noMargin>
        <HelpButton key="help" helpPagePath="/objects/events-based-objects" />
      </Line>
    </ColumnStackLayout>
  );
}
