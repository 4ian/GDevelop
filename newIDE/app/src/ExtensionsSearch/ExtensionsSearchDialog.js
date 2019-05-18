// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CloudDownload from 'material-ui/svg-icons/file/cloud-download';
import ExtensionsSearch, { addSerializedExtensionToProject } from '.';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';

type Props = {|
  project: gdProject,
  onClose: () => void,
|};

const importExtension = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject
) => {
  const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();
  if (!eventsFunctionsExtensionOpener) return;

  return eventsFunctionsExtensionOpener
    .chooseEventsFunctionExtensionFile()
    .then(pathOrUrl => {
      if (!pathOrUrl) return;

      return eventsFunctionsExtensionOpener
        .readEventsFunctionExtensionFile(pathOrUrl)
        .then(serializedExtension => {
          return addSerializedExtensionToProject(
            eventsFunctionsExtensionsState,
            project,
            serializedExtension
          );
        });
    });
};

export default class ExtensionsSearchDialog extends Component<Props, {||}> {
  render() {
    const { project, onClose } = this.props;

    return (
      <EventsFunctionsExtensionsContext.Consumer>
        {eventsFunctionsExtensionsState => {
          const eventsFunctionsExtensionOpener = eventsFunctionsExtensionsState.getEventsFunctionsExtensionOpener();
          return (
            <Dialog
              title={<Trans>Search for New Extensions</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={onClose}
                />,
              ]}
              secondaryActions={[
                eventsFunctionsExtensionOpener ? (
                  <FlatButton
                    icon={<CloudDownload />}
                    key="import"
                    label={<Trans>Import extension</Trans>}
                    onClick={() =>
                      importExtension(eventsFunctionsExtensionsState, project)
                    }
                  />
                ) : null,
              ]}
              open
              autoScrollBodyContent
              noMargin
              onRequestClose={onClose}
            >
              <ExtensionsSearch
                project={project}
                onNewExtensionInstalled={() => {}}
              />
            </Dialog>
          );
        }}
      </EventsFunctionsExtensionsContext.Consumer>
    );
  }
}
