//@flow
import React from 'react';
import axios from 'axios';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import TextField from '../../UI/TextField';
import { ColumnStackLayout } from '../../UI/Layout';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

import useForceUpdate from '../../Utils/UseForceUpdate';
import {
  getHelpLink,
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
} from '../../Utils/HelpLink';
import { UsersAutocomplete } from '../../Profile/UsersAutocomplete';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import { CompactIconField } from './CompactIconField';

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
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin expand>
          <TextField
            floatingLabelText={<Trans>Name</Trans>}
            value={eventsFunctionsExtension.getName()}
            disabled
            fullWidth
          />
          <CompactIconField
            onLoadChange={onLoadChange}
            isLoading={isLoading}
            getPreviewIconUrl={() =>
              eventsFunctionsExtension.getPreviewIconUrl()
            }
            setPreviewIconUrl={value => {
              eventsFunctionsExtension.setPreviewIconUrl(value);
            }}
            setIconUrl={value => {
              eventsFunctionsExtension.setIconUrl(value);
            }}
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
          <SelectField
            floatingLabelText={<Trans>Dimension</Trans>}
            value={eventsFunctionsExtension.getDimension()}
            onChange={(e, i, value) => {
              eventsFunctionsExtension.setDimension(value);
              forceUpdate();
            }}
            fullWidth
          >
            <SelectOption value="" label={t`Not applicable`} />
            <SelectOption value="2D" label="2D" />
            <SelectOption value="3D" label="3D" />
            <SelectOption value="2D/3D" label="2D/3D" />
          </SelectField>
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
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
