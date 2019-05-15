// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import EventsBasedBehaviorEditor from './index';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
|};

export default function EventsBasedBehaviorEditorDialog({
  onApply,
  eventsBasedBehavior,
  eventsFunctionsExtension,
  project,
}: Props) {
  return (
    <Dialog
      noMargin
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/behaviors/events-based-behaviors"
        />,
      ]}
      actions={[
        <FlatButton
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
          key={'Apply'}
        />,
      ]}
      modal
      open
      onRequestClose={onApply}
      autoScrollBodyContent
      title={<Trans>Edit the behavior</Trans>}
    >
      <EventsBasedBehaviorEditor
        project={project}
        eventsFunctionsExtension={eventsFunctionsExtension}
        eventsBasedBehavior={eventsBasedBehavior}
      />
    </Dialog>
  );
}
