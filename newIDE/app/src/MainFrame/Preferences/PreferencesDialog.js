// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';

import React from 'react';
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
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { Tabs } from '../../UI/Tabs';
import ShortcutsList from '../../KeyboardShortcuts/ShortcutsList';
import LanguageSelector from './LanguageSelector';
import Link from '../../UI/Link';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { adaptAcceleratorString } from '../../UI/AcceleratorString';
import { getElectronAccelerator } from '../../KeyboardShortcuts';
import defaultShortcuts from '../../KeyboardShortcuts/DefaultShortcuts';
import AlertMessage from '../../UI/AlertMessage';
import ErrorBoundary from '../../UI/ErrorBoundary';
import CompactSelectField from '../../UI/CompactSelectField';
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
    setShowAiAskButtonInTitleBar,
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
          <Column>
            <LanguageSelector
              onLanguageChanged={() => {
                setLanguageDidChange(true);
              }}
            />
          </Column>
          <Text size="block-title">
            <Trans>Appearance</Trans>
          </Text>
          <ColumnStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Column noMargin expand>
                <Text noMargin>
                  <Trans>UI Theme</Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <CompactSelectField
                  value={values.themeName}
                  onChange={(value: string) => setThemeName(value)}
                >
                  {Object.keys(themes).map(themeName => (
                    <SelectOption
                      value={themeName}
                      label={themeName}
                      key={themeName}
                    />
                  ))}
                </CompactSelectField>
              </Column>
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Column noMargin expand>
                <Text noMargin>
                  <Trans>Code editor Theme</Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <CompactSelectField
                  value={values.codeEditorThemeName}
                  onChange={(value: string) => setCodeEditorThemeName(value)}
                >
                  {getAllThemes().map(codeEditorTheme => (
                    <SelectOption
                      value={codeEditorTheme.themeName}
                      label={codeEditorTheme.name}
                      key={codeEditorTheme.themeName}
                    />
                  ))}
                </CompactSelectField>
              </Column>
            </LineStackLayout>
            <Line noMargin>
              <Text color="secondary">
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
          </ColumnStackLayout>
          <Text size="block-title">
            <Trans>Layouts</Trans>
          </Text>
          <ColumnStackLayout expand>
            <FlatButton
              label={<Trans>Reset Scene Editor layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('scene-editor', null)}
              disabled={!getDefaultEditorMosaicNode('scene-editor')}
            />
            <FlatButton
              label={<Trans>Reset Debugger layout</Trans>}
              onClick={() => setDefaultEditorMosaicNode('debugger', null)}
              disabled={!getDefaultEditorMosaicNode('debugger')}
            />
            <FlatButton
              label={<Trans>Reset Resource Editor layout</Trans>}
              onClick={() =>
                setDefaultEditorMosaicNode('resources-editor', null)
              }
              disabled={!getDefaultEditorMosaicNode('resources-editor')}
            />
            <FlatButton
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
          <ColumnStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Column noMargin expand>
                <Text noMargin>
                  <Trans>Dialog backdrop click behavior</Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <CompactSelectField
                  value={values.backdropClickBehavior}
                  onChange={(value: string) => setBackdropClickBehavior(value)}
                >
                  <SelectOption value="cancel" label={t`Cancel changes`} />
                  <SelectOption value="apply" label={t`Apply changes`} />
                  <SelectOption value="nothing" label={t`Do nothing`} />
                </CompactSelectField>
              </Column>
            </LineStackLayout>

            {!!electron && (
              <LineStackLayout noMargin alignItems="center">
                <Column noMargin expand>
                  <Text noMargin>
                    <Trans>
                      Importing resources outside from the project folder
                    </Trans>
                  </Text>
                </Column>
                <Column noMargin expand>
                  <CompactSelectField
                    value={values.resourcesImporationBehavior}
                    onChange={(value: string) =>
                      setResourcesImporationBehavior(value)
                    }
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
                  </CompactSelectField>
                </Column>
              </LineStackLayout>
            )}
          </ColumnStackLayout>
          <Text size="block-title">
            <Trans>Updates</Trans>
          </Text>
          <ColumnStackLayout expand>
            <CompactToggleField
              labelColor="primary"
              hideTooltip
              onCheck={setAutoDownloadUpdates}
              checked={values.autoDownloadUpdates}
              label={i18n._(t`Auto download and install updates (recommended)`)}
            />
            <CompactToggleField
              labelColor="primary"
              hideTooltip
              onCheck={setAutoDisplayChangelog}
              checked={values.autoDisplayChangelog}
              label={i18n._(
                t`Display What's New when a new version is launched (recommended)`
              )}
            />
          </ColumnStackLayout>
          <Text size="block-title">
            <Trans>Events Sheet</Trans>
          </Text>
          <ColumnStackLayout expand>
            <CompactToggleField
              labelColor="primary"
              hideTooltip
              onCheck={setEventsSheetShowObjectThumbnails}
              checked={values.eventsSheetShowObjectThumbnails}
              label={i18n._(t`Display object thumbnails in Events Sheets`)}
            />
            <CompactToggleField
              labelColor="primary"
              hideTooltip
              onCheck={setEventsSheetUseAssignmentOperators}
              checked={values.eventsSheetUseAssignmentOperators}
              label={i18n._(t`Display assignment operators in Events Sheets`)}
            />
            <LineStackLayout noMargin alignItems="center">
              <Column noMargin expand>
                <Text noMargin>
                  <Trans>Indent Scale in Events Sheet</Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <CompactSelectField
                  value={values.eventsSheetIndentScale.toString()}
                  onChange={(value: string) =>
                    setEventsSheetIndentScale(parseInt(value, 10))
                  }
                >
                  <SelectOption value="1" label={t`100% (Default)`} />
                  <SelectOption value="2" label={t`200%`} />
                  <SelectOption value="3" label={t`300%`} />
                  <SelectOption value="4" label={t`400%`} />
                  <SelectOption value="5" label={t`500%`} />
                  <SelectOption value="6" label={t`600%`} />
                  <SelectOption value="7" label={t`700%`} />
                  <SelectOption value="8" label={t`800%`} />
                </CompactSelectField>
              </Column>
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <Column noMargin expand>
                <Text noMargin>
                  <Trans>
                    Escape key behavior when editing an parameter inline
                  </Trans>
                </Text>
              </Column>
              <Column noMargin expand>
                <CompactSelectField
                  value={values.eventsSheetCancelInlineParameter}
                  onChange={(value: string) =>
                    setEventsSheetCancelInlineParameter(value)
                  }
                >
                  <SelectOption value="cancel" label={t`Cancel changes`} />
                  <SelectOption value="apply" label={t`Apply changes`} />
                </CompactSelectField>
              </Column>
            </LineStackLayout>
          </ColumnStackLayout>

          <Text size="block-title">
            <Trans>Embedded help and tutorials</Trans>
          </Text>
          <ColumnStackLayout expand>
            <FlatButton
              label={<Trans>Reset hidden embedded explanations</Trans>}
              onClick={() => showAllAlertMessages()}
              disabled={!Object.keys(values.hiddenAlertMessages).length}
            />
            <FlatButton
              label={<Trans>Reset hidden embedded tutorials</Trans>}
              onClick={() => showAllTutorialHints()}
              disabled={!Object.keys(values.hiddenTutorialHints).length}
            />
            <FlatButton
              label={<Trans>Reset hidden announcements</Trans>}
              onClick={() => showAllAnnouncements()}
              disabled={!Object.keys(values.hiddenAnnouncements).length}
            />
          </ColumnStackLayout>
          <Column noMargin>
            <Text size="block-title">
              <Trans>Advanced</Trans>
            </Text>
            <ColumnStackLayout>
              <Text size="sub-title">
                <Trans>Previews</Trans>
              </Text>
              <ColumnStackLayout>
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setAutosaveOnPreview}
                  checked={values.autosaveOnPreview}
                  label={i18n._(t`Auto-save project on preview`)}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setFetchPlayerTokenForPreviewAutomatically}
                  checked={values.fetchPlayerTokenForPreviewAutomatically}
                  label={i18n._(t`Automatically log in as a player in preview`)}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setOpenDiagnosticReportAutomatically}
                  checked={values.openDiagnosticReportAutomatically}
                  label={i18n._(
                    t`Automatically open the diagnostic report at preview`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={check =>
                    setPreviewCrashReportUploadLevel(
                      check ? 'exclude-javascript-code-events' : 'none'
                    )
                  }
                  checked={values.previewCrashReportUploadLevel !== 'none'}
                  label={i18n._(
                    t`Send crash reports during previews to GDevelop`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setTakeScreenshotOnPreview}
                  checked={values.takeScreenshotOnPreview}
                  label={i18n._(
                    t`Automatically take a screenshot in game previews`
                  )}
                />
                {electron && (
                  <>
                    <ColumnStackLayout expand noMargin>
                      <CompactToggleField
                        labelColor="primary"
                        hideTooltip
                        onCheck={setIsMenuBarHiddenInPreview}
                        checked={values.isMenuBarHiddenInPreview}
                        label={i18n._(
                          t`Hide the menu bar in the preview window`
                        )}
                      />
                      <CompactToggleField
                        labelColor="primary"
                        hideTooltip
                        onCheck={setIsAlwaysOnTopInPreview}
                        checked={values.isAlwaysOnTopInPreview}
                        label={i18n._(
                          t`Always display the preview window on top of the editor`
                        )}
                      />
                      <CompactToggleField
                        labelColor="primary"
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
              </ColumnStackLayout>
              <Text size="sub-title">
                <Trans>Scene editor</Trans>
              </Text>
              <ColumnStackLayout>
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setShowBasicProfilingCounters}
                  checked={values.showBasicProfilingCounters}
                  label={i18n._(
                    t`Display profiling information in scene editor`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setUse3DEditor}
                  checked={values.use3DEditor}
                  label={i18n._(t`Show objects in 3D in the scene editor`)}
                />
                {initialUse3DEditor.current !== values.use3DEditor && (
                  <AlertMessage kind="info">
                    <Trans>
                      For the 3D change to take effect, close and reopen all
                      currently opened scenes.
                    </Trans>
                  </AlertMessage>
                )}
              </ColumnStackLayout>
              <Text size="sub-title">
                <Trans>Other</Trans>
              </Text>
              <ColumnStackLayout>
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setShowAiAskButtonInTitleBar}
                  checked={values.showAiAskButtonInTitleBar}
                  label={i18n._(t`Show "Ask AI" button in the title bar`)}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={check =>
                    setDisplaySaveReminder({ activated: check })
                  }
                  checked={values.displaySaveReminder.activated}
                  label={i18n._(
                    t`Display save reminder after significant changes in project`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setAutoOpenMostRecentProject}
                  checked={values.autoOpenMostRecentProject}
                  label={i18n._(
                    t`Automatically re-open the project edited during last session`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setShowCommunityExtensions}
                  checked={values.showCommunityExtensions}
                  label={i18n._(
                    t`Show community (non reviewed) extensions in the list of extensions`
                  )}
                />
                <CompactToggleField
                  labelColor="primary"
                  hideTooltip
                  onCheck={setShowDeprecatedInstructionWarning}
                  checked={values.showDeprecatedInstructionWarning}
                  label={i18n._(
                    t`Show a warning on deprecated actions and conditions`
                  )}
                />
                {!!electron && (
                  <CompactToggleField
                    labelColor="primary"
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
              </ColumnStackLayout>
            </ColumnStackLayout>
          </Column>

          <Text size="block-title">
            <Trans>Contributor options</Trans>
          </Text>
          <ColumnStackLayout>
            <CompactToggleField
              labelColor="primary"
              hideTooltip
              onCheck={setShowInAppTutorialDeveloperMode}
              checked={values.showInAppTutorialDeveloperMode}
              label={i18n._(
                t`Show button to load guided lesson from file and test it`
              )}
            />
          </ColumnStackLayout>

          {Window.isDev() && (
            <>
              <ColumnStackLayout expand noMargin>
                <Text size="block-title">
                  <Trans>Developer options</Trans>
                </Text>
                <ColumnStackLayout>
                  <CompactToggleField
                    labelColor="primary"
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
