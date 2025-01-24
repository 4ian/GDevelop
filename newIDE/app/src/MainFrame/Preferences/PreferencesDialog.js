// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';

import React from 'react';
import SelectField from '../../UI/SelectField';
import FlatButton from '../../UI/FlatButton';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import SelectOption from '../../UI/SelectOption';
import { CompactToggleField } from '../../UI/CompactToggleField';
import Dialog from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import { themes } from '../../UI/Theme/ThemeRegistry';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';
import PreferencesContext from './PreferencesContext';
import Text from '../../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { Tabs } from '../../UI/Tabs';
import RaisedButton from '../../UI/RaisedButton';
import ShortcutsList from '../../KeyboardShortcuts/ShortcutsList';
import LanguageSelector from './LanguageSelector';
import Link from '../../UI/Link';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { adaptAcceleratorString } from '../../UI/AcceleratorString';
import { getElectronAccelerator } from '../../KeyboardShortcuts';
import defaultShortcuts from '../../KeyboardShortcuts/DefaultShortcuts';
import AlertMessage from '../../UI/AlertMessage';
import ErrorBoundary from '../../UI/ErrorBoundary';
const electron = optionalRequire('electron');

type Props = {|
  i18n: I18n,
  onClose: (options: {| languageDidChange: boolean |}) => void,
  onOpenQuickCustomizationDialog: () => void,
|};

const PreferencesDialog = ({
  i18n,
  onClose,
  onOpenQuickCustomizationDialog,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
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
    setUseGDJSDevelopmentWatcher,
    setEventsSheetUseAssignmentOperators,
    setEventsSheetIndentScale,
    getDefaultEditorMosaicNode,
    setDefaultEditorMosaicNode,
    setAutoOpenMostRecentProject,
    resetShortcutsToDefault,
    setShortcutForCommand,
    setIsMenuBarHiddenInPreview,
    setBackdropClickBehavior,
    setResourcesImporationBehavior,
    setIsAlwaysOnTopInPreview,
    setEventsSheetCancelInlineParameter,
    setShowCommunityExtensions,
    setShowInAppTutorialDeveloperMode,
    setOpenDiagnosticReportAutomatically,
    setShowDeprecatedInstructionWarning,
    setUse3DEditor,
    setShowBasicProfilingCounters,
    setNewProjectsDefaultFolder,
    setUseShortcutToClosePreviewWindow,
    setWatchProjectFolderFilesForLocalProjects,
    setDisplaySaveReminder,
    setFetchPlayerTokenForPreviewAutomatically,
    setPreviewCrashReportUploadLevel,
    setTakeScreenshotOnPreview,
  } = React.useContext(PreferencesContext);

  const initialUse3DEditor = React.useRef<boolean>(values.use3DEditor);

  return (
    <Dialog
      title={<Trans>Preferences</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={() => onClose({ languageDidChange })}
        />,
      ]}
      onRequestClose={() => onClose({ languageDidChange })}
      open
      maxWidth="sm"
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            { value: 'preferences', label: <Trans>Preferences</Trans> },
            { value: 'shortcuts', label: <Trans>Keyboard Shortcuts</Trans> },
            ...(electron
              ? [{ value: 'folders', label: <Trans>Folders</Trans> }]
              : []),
          ]}
          // Enforce scroll on very small screens, because the tabs have long names.
          variant={isMobile ? 'scrollable' : undefined}
        />
      }
    >
      {currentTab === 'preferences' && (
        <ColumnStackLayout noMargin>
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
                  label={themeName}
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
                  label={codeEditorTheme.name}
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
          <ColumnStackLayout expand noMargin>
            <RaisedButton
              label={<Trans>Reset Scene Editor layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('scene-editor', null)}
              disabled={!getDefaultEditorMosaicNode('scene-editor')}
            />
            <RaisedButton
              label={<Trans>Reset Debugger layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('debugger', null)}
              disabled={!getDefaultEditorMosaicNode('debugger')}
            />
            <RaisedButton
              label={<Trans>Reset Resource Editor layout</Trans>}
              onClick={() =>
                setDefaultEditorMosaicNode('resources-editor', null)
              }
              disabled={!getDefaultEditorMosaicNode('resources-editor')}
            />
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
          </ColumnStackLayout>
          <Text size="block-title">
            <Trans>Dialogs</Trans>
          </Text>
          <SelectField
            floatingLabelText={<Trans>Dialog backdrop click behavior</Trans>}
            value={values.backdropClickBehavior}
            onChange={(e, i, value: string) => setBackdropClickBehavior(value)}
            fullWidth
          >
            <SelectOption value="cancel" label={t`Cancel changes`} />
            <SelectOption value="apply" label={t`Apply changes`} />
            <SelectOption value="nothing" label={t`Do nothing`} />
          </SelectField>
          {!!electron && (
            <SelectField
              floatingLabelText={
                <Trans>
                  Importing resources outside from the project folder
                </Trans>
              }
              value={values.resourcesImporationBehavior}
              onChange={(e, i, value: string) =>
                setResourcesImporationBehavior(value)
              }
              fullWidth
            >
              <SelectOption
                value="import"
                label={t`Copy them into the project folder`}
              />
              <SelectOption
                value="relative"
                label={t`Keep their original location`}
              />
              <SelectOption value="ask" label={t`Ask every time`} />
            </SelectField>
          )}
          <Text size="block-title">
            <Trans>Updates</Trans>
          </Text>
          <CompactToggleField
            hideTooltip
            onCheck={setAutoDownloadUpdates}
            checked={values.autoDownloadUpdates}
            label={i18n._(t`Auto download and install updates (recommended)`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setAutoDisplayChangelog}
            checked={values.autoDisplayChangelog}
            label={i18n._(
              t`Display What's New when a new version is launched (recommended)`
            )}
          />
          <Text size="block-title">
            <Trans>Events Sheet</Trans>
          </Text>
          <CompactToggleField
            hideTooltip
            onCheck={setEventsSheetShowObjectThumbnails}
            checked={values.eventsSheetShowObjectThumbnails}
            label={i18n._(t`Display object thumbnails in Events Sheets`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setEventsSheetUseAssignmentOperators}
            checked={values.eventsSheetUseAssignmentOperators}
            label={i18n._(t`Display assignment operators in Events Sheets`)}
          />
          <SelectField
            floatingLabelText={<Trans>Indent Scale in Events Sheet</Trans>}
            fullWidth
            value={values.eventsSheetIndentScale.toString()}
            onChange={(e, i, value) => {
              setEventsSheetIndentScale(parseInt(value, 10));
            }}
          >
            <SelectOption value="1" label={t`100% (Default)`} />
            <SelectOption value="2" label={t`200%`} />
            <SelectOption value="3" label={t`300%`} />
            <SelectOption value="4" label={t`400%`} />
            <SelectOption value="5" label={t`500%`} />
            <SelectOption value="6" label={t`600%`} />
            <SelectOption value="7" label={t`700%`} />
            <SelectOption value="8" label={t`800%`} />
          </SelectField>
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
            <SelectOption value="cancel" label={t`Cancel changes`} />
            <SelectOption value="apply" label={t`Apply changes`} />
          </SelectField>
          <Text size="block-title">
            <Trans>Embedded help and tutorials</Trans>
          </Text>
          <ColumnStackLayout expand noMargin>
            <RaisedButton
              label={<Trans>Reset hidden embedded explanations</Trans>}
              onClick={() => showAllAlertMessages()}
              disabled={!Object.keys(values.hiddenAlertMessages).length}
            />
            <RaisedButton
              label={<Trans>Reset hidden embedded tutorials</Trans>}
              onClick={() => showAllTutorialHints()}
              disabled={!Object.keys(values.hiddenTutorialHints).length}
            />
            <RaisedButton
              label={<Trans>Reset hidden announcements</Trans>}
              onClick={() => showAllAnnouncements()}
              disabled={!Object.keys(values.hiddenAnnouncements).length}
            />
          </ColumnStackLayout>
          <Text size="block-title">
            <Trans>Advanced</Trans>
          </Text>
          <CompactToggleField
            hideTooltip
            onCheck={setAutosaveOnPreview}
            checked={values.autosaveOnPreview}
            label={i18n._(t`Auto-save project on preview`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setFetchPlayerTokenForPreviewAutomatically}
            checked={values.fetchPlayerTokenForPreviewAutomatically}
            label={i18n._(t`Automatically log in as a player in preview`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={check => setDisplaySaveReminder({ activated: check })}
            checked={values.displaySaveReminder.activated}
            label={i18n._(
              t`Display save reminder after significant changes in project`
            )}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setAutoOpenMostRecentProject}
            checked={values.autoOpenMostRecentProject}
            label={i18n._(
              t`Automatically re-open the project edited during last session`
            )}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setShowCommunityExtensions}
            checked={values.showCommunityExtensions}
            label={i18n._(
              t`Show community (non reviewed) extensions in the list of extensions`
            )}
          />
          {!!electron && (
            <CompactToggleField
              hideTooltip
              onCheck={check =>
                setWatchProjectFolderFilesForLocalProjects(check)
              }
              checked={values.watchProjectFolderFilesForLocalProjects}
              label={i18n._(
                t`Watch the project folder for file changes in order to refresh the resources used in the editor (images, 3D models, fonts, etc.)`
              )}
            />
          )}
          <CompactToggleField
            hideTooltip
            onCheck={setOpenDiagnosticReportAutomatically}
            checked={values.openDiagnosticReportAutomatically}
            label={i18n._(
              t`Automatically open the diagnostic report at preview`
            )}
          />
          <CompactToggleField
            hideTooltip
            onCheck={check =>
              setPreviewCrashReportUploadLevel(
                check ? 'exclude-javascript-code-events' : 'none'
              )
            }
            checked={values.previewCrashReportUploadLevel !== 'none'}
            label={i18n._(t`Send crash reports during previews to GDevelop`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setTakeScreenshotOnPreview}
            checked={values.takeScreenshotOnPreview}
            label={i18n._(t`Automatically take a screenshot in game previews`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setShowDeprecatedInstructionWarning}
            checked={values.showDeprecatedInstructionWarning}
            label={i18n._(
              t`Show a warning on deprecated actions and conditions`
            )}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setShowBasicProfilingCounters}
            checked={values.showBasicProfilingCounters}
            label={i18n._(t`Display profiling information in scene editor`)}
          />
          <CompactToggleField
            hideTooltip
            onCheck={setUse3DEditor}
            checked={values.use3DEditor}
            label={i18n._(t`Show objects in 3D in the scene editor`)}
          />
          {initialUse3DEditor.current !== values.use3DEditor && (
            <AlertMessage kind="info">
              <Trans>
                For the 3D change to take effect, close and reopen all currently
                opened scenes.
              </Trans>
            </AlertMessage>
          )}
          {electron && (
            <>
              <ColumnStackLayout expand noMargin>
                <CompactToggleField
                  hideTooltip
                  onCheck={setIsMenuBarHiddenInPreview}
                  checked={values.isMenuBarHiddenInPreview}
                  label={i18n._(t`Hide the menu bar in the preview window`)}
                />
                <CompactToggleField
                  hideTooltip
                  onCheck={setIsAlwaysOnTopInPreview}
                  checked={values.isAlwaysOnTopInPreview}
                  label={i18n._(
                    t`Always display the preview window on top of the editor`
                  )}
                />
                <CompactToggleField
                  hideTooltip
                  onCheck={setUseShortcutToClosePreviewWindow}
                  checked={values.useShortcutToClosePreviewWindow}
                  label={i18n._(
                    t`Enable "Close project" shortcut (${adaptAcceleratorString(
                      getElectronAccelerator(
                        values.userShortcutMap['CLOSE_PROJECT'] ||
                          defaultShortcuts['CLOSE_PROJECT']
                      )
                    )}) to close preview window`
                  )}
                />
              </ColumnStackLayout>
            </>
          )}
          <Text size="block-title">
            <Trans>Contributor options</Trans>
          </Text>
          <CompactToggleField
            hideTooltip
            onCheck={setShowInAppTutorialDeveloperMode}
            checked={values.showInAppTutorialDeveloperMode}
            label={i18n._(
              t`Show button to load guided lesson from file and test it`
            )}
          />
          {Window.isDev() && (
            <>
              <ColumnStackLayout expand noMargin>
                <Text size="block-title">
                  <Trans>Developer options</Trans>
                </Text>
                <CompactToggleField
                  hideTooltip
                  onCheck={setUseGDJSDevelopmentWatcher}
                  checked={values.useGDJSDevelopmentWatcher}
                  label={i18n._(
                    t`Watch changes in game engine (GDJS) sources and auto import them (dev only)`
                  )}
                />
                <FlatButton
                  fullWidth
                  onClick={onOpenQuickCustomizationDialog}
                  label={<Trans>Open quick customization</Trans>}
                />
              </ColumnStackLayout>
            </>
          )}
        </ColumnStackLayout>
      )}
      {currentTab === 'shortcuts' && (
        <Line expand>
          <Column expand noMargin>
            <ShortcutsList
              i18n={i18n}
              userShortcutMap={values.userShortcutMap}
              onEdit={setShortcutForCommand}
              onReset={resetShortcutsToDefault}
            />
          </Column>
        </Line>
      )}
      {electron && currentTab === 'folders' && (
        <ColumnStackLayout noMargin>
          <LocalFolderPicker
            fullWidth
            value={values.newProjectsDefaultFolder}
            onChange={setNewProjectsDefaultFolder}
            type="default-workspace"
          />
        </ColumnStackLayout>
      )}
    </Dialog>
  );
};

const PreferencesDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Preferences</Trans>}
    scope="preferences"
    onClose={() => props.onClose({ languageDidChange: false })}
  >
    <PreferencesDialog {...props} />
  </ErrorBoundary>
);

export default PreferencesDialogWithErrorBoundary;
