// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import CloudDownload from 'material-ui/svg-icons/file/cloud-download';
import ExtensionsSearch, { addSerializedExtensionToProject } from '.';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import HelpButton from '../UI/HelpButton';
import { showWarningBox } from '../UI/Messages/MessageBox';

type Props = {|
  project: gdProject,
  onClose: () => void,
|};

const importExtension = (
  i18n: I18nType,
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
          if (
            project.hasEventsFunctionsExtensionNamed(serializedExtension.name)
          ) {
            //eslint-disable-next-line
            const answer = confirm(
              i18n._(
                t`An extension with this name already exists in the project. Importing this extension will replace it: are you sure you want to continue?`
              )
            );
            if (!answer) return;
          }

          return addSerializedExtensionToProject(
            eventsFunctionsExtensionsState,
            project,
            serializedExtension
          );
        });
    })
    .catch(error => {
      showWarningBox(
        i18n._(
          t`An error happened while loading this extension. Please check that it is a proper extension file and compatible with this version of GDevelop`,
          error
        )
      );
    });
};

export default class ExtensionsSearchDialog extends Component<Props, {||}> {
  render() {
    const { project, onClose } = this.props;

    return (
      <I18n>
        {({ i18n }) => (
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
                    <HelpButton key="help" helpPagePath="/extensions/search" />,
                    eventsFunctionsExtensionOpener ? (
                      <FlatButton
                        icon={<CloudDownload />}
                        key="import"
                        label={<Trans>Import extension</Trans>}
                        onClick={() => {
                          importExtension(
                            i18n,
                            eventsFunctionsExtensionsState,
                            project
                          );
                        }}
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
                    onRegistryLoaded={() => {
                      this.forceUpdate(); // Force update to ensure dialog is properly positioned.
                    }}
                    showOnlyWithBehaviors={false}
                  />
                </Dialog>
              );
            }}
          </EventsFunctionsExtensionsContext.Consumer>
        )}
      </I18n>
    );
  }
}
