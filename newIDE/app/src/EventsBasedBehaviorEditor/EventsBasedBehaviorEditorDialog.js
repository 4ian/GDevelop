// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import EventsBasedBehaviorEditor from './index';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onApply: () => void,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  onRenameProperty: (oldName: string, newName: string) => void,
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
        onApply={onApply}
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
        cannotBeDismissed={true}
        open
        onRequestClose={onApply}
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
        />
      </Dialog>
    );
  }
}
