// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import { Column, Line } from '../UI/Grid';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
  open: boolean,
|};
type State = {|
  exportDialogOpen: boolean,
|};

const exportExtension = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
  if (!eventsFunctionsExtensionWriter)
    return Promise.reject(new Error('Not supported'));

  return eventsFunctionsExtensionWriter
    .chooseEventsFunctionExtensionFile()
    .then(pathOrUrl => {
      if (!pathOrUrl) return;

      eventsFunctionsExtensionWriter
        .writeEventsFunctionsExtension(eventsFunctionsExtension, pathOrUrl)
        .then();
    });
};

const openGitHubIssue = () => {
  const body = `
**⚠️ Please edit and complete this before submitting your extension:**

## Describe the extension
A clear and concise description of what the extension is, how useful it is.

## Checklist

- [ ] Extension has a proper name and description.
- [ ] Extension has tags (for example: "platform, brick, breakable").
- [ ] All behaviors have a description.
- [ ] All functions (actions, conditions, expressions) have descriptions.
- [ ] I confirm that this extension can be intergrated to this GitHub repository, distributed and MIT licensed.

## Extension file

Finally, attach the .json file of your extension here.

You also may have to create an account on GitHub before posting.
If your extension is high quality and useful, it will be added to the list of GDevelop community extensions.
When you're ready, remove this last paragraph and click on "Submit new issue". Thanks 🙌`;
  Window.openExternalURL(
    `https://github.com/4ian/GDevelop-extensions/issues/new?body=${encodeURIComponent(
      body
    )}&title=New%20extension`
  );
};

export default class OptionsEditorDialog extends React.Component<Props, State> {
  state = {
    exportDialogOpen: false,
  };

  render() {
    const { eventsFunctionsExtension } = this.props;
    const { exportDialogOpen } = this.state;

    return (
      <EventsFunctionsExtensionsContext.Consumer>
        {eventsFunctionsExtensionsState => {
          const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();
          return (
            <Dialog
              secondaryActions={[
                <HelpButton key="help" helpPagePath="/extensions/create" />,
                eventsFunctionsExtensionWriter ? (
                  <FlatButton
                    icon={<CloudUpload />}
                    key="export"
                    label={<Trans>Export extension</Trans>}
                    onClick={() => this.setState({ exportDialogOpen: true })}
                  />
                ) : null,
              ]}
              actions={[
                <FlatButton
                  label={<Trans>Close</Trans>}
                  primary={true}
                  keyboardFocused={true}
                  onClick={() => this.props.onClose()}
                  key={'close'}
                />,
              ]}
              open={this.props.open}
              title={<Trans>Edit Extension Options</Trans>}
              onRequestClose={this.props.onClose}
              autoScrollBodyContent={true}
            >
              <Column>
                <TextField
                  floatingLabelText={<Trans>Name</Trans>}
                  value={eventsFunctionsExtension.getName()}
                  disabled
                  fullWidth
                />
                <TextField
                  floatingLabelText={<Trans>Name displayed in editor</Trans>}
                  value={eventsFunctionsExtension.getFullName()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setFullName(text);
                    this.forceUpdate();
                  }}
                  fullWidth
                />
                <TextField
                  floatingLabelText={<Trans>Short description</Trans>}
                  value={eventsFunctionsExtension.getShortDescription()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setShortDescription(text);
                    this.forceUpdate();
                  }}
                  multiLine
                  fullWidth
                  rows={2}
                  rowsMax={2}
                />
                <TextField
                  floatingLabelText={
                    <Trans>Description (markdown supported)</Trans>
                  }
                  value={eventsFunctionsExtension.getDescription()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setDescription(text);
                    this.forceUpdate();
                  }}
                  multiLine
                  fullWidth
                  rows={5}
                  rowsMax={5}
                />
                <TextField
                  floatingLabelText={<Trans>Version</Trans>}
                  value={eventsFunctionsExtension.getVersion()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setVersion(text);
                    this.forceUpdate();
                  }}
                  fullWidth
                />
                <TextField
                  floatingLabelText={<Trans>Tags (comma separated)</Trans>}
                  value={eventsFunctionsExtension.getTags()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setTags(text);
                    this.forceUpdate();
                  }}
                  fullWidth
                />
                <TextField
                  floatingLabelText={
                    <Trans>Author (Name, email or GitHub handle)</Trans>
                  }
                  value={eventsFunctionsExtension.getAuthor()}
                  onChange={(e, text) => {
                    eventsFunctionsExtension.setAuthor(text);
                    this.forceUpdate();
                  }}
                  fullWidth
                />
              </Column>
              {exportDialogOpen && (
                <Dialog
                  secondaryActions={[
                    <HelpButton key="help" helpPagePath="/extensions/share" />,
                  ]}
                  actions={[
                    <FlatButton
                      label={<Trans>Close</Trans>}
                      keyboardFocused={true}
                      onClick={() => this.setState({ exportDialogOpen: false })}
                      key={'close'}
                    />,
                  ]}
                  open
                  onRequestClose={() =>
                    this.setState({ exportDialogOpen: false })
                  }
                >
                  <Column expand>
                    <Line>
                      <p>
                        <Trans>
                          You can export the extension to a file to easily
                          import it in another project. If your extension is
                          providing useful and reusable functions or behaviors,
                          consider sharing it with the GDevelop community!
                        </Trans>
                      </p>
                    </Line>
                    <Line>
                      <RaisedButton
                        icon={<CloudUpload />}
                        primary
                        label={<Trans>Export to a file</Trans>}
                        onClick={() => {
                          exportExtension(
                            eventsFunctionsExtensionsState,
                            eventsFunctionsExtension
                          );
                        }}
                      />
                      <FlatButton
                        label={<Trans>Submit extension to the community</Trans>}
                        onClick={openGitHubIssue}
                      />
                    </Line>
                  </Column>
                </Dialog>
              )}
            </Dialog>
          );
        }}
      </EventsFunctionsExtensionsContext.Consumer>
    );
  }
}
