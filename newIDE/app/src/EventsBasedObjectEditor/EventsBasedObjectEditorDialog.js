// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedObjectEditor from './index';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
|};

export default class EventsBasedObjectEditorDialog extends React.Component<
  Props,
  {||}
> {
  render() {
    const {
      onApply,
      eventsBasedObject,
      eventsFunctionsExtension,
      project,
    } = this.props;

    return (
      <Dialog
        noMargin
        fullHeight
        secondaryActions={[
          <HelpButton
            key="help"
            helpPagePath="/objects/events-based-objects"
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
        title={<Trans>Edit the object</Trans>}
      >
        <EventsBasedObjectEditor
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedObject={eventsBasedObject}
          onTabChanged={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onPropertiesUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positioned*/
          }
          onRenameProperty={this.props.onRenameProperty}
        />
      </Dialog>
    );
  }
}
