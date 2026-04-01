//@flow
import React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { ColumnStackLayout } from '../../UI/Layout';
import { Column } from '../../UI/Grid';
import useForceUpdate from '../../Utils/UseForceUpdate';
import {
  getHelpLink,
  isRelativePathToDocumentationRoot,
  isDocumentationAbsoluteUrl,
} from '../../Utils/HelpLink';
import { UsersAutocomplete } from '../../Profile/UsersAutocomplete';
import SelectOption from '../../UI/SelectOption';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import { CompactIconField } from './CompactIconField';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import CompactTextField from '../../UI/CompactTextField';
import { CompactTextAreaField } from '../../UI/CompactTextAreaField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import CompactSelectField from '../../UI/CompactSelectField';
import { MarkdownText } from '../../UI/MarkdownText';

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
    : '';
  const hasError = !!helpPath && !isAbsoluteUrl && !isRelativePath;

  return (
    <CompactPropertiesEditorRowField
      label={i18n._(t`Help page URL`)}
      markdownDescription={i18n._(
        t`This can either be a URL to a web page, or a path starting with a slash that will be opened in the GDevelop wiki. Leave empty if there is no help page, although it's recommended you eventually write one if you distribute the extension.`
      )}
      field={
        <Column noMargin expand>
          <CompactSemiControlledTextField
            value={helpPath}
            onChange={text => {
              onChangeHelpPath(text);
            }}
            errored={hasError}
            errorText={
              hasError ? (
                <Trans>
                  This is not a URL starting with "http://" or "https://".
                </Trans>
              ) : null
            }
          />
          {helperText && !hasError && <MarkdownText source={helperText} />}
        </Column>
      }
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
          <CompactPropertiesEditorRowField
            label={i18n._(t`Name`)}
            field={
              <CompactTextField
                value={eventsFunctionsExtension.getName()}
                onChange={() => {}}
                disabled
              />
            }
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
          <CompactPropertiesEditorRowField
            label={i18n._(t`Name displayed in editor`)}
            field={
              <CompactTextField
                value={eventsFunctionsExtension.getFullName()}
                onChange={(e, text) => {
                  eventsFunctionsExtension.setFullName(text);
                  forceUpdate();
                }}
              />
            }
          />
          <CompactTextAreaField
            label={i18n._(t`Short description`)}
            value={eventsFunctionsExtension.getShortDescription()}
            onChange={text => {
              eventsFunctionsExtension.setShortDescription(text);
              forceUpdate();
            }}
            rows={2}
          />
          <CompactTextAreaField
            label={i18n._(t`Description (markdown supported)`)}
            value={eventsFunctionsExtension.getDescription()}
            onChange={text => {
              eventsFunctionsExtension.setDescription(text);
              forceUpdate();
            }}
            placeholder={i18n._(
              t`Explain and give some examples of what can be achieved with this extension.`
            )}
            rows={6}
          />
          <CompactPropertiesEditorRowField
            label={i18n._(t`Version`)}
            field={
              <CompactTextField
                value={eventsFunctionsExtension.getVersion()}
                onChange={(e, text) => {
                  eventsFunctionsExtension.setVersion(text);
                  forceUpdate();
                }}
              />
            }
          />
          <CompactPropertiesEditorRowField
            label={i18n._(t`Dimension`)}
            field={
              <CompactSelectField
                value={eventsFunctionsExtension.getDimension()}
                onChange={value => {
                  eventsFunctionsExtension.setDimension(value);
                  forceUpdate();
                }}
              >
                <SelectOption value="" label={t`Not applicable`} />
                <SelectOption value="2D" label="2D" />
                <SelectOption value="3D" label="3D" />
                <SelectOption value="2D/3D" label="2D/3D" />
              </CompactSelectField>
            }
          />
          <CompactPropertiesEditorRowField
            label={i18n._(t`Tags (comma separated)`)}
            field={
              <CompactSemiControlledTextField
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
              />
            }
          />
          <HelpPathTextField
            i18n={i18n}
            helpPath={eventsFunctionsExtension.getHelpPath()}
            onChangeHelpPath={helpPath => {
              eventsFunctionsExtension.setHelpPath(helpPath);
              forceUpdate();
            }}
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
