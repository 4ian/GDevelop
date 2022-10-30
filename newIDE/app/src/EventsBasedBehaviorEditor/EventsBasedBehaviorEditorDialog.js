// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedBehaviorEditor from './index';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
|};

export default class EventsBasedBehaviorEditorDialog extends React.Component<
  Props,
  {||}
> {
  render() {
    const {
      onApply,
      eventsBasedBehavior,
      eventsFunctionsExtension,
      project,
    } = this.props;

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
          <DialogPrimaryButton
            label={<Trans>Apply</Trans>}
            primary
            onClick={onApply}
            key={'Apply'}
          />,
        ]}
        open
        onRequestClose={onApply}
        onApply={onApply}
        title={<Trans>Edit the behavior</Trans>}
      >
        <EventsBasedBehaviorEditor
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          onTabChanged={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onPropertiesUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onRenameProperty={this.props.onRenameProperty}
          onRenameSharedProperty={this.props.onRenameSharedProperty}
        />
      </Dialog>
    );
  }
}
