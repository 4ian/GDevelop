// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';

import React from 'react';
import SelectField from '../../UI/SelectField';
import FlatButton from '../../UI/FlatButton';
import SelectOption from '../../UI/SelectOption';
import Toggle from '../../UI/Toggle';
import Dialog from '../../UI/Dialog';
import { Column, Line, Spacer } from '../../UI/Grid';
import { themes } from '../../UI/Theme';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';
import PreferencesContext from './PreferencesContext';
import Text from '../../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { Tabs, Tab } from '../../UI/Tabs';
import RaisedButton from '../../UI/RaisedButton';
import ShortcutsList from '../../KeyboardShortcuts/ShortcutsList';
import LanguageSelector from './LanguageSelector';
import Link from '../../UI/Link';
const electron = optionalRequire('electron');

type Props = {|
  i18n: I18n,
  onClose: (languageDidChange: boolean) => void,
|};

const PreferencesDialog = ({ i18n, onClose }: Props) => {
  const [currentTab, setCurrentTab] = React.useState('preferences');
  const [languageDidChange, setLanguageDidChange] = React.useState<boolean>(
    false
  );
  const {
    values,
    setThemeName,
    setCodeEditorThemeName,
    setAutoDownloadUpdates,
    showAllAlertMessages,
    showAllTutorialHints,
    showAllAnnouncements,
    setAutoDisplayChangelog,
    setEventsSheetShowObjectThumbnails,
    setAutosaveOnPreview,
    setUseNewInstructionEditorDialog,
    setUseUndefinedVariablesInAutocompletion,
    setUseGDJSDevelopmentWatcher,
    setEventsSheetUseAssignmentOperators,
    getDefaultEditorMosaicNode,
    setDefaultEditorMosaicNode,
    setAutoOpenMostRecentProject,
    resetShortcutsToDefault,
    setShortcutForCommand,
    setIsMenuBarHiddenInPreview,
    setBackdropClickBehavior,
    setIsAlwaysOnTopInPreview,
    setEventsSheetCancelInlineParameter,
    setShowCommunityExtensions,
  } = React.useContext(PreferencesContext);

  return (
    <Dialog
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={() => onClose(languageDidChange)}
        />,
      ]}
      onRequestClose={() => onClose(languageDidChange)}
      open
      noTitleMargin
      maxWidth="sm"
      noMargin
      title={
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>Preferences</Trans>} value="preferences" />
          <Tab label={<Trans>Keyboard Shortcuts</Trans>} value="shortcuts" />
        </Tabs>
      }
    >
      {currentTab === 'preferences' && (
        <ColumnStackLayout>
          <Text size="block-title">
            <Trans>Language</Trans>
          </Text>
          <LanguageSelector
            onLanguageChanged={() => {
              setLanguageDidChange(true);
            }}
          />
          <Text size="block-title">
            <Trans>Appearance</Trans>
          </Text>
          <ResponsiveLineStackLayout noMargin>
            <SelectField
              floatingLabelText={<Trans>UI Theme</Trans>}
              value={values.themeName}
              onChange={(e, i, value: string) => setThemeName(value)}
              fullWidth
            >
              {Object.keys(themes).map(themeName => (
                <SelectOption
                  value={themeName}
                  primaryText={themeName}
                  key={themeName}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={<Trans>Code editor Theme</Trans>}
              value={values.codeEditorThemeName}
              onChange={(e, i, value: string) => setCodeEditorThemeName(value)}
              fullWidth
            >
              {getAllThemes().map(codeEditorTheme => (
                <SelectOption
                  value={codeEditorTheme.themeName}
                  primaryText={codeEditorTheme.name}
                  key={codeEditorTheme.themeName}
                />
              ))}
            </SelectField>
          </ResponsiveLineStackLayout>
          <Line noMargin>
            <Text>
              <Trans>
                You can contribute and{' '}
                <Link
                  href={
                    'https://github.com/4ian/GDevelop/blob/master/newIDE/README-themes.md'
                  }
                  onClick={() =>
                    Window.openExternalURL(
                      'https://github.com/4ian/GDevelop/blob/master/newIDE/README-themes.md'
                    )
                  }
                >
                  create your own themes
                </Link>
                .
              </Trans>
            </Text>
          </Line>
          <Text size="block-title">
            <Trans>Layouts</Trans>
          </Text>
          <Column noMargin>
            <RaisedButton
              label={<Trans>Reset Scene Editor layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('scene-editor', null)}
              disabled={!getDefaultEditorMosaicNode('scene-editor')}
            />
            <Spacer />
            <RaisedButton
              label={<Trans>Reset Scene Editor (small window) layout</Trans>}
              onClick={() =>
                setDefaultEditorMosaicNode('scene-editor-small', null)
              }
              disabled={!getDefaultEditorMosaicNode('scene-editor-small')}
            />
            <Spacer />
            <RaisedButton
              label={<Trans>Reset Debugger layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('debugger', null)}
              disabled={!getDefaultEditorMosaicNode('debugger')}
            />
            <Spacer />
            <RaisedButton
              label={<Trans>Reset Resource Editor layout</Trans>}
              onClick={() =>
                setDefaultEditorMosaicNode('resources-editor', null)
              }
              disabled={!getDefaultEditorMosaicNode('resources-editor')}
            />
            <Spacer />
            <RaisedButton
              label={<Trans>Reset Extension Editor layout</Trans>}
              onClick={() =>
                setDefaultEditorMosaicNode(
                  'events-functions-extension-editor',
                  null
                )
              }
              disabled={
                !getDefaultEditorMosaicNode('events-functions-extension-editor')
              }
            />
          </Column>
          <Text size="block-title">
            <Trans>Dialogs</Trans>
          </Text>
          <SelectField
            floatingLabelText={<Trans>Dialog backdrop click behavior</Trans>}
            value={values.backdropClickBehavior}
            onChange={(e, i, value: string) => setBackdropClickBehavior(value)}
            fullWidth
          >
            <SelectOption value="cancel" primaryText={t`Cancel changes`} />
            <SelectOption value="apply" primaryText={t`Apply changes`} />
            <SelectOption value="nothing" primaryText={t`Do nothing`} />
          </SelectField>
          <Text size="block-title">
            <Trans>Updates</Trans>
          </Text>
          <Toggle
            onToggle={(e, check) => setAutoDownloadUpdates(check)}
            toggled={values.autoDownloadUpdates}
            labelPosition="right"
            label={
              <Trans>Auto download and install updates (recommended)</Trans>
            }
          />
          <Toggle
            onToggle={(e, check) => setAutoDisplayChangelog(check)}
            toggled={values.autoDisplayChangelog}
            labelPosition="right"
            label={
              <Trans>
                Display What's New when a new version is launched (recommended)
              </Trans>
            }
          />
          <Text size="block-title">
            <Trans>Events Sheet</Trans>
          </Text>
          <Toggle
            onToggle={(e, check) => setEventsSheetShowObjectThumbnails(check)}
            toggled={values.eventsSheetShowObjectThumbnails}
            labelPosition="right"
            label={<Trans>Display object thumbnails in Events Sheets</Trans>}
          />
          <Toggle
            onToggle={(e, check) => setEventsSheetUseAssignmentOperators(check)}
            toggled={values.eventsSheetUseAssignmentOperators}
            labelPosition="right"
            label={<Trans>Display assignment operators in Events Sheets</Trans>}
          />
          <Toggle
            onToggle={(e, check) => setUseNewInstructionEditorDialog(check)}
            toggled={values.useNewInstructionEditorDialog}
            labelPosition="right"
            label={<Trans>Use the new action/condition editor</Trans>}
          />
          <Toggle
            onToggle={(e, check) =>
              setUseUndefinedVariablesInAutocompletion(check)
            }
            toggled={values.useUndefinedVariablesInAutocompletion}
            labelPosition="right"
            label={
              <Trans>
                Suggest names of variables used in events but not declared in
                the list of variables
              </Trans>
            }
          />
          <SelectField
            floatingLabelText={
              <Trans>
                Escape key behavior when editing an parameter inline
              </Trans>
            }
            value={values.eventsSheetCancelInlineParameter}
            onChange={(e, i, value: string) => {
              setEventsSheetCancelInlineParameter(value);
            }}
            fullWidth
          >
            <SelectOption value="cancel" primaryText={t`Cancel changes`} />
            <SelectOption value="apply" primaryText={t`Apply changes`} />
          </SelectField>
          <Text size="block-title">
            <Trans>Embedded help and tutorials</Trans>
          </Text>
          <Column noMargin>
            <Line>
              <RaisedButton
                label={<Trans>Reset hidden embedded explanations</Trans>}
                onClick={() => showAllAlertMessages()}
                disabled={!Object.keys(values.hiddenAlertMessages).length}
              />
            </Line>
            <Line>
              <RaisedButton
                label={<Trans>Reset hidden embedded tutorials</Trans>}
                onClick={() => showAllTutorialHints()}
                disabled={!Object.keys(values.hiddenTutorialHints).length}
              />
            </Line>
            <Line>
              <RaisedButton
                label={<Trans>Reset hidden announcements</Trans>}
                onClick={() => showAllAnnouncements()}
                disabled={!Object.keys(values.hiddenAnnouncements).length}
              />
            </Line>
          </Column>
          <Text size="block-title">
            <Trans>Advanced</Trans>
          </Text>
          <Toggle
            onToggle={(e, check) => setAutosaveOnPreview(check)}
            toggled={values.autosaveOnPreview}
            labelPosition="right"
            label={<Trans>Auto-save project on Preview</Trans>}
          />
          <Toggle
            onToggle={(e, check) => setAutoOpenMostRecentProject(check)}
            toggled={values.autoOpenMostRecentProject}
            labelPosition="right"
            label={
              <Trans>
                Automatically re-open the project edited during last session
              </Trans>
            }
          />
          <Toggle
            onToggle={(e, check) => setShowCommunityExtensions(check)}
            toggled={values.showCommunityExtensions}
            labelPosition="right"
            label={
              <Trans>
                Show community (non reviewed) extensions in the list of
                extensions
              </Trans>
            }
          />
          {electron && (
            <>
              <ColumnStackLayout expand noMargin>
                <Toggle
                  onToggle={(e, check) => setIsMenuBarHiddenInPreview(check)}
                  toggled={values.isMenuBarHiddenInPreview}
                  labelPosition="right"
                  label={<Trans>Hide the menu bar in the preview window</Trans>}
                />
                <Toggle
                  onToggle={(e, check) => setIsAlwaysOnTopInPreview(check)}
                  toggled={values.isAlwaysOnTopInPreview}
                  labelPosition="right"
                  label={
                    <Trans>
                      Always display the preview window on top of the editor
                    </Trans>
                  }
                />
              </ColumnStackLayout>
            </>
          )}
          {Window.isDev() && (
            <Toggle
              onToggle={(e, check) => setUseGDJSDevelopmentWatcher(check)}
              toggled={values.useGDJSDevelopmentWatcher}
              labelPosition="right"
              label={
                <Trans>
                  Watch changes in game engine (GDJS) sources and auto import
                  them (dev only)
                </Trans>
              }
            />
          )}
        </ColumnStackLayout>
      )}
      {currentTab === 'shortcuts' && (
        <Line expand>
          <Column expand>
            <ShortcutsList
              i18n={i18n}
              userShortcutMap={values.userShortcutMap}
              onEdit={setShortcutForCommand}
              onReset={resetShortcutsToDefault}
            />
          </Column>
        </Line>
      )}
    </Dialog>
  );
};

export default PreferencesDialog;
