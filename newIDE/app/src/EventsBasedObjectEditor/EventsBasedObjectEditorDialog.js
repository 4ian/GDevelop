// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedObjectEditor from './index';
import HelpButton from '../UI/HelpButton';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';

type Props = {|
  onApply: () => void,
  project: gdProject,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
  globalObjectsContainer: gdObjectsContainer,
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
      globalObjectsContainer,
    } = this.props;

    return (
      <Dialog
        title={<Trans>Edit the object</Trans>}
        fullHeight
        flexColumnBody
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
      >
        <EventsBasedObjectEditor
          project={project}
          onFetchNewlyAddedResources={this.props.onFetchNewlyAddedResources}
          globalObjectsContainer={globalObjectsContainer}
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
