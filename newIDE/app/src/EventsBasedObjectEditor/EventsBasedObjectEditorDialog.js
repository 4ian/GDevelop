// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import EventsBasedObjectEditor from './index';
import HelpButton from '../UI/HelpButton';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';
import { Tabs } from '../UI/Tabs';
import EventsBasedObjectPropertiesEditor from './EventsBasedObjectPropertiesEditor';
import EventBasedObjectChildrenEditor from './EventBasedObjectChildrenEditor';

type TabName = 'configuration' | 'properties' | 'children';

type Props = {|
  onApply: () => void,
  project: gdProject,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
|};

type State = {|
  currentTab: TabName,
|};

export default class EventsBasedObjectEditorDialog extends React.Component<
  Props,
  State
> {
  state = {
    currentTab: 'configuration',
  };

  _changeTab = (newTab: TabName) => {
    this.setState({
      currentTab: newTab,
    });
  };

  render() {
    const {
      onApply,
      eventsBasedObject,
      eventsFunctionsExtension,
      project,
      globalObjectsContainer,
    } = this.props;

    const { currentTab } = this.state;

    return (
      <Dialog
        title={<Trans>Edit {eventsBasedObject.getName()}</Trans>}
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
        fullHeight
        flexBody
        fixedContent={
          <Tabs
            value={currentTab}
            onChange={this._changeTab}
            options={[
              {
                value: 'configuration',
                label: <Trans>Configuration</Trans>,
              },
              {
                value: 'properties',
                label: <Trans>Properties</Trans>,
              },
              {
                value: 'children',
                label: <Trans>Children</Trans>,
              },
            ]}
          />
        }
      >
        {currentTab === 'configuration' && (
          <EventsBasedObjectEditor eventsBasedObject={eventsBasedObject} />
        )}
        {currentTab === 'properties' && (
          <EventsBasedObjectPropertiesEditor
            project={project}
            eventsBasedObject={eventsBasedObject}
            onPropertiesUpdated={() => {}}
            onRenameProperty={this.props.onRenameProperty}
          />
        )}
        {currentTab === 'children' && (
          <EventBasedObjectChildrenEditor
            project={project}
            onFetchNewlyAddedResources={this.props.onFetchNewlyAddedResources}
            globalObjectsContainer={globalObjectsContainer}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedObject={eventsBasedObject}
          />
        )}
      </Dialog>
    );
  }
}
