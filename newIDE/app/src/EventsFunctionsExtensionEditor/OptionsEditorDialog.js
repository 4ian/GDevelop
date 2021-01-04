// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { Column, Line } from '../UI/Grid';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import Text from '../UI/Text';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ResourceStore } from '../AssetStore/ResourceStore';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../UI/Layout';
import axios from 'axios';
import useForceUpdate from '../Utils/UseForceUpdate';
import { useIsMounted } from '../Utils/UseIsMounted';
import { showErrorBox } from '../UI/Messages/MessageBox';
import {
  getHelpLink,
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
} from '../Utils/HelpLink';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onClose: () => void,
  open: boolean,
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

const downloadSvgAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const image = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    if (image.length > 100 * 1024) {
      throw new Error(
        `Icon is too big (size after base64 conversion: ${image.length})`
      );
    }

    const contentType = response.headers
      ? response.headers['content-type'].toLowerCase()
      : '';
    if (contentType !== 'image/svg+xml')
      throw new Error(
        `Wrong content type. Got: "${contentType}", expected "image/svg+xml"`
      );

    return `data:${contentType};base64,${image}`;
  } catch (err) {
    console.error('Unable to import the icon.', err);
    throw err;
  }
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

type HelpPathTextFieldProps = {|
  i18n: I18nType,
  helpPath: string,
  onChangeHelpPath: string => void,
|};

const HelpPathTextField = ({
  i18n,
  helpPath,
  onChangeHelpPath,
}: HelpPathTextFieldProps) => {
  const isAbsoluteUrl = isDocumentationAbsoluteUrl(helpPath);
  const isRelativePath = isRelativePathToDocumentationRoot(helpPath);
  const helperText = helpPath
    ? (isRelativePath
        ? i18n._(
            t`This is a relative path that will open in the GDevelop wiki.`
          )
        : i18n._(t`This is link to a webpage.`)) +
      ` [${i18n._(t`Click here to test the link.`)}](${getHelpLink(helpPath)})`
    : i18n._(
        t`This can either be a URL to a web page, or a path starting with a slash that will be opened in the GDevelop wiki. Leave empty if there is no help page, although it's recommended you eventually write one if you distribute the extension.`
      );

  return (
    <TextField
      floatingLabelText={<Trans>Help page URL</Trans>}
      value={helpPath}
      onChange={(e, text) => {
        onChangeHelpPath(text);
      }}
      errorText={
        !!helpPath && !isAbsoluteUrl && !isRelativePath ? (
          <Trans>
            This is not a URL starting with "http://" or "https://".
          </Trans>
        ) : null
      }
      helperMarkdownText={helperText}
      fullWidth
    />
  );
};

export default function OptionsEditorDialog({
  eventsFunctionsExtension,
  onClose,
  open,
}: Props) {
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [resourceStoreOpen, setResourceStoreOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const forceUpdate = useForceUpdate();
  const isMounted = useIsMounted();

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          secondaryActions={[
            <HelpButton key="help" helpPagePath="/extensions/create" />,
            eventsFunctionsExtensionWriter ? (
              <FlatButton
                icon={<CloudUpload />}
                key="export"
                label={<Trans>Export extension</Trans>}
                onClick={() => {
                  setExportDialogOpen(true);
                }}
                disabled={isLoading}
              />
            ) : null,
          ]}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              primary={true}
              keyboardFocused={true}
              onClick={() => onClose()}
              disabled={isLoading}
              key={'close'}
            />,
          ]}
          cannotBeDismissed={true}
          open={open}
          title={<Trans>Edit Extension Options</Trans>}
          onRequestClose={isLoading ? () => {} : onClose}
        >
          <ColumnStackLayout noMargin>
            <TextField
              floatingLabelText={<Trans>Name</Trans>}
              value={eventsFunctionsExtension.getName()}
              disabled
              fullWidth
            />
            <TextFieldWithButtonLayout
              renderButton={style => (
                <RaisedButton
                  onClick={() => {
                    setResourceStoreOpen(true);
                  }}
                  primary
                  label={<Trans>Choose</Trans>}
                  disabled={isLoading}
                  style={style}
                />
              )}
              renderTextField={() => (
                <SemiControlledTextField
                  floatingLabelText={<Trans>Icon URL</Trans>}
                  value={eventsFunctionsExtension.getPreviewIconUrl()}
                  onChange={text => {
                    eventsFunctionsExtension.setPreviewIconUrl(text);
                  }}
                  disabled
                  fullWidth
                />
              )}
            />
            <TextField
              floatingLabelText={<Trans>Name displayed in editor</Trans>}
              value={eventsFunctionsExtension.getFullName()}
              onChange={(e, text) => {
                eventsFunctionsExtension.setFullName(text);
                forceUpdate();
              }}
              fullWidth
            />
            <TextField
              floatingLabelText={<Trans>Short description</Trans>}
              value={eventsFunctionsExtension.getShortDescription()}
              onChange={(e, text) => {
                eventsFunctionsExtension.setShortDescription(text);
                forceUpdate();
              }}
              multiline
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
                forceUpdate();
              }}
              multiline
              fullWidth
              rows={5}
              rowsMax={5}
            />
            <TextField
              floatingLabelText={<Trans>Version</Trans>}
              value={eventsFunctionsExtension.getVersion()}
              onChange={(e, text) => {
                eventsFunctionsExtension.setVersion(text);
                forceUpdate();
              }}
              fullWidth
            />
            <SemiControlledTextField
              floatingLabelText={<Trans>Tags (comma separated)</Trans>}
              value={eventsFunctionsExtension
                .getTags()
                .toJSArray()
                .join(', ')}
              onChange={text => {
                const tags = eventsFunctionsExtension.getTags();
                tags.clear();
                text
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(Boolean)
                  .forEach(tag => {
                    tags.push_back(tag);
                  });
                forceUpdate();
              }}
              fullWidth
            />
            <HelpPathTextField
              i18n={i18n}
              helpPath={eventsFunctionsExtension.getHelpPath()}
              onChangeHelpPath={helpPath => {
                eventsFunctionsExtension.setHelpPath(helpPath);
                forceUpdate();
              }}
            />
            <TextField
              floatingLabelText={
                <Trans>Author (Name, email or GitHub handle)</Trans>
              }
              value={eventsFunctionsExtension.getAuthor()}
              onChange={(e, text) => {
                eventsFunctionsExtension.setAuthor(text);
                forceUpdate();
              }}
              fullWidth
            />
          </ColumnStackLayout>
          {exportDialogOpen && (
            <Dialog
              secondaryActions={[
                <HelpButton key="help" helpPagePath="/extensions/share" />,
              ]}
              actions={[
                <FlatButton
                  label={<Trans>Close</Trans>}
                  keyboardFocused={true}
                  onClick={() => {
                    setExportDialogOpen(false);
                  }}
                  key={'close'}
                />,
              ]}
              open
              cannotBeDismissed={false}
              onRequestClose={() => {
                setExportDialogOpen(false);
              }}
            >
              <Column expand>
                <Line>
                  <Text>
                    <Trans>
                      You can export the extension to a file to easily import it
                      in another project. If your extension is providing useful
                      and reusable functions or behaviors, consider sharing it
                      with the GDevelop community!
                    </Trans>
                  </Text>
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
          {resourceStoreOpen && (
            <Dialog
              title={<Trans>Choose an icon for the extension</Trans>}
              actions={[
                <FlatButton
                  key="cancel"
                  label={<Trans>Cancel</Trans>}
                  primary={false}
                  onClick={() => {
                    setResourceStoreOpen(false);
                  }}
                />,
              ]}
              cannotBeDismissed={false}
              open
              noMargin
            >
              <ResourceStore
                onChoose={resource => {
                  setResourceStoreOpen(false);
                  setIsLoading(true);
                  downloadSvgAsBase64(resource.url)
                    .then(
                      base64Svg => {
                        if (!isMounted.current) return;

                        eventsFunctionsExtension.setPreviewIconUrl(
                          resource.url
                        );
                        eventsFunctionsExtension.setIconUrl(base64Svg);
                      },
                      rawError => {
                        if (!isMounted.current) return;

                        showErrorBox({
                          message: i18n._(
                            t`Unable to download the icon. Verify your internet connection or try again later.`
                          ),
                          rawError,
                          errorId: 'icon-download-error',
                        });
                      }
                    )
                    .then(() => {
                      if (!isMounted.current) return;

                      setIsLoading(false);
                    });
                }}
                resourceKind={'svg'}
              />
            </Dialog>
          )}
        </Dialog>
      )}
    </I18n>
  );
}
