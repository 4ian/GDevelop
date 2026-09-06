// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';

import React from 'react';
import { Divider } from '@material-ui/core';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
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
import EmptyMessage from '../../UI/EmptyMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import { Tabs } from '../../UI/Tabs';
import SettingsRow from '../../UI/SettingsRow';
import VerticalTabButton from '../../UI/VerticalTabButton';
import SearchBar from '../../UI/SearchBar';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import ShortcutsList, {
  getShortcutSections,
  normalizeForSearch,
} from '../../KeyboardShortcuts/ShortcutsList';
import { LanguageSelectField } from './LanguageSelector';
import Link from '../../UI/Link';
import { commandAreas } from '../../CommandPalette/CommandsList';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { adaptAcceleratorString } from '../../UI/AcceleratorString';
import {
  getElectronAccelerator,
  getShortcutDisplayName,
} from '../../KeyboardShortcuts';
import defaultShortcuts, {
  defaultSecondaryShortcuts,
} from '../../KeyboardShortcuts/DefaultShortcuts';
import AlertMessage from '../../UI/AlertMessage';
import ErrorBoundary from '../../UI/ErrorBoundary';
import CompactSelectField from '../../UI/CompactSelectField';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import TuneIcon from '../../UI/CustomSvgIcons/Tune';
import BrushIcon from '../../UI/CustomSvgIcons/Brush';
import GridIcon from '../../UI/CustomSvgIcons/Grid';
import DesktopIcon from '../../UI/CustomSvgIcons/Desktop';
import UpdateIcon from '../../UI/CustomSvgIcons/Update';
import EventsIcon from '../../UI/CustomSvgIcons/Events';
import PlayIcon from '../../UI/CustomSvgIcons/Play';
import SceneIcon from '../../UI/CustomSvgIcons/Scene';
import HelpIcon from '../../UI/CustomSvgIcons/Help';
import SettingsIcon from '../../UI/CustomSvgIcons/Settings';
import FolderIcon from '../../UI/CustomSvgIcons/Folder';
import HammerIcon from '../../UI/CustomSvgIcons/Hammer';
import ProjectManagerIcon from '../../UI/CustomSvgIcons/ProjectManager';
const electron = optionalRequire('electron');

export type PreferencesSectionName =
  | 'general'
  | 'appearance'
  | 'layouts'
  | 'dialogs'
  | 'updates'
  | 'events-sheet'
  | 'previews'
  | 'scene-editor'
  | 'help'
  | 'other'
  | 'folders'
  | 'contributor';

export type PreferencesTabName = 'preferences' | 'shortcuts';

type ShortcutArea = $Keys<typeof commandAreas>;

type GetIconFunction = ({
  color: string,
  fontSize: 'inherit' | 'small',
}) => React.Node;

type PreferencesSection = {|
  name: PreferencesSectionName,
  label: React.Node,
  /** The label as a string, used by the search. */
  getSearchableLabel: (i18n: I18n) => string,
  getIcon: GetIconFunction,
|};

const sections: Array<PreferencesSection> = [
  {
    name: 'general',
    label: <Trans>General</Trans>,
    getSearchableLabel: i18n => i18n._(t`General`),
    getIcon: ({ color, fontSize }) => (
      <TuneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'appearance',
    label: <Trans>Appearance</Trans>,
    getSearchableLabel: i18n => i18n._(t`Appearance`),
    getIcon: ({ color, fontSize }) => (
      <BrushIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'layouts',
    label: <Trans>Layouts</Trans>,
    getSearchableLabel: i18n => i18n._(t`Layouts`),
    getIcon: ({ color, fontSize }) => (
      <GridIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'dialogs',
    label: <Trans>Dialogs</Trans>,
    getSearchableLabel: i18n => i18n._(t`Dialogs`),
    getIcon: ({ color, fontSize }) => (
      <DesktopIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'updates',
    label: <Trans>Updates</Trans>,
    getSearchableLabel: i18n => i18n._(t`Updates`),
    getIcon: ({ color, fontSize }) => (
      <UpdateIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'events-sheet',
    label: <Trans>Events Sheet</Trans>,
    getSearchableLabel: i18n => i18n._(t`Events Sheet`),
    getIcon: ({ color, fontSize }) => (
      <EventsIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'previews',
    label: <Trans>Previews</Trans>,
    getSearchableLabel: i18n => i18n._(t`Previews`),
    getIcon: ({ color, fontSize }) => (
      <PlayIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'scene-editor',
    label: <Trans>Scene editor</Trans>,
    getSearchableLabel: i18n => i18n._(t`Scene editor`),
    getIcon: ({ color, fontSize }) => (
      <SceneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'help',
    label: <Trans>Help and tutorials</Trans>,
    getSearchableLabel: i18n => i18n._(t`Help and tutorials`),
    getIcon: ({ color, fontSize }) => (
      <HelpIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'other',
    label: <Trans>Advanced</Trans>,
    getSearchableLabel: i18n => i18n._(t`Advanced`),
    getIcon: ({ color, fontSize }) => (
      <SettingsIcon fontSize={fontSize} color={color} />
    ),
  },
  ...(electron
    ? [
        {
          name: 'folders',
          label: <Trans>Folders</Trans>,
          getSearchableLabel: i18n => i18n._(t`Folders`),
          getIcon: ({ color, fontSize }) => (
            <FolderIcon fontSize={fontSize} color={color} />
          ),
        },
      ]
    : []),
  {
    name: 'contributor',
    label: <Trans>Contributor options</Trans>,
    getSearchableLabel: i18n => i18n._(t`Contributor options`),
    getIcon: ({ color, fontSize }) => (
      <HammerIcon fontSize={fontSize} color={color} />
    ),
  },
];

type ShortcutAreaDefinition = {|
  name: ShortcutArea,
  getIcon: GetIconFunction,
|};

/**
 * The areas of the commands, displayed as the sections of the shortcuts tab.
 * Their labels come from `commandAreas`.
 */
const shortcutAreas: Array<ShortcutAreaDefinition> = [
  {
    name: 'GENERAL',
    getIcon: ({ color, fontSize }) => (
      <TuneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'IDE',
    getIcon: ({ color, fontSize }) => (
      <DesktopIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'PROJECT',
    getIcon: ({ color, fontSize }) => (
      <ProjectManagerIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'SCENE',
    getIcon: ({ color, fontSize }) => (
      <SceneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'EVENTS',
    getIcon: ({ color, fontSize }) => (
      <EventsIcon fontSize={fontSize} color={color} />
    ),
  },
];

/**
 * A setting displayed as a row: a translated label (also used by the search)
 * and the control to change it.
 */
type SettingDefinition = {|
  id: string,
  label: string,
  renderControl: () => React.Node,
|};

/**
 * The content of a section: its settings, and optional content displayed
 * around them when the section is opened (not when searching).
 */
type SectionContent = {|
  settings: Array<SettingDefinition>,
  renderHeader?: () => React.Node,
  renderFooter?: () => React.Node,
|};

const sectionsColumnWidth = 220;

const styles = {
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  sectionsColumn: {
    width: sectionsColumnWidth,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingRight: 8,
  },
  sectionContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingLeft: 16,
  },
  sectionContentOnMobile: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  fullWidthControl: {
    flex: 1,
    minWidth: 0,
  },
};

type Props = {|
  i18n: I18n,
  onClose: (options: {| languageDidChange: boolean |}) => void,
  onOpenQuickCustomizationDialog: () => void,
  /** The tab displayed when the dialog opens. Defaults to the preferences. */
  initialTab?: PreferencesTabName,
  /** The preferences section displayed when the dialog opens. Defaults to the general one. */
  initialSection?: PreferencesSectionName,
|};

const PreferencesDialog = ({
  i18n,
  onClose,
  onOpenQuickCustomizationDialog,
  initialTab,
  initialSection,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const { showConfirmation } = useAlertDialog();
  const [
    currentSection,
    setCurrentSection,
  ] = React.useState<PreferencesSectionName>(initialSection || 'general');
  const [currentTab, setCurrentTab] = React.useState<PreferencesTabName>(
    initialTab || 'preferences'
  );
  const [
    currentShortcutArea,
    setCurrentShortcutArea,
  ] = React.useState<ShortcutArea>('GENERAL');
  const [searchText, setSearchText] = React.useState<string>('');
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
    showAllAskAiStandAloneForms,
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
    setShowExperimentalExtensions,
    setShowInAppTutorialDeveloperMode,
    setOpenDiagnosticReportAutomatically,
    setBlockPreviewAndExportOnDiagnosticErrors,
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
    setAutomaticallyUseCreditsForAiRequests,
    setShowCreateSectionByDefault,
    setDisableNpmScriptConfirmation,
    setUseBackgroundSerializerForSaving,
    setShowJsTypeError,
  } = React.useContext(PreferencesContext);

  const initialUse3DEditor = React.useRef<boolean>(values.use3DEditor);

  const isSearching = searchText.trim() !== '';

  const hasCustomizedShortcuts = Object.keys(values.userShortcutMap).some(
    commandName =>
      values.userShortcutMap[commandName] != null &&
      values.userShortcutMap[commandName] !==
        (defaultShortcuts[commandName] || '')
  );

  const resetAllShortcutsToDefault = async () => {
    const answer = await showConfirmation({
      title: t`Reset all shortcuts`,
      message: t`Are you sure you want to reset all shortcuts to their default values?`,
      confirmButtonLabel: t`Reset all shortcuts`,
      level: 'warning',
    });
    if (answer) resetShortcutsToDefault();
  };

  const commandPaletteShortcut = getShortcutDisplayName(
    values.userShortcutMap['OPEN_COMMAND_PALETTE'] ||
      defaultShortcuts['OPEN_COMMAND_PALETTE']
  );
  const commandPaletteSecondaryShortcut = getShortcutDisplayName(
    defaultSecondaryShortcuts['OPEN_COMMAND_PALETTE']
  );

  const renderToggle = (
    checked: boolean,
    onCheck: (newValue: boolean) => void
  ) => (
    <CompactToggleField
      label=""
      hideTooltip
      checked={checked}
      onCheck={onCheck}
    />
  );

  const renderResetLayoutButton = (editorMosaicName: string) => (
    <FlatButton
      label={<Trans>Reset</Trans>}
      onClick={() => setDefaultEditorMosaicNode(editorMosaicName, null)}
      disabled={!getDefaultEditorMosaicNode(editorMosaicName)}
    />
  );

  const renderResetButton = (onClick: () => void, disabled: boolean) => (
    <FlatButton
      label={<Trans>Reset</Trans>}
      onClick={onClick}
      disabled={disabled}
    />
  );

  const getSectionContent = (
    sectionName: PreferencesSectionName
  ): SectionContent => {
    switch (sectionName) {
      case 'general':
        return {
          settings: [
            {
              id: 'language',
              label: i18n._(t`Choose GDevelop language`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
                  <LanguageSelectField
                    onLanguageChanged={() => setLanguageDidChange(true)}
                  />
                </div>
              ),
            },
            {
              id: 'show-create-section-by-default',
              label: i18n._(
                t`Show the "Create" section by default when opening GDevelop`
              ),
              renderControl: () =>
                renderToggle(
                  values.showCreateSectionByDefault,
                  setShowCreateSectionByDefault
                ),
            },
            {
              id: 'auto-open-most-recent-project',
              label: i18n._(
                t`Automatically re-open the project edited during last session`
              ),
              renderControl: () =>
                renderToggle(
                  values.autoOpenMostRecentProject,
                  setAutoOpenMostRecentProject
                ),
            },
          ],
        };
      case 'appearance':
        return {
          settings: [
            {
              id: 'ui-theme',
              label: i18n._(t`UI Theme`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
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
                </div>
              ),
            },
            {
              id: 'code-editor-theme',
              label: i18n._(t`Code editor Theme`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
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
                </div>
              ),
            },
          ],
          renderFooter: () => (
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
          ),
        };
      case 'layouts':
        return {
          settings: [
            {
              id: 'scene-editor-layout',
              label: i18n._(t`Scene Editor layout`),
              renderControl: () => renderResetLayoutButton('scene-editor'),
            },
            {
              id: 'debugger-layout',
              label: i18n._(t`Debugger layout`),
              renderControl: () => renderResetLayoutButton('debugger'),
            },
            {
              id: 'resources-editor-layout',
              label: i18n._(t`Resource Editor layout`),
              renderControl: () => renderResetLayoutButton('resources-editor'),
            },
            {
              id: 'extension-editor-layout',
              label: i18n._(t`Extension Editor layout`),
              renderControl: () =>
                renderResetLayoutButton('events-functions-extension-editor'),
            },
          ],
          renderHeader: () => (
            <Text color="secondary" noMargin>
              <Trans>
                Reset the position and the size of the panels of an editor to
                their default values.
              </Trans>
            </Text>
          ),
        };
      case 'dialogs':
        return {
          settings: [
            {
              id: 'backdrop-click-behavior',
              label: i18n._(t`Dialog backdrop click behavior`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
                  <CompactSelectField
                    value={values.backdropClickBehavior}
                    onChange={(value: string) =>
                      setBackdropClickBehavior(value)
                    }
                  >
                    <SelectOption value="cancel" label={t`Cancel changes`} />
                    <SelectOption value="apply" label={t`Apply changes`} />
                    <SelectOption value="nothing" label={t`Do nothing`} />
                  </CompactSelectField>
                </div>
              ),
            },
            ...(electron
              ? [
                  {
                    id: 'resources-importation-behavior',
                    label: i18n._(
                      t`Importing resources outside from the project folder`
                    ),
                    renderControl: () => (
                      <div style={styles.fullWidthControl}>
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
                      </div>
                    ),
                  },
                ]
              : []),
          ],
        };
      case 'updates':
        return {
          settings: [
            {
              id: 'auto-download-updates',
              label: i18n._(t`Auto download and install updates (recommended)`),
              renderControl: () =>
                renderToggle(
                  values.autoDownloadUpdates,
                  setAutoDownloadUpdates
                ),
            },
            {
              id: 'auto-display-changelog',
              label: i18n._(
                t`Display What's New when a new version is launched (recommended)`
              ),
              renderControl: () =>
                renderToggle(
                  values.autoDisplayChangelog,
                  setAutoDisplayChangelog
                ),
            },
          ],
        };
      case 'events-sheet':
        return {
          settings: [
            {
              id: 'events-sheet-object-thumbnails',
              label: i18n._(t`Display object thumbnails in Events Sheets`),
              renderControl: () =>
                renderToggle(
                  values.eventsSheetShowObjectThumbnails,
                  setEventsSheetShowObjectThumbnails
                ),
            },
            {
              id: 'events-sheet-assignment-operators',
              label: i18n._(t`Display assignment operators in Events Sheets`),
              renderControl: () =>
                renderToggle(
                  values.eventsSheetUseAssignmentOperators,
                  setEventsSheetUseAssignmentOperators
                ),
            },
            {
              id: 'events-sheet-indent-scale',
              label: i18n._(t`Indent Scale in Events Sheet`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
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
                </div>
              ),
            },
            {
              id: 'events-sheet-escape-key-behavior',
              label: i18n._(
                t`Escape key behavior when editing an parameter inline`
              ),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
                  <CompactSelectField
                    value={values.eventsSheetCancelInlineParameter}
                    onChange={(value: string) =>
                      setEventsSheetCancelInlineParameter(value)
                    }
                  >
                    <SelectOption value="cancel" label={t`Cancel changes`} />
                    <SelectOption value="apply" label={t`Apply changes`} />
                  </CompactSelectField>
                </div>
              ),
            },
            {
              id: 'deprecated-instruction-warning',
              label: i18n._(t`Deprecated actions and conditions warning`),
              renderControl: () => (
                <div style={styles.fullWidthControl}>
                  <CompactSelectField
                    value={values.showDeprecatedInstructionWarning}
                    onChange={(value: string) => {
                      if (
                        value === 'no' ||
                        value === 'icon' ||
                        value === 'icon-and-deprecated-warning-text'
                      ) {
                        setShowDeprecatedInstructionWarning(value);
                      }
                    }}
                  >
                    <SelectOption value="no" label={t`No warning`} />
                    <SelectOption value="icon" label={t`Icon only`} />
                    <SelectOption
                      value="icon-and-deprecated-warning-text"
                      label={t`Icon and [DEPRECATED] text`}
                    />
                  </CompactSelectField>
                </div>
              ),
            },
            {
              id: 'show-js-type-error',
              label: i18n._(
                t`Show type errors in JavaScript events (needs a restart)`
              ),
              renderControl: () =>
                renderToggle(values.showJsTypeError, setShowJsTypeError),
            },
          ],
        };
      case 'previews':
        return {
          settings: [
            {
              id: 'autosave-on-preview',
              label: i18n._(t`Auto-save project on preview`),
              renderControl: () =>
                renderToggle(values.autosaveOnPreview, setAutosaveOnPreview),
            },
            {
              id: 'fetch-player-token-for-preview',
              label: i18n._(t`Automatically log in as a player in preview`),
              renderControl: () =>
                renderToggle(
                  values.fetchPlayerTokenForPreviewAutomatically,
                  setFetchPlayerTokenForPreviewAutomatically
                ),
            },
            {
              id: 'open-diagnostic-report-automatically',
              label: i18n._(
                t`Automatically open the diagnostic report at preview`
              ),
              renderControl: () =>
                renderToggle(
                  values.openDiagnosticReportAutomatically,
                  setOpenDiagnosticReportAutomatically
                ),
            },
            {
              id: 'block-preview-on-diagnostic-errors',
              label: i18n._(
                t`Block preview and export when diagnostic errors are found`
              ),
              renderControl: () =>
                renderToggle(
                  values.blockPreviewAndExportOnDiagnosticErrors,
                  setBlockPreviewAndExportOnDiagnosticErrors
                ),
            },
            {
              id: 'preview-crash-reports',
              label: i18n._(t`Send crash reports during previews to GDevelop`),
              renderControl: () =>
                renderToggle(
                  values.previewCrashReportUploadLevel !== 'none',
                  check =>
                    setPreviewCrashReportUploadLevel(
                      check ? 'exclude-javascript-code-events' : 'none'
                    )
                ),
            },
            {
              id: 'take-screenshot-on-preview',
              label: i18n._(
                t`Automatically take a screenshot in game previews`
              ),
              renderControl: () =>
                renderToggle(
                  values.takeScreenshotOnPreview,
                  setTakeScreenshotOnPreview
                ),
            },
            ...(electron
              ? [
                  {
                    id: 'hide-menu-bar-in-preview',
                    label: i18n._(t`Hide the menu bar in the preview window`),
                    renderControl: () =>
                      renderToggle(
                        values.isMenuBarHiddenInPreview,
                        setIsMenuBarHiddenInPreview
                      ),
                  },
                  {
                    id: 'always-on-top-in-preview',
                    label: i18n._(
                      t`Always display the preview window on top of the editor`
                    ),
                    renderControl: () =>
                      renderToggle(
                        values.isAlwaysOnTopInPreview,
                        setIsAlwaysOnTopInPreview
                      ),
                  },
                  {
                    id: 'use-shortcut-to-close-preview-window',
                    label: i18n._(
                      t`Enable "Close project" shortcut (${adaptAcceleratorString(
                        getElectronAccelerator(
                          values.userShortcutMap['CLOSE_PROJECT'] ||
                            defaultShortcuts['CLOSE_PROJECT']
                        )
                      )}) to close preview window`
                    ),
                    renderControl: () =>
                      renderToggle(
                        values.useShortcutToClosePreviewWindow,
                        setUseShortcutToClosePreviewWindow
                      ),
                  },
                ]
              : []),
          ],
        };
      case 'scene-editor':
        return {
          settings: [
            {
              id: 'show-basic-profiling-counters',
              label: i18n._(t`Display profiling information in scene editor`),
              renderControl: () =>
                renderToggle(
                  values.showBasicProfilingCounters,
                  setShowBasicProfilingCounters
                ),
            },
            {
              id: 'use-3d-editor',
              label: i18n._(t`Show objects in 3D in the scene editor`),
              renderControl: () =>
                renderToggle(values.use3DEditor, setUse3DEditor),
            },
          ],
          renderFooter: () =>
            initialUse3DEditor.current !== values.use3DEditor ? (
              <AlertMessage kind="info">
                <Trans>
                  For the 3D change to take effect, close and reopen all
                  currently opened scenes.
                </Trans>
              </AlertMessage>
            ) : null,
        };
      case 'help':
        return {
          settings: [
            {
              id: 'hidden-alert-messages',
              label: i18n._(t`Hidden embedded explanations`),
              renderControl: () =>
                renderResetButton(
                  showAllAlertMessages,
                  !Object.keys(values.hiddenAlertMessages).length
                ),
            },
            {
              id: 'hidden-tutorial-hints',
              label: i18n._(t`Hidden embedded tutorials`),
              renderControl: () =>
                renderResetButton(
                  showAllTutorialHints,
                  !Object.keys(values.hiddenTutorialHints).length
                ),
            },
            {
              id: 'hidden-announcements',
              label: i18n._(t`Hidden announcements`),
              renderControl: () =>
                renderResetButton(
                  showAllAnnouncements,
                  !Object.keys(values.hiddenAnnouncements).length
                ),
            },
            {
              id: 'hidden-ask-ai-forms',
              label: i18n._(t`Hidden Ask AI text inputs`),
              renderControl: () =>
                renderResetButton(
                  showAllAskAiStandAloneForms,
                  !Object.keys(values.hiddenAskAiStandAloneForms).length
                ),
            },
          ],
        };
      case 'other':
        return {
          settings: [
            {
              id: 'show-ask-ai-button-in-title-bar',
              label: i18n._(t`Show "Ask AI" button in the title bar`),
              renderControl: () =>
                renderToggle(
                  values.showAiAskButtonInTitleBar,
                  setShowAiAskButtonInTitleBar
                ),
            },
            {
              id: 'automatically-use-credits-for-ai-requests',
              label: i18n._(
                t`Automatically use GDevelop credits for AI requests when run out of AI credits`
              ),
              renderControl: () =>
                renderToggle(
                  values.automaticallyUseCreditsForAiRequests,
                  setAutomaticallyUseCreditsForAiRequests
                ),
            },
            {
              id: 'display-save-reminder',
              label: i18n._(
                t`Display save reminder after significant changes in project`
              ),
              renderControl: () =>
                renderToggle(values.displaySaveReminder.activated, check =>
                  setDisplaySaveReminder({ activated: check })
                ),
            },
            {
              id: 'show-experimental-extensions',
              label: i18n._(
                t`Show experimental extensions in the list of extensions`
              ),
              renderControl: () =>
                renderToggle(
                  values.showExperimentalExtensions,
                  setShowExperimentalExtensions
                ),
            },
            {
              id: 'use-background-serializer-for-saving',
              label: i18n._(
                t`Use experimental background serializer for saving projects`
              ),
              renderControl: () =>
                renderToggle(
                  values.useBackgroundSerializerForSaving,
                  setUseBackgroundSerializerForSaving
                ),
            },
            ...(electron
              ? [
                  {
                    id: 'watch-project-folder-files',
                    label: i18n._(
                      t`Watch the project folder for file changes in order to refresh the resources used in the editor (images, 3D models, fonts, etc.)`
                    ),
                    renderControl: () =>
                      renderToggle(
                        values.watchProjectFolderFilesForLocalProjects,
                        check =>
                          setWatchProjectFolderFilesForLocalProjects(check)
                      ),
                  },
                ]
              : []),
            ...(electron && values.disableNpmScriptConfirmation
              ? [
                  {
                    id: 'npm-script-confirmation',
                    label: i18n._(t`npm script security warning`),
                    renderControl: () => (
                      <FlatButton
                        label={<Trans>Re-enable</Trans>}
                        onClick={() => setDisableNpmScriptConfirmation(false)}
                      />
                    ),
                  },
                ]
              : []),
          ],
        };
      case 'folders':
        return {
          settings: [
            {
              id: 'new-projects-default-folder',
              label: i18n._(t`Default folder for new projects`),
              renderControl: () => (
                <LocalFolderPicker
                  fullWidth
                  value={values.newProjectsDefaultFolder}
                  onChange={setNewProjectsDefaultFolder}
                  type="default-workspace"
                />
              ),
            },
          ],
        };
      case 'contributor':
        return {
          settings: [
            {
              id: 'show-in-app-tutorial-developer-mode',
              label: i18n._(
                t`Show button to load guided lesson from file and test it`
              ),
              renderControl: () =>
                renderToggle(
                  values.showInAppTutorialDeveloperMode,
                  setShowInAppTutorialDeveloperMode
                ),
            },
            ...(Window.isDev()
              ? [
                  {
                    id: 'use-gdjs-development-watcher',
                    label: i18n._(
                      t`Watch changes in game engine (GDJS) sources and auto import them (dev only)`
                    ),
                    renderControl: () =>
                      renderToggle(
                        values.useGDJSDevelopmentWatcher,
                        setUseGDJSDevelopmentWatcher
                      ),
                  },
                  {
                    id: 'quick-customization',
                    label: i18n._(t`Quick customization (dev only)`),
                    renderControl: () => (
                      <FlatButton
                        onClick={onOpenQuickCustomizationDialog}
                        label={<Trans>Open</Trans>}
                      />
                    ),
                  },
                ]
              : []),
          ],
        };
      default:
        return { settings: [] };
    }
  };

  const renderSettingsRows = (settings: Array<SettingDefinition>) => (
    <Column noMargin>
      {settings.map(setting => (
        <SettingsRow
          key={setting.id}
          id={`preferences-setting-${setting.id}`}
          label={setting.label}
        >
          {setting.renderControl()}
        </SettingsRow>
      ))}
    </Column>
  );

  const renderCurrentSection = () => {
    if (currentTab === 'shortcuts') {
      return (
        <ColumnStackLayout noMargin expand>
          <Text size="section-title" noMargin>
            {i18n._(commandAreas[currentShortcutArea])}
          </Text>
          <DismissableAlertMessage
            kind="info"
            identifier="command-palette-shortcut"
          >
            <Trans>
              You can open the command palette by pressing{' '}
              {commandPaletteShortcut} or {commandPaletteSecondaryShortcut}.
            </Trans>
          </DismissableAlertMessage>
          <ShortcutsList
            i18n={i18n}
            userShortcutMap={values.userShortcutMap}
            onEdit={setShortcutForCommand}
            areaName={currentShortcutArea}
          />
        </ColumnStackLayout>
      );
    }

    const section =
      sections.find(section => section.name === currentSection) || sections[0];
    const { settings, renderHeader, renderFooter } = getSectionContent(
      section.name
    );

    return (
      <ColumnStackLayout noMargin expand>
        <Text size="section-title" noMargin>
          {section.label}
        </Text>
        {renderHeader && renderHeader()}
        {settings.length > 0 && renderSettingsRows(settings)}
        {renderFooter && renderFooter()}
      </ColumnStackLayout>
    );
  };

  /**
   * Display the settings of all the sections matching the search, grouped by
   * section. A section whose name matches shows all its settings.
   */
  const renderSearchResults = () => {
    const normalizedSearchText = normalizeForSearch(searchText);

    const hasMatchingShortcuts =
      getShortcutSections(i18n, values.userShortcutMap, searchText).length > 0;
    const matchingSections = sections
      .map(section => {
        const { settings } = getSectionContent(section.name);
        const isSectionNameMatching = normalizeForSearch(
          section.getSearchableLabel(i18n)
        ).includes(normalizedSearchText);
        const matchingSettings = isSectionNameMatching
          ? settings
          : settings.filter(setting =>
              normalizeForSearch(setting.label).includes(normalizedSearchText)
            );
        return matchingSettings.length > 0
          ? { section, settings: matchingSettings }
          : null;
      })
      .filter(Boolean);

    if (matchingSections.length === 0 && !hasMatchingShortcuts) {
      return (
        <EmptyMessage>
          <Trans>No setting matches your search.</Trans>
        </EmptyMessage>
      );
    }

    return (
      <ColumnStackLayout noMargin expand>
        {matchingSections.map(({ section, settings }) => (
          <Column noMargin key={section.name}>
            <Text size="section-title">{section.label}</Text>
            {renderSettingsRows(settings)}
          </Column>
        ))}
        {hasMatchingShortcuts && (
          <Column noMargin>
            <Text size="section-title">
              <Trans>Keyboard Shortcuts</Trans>
            </Text>
            <ShortcutsList
              i18n={i18n}
              userShortcutMap={values.userShortcutMap}
              onEdit={setShortcutForCommand}
              searchText={searchText}
            />
          </Column>
        )}
      </ColumnStackLayout>
    );
  };

  const onSelectTab = (tabName: PreferencesTabName) => {
    setSearchText('');
    setCurrentTab(tabName);
  };

  const onSelectSection = (sectionName: PreferencesSectionName) => {
    setSearchText('');
    setCurrentSection(sectionName);
  };

  const onSelectShortcutArea = (areaName: ShortcutArea) => {
    setSearchText('');
    setCurrentShortcutArea(areaName);
  };

  // The entries of the sections list, on the left of the content: the
  // preferences sections or the shortcut areas, depending on the current tab.
  const sectionListEntries =
    currentTab === 'preferences'
      ? sections.map(section => ({
          key: section.name,
          label: section.label,
          getIcon: section.getIcon,
          isActive: !isSearching && currentSection === section.name,
          onSelect: () => onSelectSection(section.name),
        }))
      : shortcutAreas.map(area => ({
          key: area.name,
          label: i18n._(commandAreas[area.name]),
          getIcon: area.getIcon,
          isActive: !isSearching && currentShortcutArea === area.name,
          onSelect: () => onSelectShortcutArea(area.name),
        }));
  const activeSectionListEntry = sectionListEntries.find(
    entry => entry.isActive
  );
  const onSelectSectionListEntry = (key: string) => {
    const entry = sectionListEntries.find(entry => entry.key === key);
    if (entry) entry.onSelect();
  };

  return (
    <Dialog
      title={<Trans>Preferences</Trans>}
      id="preferences-dialog"
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={() => onClose({ languageDidChange })}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath="/preferences" />,
        !isMobile ? (
          <FlatButton
            key="translate"
            label={<Trans>Help translate GDevelop</Trans>}
            onClick={() =>
              Window.openExternalURL('https://crowdin.com/project/gdevelop')
            }
          />
        ) : null,
        currentTab === 'shortcuts' && !isSearching ? (
          <FlatButton
            key="reset-all-shortcuts"
            label={<Trans>Reset all shortcuts</Trans>}
            onClick={resetAllShortcutsToDefault}
            disabled={!hasCustomizedShortcuts}
          />
        ) : null,
      ]}
      onRequestClose={() => onClose({ languageDidChange })}
      open
      aspectRatio="16:9"
      flexColumnBody
      actionsFullWidthOnMobile
      fixedContent={
        <ColumnStackLayout noMargin>
          <Tabs
            value={currentTab}
            onChange={onSelectTab}
            options={[
              { value: 'preferences', label: <Trans>Preferences</Trans> },
              { value: 'shortcuts', label: <Trans>Keyboard Shortcuts</Trans> },
            ]}
          />
          {isMobile && (
            // On mobile, the sections column is replaced by scrollable tabs.
            <Tabs
              value={
                activeSectionListEntry ? activeSectionListEntry.key : undefined
              }
              onChange={onSelectSectionListEntry}
              options={sectionListEntries.map(entry => ({
                value: entry.key,
                label: entry.label,
              }))}
              variant="scrollable"
            />
          )}
          <SearchBar
            id="preferences-search-bar"
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={setSearchText}
            placeholder={t`Search a setting, a command or a shortcut`}
            autoFocus="desktop"
          />
        </ColumnStackLayout>
      }
    >
      <div style={styles.body}>
        {!isMobile && (
          <>
            <div style={styles.sectionsColumn}>
              <ColumnStackLayout noMargin>
                {sectionListEntries.map(entry => (
                  <VerticalTabButton
                    key={entry.key}
                    id={`preferences-section-${entry.key}`}
                    label={entry.label}
                    getIcon={entry.getIcon}
                    isActive={entry.isActive}
                    onClick={entry.onSelect}
                  />
                ))}
              </ColumnStackLayout>
            </div>
            <Divider orientation="vertical" flexItem />
          </>
        )}
        <div
          style={
            isMobile ? styles.sectionContentOnMobile : styles.sectionContent
          }
        >
          {isSearching ? (
            <Line noMargin expand>
              {renderSearchResults()}
            </Line>
          ) : (
            renderCurrentSection()
          )}
        </div>
      </div>
    </Dialog>
  );
};

const PreferencesDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>Preferences</Trans>}
    scope="preferences"
    onClose={() => props.onClose({ languageDidChange: false })}
  >
    <PreferencesDialog {...props} />
  </ErrorBoundary>
);

export default PreferencesDialogWithErrorBoundary;
