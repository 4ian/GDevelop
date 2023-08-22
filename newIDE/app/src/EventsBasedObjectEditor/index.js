// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import TextField from '../UI/TextField';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
|};

export default function EventsBasedObjectEditor({ eventsBasedObject }: Props) {
  const forceUpdate = useForceUpdate();

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
          forceUpdate();
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
          forceUpdate();
        }}
        multiline
        fullWidth
        rows={3}
      />
      <I18n>
        {({ i18n }) => (
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default name for created objects</Trans>}
            value={
              eventsBasedObject.getDefaultName() || eventsBasedObject.getName()
            }
            onChange={newName => {
              eventsBasedObject.setDefaultName(gd.Project.getSafeName(newName));
              forceUpdate();
            }}
            fullWidth
          />
        )}
      </I18n>
      {eventsBasedObject.getEventsFunctions().getEventsFunctionsCount() ===
        0 && (
        <DismissableAlertMessage
          identifier="empty-events-based-object-explanation"
          kind="info"
        >
          <Trans>
            Once you're done, close this dialog and start adding some functions
            to the object. Then, test the object by adding to a scene.
          </Trans>
        </DismissableAlertMessage>
      )}
    </ColumnStackLayout>
  );
}
