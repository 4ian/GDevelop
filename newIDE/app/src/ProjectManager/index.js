// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { List, ListItem } from '../UI/List';
import SearchBar, { type SearchBarInterface } from '../UI/SearchBar';
import { AddListItem } from '../UI/ListCommonItem';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import ProjectPropertiesDialog from './ProjectPropertiesDialog';
import {
  enumerateLayouts,
  enumerateExternalEvents,
  enumerateExternalLayouts,
  enumerateEventsFunctionsExtensions,
  filterProjectItemsList,
} from './EnumerateProjectItems';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import ExtensionsSearchDialog from '../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import Flag from '@material-ui/icons/Flag';
import SettingsApplications from '@material-ui/icons/SettingsApplications';
import PhotoLibrary from '@material-ui/icons/PhotoLibrary';
import VariableTree from '../UI/CustomSvgIcons/VariableTree';
import ArtTrack from '@material-ui/icons/ArtTrack';
import ScenePropertiesDialog from '../SceneEditor/ScenePropertiesDialog';
import SceneVariablesDialog from '../SceneEditor/SceneVariablesDialog';
import { isExtensionNameTaken } from './EventFunctionExtensionNameVerifier';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import ProjectManagerCommands from './ProjectManagerCommands';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import InstalledExtensionDetails from './InstalledExtensionDetails';
import {
  Item,
  ProjectStructureItem,
  EventFunctionExtensionItem,
} from './ProjectManagerItems';
import Tooltip from '@material-ui/core/Tooltip';
import SceneIcon from '../UI/CustomSvgIcons/Scene';
import ExternalLayoutIcon from '../UI/CustomSvgIcons/ExternalLayout';
import ExternalEventsIcon from '../UI/CustomSvgIcons/ExternalEvents';
import { type ShortcutMap } from '../KeyboardShortcuts/DefaultShortcuts';
import { ShortcutsReminder } from './ShortcutsReminder';
import Paper from '../UI/Paper';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';

const LAYOUT_CLIPBOARD_KIND = 'Layout';
const EXTERNAL_LAYOUT_CLIPBOARD_KIND = 'External layout';
const EXTERNAL_EVENTS_CLIPBOARD_KIND = 'External events';
const EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND = 'Events Functions Extension';

const DragSourceAndDropTargetForScenes = makeDragSourceAndDropTarget(
  'project-manager-items-scenes'
);
const DragSourceAndDropTargetForExternalLayouts = makeDragSourceAndDropTarget(
  'project-manager-items-external-layouts'
);
const DragSourceAndDropTargetForExternalEvents = makeDragSourceAndDropTarget(
  'project-manager-items-external-events'
);
const DragSourceAndDropTargetForExtensions = makeDragSourceAndDropTarget(
  'project-manager-items-external-events'
);

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    scrollbarWidth: 'thin', // For Firefox, to avoid having a very large scrollbar.
    marginTop: 16,
    padding: '0 16px 16px 16px',
    position: 'relative',
  },
  searchBarContainer: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  searchBarPaper: { paddingBottom: 8 },
};

type ProjectItemKind =
  | 'layout'
  | 'external-events'
  | 'external-layout'
  | 'events-functions-extension';

const getTabId = (identifier: string) => `project-manager-tab-${identifier}`;

type Props = {|
  project: gdProject,
  onChangeProjectName: string => Promise<void>,
  onSaveProjectProperties: (options: { newName?: string }) => Promise<boolean>,
  onDeleteLayout: gdLayout => void,
  onDeleteExternalEvents: gdExternalEvents => void,
  onDeleteExternalLayout: gdExternalLayout => void,
  onDeleteEventsFunctionsExtension: gdEventsFunctionsExtension => void,
  onRenameLayout: (string, string) => void,
  onRenameExternalEvents: (string, string) => void,
  onRenameExternalLayout: (string, string) => void,
  onRenameEventsFunctionsExtension: (string, string) => void,
  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,
  onOpenExternalLayout: string => void,
  onOpenEventsFunctionsExtension: string => void,
  onOpenResources: () => void,
  onOpenPlatformSpecificAssets: () => void,
  eventsFunctionsExtensionsError: ?Error,
  onReloadEventsFunctionsExtensions: () => void,
  freezeUpdate: boolean,
  unsavedChanges?: UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onInstallExtension: ExtensionShortHeader => void,
  shortcutMap: ShortcutMap,

  // For resources:
  resourceManagementProps: ResourceManagementProps,
|};

type State = {|
  editedPropertiesLayout: ?gdLayout,
  editedVariablesLayout: ?gdLayout,
  renamedItemKind: ?ProjectItemKind,
  renamedItemName: string,
  searchText: string,
  projectPropertiesDialogOpen: boolean,
  projectPropertiesDialogInitialTab: 'properties' | 'loading-screen',
  projectVariablesEditorOpen: boolean,
  extensionsSearchDialogOpen: boolean,
  openedExtensionShortHeader: ?ExtensionShortHeader,
  openedExtensionName: ?string,
  isInstallingExtension: boolean,
  layoutPropertiesDialogOpen: boolean,
  layoutVariablesDialogOpen: boolean,
|};

export default class ProjectManager extends React.Component<Props, State> {
  _searchBar: ?SearchBarInterface;
  _draggedLayoutIndex: number | null = null;
  _draggedExternalLayoutIndex: number | null = null;
  _draggedExternalEventsIndex: number | null = null;
  _draggedExtensionIndex: number | null = null;

  state = {
    editedPropertiesLayout: null,
    editedVariablesLayout: null,
    renamedItemKind: null,
    renamedItemName: '',
    searchText: '',
    projectPropertiesDialogOpen: false,
    projectPropertiesDialogInitialTab: 'properties',
    projectVariablesEditorOpen: false,
    extensionsSearchDialogOpen: false,
    openedExtensionShortHeader: null,
    openedExtensionName: null,
    isInstallingExtension: false,
    layoutPropertiesDialogOpen: false,
    layoutVariablesDialogOpen: false,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (
      nextState.projectPropertiesDialogOpen !==
        this.state.projectPropertiesDialogOpen ||
      nextState.projectVariablesEditorOpen !==
        this.state.projectVariablesEditorOpen ||
      nextState.extensionsSearchDialogOpen !==
        this.state.extensionsSearchDialogOpen ||
      nextState.openedExtensionShortHeader !==
        this.state.openedExtensionShortHeader
    )
      return true;

    // Rendering the component is (super) costly (~20ms) as it iterates over
    // every project layouts/external layouts/external events,
    // so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !nextProps.freezeUpdate;
  }

  componentDidUpdate(prevProps: Props) {
    // Typical usage (don't forget to compare props):
    if (!this.props.freezeUpdate && prevProps.freezeUpdate) {
      // TODO: When this component is refactored into a functional component,
      // use useShouldAutofocusInput.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (useScreenType() === 'normal' && this._searchBar)
        this._searchBar.focus();
    }
  }

  _openProjectProperties = () => {
    this.setState({
      projectPropertiesDialogOpen: true,
      projectPropertiesDialogInitialTab: 'properties',
    });
  };

  _openProjectLoadingScreen = () => {
    this.setState({
      projectPropertiesDialogOpen: true,
      projectPropertiesDialogInitialTab: 'loading-screen',
    });
  };

  _openProjectVariables = () => {
    this.setState({
      projectVariablesEditorOpen: true,
    });
  };

  _openSearchExtensionDialog = () => {
    this.setState({ extensionsSearchDialogOpen: true });
  };

  _onEditName = (kind: ?ProjectItemKind, name: string) => {
    this.setState({
      renamedItemKind: kind,
      renamedItemName: name,
    });
  };

  _copyLayout = (layout: gdLayout) => {
    Clipboard.set(LAYOUT_CLIPBOARD_KIND, {
      layout: serializeToJSObject(layout),
      name: layout.getName(),
    });
  };

  _cutLayout = (layout: gdLayout) => {
    this._copyLayout(layout);
    this.props.onDeleteLayout(layout);
  };

  _pasteLayout = (index: number) => {
    if (!Clipboard.has(LAYOUT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(LAYOUT_CLIPBOARD_KIND);
    const copiedLayout = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'layout'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedLayout) return;

    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasLayoutNamed(name)
    );

    const newLayout = project.insertNewLayout(newName, index);

    unserializeFromJSObject(
      newLayout,
      copiedLayout,
      'unserializeFrom',
      project
    );
    newLayout.setName(newName); // Unserialization has overwritten the name.
    newLayout.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
  };

  _duplicateLayout = (layout: gdLayout, index: number) => {
    const { project } = this.props;

    const newName = newNameGenerator(layout.getName(), name =>
      project.hasLayoutNamed(name)
    );

    const newLayout = project.insertNewLayout(newName, index);

    unserializeFromJSObject(
      newLayout,
      serializeToJSObject(layout),
      'unserializeFrom',
      project
    );
    newLayout.setName(newName); // Unserialization has overwritten the name.
    newLayout.updateBehaviorsSharedData(project);

    this._onProjectItemModified();
  };

  _addLayout = (index: number, i18n: I18nType) => {
    const { project } = this.props;

    const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
      project.hasLayoutNamed(name)
    );
    const newLayout = project.insertNewLayout(newName, index + 1);
    newLayout.setName(newName);
    newLayout.updateBehaviorsSharedData(project);
    addDefaultLightToAllLayers(newLayout);

    this._onProjectItemModified();

    // Trigger an edit of the name, so that the user can rename the layout easily.
    this._onEditName('layout', newName);
  };

  _onOpenLayoutProperties = (layout: ?gdLayout) => {
    this.setState({ editedPropertiesLayout: layout });
  };

  _onOpenLayoutVariables = (layout: ?gdLayout) => {
    this.setState({ editedVariablesLayout: layout });
  };

  _addExternalEvents = (index: number, i18n: I18nType) => {
    const { project } = this.props;

    const newName = newNameGenerator(
      i18n._(t`Untitled external events`),
      name => project.hasExternalEventsNamed(name)
    );
    project.insertNewExternalEvents(newName, index + 1);
    this._onProjectItemModified();

    // Trigger an edit of the name, so that the user can rename the external events easily.
    this._onEditName('external-events', newName);
  };

  _addExternalLayout = (index: number, i18n: I18nType) => {
    const { project } = this.props;

    const newName = newNameGenerator(
      i18n._(t`Untitled external layout`),
      name => project.hasExternalLayoutNamed(name)
    );
    project.insertNewExternalLayout(newName, index + 1);
    this._onProjectItemModified();

    // Trigger an edit of the name, so that the user can rename the external layout easily.
    this._onEditName('external-layout', newName);
  };

  _addEventsFunctionsExtension = (index: number, i18n: I18nType) => {
    const { project } = this.props;

    const newName = newNameGenerator(i18n._(t`UntitledExtension`), name =>
      isExtensionNameTaken(name, project)
    );
    project.insertNewEventsFunctionsExtension(newName, index + 1);
    this._onProjectItemModified();
    return newName;
  };

  _moveUpLayout = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapLayouts(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownLayout = (index: number) => {
    const { project } = this.props;
    if (index >= project.getLayoutsCount() - 1) return;

    project.swapLayouts(index, index + 1);
    this._onProjectItemModified();
  };

  _dropOnLayout = (targetLayoutIndex: number) => {
    const { _draggedLayoutIndex } = this;
    if (_draggedLayoutIndex === null) return;

    if (targetLayoutIndex !== _draggedLayoutIndex) {
      this.props.project.moveLayout(
        _draggedLayoutIndex,
        targetLayoutIndex > _draggedLayoutIndex
          ? targetLayoutIndex - 1
          : targetLayoutIndex
      );
      this._onProjectItemModified();
    }
    this._draggedLayoutIndex = null;
  };

  _dropOnExternalLayout = (targetExternalLayoutIndex: number) => {
    const { _draggedExternalLayoutIndex } = this;
    if (_draggedExternalLayoutIndex === null) return;

    if (targetExternalLayoutIndex !== _draggedExternalLayoutIndex) {
      this.props.project.moveExternalLayout(
        _draggedExternalLayoutIndex,
        targetExternalLayoutIndex > _draggedExternalLayoutIndex
          ? targetExternalLayoutIndex - 1
          : targetExternalLayoutIndex
      );
      this._onProjectItemModified();
    }
    this._draggedExternalLayoutIndex = null;
  };

  _dropOnExternalEvents = (targetExternalEventsIndex: number) => {
    const { _draggedExternalEventsIndex } = this;
    if (_draggedExternalEventsIndex === null) return;

    if (targetExternalEventsIndex !== _draggedExternalEventsIndex) {
      this.props.project.moveExternalEvents(
        _draggedExternalEventsIndex,
        targetExternalEventsIndex > _draggedExternalEventsIndex
          ? targetExternalEventsIndex - 1
          : targetExternalEventsIndex
      );
      this._onProjectItemModified();
    }
    this._draggedExternalEventsIndex = null;
  };

  _dropOnExtension = (targetExtensionIndex: number) => {
    const { _draggedExtensionIndex } = this;
    if (_draggedExtensionIndex === null) return;

    if (targetExtensionIndex !== _draggedExtensionIndex) {
      this.props.project.moveEventsFunctionsExtension(
        _draggedExtensionIndex,
        targetExtensionIndex > _draggedExtensionIndex
          ? targetExtensionIndex - 1
          : targetExtensionIndex
      );
      this._onProjectItemModified();
    }
    this._draggedExtensionIndex = null;
  };

  _copyExternalEvents = (externalEvents: gdExternalEvents) => {
    Clipboard.set(EXTERNAL_EVENTS_CLIPBOARD_KIND, {
      externalEvents: serializeToJSObject(externalEvents),
      name: externalEvents.getName(),
    });
  };

  _cutExternalEvents = (externalEvents: gdExternalEvents) => {
    this._copyExternalEvents(externalEvents);
    this.props.onDeleteExternalEvents(externalEvents);
  };

  _pasteExternalEvents = (index: number) => {
    if (!Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EXTERNAL_EVENTS_CLIPBOARD_KIND);
    const copiedExternalEvents = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'externalEvents'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedExternalEvents) return;

    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasExternalEventsNamed(name)
    );

    const newExternalEvents = project.insertNewExternalEvents(newName, index);

    unserializeFromJSObject(
      newExternalEvents,
      copiedExternalEvents,
      'unserializeFrom',
      project
    );
    newExternalEvents.setName(newName); // Unserialization has overwritten the name.

    this._onProjectItemModified();
  };

  _duplicateExternalEvents = (
    externalEvents: gdExternalEvents,
    index: number
  ) => {
    this._copyExternalEvents(externalEvents);
    this._pasteExternalEvents(index);
  };

  _moveUpExternalEvents = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapExternalEvents(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownExternalEvents = (index: number) => {
    const { project } = this.props;
    if (index >= project.getExternalEventsCount() - 1) return;

    project.swapExternalEvents(index, index + 1);
    this._onProjectItemModified();
  };

  _copyExternalLayout = (externalLayout: gdExternalLayout) => {
    Clipboard.set(EXTERNAL_LAYOUT_CLIPBOARD_KIND, {
      externalLayout: serializeToJSObject(externalLayout),
      name: externalLayout.getName(),
    });
  };

  _cutExternalLayout = (externalLayout: gdExternalLayout) => {
    this._copyExternalLayout(externalLayout);
    this.props.onDeleteExternalLayout(externalLayout);
  };

  _pasteExternalLayout = (index: number) => {
    if (!Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EXTERNAL_LAYOUT_CLIPBOARD_KIND);
    const copiedExternalLayout = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'externalLayout'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedExternalLayout) return;

    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      project.hasExternalLayoutNamed(name)
    );

    const newExternalLayout = project.insertNewExternalLayout(newName, index);

    unserializeFromJSObject(newExternalLayout, copiedExternalLayout);
    newExternalLayout.setName(newName); // Unserialization has overwritten the name.
    this._onProjectItemModified();
  };

  _duplicateExternalLayout = (
    externalLayout: gdExternalLayout,
    index: number
  ) => {
    this._copyExternalLayout(externalLayout);
    this._pasteExternalLayout(index);
  };

  _moveUpExternalLayout = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapExternalLayouts(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownExternalLayout = (index: number) => {
    const { project } = this.props;
    if (index >= project.getExternalLayoutsCount() - 1) return;

    project.swapExternalLayouts(index, index + 1);
    this._onProjectItemModified();
  };

  _copyEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    Clipboard.set(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND, {
      eventsFunctionsExtension: serializeToJSObject(eventsFunctionsExtension),
      name: eventsFunctionsExtension.getName(),
    });
  };

  _cutEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => {
    this._copyEventsFunctionsExtension(eventsFunctionsExtension);
    this.props.onDeleteEventsFunctionsExtension(eventsFunctionsExtension);
  };

  _duplicateEventsFunctionsExtension = (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    index: number
  ) => {
    this._copyEventsFunctionsExtension(eventsFunctionsExtension);
    this._pasteEventsFunctionsExtension(index);
  };

  _pasteEventsFunctionsExtension = (index: number) => {
    if (!Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(
      EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND
    );
    const copiedEventsFunctionsExtension = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsFunctionsExtension'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsFunctionsExtension) return;

    const { project } = this.props;

    const newName = newNameGenerator(name, name =>
      isExtensionNameTaken(name, project)
    );

    const newEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsFunctionsExtension,
      copiedEventsFunctionsExtension,
      'unserializeFrom',
      project
    );
    newEventsFunctionsExtension.setName(newName); // Unserialization has overwritten the name.

    this._onProjectItemModified();
    this.props.onReloadEventsFunctionsExtensions();
  };

  _moveUpEventsFunctionsExtension = (index: number) => {
    const { project } = this.props;
    if (index <= 0) return;

    project.swapEventsFunctionsExtensions(index, index - 1);
    this._onProjectItemModified();
  };

  _moveDownEventsFunctionsExtension = (index: number) => {
    const { project } = this.props;
    if (index >= project.getEventsFunctionsExtensionsCount() - 1) return;

    project.swapEventsFunctionsExtensions(index, index + 1);
    this._onProjectItemModified();
  };

  _onEditEventsFunctionExtensionOrSeeDetails = (
    extensionShortHeadersByName: { [string]: ExtensionShortHeader },
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    name: string
  ) => {
    // If the extension is coming from the store, open its details.
    // If that's not the case, or if it cannot be found in the store, edit it directly.
    const originName = eventsFunctionsExtension.getOriginName();
    if (originName !== 'gdevelop-extension-store') {
      this.props.onOpenEventsFunctionsExtension(name);
      return;
    }
    const originIdentifier = eventsFunctionsExtension.getOriginIdentifier();
    const extensionShortHeader = extensionShortHeadersByName[originIdentifier];
    if (!extensionShortHeader) {
      console.warn(
        `This extension was downloaded from the store but its reference ${originIdentifier} couldn't be found in the store. Opening the extension in the editor...`
      );
      this.props.onOpenEventsFunctionsExtension(name);
      return;
    }
    this.setState({
      openedExtensionShortHeader: extensionShortHeader,
      openedExtensionName: name,
    });
  };

  _onProjectPropertiesApplied = (options: { newName?: string }) => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }

    if (options.newName) {
      this.props.onChangeProjectName(options.newName);
    }

    this.setState({ projectPropertiesDialogOpen: false });
  };

  _onSearchChange = (text: string) =>
    this.setState({
      searchText: text,
    });

  _onRequestSearch = () => {
    /* Do nothing for now, but we could open the first result. */
  };

  _onProjectItemModified = () => {
    this.forceUpdate();
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
  };

  _setProjectFirstLayout = (layoutName: string) => {
    this.props.project.setFirstLayout(layoutName);
    this.forceUpdate();
  };

  _onCreateNewExtension = (project: gdProject, i18n: I18nType) => {
    const newExtensionName = this._addEventsFunctionsExtension(
      project.getEventsFunctionsExtensionsCount(),
      i18n
    );
    this.props.onOpenEventsFunctionsExtension(newExtensionName);
    this.setState({ extensionsSearchDialogOpen: false });
  };

  render() {
    const {
      project,
      eventsFunctionsExtensionsError,
      onReloadEventsFunctionsExtensions,
      onInstallExtension,
      shortcutMap,
    } = this.props;
    const {
      renamedItemKind,
      renamedItemName,
      searchText,
      openedExtensionShortHeader,
      openedExtensionName,
    } = this.state;

    const firstLayoutName = project.getFirstLayout();

    const displayedScenes = filterProjectItemsList(
      enumerateLayouts(project),
      searchText
    );
    const displayedExtensions = filterProjectItemsList(
      enumerateEventsFunctionsExtensions(project),
      searchText
    );
    const displayedExternalEvents = filterProjectItemsList(
      enumerateExternalEvents(project),
      searchText
    );
    const displayedExternalLayouts = filterProjectItemsList(
      enumerateExternalLayouts(project),
      searchText
    );

    return (
      <I18n>
        {({ i18n }) => (
          <div style={styles.container} id="project-manager">
            <ProjectManagerCommands
              project={this.props.project}
              onOpenProjectProperties={this._openProjectProperties}
              onOpenProjectLoadingScreen={this._openProjectLoadingScreen}
              onOpenProjectVariables={this._openProjectVariables}
              onOpenResourcesDialog={this.props.onOpenResources}
              onOpenPlatformSpecificAssetsDialog={
                this.props.onOpenPlatformSpecificAssets
              }
              onOpenSearchExtensionDialog={this._openSearchExtensionDialog}
            />
            <div style={styles.searchBarContainer}>
              <Paper background="dark" square style={styles.searchBarPaper}>
                <SearchBar
                  ref={searchBar => (this._searchBar = searchBar)}
                  value={searchText}
                  onRequestSearch={this._onRequestSearch}
                  onChange={this._onSearchChange}
                  placeholder={t`Search in project`}
                />
              </Paper>
            </div>
            <ShortcutsReminder shortcutMap={shortcutMap} />
            <List>
              <ProjectStructureItem
                id={getTabId('game-settings')}
                primaryText={<Trans>Game settings</Trans>}
                renderNestedItems={() => [
                  <ListItem
                    id={getTabId('game-properties')}
                    key="properties"
                    primaryText={<Trans>Properties</Trans>}
                    leftIcon={<SettingsApplications />}
                    onClick={this._openProjectProperties}
                    noPadding
                  />,
                  <ListItem
                    id={getTabId('global-variables')}
                    key="global-variables"
                    primaryText={<Trans>Global variables</Trans>}
                    leftIcon={<VariableTree />}
                    onClick={this._openProjectVariables}
                    noPadding
                  />,
                  <ListItem
                    id={getTabId('game-icons')}
                    key="icons"
                    primaryText={<Trans>Icons and thumbnail</Trans>}
                    leftIcon={<PhotoLibrary />}
                    onClick={this.props.onOpenPlatformSpecificAssets}
                    noPadding
                  />,
                  <ListItem
                    id={getTabId('game-resources')}
                    key="resources"
                    primaryText={<Trans>Resources</Trans>}
                    leftIcon={<ArtTrack />}
                    onClick={this.props.onOpenResources}
                    noPadding
                  />,
                ]}
              />
              <ProjectStructureItem
                id={getTabId('scenes')}
                primaryText={<Trans>Scenes</Trans>}
                renderNestedItems={() => [
                  ...displayedScenes.map((layout: gdLayout, i: number) => {
                    const name = layout.getName();
                    return (
                      <Item
                        id={`scene-item-${i}`}
                        isLastItem={i === displayedScenes.length - 1}
                        key={i}
                        data={{
                          scene: name,
                          default:
                            name === firstLayoutName ? 'true' : undefined,
                        }}
                        leftIcon={<SceneIcon />}
                        primaryText={name}
                        textEndAdornment={
                          name === firstLayoutName ? (
                            <Tooltip
                              title={i18n._(
                                t`This scene will be used as the start scene.`
                              )}
                            >
                              <Flag color="disabled" fontSize="small" />
                            </Tooltip>
                          ) : (
                            undefined
                          )
                        }
                        editingName={
                          renamedItemKind === 'layout' &&
                          renamedItemName === name
                        }
                        onEdit={() => this.props.onOpenLayout(name)}
                        onDelete={() => this.props.onDeleteLayout(layout)}
                        addLabel={t`Add a new scene`}
                        onAdd={() => this._addLayout(i, i18n)}
                        onRename={newName => {
                          this.props.onRenameLayout(name, newName);
                          this._onEditName(null, '');
                        }}
                        onEditName={() => this._onEditName('layout', name)}
                        onCopy={() => this._copyLayout(layout)}
                        onCut={() => this._cutLayout(layout)}
                        onPaste={() => this._pasteLayout(i)}
                        onDuplicate={() => this._duplicateLayout(layout, i)}
                        canPaste={() => Clipboard.has(LAYOUT_CLIPBOARD_KIND)}
                        canMoveUp={i !== 0}
                        onMoveUp={() => this._moveUpLayout(i)}
                        canMoveDown={i !== project.getLayoutsCount() - 1}
                        onMoveDown={() => this._moveDownLayout(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForScenes,
                          onBeginDrag: () => {
                            this._draggedLayoutIndex = i;
                          },
                          onDrop: () => {
                            this._dropOnLayout(i);
                          },
                        }}
                        buildExtraMenuTemplate={(i18n: I18nType) => [
                          {
                            label: i18n._(t`Edit scene properties`),
                            enabled: true,
                            click: () => this._onOpenLayoutProperties(layout),
                          },
                          {
                            label: i18n._(t`Edit scene variables`),
                            enabled: true,
                            click: () => this._onOpenLayoutVariables(layout),
                          },
                          {
                            label: i18n._(t`Set as start scene`),
                            enabled: name !== firstLayoutName,
                            click: () => this._setProjectFirstLayout(name),
                          },
                        ]}
                      />
                    );
                  }),
                  ...(!!searchText
                    ? []
                    : [
                        <AddListItem
                          noMargin
                          id="add-new-scene-button"
                          key={'add-scene'}
                          onClick={() =>
                            this._addLayout(project.getLayoutsCount(), i18n)
                          }
                          primaryText={<Trans>Add scene</Trans>}
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getTabId('extensions')}
                primaryText={<Trans>Extensions</Trans>}
                error={eventsFunctionsExtensionsError}
                onRefresh={onReloadEventsFunctionsExtensions}
                renderNestedItems={() => [
                  ...displayedExtensions.map((eventsFunctionsExtension, i) => {
                    const name = eventsFunctionsExtension.getName();
                    return (
                      <EventFunctionExtensionItem
                        key={i}
                        isLastItem={i === displayedExtensions.length - 1}
                        eventsFunctionsExtension={eventsFunctionsExtension}
                        isEditingName={
                          renamedItemKind === 'events-functions-extension' &&
                          renamedItemName === name
                        }
                        onEdit={extensionShortHeadersByName =>
                          this._onEditEventsFunctionExtensionOrSeeDetails(
                            extensionShortHeadersByName,
                            eventsFunctionsExtension,
                            name
                          )
                        }
                        onDelete={() =>
                          this.props.onDeleteEventsFunctionsExtension(
                            eventsFunctionsExtension
                          )
                        }
                        onAdd={() => {
                          this._addEventsFunctionsExtension(i, i18n);
                        }}
                        onRename={newName => {
                          this.props.onRenameEventsFunctionsExtension(
                            name,
                            newName
                          );
                          this._onEditName(null, '');
                        }}
                        onEditName={() =>
                          this._onEditName('events-functions-extension', name)
                        }
                        onCopy={() =>
                          this._copyEventsFunctionsExtension(
                            eventsFunctionsExtension
                          )
                        }
                        onCut={() =>
                          this._cutEventsFunctionsExtension(
                            eventsFunctionsExtension
                          )
                        }
                        onPaste={() => this._pasteEventsFunctionsExtension(i)}
                        onDuplicate={() =>
                          this._duplicateEventsFunctionsExtension(
                            eventsFunctionsExtension,
                            i
                          )
                        }
                        canPaste={() =>
                          Clipboard.has(
                            EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND
                          )
                        }
                        canMoveUp={i !== 0}
                        onMoveUp={() => this._moveUpEventsFunctionsExtension(i)}
                        canMoveDown={
                          i !== project.getEventsFunctionsExtensionsCount() - 1
                        }
                        onMoveDown={() =>
                          this._moveDownEventsFunctionsExtension(i)
                        }
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExtensions,
                          onBeginDrag: () => {
                            this._draggedExtensionIndex = i;
                          },
                          onDrop: () => {
                            this._dropOnExtension(i);
                          },
                        }}
                      />
                    );
                  }),
                  ...(!!searchText
                    ? []
                    : [
                        <AddListItem
                          noMargin
                          id="project-manager-extension-search-or-create"
                          key={'extensions-search'}
                          kind="search"
                          primaryText={
                            <Trans>Create or search for new extensions</Trans>
                          }
                          onClick={this._openSearchExtensionDialog}
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getTabId('external-events')}
                primaryText={<Trans>External events</Trans>}
                renderNestedItems={() => [
                  ...displayedExternalEvents.map((externalEvents, i) => {
                    const name = externalEvents.getName();
                    return (
                      <Item
                        key={i}
                        isLastItem={i === displayedExternalEvents.length - 1}
                        leftIcon={<ExternalEventsIcon />}
                        primaryText={name}
                        editingName={
                          renamedItemKind === 'external-events' &&
                          renamedItemName === name
                        }
                        onEdit={() => this.props.onOpenExternalEvents(name)}
                        onDelete={() =>
                          this.props.onDeleteExternalEvents(externalEvents)
                        }
                        addLabel={t`Add new external events`}
                        onAdd={() => this._addExternalEvents(i, i18n)}
                        onRename={newName => {
                          this.props.onRenameExternalEvents(name, newName);
                          this._onEditName(null, '');
                        }}
                        onEditName={() =>
                          this._onEditName('external-events', name)
                        }
                        onCopy={() => this._copyExternalEvents(externalEvents)}
                        onCut={() => this._cutExternalEvents(externalEvents)}
                        onPaste={() => this._pasteExternalEvents(i)}
                        onDuplicate={() =>
                          this._duplicateExternalEvents(externalEvents, i)
                        }
                        canPaste={() =>
                          Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)
                        }
                        canMoveUp={i !== 0}
                        onMoveUp={() => this._moveUpExternalEvents(i)}
                        canMoveDown={i !== project.getExternalEventsCount() - 1}
                        onMoveDown={() => this._moveDownExternalEvents(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExternalEvents,
                          onBeginDrag: () => {
                            this._draggedExternalEventsIndex = i;
                          },
                          onDrop: () => {
                            this._dropOnExternalEvents(i);
                          },
                        }}
                      />
                    );
                  }),
                  ...(!!searchText
                    ? []
                    : [
                        <AddListItem
                          noMargin
                          key={'add-external-events'}
                          primaryText={<Trans>Add external events</Trans>}
                          onClick={() =>
                            this._addExternalEvents(
                              project.getExternalEventsCount(),
                              i18n
                            )
                          }
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getTabId('external-layouts')}
                primaryText={<Trans>External layouts</Trans>}
                renderNestedItems={() => [
                  ...displayedExternalLayouts.map((externalLayout, i) => {
                    const name = externalLayout.getName();
                    return (
                      <Item
                        key={i}
                        isLastItem={i === displayedExternalLayouts.length - 1}
                        leftIcon={<ExternalLayoutIcon />}
                        primaryText={name}
                        editingName={
                          renamedItemKind === 'external-layout' &&
                          renamedItemName === name
                        }
                        onEdit={() => this.props.onOpenExternalLayout(name)}
                        onDelete={() =>
                          this.props.onDeleteExternalLayout(externalLayout)
                        }
                        addLabel={t`Add a new external layout`}
                        onAdd={() => this._addExternalLayout(i, i18n)}
                        onRename={newName => {
                          this.props.onRenameExternalLayout(name, newName);
                          this._onEditName(null, '');
                        }}
                        onEditName={() =>
                          this._onEditName('external-layout', name)
                        }
                        onCopy={() => this._copyExternalLayout(externalLayout)}
                        onCut={() => this._cutExternalLayout(externalLayout)}
                        onPaste={() => this._pasteExternalLayout(i)}
                        onDuplicate={() =>
                          this._duplicateExternalLayout(externalLayout, i)
                        }
                        canPaste={() =>
                          Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)
                        }
                        canMoveUp={i !== 0}
                        onMoveUp={() => this._moveUpExternalLayout(i)}
                        canMoveDown={
                          i !== project.getExternalLayoutsCount() - 1
                        }
                        onMoveDown={() => this._moveDownExternalLayout(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExternalLayouts,
                          onBeginDrag: () => {
                            this._draggedExternalLayoutIndex = i;
                          },
                          onDrop: () => {
                            this._dropOnExternalLayout(i);
                          },
                        }}
                      />
                    );
                  }),
                  ...(!!searchText
                    ? []
                    : [
                        <AddListItem
                          noMargin
                          key={'add-external-layout'}
                          primaryText={<Trans>Add external layout</Trans>}
                          onClick={() =>
                            this._addExternalLayout(
                              project.getExternalLayoutsCount(),
                              i18n
                            )
                          }
                        />,
                      ]),
                ]}
              />
            </List>
            {this.state.projectVariablesEditorOpen && (
              <VariablesEditorDialog
                project={project}
                title={<Trans>Global Variables</Trans>}
                open
                variablesContainer={project.getVariables()}
                onCancel={() =>
                  this.setState({ projectVariablesEditorOpen: false })
                }
                onApply={() => {
                  if (this.props.unsavedChanges)
                    this.props.unsavedChanges.triggerUnsavedChanges();
                  this.setState({ projectVariablesEditorOpen: false });
                }}
                emptyPlaceholderTitle={
                  <Trans>Add your first global variable</Trans>
                }
                emptyPlaceholderDescription={
                  <Trans>
                    These variables hold additional information on a project.
                  </Trans>
                }
                helpPagePath={'/all-features/variables/global-variables'}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
                onComputeAllVariableNames={() =>
                  EventsRootVariablesFinder.findAllGlobalVariables(
                    project.getCurrentPlatform(),
                    project
                  )
                }
              />
            )}
            {this.state.projectPropertiesDialogOpen && (
              <ProjectPropertiesDialog
                open
                initialTab={this.state.projectPropertiesDialogInitialTab}
                project={project}
                onClose={() =>
                  this.setState({ projectPropertiesDialogOpen: false })
                }
                onApply={this.props.onSaveProjectProperties}
                onPropertiesApplied={this._onProjectPropertiesApplied}
                resourceManagementProps={this.props.resourceManagementProps}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
                i18n={i18n}
              />
            )}
            {!!this.state.editedPropertiesLayout && (
              <ScenePropertiesDialog
                open
                layout={this.state.editedPropertiesLayout}
                project={this.props.project}
                onApply={() => {
                  if (this.props.unsavedChanges)
                    this.props.unsavedChanges.triggerUnsavedChanges();
                  this._onOpenLayoutProperties(null);
                }}
                onClose={() => this._onOpenLayoutProperties(null)}
                onEditVariables={() => {
                  this._onOpenLayoutVariables(
                    this.state.editedPropertiesLayout
                  );
                  this._onOpenLayoutProperties(null);
                }}
                resourceManagementProps={this.props.resourceManagementProps}
              />
            )}
            {!!this.state.editedVariablesLayout && (
              <SceneVariablesDialog
                open
                project={project}
                layout={this.state.editedVariablesLayout}
                onClose={() => this._onOpenLayoutVariables(null)}
                onApply={() => {
                  if (this.props.unsavedChanges)
                    this.props.unsavedChanges.triggerUnsavedChanges();
                  this._onOpenLayoutVariables(null);
                }}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
              />
            )}
            {this.state.extensionsSearchDialogOpen && (
              <ExtensionsSearchDialog
                project={project}
                onClose={() =>
                  this.setState({ extensionsSearchDialogOpen: false })
                }
                onInstallExtension={onInstallExtension}
                onCreateNew={() => {
                  this._onCreateNewExtension(project, i18n);
                }}
              />
            )}
            {openedExtensionShortHeader && openedExtensionName && (
              <InstalledExtensionDetails
                project={project}
                onClose={() =>
                  this.setState({
                    openedExtensionShortHeader: null,
                    openedExtensionName: null,
                  })
                }
                onOpenEventsFunctionsExtension={
                  this.props.onOpenEventsFunctionsExtension
                }
                extensionShortHeader={openedExtensionShortHeader}
                extensionName={openedExtensionName}
                onInstallExtension={onInstallExtension}
              />
            )}
          </div>
        )}
      </I18n>
    );
  }
}
