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
import { Column, Line, marginsSize } from '../../UI/Grid';
import { homepageDesktopMenuBarWidth } from '../EditorContainers/HomePage/HomePageMenuBar';
import { themes } from '../../UI/Theme/ThemeRegistry';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';
import PreferencesContext, {
  type EditorMosaicName,
} from './PreferencesContext';
import Text from '../../UI/Text';
import EmptyMessage from '../../UI/EmptyMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import { Tabs } from '../../UI/Tabs';
import SettingsRow, { useSettingsRowControlIds } from '../../UI/SettingsRow';
import VerticalTabButton from '../../UI/VerticalTabButton';
import SearchBar from '../../UI/SearchBar';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import ShortcutsList, {
  getShortcutSections,
  normalizeForSearch,
} from '../../KeyboardShortcuts/ShortcutsList';
import { LanguageSelectField } from './LanguageSelector';
import Link from '../../UI/Link';
import {
  commandAreas,
  getDisplayedCommandAreaNames,
  type CommandArea,
} from '../../CommandPalette/CommandsList';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
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
import SparkleIcon from '../../UI/CustomSvgIcons/Sparkle';
import RobotFaceIcon from '../../UI/CustomSvgIcons/RobotFace';
import ExtensionIcon from '../../UI/CustomSvgIcons/Extension';
import DebugIcon from '../../UI/CustomSvgIcons/Debug';
import ProjectManagerIcon from '../../UI/CustomSvgIcons/ProjectManager';
import Object3dIcon from '../../UI/CustomSvgIcons/Object3d';
import Grid2dIcon from '../../UI/CustomSvgIcons/Grid2d';
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
  | 'experimental'
  | 'contributor'
  | 'ask-ai'
  | 'extensions'
  | 'developer';

export type PreferencesTabName = 'preferences' | 'shortcuts';

type GetIconFunction = ({
  color: string,
  fontSize: 'inherit' | 'small',
}) => React.Node;

type PreferencesSection = {|
  name: PreferencesSectionName,
  /** The label, displayed with `i18n._` and used by the search. */
  label: MessageDescriptor,
  getIcon: GetIconFunction,
|};

const sections: Array<PreferencesSection> = [
  {
    name: 'general',
    label: t`General`,
    getIcon: ({ color, fontSize }) => (
      <TuneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'updates',
    label: t`Updates`,
    getIcon: ({ color, fontSize }) => (
      <UpdateIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'help',
    label: t`Help and tutorials`,
    getIcon: ({ color, fontSize }) => (
      <HelpIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'appearance',
    label: t`Appearance`,
    getIcon: ({ color, fontSize }) => (
      <BrushIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'layouts',
    label: t`Layouts`,
    getIcon: ({ color, fontSize }) => (
      <GridIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'dialogs',
    label: t`Dialogs`,
    getIcon: ({ color, fontSize }) => (
      <DesktopIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'events-sheet',
    label: t`Events Sheet`,
    getIcon: ({ color, fontSize }) => (
      <EventsIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'previews',
    label: t`Previews & Saves`,
    getIcon: ({ color, fontSize }) => (
      <PlayIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'scene-editor',
    label: t`Scene editor`,
    getIcon: ({ color, fontSize }) => (
      <SceneIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'ask-ai',
    label: t`Ask AI`,
    getIcon: ({ color, fontSize }) => (
      <RobotFaceIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'extensions',
    label: t`Extensions`,
    getIcon: ({ color, fontSize }) => (
      <ExtensionIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'folders',
    label: t`Folders`,
    getIcon: ({ color, fontSize }) => (
      <FolderIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'contributor',
    label: t`Contributor options`,
    getIcon: ({ color, fontSize }) => (
      <HammerIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'experimental',
    label: t`Experimental`,
    getIcon: ({ color, fontSize }) => (
      <SparkleIcon fontSize={fontSize} color={color} />
    ),
  },
  {
    name: 'other',
    label: t`Advanced`,
    getIcon: ({ color, fontSize }) => (
      <SettingsIcon fontSize={fontSize} color={color} />
    ),
  },
  // Settings for the developers of GDevelop, in development mode only.
  ...(Window.isDev()
    ? [
        {
          name: 'developer',
          label: t`Developer`,
          getIcon: ({ color, fontSize }) => (
            <DebugIcon fontSize={fontSize} color={color} />
          ),
        },
      ]
    : []),
];

type ShortcutAreaDefinition = {|
  name: CommandArea,
  getIcon: GetIconFunction,
|};

/**
 * The icons of the areas of the commands. The areas themselves (and their
 * labels and order) come from `commandAreas`, displayed as the sections of the
 * shortcuts tab.
 */
const shortcutAreaIcons: { [CommandArea]: GetIconFunction } = {
  GENERAL: ({ color, fontSize }) => (
    <TuneIcon fontSize={fontSize} color={color} />
  ),
  PROJECT: ({ color, fontSize }) => (
    <ProjectManagerIcon fontSize={fontSize} color={color} />
  ),
  SCENE: ({ color, fontSize }) => (
    <SceneIcon fontSize={fontSize} color={color} />
  ),
  SCENE_3D: ({ color, fontSize }) => (
    <Object3dIcon fontSize={fontSize} color={color} />
  ),
  TILEMAP: ({ color, fontSize }) => (
    <Grid2dIcon fontSize={fontSize} color={color} />
  ),
  EVENTS: ({ color, fontSize }) => (
    <EventsIcon fontSize={fontSize} color={color} />
  ),
  DEVELOPER: ({ color, fontSize }) => (
    <DebugIcon fontSize={fontSize} color={color} />
  ),
};

const shortcutAreas: Array<ShortcutAreaDefinition> = getDisplayedCommandAreaNames().map(
  areaName => ({ name: areaName, getIcon: shortcutAreaIcons[areaName] })
);

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

const getSectionElementId = (sectionName: string): string =>
  `preferences-section-content-${sectionName}`;
const getShortcutAreaElementId = (areaName: string): string =>
  `preferences-shortcuts-area-${areaName}`;

// When scrolling to a section, its title is placed this number of pixels
// below the top of the content, so that it does not stick to the edge.
const sectionScrollOffset = 16;
// A section is considered displayed at the top of the content (and highlighted
// in the sections list) when its top is at most this number of pixels below the
// top of the content. Larger than the scroll offset, so that a section that has
// just been scrolled to is the highlighted one.
const scrollSpyTolerance = sectionScrollOffset + 8;

const styles = {
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  // A section with its title, separated from the previous one.
  section: {
    marginTop: 10,
  },
  sectionsColumn: {
    width: homepageDesktopMenuBarWidth,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingRight: marginsSize,
  },
  sectionContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingLeft: marginsSize * 2,
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
  /**
   * Display the settings of the desktop version (folders, Electron specific
   * options...). Defaults to whether the dialog runs in the desktop version:
   * only useful to force it, for example in Storybook.
   */
  isDesktop?: boolean,
|};

/**
 * A toggle alone, labelled by the settings row containing it: clicking on the
 * label of the row toggles it, and screen readers read the label.
 */
const SettingToggle = ({
  checked,
  onCheck,
}: {|
  checked: boolean,
  onCheck: (newValue: boolean) => void,
|}) => {
  const controlIds = useSettingsRowControlIds();
  return (
    <CompactToggleField
      label=""
      hideTooltip
      inputId={controlIds ? controlIds.controlId : undefined}
      ariaLabelledBy={controlIds ? controlIds.labelId : undefined}
      checked={checked}
      onCheck={onCheck}
    />
  );
};

const PreferencesDialog = ({
  i18n,
  onClose,
  onOpenQuickCustomizationDialog,
  initialTab,
  initialSection,
  isDesktop = !!electron,
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
  ] = React.useState<CommandArea>('GENERAL');
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

  // All the sections of a tab are displayed one after another: the sections
  // list on the left scrolls to the chosen section, and highlights the section
  // displayed at the top of the content while scrolling.
  const sectionContentRef = React.useRef<?HTMLDivElement>(null);
  // The element to scroll to once rendered: an element id, or the empty
  // string to scroll to the top of the content.
  const pendingScrollElementIdRef = React.useRef<?string>(
    initialSection && (initialTab || 'preferences') === 'preferences'
      ? getSectionElementId(initialSection)
      : null
  );

  // A scroll made by the dialog itself (to the section chosen in the list)
  // must not change the highlighted entry: near the bottom of the content, the
  // chosen section can't reach the top, and the scroll spy would highlight the
  // last entry instead of the chosen one.
  const isProgrammaticScrollRef = React.useRef<boolean>(false);
  const setProgrammaticScrollTop = (
    container: HTMLDivElement,
    scrollTop: number
  ) => {
    if (container.scrollTop === scrollTop) return;
    isProgrammaticScrollRef.current = true;
    container.scrollTop = scrollTop;
    // In case no scroll event is fired (already at the bottom, for example).
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 100);
  };

  const scrollToElement = (elementId: string) => {
    const container = sectionContentRef.current;
    const element = document.getElementById(elementId);
    if (!container || !element) return;

    setProgrammaticScrollTop(
      container,
      container.scrollTop +
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        sectionScrollOffset
    );
  };

  React.useEffect(() => {
    // Scroll once the content to scroll to is rendered (for example after
    // the search has been cleared or the tab has been changed).
    const pendingScrollElementId = pendingScrollElementIdRef.current;
    if (pendingScrollElementId == null) return;
    pendingScrollElementIdRef.current = null;

    if (pendingScrollElementId === '') {
      if (sectionContentRef.current)
        setProgrammaticScrollTop(sectionContentRef.current, 0);
    } else {
      scrollToElement(pendingScrollElementId);
    }
  });

  /**
   * Find the entry (section or shortcut area) displayed at the top of the
   * content, or the last one if the content is scrolled to the bottom.
   */
  const getEntryKeyAtTop = (
    entryKeys: Array<string>,
    getElementId: string => string
  ): ?string => {
    const container = sectionContentRef.current;
    if (!container || entryKeys.length === 0) return null;

    const isScrolledToBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 1;
    if (isScrolledToBottom) return entryKeys[entryKeys.length - 1];

    const containerTop = container.getBoundingClientRect().top;
    let entryKeyAtTop = entryKeys[0];
    entryKeys.forEach(entryKey => {
      const element = document.getElementById(getElementId(entryKey));
      if (
        element &&
        element.getBoundingClientRect().top - containerTop <= scrollSpyTolerance
      ) {
        entryKeyAtTop = entryKey;
      }
    });
    return entryKeyAtTop;
  };

  const onContentScroll = () => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }
    if (isSearching) return;

    if (currentTab === 'preferences') {
      const sectionNameAtTop = getEntryKeyAtTop(
        visibleSections.map(section => section.name),
        getSectionElementId
      );
      if (sectionNameAtTop && sectionNameAtTop !== currentSection) {
        setCurrentSection((sectionNameAtTop: any));
      }
    } else {
      const areaNameAtTop = getEntryKeyAtTop(
        shortcutAreas.map(area => area.name),
        getShortcutAreaElementId
      );
      if (areaNameAtTop && areaNameAtTop !== currentShortcutArea) {
        setCurrentShortcutArea((areaNameAtTop: any));
      }
    }
  };

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
  ) => <SettingToggle checked={checked} onCheck={onCheck} />;

  const renderResetLayoutButton = (editorMosaicName: EditorMosaicName) => (
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
            ...(isDesktop
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
                t`Take a screenshot in previews for the game dashboard and gd.games`
              ),
              renderControl: () =>
                renderToggle(
                  values.takeScreenshotOnPreview,
                  setTakeScreenshotOnPreview
                ),
            },
            ...(isDesktop
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
          ],
        };
      case 'ask-ai':
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
            ...(isDesktop
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
            ...(isDesktop && values.disableNpmScriptConfirmation
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
        // Only in the desktop version: the section is hidden otherwise.
        if (!isDesktop) return { settings: [] };
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
      case 'extensions':
        return {
          settings: [
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
          ],
        };
      case 'experimental':
        // No experimental setting for now: the section is hidden while empty.
        return { settings: [] };
      case 'developer':
        return {
          settings: [
            {
              id: 'use-gdjs-development-watcher',
              label: i18n._(
                t`Watch changes in game engine (GDJS) sources and auto import them`
              ),
              renderControl: () =>
                renderToggle(
                  values.useGDJSDevelopmentWatcher,
                  setUseGDJSDevelopmentWatcher
                ),
            },
            {
              id: 'quick-customization',
              label: i18n._(t`Quick customization`),
              renderControl: () => (
                <FlatButton
                  onClick={onOpenQuickCustomizationDialog}
                  label={<Trans>Open</Trans>}
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
          ],
        };
      default:
        return { settings: [] };
    }
  };

  /**
   * The sections having something to display. A section without any setting
   * (for example when its settings are only available on some platforms) is
   * hidden from the sections list and the content.
   */
  const visibleSections: Array<PreferencesSection> = sections.filter(
    section => {
      const { settings, renderHeader, renderFooter } = getSectionContent(
        section.name
      );
      return settings.length > 0 || !!renderHeader || !!renderFooter;
    }
  );
  // The current section can be hidden (an initial section without any setting
  // on this platform): the first visible section is highlighted instead.
  const highlightedSectionName = visibleSections.some(
    section => section.name === currentSection
  )
    ? currentSection
    : visibleSections[0].name;

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

  const renderSection = (section: PreferencesSection) => {
    const { settings, renderHeader, renderFooter } = getSectionContent(
      section.name
    );

    return (
      <div
        key={section.name}
        id={getSectionElementId(section.name)}
        style={styles.section}
      >
        <ColumnStackLayout noMargin expand>
          <Text size="block-title" noMargin>
            {i18n._(section.label)}
          </Text>
          {renderHeader && renderHeader()}
          {settings.length > 0 && renderSettingsRows(settings)}
          {renderFooter && renderFooter()}
        </ColumnStackLayout>
      </div>
    );
  };

  /**
   * Display all the sections of the current tab, one after another. The
   * sections list on the left (not displayed on mobile) scrolls to a section.
   */
  const renderCurrentTabContent = () => {
    if (currentTab === 'shortcuts') {
      return (
        <ColumnStackLayout noMargin expand>
          <DismissableAlertMessage
            kind="info"
            identifier="command-palette-shortcut"
          >
            <Trans>
              The command palette is a search bar listing all the commands of
              the editor: type the name of a command to run it, without having
              to remember its shortcut. Open it by pressing{' '}
              {commandPaletteShortcut} or {commandPaletteSecondaryShortcut}.
            </Trans>
          </DismissableAlertMessage>
          <ShortcutsList
            i18n={i18n}
            userShortcutMap={values.userShortcutMap}
            onEdit={setShortcutForCommand}
            getSectionElementId={getShortcutAreaElementId}
          />
        </ColumnStackLayout>
      );
    }

    return (
      <ColumnStackLayout noMargin expand>
        {visibleSections.map(renderSection)}
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
        const { settings, renderHeader, renderFooter } = getSectionContent(
          section.name
        );
        const isSectionNameMatching = normalizeForSearch(
          i18n._(section.label)
        ).includes(normalizedSearchText);
        const matchingSettings = isSectionNameMatching
          ? settings
          : settings.filter(setting =>
              normalizeForSearch(setting.label).includes(normalizedSearchText)
            );
        return matchingSettings.length > 0
          ? { section, settings: matchingSettings, renderHeader, renderFooter }
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
        {matchingSections.map(
          ({ section, settings, renderHeader, renderFooter }) => (
            <Column noMargin key={section.name}>
              <Text size="block-title">{i18n._(section.label)}</Text>
              {renderHeader && renderHeader()}
              {renderSettingsRows(settings)}
              {renderFooter && renderFooter()}
            </Column>
          )
        )}
        {hasMatchingShortcuts && (
          <Column noMargin>
            <Text size="block-title">
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
    // Start from the top of the new tab.
    if (tabName === 'preferences') setCurrentSection(visibleSections[0].name);
    else setCurrentShortcutArea(shortcutAreas[0].name);
    pendingScrollElementIdRef.current = '';
  };

  const onSelectSection = (sectionName: PreferencesSectionName) => {
    setSearchText('');
    setCurrentSection(sectionName);
    pendingScrollElementIdRef.current = getSectionElementId(sectionName);
  };

  const onSelectShortcutArea = (areaName: CommandArea) => {
    setSearchText('');
    setCurrentShortcutArea(areaName);
    pendingScrollElementIdRef.current = getShortcutAreaElementId(areaName);
  };

  // The entries of the sections list, on the left of the content: the
  // preferences sections or the shortcut areas, depending on the current tab.
  const sectionListEntries =
    currentTab === 'preferences'
      ? visibleSections.map(section => ({
          key: section.name,
          label: i18n._(section.label),
          getIcon: section.getIcon,
          isActive: !isSearching && highlightedSectionName === section.name,
          onSelect: () => onSelectSection(section.name),
        }))
      : shortcutAreas.map(area => ({
          key: area.name,
          label: i18n._(commandAreas[area.name]),
          getIcon: area.getIcon,
          isActive: !isSearching && currentShortcutArea === area.name,
          onSelect: () => onSelectShortcutArea(area.name),
        }));

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
        <HelpButton
          key="help"
          helpPagePath="/preferences"
          label={
            currentTab === 'shortcuts' ? (
              <Trans>Help for keyboard shortcuts</Trans>
            ) : (
              <Trans>Help for preferences</Trans>
            )
          }
        />,
        currentTab === 'preferences' && !isMobile ? (
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
      fullHeight
      flexColumnBody
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
          ref={sectionContentRef}
          onScroll={onContentScroll}
          style={
            isMobile ? styles.sectionContentOnMobile : styles.sectionContent
          }
        >
          {isSearching ? (
            <Line noMargin expand>
              {renderSearchResults()}
            </Line>
          ) : (
            renderCurrentTabContent()
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
