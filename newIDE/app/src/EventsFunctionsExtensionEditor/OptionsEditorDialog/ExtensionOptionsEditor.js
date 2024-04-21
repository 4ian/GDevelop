//@flow
import React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import TextField from '../../UI/TextField';
import { ColumnStackLayout, TextFieldWithButtonLayout } from '../../UI/Layout';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import RaisedButton from '../../UI/RaisedButton';
import FlatButton from '../../UI/FlatButton';
import { ResourceStore } from '../../AssetStore/ResourceStore';
import Dialog from '../../UI/Dialog';

import useForceUpdate from '../../Utils/UseForceUpdate';
import {
  getHelpLink,
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
} from '../../Utils/HelpLink';
import axios from 'axios';
import { useIsMounted } from '../../Utils/UseIsMounted';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { UsersAutocomplete } from '../../Profile/UsersAutocomplete';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

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

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onLoadChange: (isLoading: boolean) => void,
  isLoading: boolean,
|};

export const ExtensionOptionsEditor = ({
  eventsFunctionsExtension,
  onLoadChange,
  isLoading,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [resourceStoreOpen, setResourceStoreOpen] = React.useState(false);
  const isMounted = useIsMounted();

  return (
    <I18n>
      {({ i18n }: { i18n: I18nType }) => (
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
            floatingLabelText={<Trans>Description (markdown supported)</Trans>}
            value={eventsFunctionsExtension.getDescription()}
            onChange={(e, text) => {
              eventsFunctionsExtension.setDescription(text);
              forceUpdate();
            }}
            multiline
            fullWidth
            rows={5}
            rowsMax={15}
            helperMarkdownText={i18n._(
              t`Explain and give some examples of what can be achieved with this extension.`
            )}
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
          <SemiControlledAutoComplete
            floatingLabelText={<Trans>Category (shown in the editor)</Trans>}
            fullWidth
            value={eventsFunctionsExtension.getCategory()}
            onChange={category => {
              eventsFunctionsExtension.setCategory(category);
              forceUpdate();
            }}
            // TODO Sort by translated value.
            dataSource={[
              {
                text: '',
                value: 'General',
                translatableValue: 'General',
              },
              {
                text: 'Ads',
                value: 'Ads',
                translatableValue: 'Ads',
              },
              {
                text: 'Visual effect',
                value: 'Visual effect',
                translatableValue: 'Visual effect',
              },
              {
                text: 'Audio',
                value: 'Audio',
                translatableValue: 'Audio',
              },
              {
                text: 'Advanced',
                value: 'Advanced',
                translatableValue: 'Advanced',
              },
              {
                text: 'Camera',
                value: 'Camera',
                translatableValue: 'Camera',
              },
              {
                text: 'Input',
                value: 'Input',
                translatableValue: 'Input',
              },
              {
                text: 'Game mechanic',
                value: 'Game mechanic',
                translatableValue: 'Game mechanic',
              },
              {
                text: 'Movement',
                value: 'Movement',
                translatableValue: 'Movement',
              },
              {
                text: 'Network',
                value: 'Network',
                translatableValue: 'Network',
              },
              {
                text: 'Third-party',
                value: 'Third-party',
                translatableValue: 'Third-party',
              },
              {
                text: 'User interface',
                value: 'User interface',
                translatableValue: 'User interface',
              },
            ]}
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
          <UsersAutocomplete
            userIds={eventsFunctionsExtension.getAuthorIds().toJSArray()}
            onChange={userIdAndUsernames => {
              const projectAuthorIds = eventsFunctionsExtension.getAuthorIds();
              projectAuthorIds.clear();
              userIdAndUsernames.forEach(userIdAndUsername =>
                projectAuthorIds.push_back(userIdAndUsername.userId)
              );
            }}
            floatingLabelText={<Trans>Authors</Trans>}
            helperText={
              <Trans>
                Select the usernames of the contributors to this extension. They
                will be displayed in the order selected. Do not see your name?
                Go to the Profile section and create an account!
              </Trans>
            }
          />
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
              flexColumnBody
              fullHeight
              open
              onRequestClose={() => {
                setResourceStoreOpen(false);
              }}
            >
              <ResourceStore
                onChoose={resource => {
                  setResourceStoreOpen(false);
                  onLoadChange(true);
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

                      onLoadChange(false);
                    });
                }}
                resourceKind={'svg'}
              />
            </Dialog>
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
