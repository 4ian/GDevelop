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
import Paper from '../UI/Paper';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { useShouldAutofocusInput } from '../UI/Reponsive/ScreenTypeMeasurer';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import ErrorBoundary from '../UI/ErrorBoundary';
import Settings from '../UI/CustomSvgIcons/Settings';
import Picture from '../UI/CustomSvgIcons/Picture';
import Publish from '../UI/CustomSvgIcons/Publish';
import ProjectResources from '../UI/CustomSvgIcons/ProjectResources';
import GamesDashboardInfo from './GamesDashboardInfo';
import useForceUpdate from '../Utils/UseForceUpdate';
import useGamesList from '../GameDashboard/UseGamesList';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { GameDetailsDialog } from '../GameDashboard/GameDetailsDialog';

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
    padding: '0 8px 12px 12px',
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

export const getProjectManagerItemId = (identifier: string) =>
  `project-manager-tab-${identifier}`;

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
  onShareProject: () => void,

  // For resources:
  resourceManagementProps: ResourceManagementProps,
|};

const ProjectManager = React.memo(
  ({
    project,
    onChangeProjectName,
    onSaveProjectProperties,
    onDeleteLayout,
    onDeleteExternalEvents,
    onDeleteExternalLayout,
    onDeleteEventsFunctionsExtension,
    onRenameLayout,
    onRenameExternalEvents,
    onRenameExternalLayout,
    onRenameEventsFunctionsExtension,
    onOpenLayout,
    onOpenExternalEvents,
    onOpenExternalLayout,
    onOpenEventsFunctionsExtension,
    onOpenResources,
    onOpenPlatformSpecificAssets,
    eventsFunctionsExtensionsError,
    onReloadEventsFunctionsExtensions,
    freezeUpdate,
    unsavedChanges,
    hotReloadPreviewButtonProps,
    onInstallExtension,
    onShareProject,
    resourceManagementProps,
  }: Props) => {
    const forceUpdate = useForceUpdate();
    const shouldAutofocusInput = useShouldAutofocusInput();
    const { profile } = React.useContext(AuthenticatedUserContext);
    const userId = profile ? profile.id : null;
    const { games, fetchGames } = useGamesList();

    const searchBarRef = React.useRef<?SearchBarInterface>(null);
    const draggedLayoutIndexRef = React.useRef<number | null>(null);
    const draggedExternalLayoutIndexRef = React.useRef<number | null>(null);
    const draggedExternalEventsIndexRef = React.useRef<number | null>(null);
    const draggedExtensionIndexRef = React.useRef<number | null>(null);

    const [editedPropertiesLayout, setEditedPropertiesLayout] = React.useState(
      null
    );
    const [editedVariablesLayout, setEditedVariablesLayout] = React.useState(
      null
    );
    const [renamedItemKind, setRenamedItemKind] = React.useState(null);
    const [renamedItemName, setRenamedItemName] = React.useState('');
    const [searchText, setSearchText] = React.useState('');
    const [
      projectPropertiesDialogOpen,
      setProjectPropertiesDialogOpen,
    ] = React.useState(false);
    const [
      projectPropertiesDialogInitialTab,
      setProjectPropertiesDialogInitialTab,
    ] = React.useState('properties');
    const [
      projectVariablesEditorOpen,
      setProjectVariablesEditorOpen,
    ] = React.useState(false);
    const [
      extensionsSearchDialogOpen,
      setExtensionsSearchDialogOpen,
    ] = React.useState(false);
    const [
      openedExtensionShortHeader,
      setOpenedExtensionShortHeader,
    ] = React.useState(null);
    const [openedExtensionName, setOpenedExtensionName] = React.useState(null);
    const [openGameDetails, setOpenGameDetails] = React.useState<boolean>(
      false
    );

    const projectUuid = project.getProjectUuid();
    const gameMatchingProjectUuid = games
      ? games.find(game => game.id === projectUuid)
      : null;

    React.useEffect(() => {
      if (!freezeUpdate && shouldAutofocusInput && searchBarRef.current) {
        searchBarRef.current.focus();
      }
    });

    React.useEffect(
      () => {
        fetchGames();
      },
      [fetchGames, userId]
    );

    const onProjectItemModified = React.useCallback(
      () => {
        forceUpdate();
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      },
      [forceUpdate, unsavedChanges]
    );

    const openProjectProperties = React.useCallback(() => {
      setProjectPropertiesDialogOpen(true);
      setProjectPropertiesDialogInitialTab('properties');
    }, []);

    const openProjectLoadingScreen = React.useCallback(() => {
      setProjectPropertiesDialogOpen(true);
      setProjectPropertiesDialogInitialTab('loading-screen');
    }, []);

    const openProjectVariables = React.useCallback(() => {
      setProjectVariablesEditorOpen(true);
    }, []);

    const openSearchExtensionDialog = React.useCallback(() => {
      setExtensionsSearchDialogOpen(true);
    }, []);

    const onEditName = React.useCallback(
      (kind: ?ProjectItemKind, name: string) => {
        setRenamedItemKind(kind);
        setRenamedItemName(name);
      },
      []
    );

    const copyLayout = React.useCallback((layout: gdLayout) => {
      Clipboard.set(LAYOUT_CLIPBOARD_KIND, {
        layout: serializeToJSObject(layout),
        name: layout.getName(),
      });
    }, []);

    const cutLayout = React.useCallback(
      (layout: gdLayout) => {
        copyLayout(layout);
        onDeleteLayout(layout);
      },
      [onDeleteLayout, copyLayout]
    );

    const pasteLayout = React.useCallback(
      (index: number) => {
        if (!Clipboard.has(LAYOUT_CLIPBOARD_KIND)) return;

        const clipboardContent = Clipboard.get(LAYOUT_CLIPBOARD_KIND);
        const copiedLayout = SafeExtractor.extractObjectProperty(
          clipboardContent,
          'layout'
        );
        const name = SafeExtractor.extractStringProperty(
          clipboardContent,
          'name'
        );
        if (!name || !copiedLayout) return;

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

        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const duplicateLayout = React.useCallback(
      (layout: gdLayout, index: number) => {
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

        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const addLayout = React.useCallback(
      (index: number, i18n: I18nType) => {
        const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
          project.hasLayoutNamed(name)
        );
        const newLayout = project.insertNewLayout(newName, index + 1);
        newLayout.setName(newName);
        newLayout.updateBehaviorsSharedData(project);
        addDefaultLightToAllLayers(newLayout);

        onProjectItemModified();

        // Trigger an edit of the name, so that the user can rename the layout easily.
        onEditName('layout', newName);
      },
      [project, onProjectItemModified, onEditName]
    );

    const onOpenLayoutProperties = React.useCallback((layout: ?gdLayout) => {
      setEditedPropertiesLayout(layout);
    }, []);

    const onOpenLayoutVariables = React.useCallback((layout: ?gdLayout) => {
      setEditedVariablesLayout(layout);
    }, []);

    const addExternalEvents = React.useCallback(
      (index: number, i18n: I18nType) => {
        const newName = newNameGenerator(
          i18n._(t`Untitled external events`),
          name => project.hasExternalEventsNamed(name)
        );
        project.insertNewExternalEvents(newName, index + 1);
        onProjectItemModified();

        // Trigger an edit of the name, so that the user can rename the external events easily.
        onEditName('external-events', newName);
      },
      [project, onProjectItemModified, onEditName]
    );

    const addExternalLayout = React.useCallback(
      (index: number, i18n: I18nType) => {
        const newName = newNameGenerator(
          i18n._(t`Untitled external layout`),
          name => project.hasExternalLayoutNamed(name)
        );
        project.insertNewExternalLayout(newName, index + 1);
        onProjectItemModified();

        // Trigger an edit of the name, so that the user can rename the external layout easily.
        onEditName('external-layout', newName);
      },
      [project, onEditName, onProjectItemModified]
    );

    const addEventsFunctionsExtension = React.useCallback(
      (index: number, i18n: I18nType) => {
        const newName = newNameGenerator(i18n._(t`UntitledExtension`), name =>
          isExtensionNameTaken(name, project)
        );
        project.insertNewEventsFunctionsExtension(newName, index + 1);
        onProjectItemModified();
        return newName;
      },
      [project, onProjectItemModified]
    );

    const moveUpLayout = React.useCallback(
      (index: number) => {
        if (index <= 0) return;

        project.swapLayouts(index, index - 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const moveDownLayout = React.useCallback(
      (index: number) => {
        if (index >= project.getLayoutsCount() - 1) return;

        project.swapLayouts(index, index + 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const dropOnLayout = React.useCallback(
      (targetLayoutIndex: number) => {
        const { current: draggedLayoutIndex } = draggedLayoutIndexRef;
        if (draggedLayoutIndex === null) return;

        if (targetLayoutIndex !== draggedLayoutIndex) {
          project.moveLayout(
            draggedLayoutIndex,
            targetLayoutIndex > draggedLayoutIndex
              ? targetLayoutIndex - 1
              : targetLayoutIndex
          );
          onProjectItemModified();
        }
        draggedLayoutIndexRef.current = null;
      },
      [project, onProjectItemModified]
    );

    const dropOnExternalLayout = React.useCallback(
      (targetExternalLayoutIndex: number) => {
        const {
          current: draggedExternalLayoutIndex,
        } = draggedExternalLayoutIndexRef;
        if (draggedExternalLayoutIndex === null) return;

        if (targetExternalLayoutIndex !== draggedExternalLayoutIndex) {
          project.moveExternalLayout(
            draggedExternalLayoutIndex,
            targetExternalLayoutIndex > draggedExternalLayoutIndex
              ? targetExternalLayoutIndex - 1
              : targetExternalLayoutIndex
          );
          onProjectItemModified();
        }
        draggedExternalLayoutIndexRef.current = null;
      },
      [project, onProjectItemModified]
    );

    const dropOnExternalEvents = React.useCallback(
      (targetExternalEventsIndex: number) => {
        const {
          current: draggedExternalEventsIndex,
        } = draggedExternalEventsIndexRef;
        if (draggedExternalEventsIndex === null) return;

        if (targetExternalEventsIndex !== draggedExternalEventsIndex) {
          project.moveExternalEvents(
            draggedExternalEventsIndex,
            targetExternalEventsIndex > draggedExternalEventsIndex
              ? targetExternalEventsIndex - 1
              : targetExternalEventsIndex
          );
          onProjectItemModified();
        }
        draggedExternalEventsIndexRef.current = null;
      },
      [project, onProjectItemModified]
    );

    const dropOnExtension = React.useCallback(
      (targetExtensionIndex: number) => {
        const { current: draggedExtensionIndex } = draggedExtensionIndexRef;
        if (draggedExtensionIndex === null) return;

        if (targetExtensionIndex !== draggedExtensionIndex) {
          project.moveEventsFunctionsExtension(
            draggedExtensionIndex,
            targetExtensionIndex > draggedExtensionIndex
              ? targetExtensionIndex - 1
              : targetExtensionIndex
          );
          onProjectItemModified();
        }
        draggedExtensionIndexRef.current = null;
      },
      [project, onProjectItemModified]
    );

    const copyExternalEvents = React.useCallback(
      (externalEvents: gdExternalEvents) => {
        Clipboard.set(EXTERNAL_EVENTS_CLIPBOARD_KIND, {
          externalEvents: serializeToJSObject(externalEvents),
          name: externalEvents.getName(),
        });
      },
      []
    );

    const cutExternalEvents = React.useCallback(
      (externalEvents: gdExternalEvents) => {
        copyExternalEvents(externalEvents);
        onDeleteExternalEvents(externalEvents);
      },
      [copyExternalEvents, onDeleteExternalEvents]
    );

    const pasteExternalEvents = React.useCallback(
      (index: number) => {
        if (!Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)) return;

        const clipboardContent = Clipboard.get(EXTERNAL_EVENTS_CLIPBOARD_KIND);
        const copiedExternalEvents = SafeExtractor.extractObjectProperty(
          clipboardContent,
          'externalEvents'
        );
        const name = SafeExtractor.extractStringProperty(
          clipboardContent,
          'name'
        );
        if (!name || !copiedExternalEvents) return;

        const newName = newNameGenerator(name, name =>
          project.hasExternalEventsNamed(name)
        );

        const newExternalEvents = project.insertNewExternalEvents(
          newName,
          index
        );

        unserializeFromJSObject(
          newExternalEvents,
          copiedExternalEvents,
          'unserializeFrom',
          project
        );
        newExternalEvents.setName(newName); // Unserialization has overwritten the name.

        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const duplicateExternalEvents = React.useCallback(
      (externalEvents: gdExternalEvents, index: number) => {
        copyExternalEvents(externalEvents);
        pasteExternalEvents(index);
      },
      [copyExternalEvents, pasteExternalEvents]
    );

    const moveUpExternalEvents = React.useCallback(
      (index: number) => {
        if (index <= 0) return;

        project.swapExternalEvents(index, index - 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const moveDownExternalEvents = React.useCallback(
      (index: number) => {
        if (index >= project.getExternalEventsCount() - 1) return;

        project.swapExternalEvents(index, index + 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const copyExternalLayout = React.useCallback(
      (externalLayout: gdExternalLayout) => {
        Clipboard.set(EXTERNAL_LAYOUT_CLIPBOARD_KIND, {
          externalLayout: serializeToJSObject(externalLayout),
          name: externalLayout.getName(),
        });
      },
      []
    );

    const cutExternalLayout = React.useCallback(
      (externalLayout: gdExternalLayout) => {
        copyExternalLayout(externalLayout);
        onDeleteExternalLayout(externalLayout);
      },
      [copyExternalLayout, onDeleteExternalLayout]
    );

    const pasteExternalLayout = React.useCallback(
      (index: number) => {
        if (!Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)) return;

        const clipboardContent = Clipboard.get(EXTERNAL_LAYOUT_CLIPBOARD_KIND);
        const copiedExternalLayout = SafeExtractor.extractObjectProperty(
          clipboardContent,
          'externalLayout'
        );
        const name = SafeExtractor.extractStringProperty(
          clipboardContent,
          'name'
        );
        if (!name || !copiedExternalLayout) return;

        const newName = newNameGenerator(name, name =>
          project.hasExternalLayoutNamed(name)
        );

        const newExternalLayout = project.insertNewExternalLayout(
          newName,
          index
        );

        unserializeFromJSObject(newExternalLayout, copiedExternalLayout);
        newExternalLayout.setName(newName); // Unserialization has overwritten the name.
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const duplicateExternalLayout = React.useCallback(
      (externalLayout: gdExternalLayout, index: number) => {
        copyExternalLayout(externalLayout);
        pasteExternalLayout(index);
      },
      [copyExternalLayout, pasteExternalLayout]
    );

    const moveUpExternalLayout = React.useCallback(
      (index: number) => {
        if (index <= 0) return;

        project.swapExternalLayouts(index, index - 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const moveDownExternalLayout = React.useCallback(
      (index: number) => {
        if (index >= project.getExternalLayoutsCount() - 1) return;

        project.swapExternalLayouts(index, index + 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const copyEventsFunctionsExtension = React.useCallback(
      (eventsFunctionsExtension: gdEventsFunctionsExtension) => {
        Clipboard.set(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND, {
          eventsFunctionsExtension: serializeToJSObject(
            eventsFunctionsExtension
          ),
          name: eventsFunctionsExtension.getName(),
        });
      },
      []
    );

    const cutEventsFunctionsExtension = React.useCallback(
      (eventsFunctionsExtension: gdEventsFunctionsExtension) => {
        copyEventsFunctionsExtension(eventsFunctionsExtension);
        onDeleteEventsFunctionsExtension(eventsFunctionsExtension);
      },
      [copyEventsFunctionsExtension, onDeleteEventsFunctionsExtension]
    );

    const pasteEventsFunctionsExtension = React.useCallback(
      (index: number) => {
        if (!Clipboard.has(EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND)) return;

        const clipboardContent = Clipboard.get(
          EVENTS_FUNCTIONS_EXTENSION_CLIPBOARD_KIND
        );
        const copiedEventsFunctionsExtension = SafeExtractor.extractObjectProperty(
          clipboardContent,
          'eventsFunctionsExtension'
        );
        const name = SafeExtractor.extractStringProperty(
          clipboardContent,
          'name'
        );
        if (!name || !copiedEventsFunctionsExtension) return;

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

        onProjectItemModified();
        onReloadEventsFunctionsExtensions();
      },
      [project, onProjectItemModified, onReloadEventsFunctionsExtensions]
    );

    const duplicateEventsFunctionsExtension = React.useCallback(
      (eventsFunctionsExtension: gdEventsFunctionsExtension, index: number) => {
        copyEventsFunctionsExtension(eventsFunctionsExtension);
        pasteEventsFunctionsExtension(index);
      },
      [copyEventsFunctionsExtension, pasteEventsFunctionsExtension]
    );

    const moveUpEventsFunctionsExtension = React.useCallback(
      (index: number) => {
        if (index <= 0) return;

        project.swapEventsFunctionsExtensions(index, index - 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const moveDownEventsFunctionsExtension = React.useCallback(
      (index: number) => {
        if (index >= project.getEventsFunctionsExtensionsCount() - 1) return;

        project.swapEventsFunctionsExtensions(index, index + 1);
        onProjectItemModified();
      },
      [project, onProjectItemModified]
    );

    const onEditEventsFunctionExtensionOrSeeDetails = React.useCallback(
      (
        extensionShortHeadersByName: { [string]: ExtensionShortHeader },
        eventsFunctionsExtension: gdEventsFunctionsExtension,
        name: string
      ) => {
        // If the extension is coming from the store, open its details.
        // If that's not the case, or if it cannot be found in the store, edit it directly.
        const originName = eventsFunctionsExtension.getOriginName();
        if (originName !== 'gdevelop-extension-store') {
          onOpenEventsFunctionsExtension(name);
          return;
        }
        const originIdentifier = eventsFunctionsExtension.getOriginIdentifier();
        const extensionShortHeader =
          extensionShortHeadersByName[originIdentifier];
        if (!extensionShortHeader) {
          console.warn(
            `This extension was downloaded from the store but its reference ${originIdentifier} couldn't be found in the store. Opening the extension in the editor...`
          );
          onOpenEventsFunctionsExtension(name);
          return;
        }
        setOpenedExtensionShortHeader(extensionShortHeader);
        setOpenedExtensionName(name);
      },
      [onOpenEventsFunctionsExtension]
    );

    const onProjectPropertiesApplied = React.useCallback(
      (options: { newName?: string }) => {
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }

        if (options.newName) {
          onChangeProjectName(options.newName);
        }
        setProjectPropertiesDialogOpen(false);
      },
      [unsavedChanges, onChangeProjectName]
    );

    const onRequestSearch = () => {
      /* Do nothing for now, but we could open the first result. */
    };

    const setProjectFirstLayout = React.useCallback(
      (layoutName: string) => {
        project.setFirstLayout(layoutName);
        forceUpdate();
      },
      [project, forceUpdate]
    );

    const onCreateNewExtension = React.useCallback(
      (project: gdProject, i18n: I18nType) => {
        const newExtensionName = addEventsFunctionsExtension(
          project.getEventsFunctionsExtensionsCount(),
          i18n
        );
        onOpenEventsFunctionsExtension(newExtensionName);
        setExtensionsSearchDialogOpen(false);
      },
      [addEventsFunctionsExtension, onOpenEventsFunctionsExtension]
    );

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

    const onOpenGamesDashboardDialog = gameMatchingProjectUuid
      ? () => setOpenGameDetails(true)
      : null;

    return (
      <I18n>
        {({ i18n }) => (
          <div style={styles.container} id="project-manager">
            <ProjectManagerCommands
              project={project}
              onOpenProjectProperties={openProjectProperties}
              onOpenProjectLoadingScreen={openProjectLoadingScreen}
              onOpenProjectVariables={openProjectVariables}
              onOpenResourcesDialog={onOpenResources}
              onOpenPlatformSpecificAssetsDialog={onOpenPlatformSpecificAssets}
              onOpenSearchExtensionDialog={openSearchExtensionDialog}
            />
            <div style={styles.searchBarContainer}>
              <Paper background="dark" square style={styles.searchBarPaper}>
                <SearchBar
                  ref={searchBarRef}
                  value={searchText}
                  onRequestSearch={onRequestSearch}
                  onChange={setSearchText}
                  placeholder={t`Search in project`}
                />
              </Paper>
            </div>
            <List>
              <ProjectStructureItem
                id={getProjectManagerItemId('game-settings')}
                primaryText={<Trans>Game settings</Trans>}
                renderNestedItems={() => [
                  <ListItem
                    id={getProjectManagerItemId('game-properties')}
                    key="properties"
                    primaryText={<Trans>Properties</Trans>}
                    leftIcon={<Settings />}
                    onClick={openProjectProperties}
                    noPadding
                  />,
                  <ListItem
                    id={getProjectManagerItemId('game-icons')}
                    key="icons"
                    primaryText={<Trans>Icons and thumbnail</Trans>}
                    leftIcon={<Picture />}
                    onClick={onOpenPlatformSpecificAssets}
                    noPadding
                  />,
                  <GamesDashboardInfo
                    onShareProject={onShareProject}
                    onOpenGamesDashboardDialog={onOpenGamesDashboardDialog}
                    key="manage"
                  />,
                ]}
              />
              <ProjectStructureItem
                id={getProjectManagerItemId('project-settings')}
                primaryText={<Trans>Project settings</Trans>}
                renderNestedItems={() => [
                  <ListItem
                    id={getProjectManagerItemId('global-variables')}
                    key="global-variables"
                    primaryText={<Trans>Global variables</Trans>}
                    leftIcon={<Publish />}
                    onClick={openProjectVariables}
                    noPadding
                  />,
                  <ListItem
                    id={getProjectManagerItemId('game-resources')}
                    key="resources"
                    primaryText={<Trans>Resources</Trans>}
                    leftIcon={<ProjectResources />}
                    onClick={onOpenResources}
                    noPadding
                  />,
                ]}
              />
              <ProjectStructureItem
                id={getProjectManagerItemId('scenes')}
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
                        onEdit={() => onOpenLayout(name)}
                        onDelete={() => onDeleteLayout(layout)}
                        addLabel={t`Add a new scene`}
                        onAdd={() => addLayout(i, i18n)}
                        onRename={newName => {
                          onRenameLayout(name, newName);
                          onEditName(null, '');
                        }}
                        onEditName={() => onEditName('layout', name)}
                        onCopy={() => copyLayout(layout)}
                        onCut={() => cutLayout(layout)}
                        onPaste={() => pasteLayout(i)}
                        onDuplicate={() => duplicateLayout(layout, i)}
                        canPaste={() => Clipboard.has(LAYOUT_CLIPBOARD_KIND)}
                        canMoveUp={i !== 0}
                        onMoveUp={() => moveUpLayout(i)}
                        canMoveDown={i !== project.getLayoutsCount() - 1}
                        onMoveDown={() => moveDownLayout(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForScenes,
                          onBeginDrag: () => {
                            draggedLayoutIndexRef.current = i;
                          },
                          onDrop: () => {
                            dropOnLayout(i);
                          },
                        }}
                        buildExtraMenuTemplate={(i18n: I18nType) => [
                          {
                            label: i18n._(t`Edit scene properties`),
                            enabled: true,
                            click: () => onOpenLayoutProperties(layout),
                          },
                          {
                            label: i18n._(t`Edit scene variables`),
                            enabled: true,
                            click: () => onOpenLayoutVariables(layout),
                          },
                          {
                            label: i18n._(t`Set as start scene`),
                            enabled: name !== firstLayoutName,
                            click: () => setProjectFirstLayout(name),
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
                            addLayout(project.getLayoutsCount(), i18n)
                          }
                          primaryText={<Trans>Add scene</Trans>}
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getProjectManagerItemId('extensions')}
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
                          onEditEventsFunctionExtensionOrSeeDetails(
                            extensionShortHeadersByName,
                            eventsFunctionsExtension,
                            name
                          )
                        }
                        onDelete={() =>
                          onDeleteEventsFunctionsExtension(
                            eventsFunctionsExtension
                          )
                        }
                        onAdd={() => {
                          addEventsFunctionsExtension(i, i18n);
                        }}
                        onRename={newName => {
                          onRenameEventsFunctionsExtension(name, newName);
                          onEditName(null, '');
                        }}
                        onEditName={() =>
                          onEditName('events-functions-extension', name)
                        }
                        onCopy={() =>
                          copyEventsFunctionsExtension(eventsFunctionsExtension)
                        }
                        onCut={() =>
                          cutEventsFunctionsExtension(eventsFunctionsExtension)
                        }
                        onPaste={() => pasteEventsFunctionsExtension(i)}
                        onDuplicate={() =>
                          duplicateEventsFunctionsExtension(
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
                        onMoveUp={() => moveUpEventsFunctionsExtension(i)}
                        canMoveDown={
                          i !== project.getEventsFunctionsExtensionsCount() - 1
                        }
                        onMoveDown={() => moveDownEventsFunctionsExtension(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExtensions,
                          onBeginDrag: () => {
                            draggedExtensionIndexRef.current = i;
                          },
                          onDrop: () => {
                            dropOnExtension(i);
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
                          onClick={openSearchExtensionDialog}
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getProjectManagerItemId('external-events')}
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
                        onEdit={() => onOpenExternalEvents(name)}
                        onDelete={() => onDeleteExternalEvents(externalEvents)}
                        addLabel={t`Add new external events`}
                        onAdd={() => addExternalEvents(i, i18n)}
                        onRename={newName => {
                          onRenameExternalEvents(name, newName);
                          onEditName(null, '');
                        }}
                        onEditName={() => onEditName('external-events', name)}
                        onCopy={() => copyExternalEvents(externalEvents)}
                        onCut={() => cutExternalEvents(externalEvents)}
                        onPaste={() => pasteExternalEvents(i)}
                        onDuplicate={() =>
                          duplicateExternalEvents(externalEvents, i)
                        }
                        canPaste={() =>
                          Clipboard.has(EXTERNAL_EVENTS_CLIPBOARD_KIND)
                        }
                        canMoveUp={i !== 0}
                        onMoveUp={() => moveUpExternalEvents(i)}
                        canMoveDown={i !== project.getExternalEventsCount() - 1}
                        onMoveDown={() => moveDownExternalEvents(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExternalEvents,
                          onBeginDrag: () => {
                            draggedExternalEventsIndexRef.current = i;
                          },
                          onDrop: () => {
                            dropOnExternalEvents(i);
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
                            addExternalEvents(
                              project.getExternalEventsCount(),
                              i18n
                            )
                          }
                        />,
                      ]),
                ]}
              />
              <ProjectStructureItem
                id={getProjectManagerItemId('external-layouts')}
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
                        onEdit={() => onOpenExternalLayout(name)}
                        onDelete={() => onDeleteExternalLayout(externalLayout)}
                        addLabel={t`Add a new external layout`}
                        onAdd={() => addExternalLayout(i, i18n)}
                        onRename={newName => {
                          onRenameExternalLayout(name, newName);
                          onEditName(null, '');
                        }}
                        onEditName={() => onEditName('external-layout', name)}
                        onCopy={() => copyExternalLayout(externalLayout)}
                        onCut={() => cutExternalLayout(externalLayout)}
                        onPaste={() => pasteExternalLayout(i)}
                        onDuplicate={() =>
                          duplicateExternalLayout(externalLayout, i)
                        }
                        canPaste={() =>
                          Clipboard.has(EXTERNAL_LAYOUT_CLIPBOARD_KIND)
                        }
                        canMoveUp={i !== 0}
                        onMoveUp={() => moveUpExternalLayout(i)}
                        canMoveDown={
                          i !== project.getExternalLayoutsCount() - 1
                        }
                        onMoveDown={() => moveDownExternalLayout(i)}
                        dragAndDropProps={{
                          DragSourceAndDropTarget: DragSourceAndDropTargetForExternalLayouts,
                          onBeginDrag: () => {
                            draggedExternalLayoutIndexRef.current = i;
                          },
                          onDrop: () => {
                            dropOnExternalLayout(i);
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
                            addExternalLayout(
                              project.getExternalLayoutsCount(),
                              i18n
                            )
                          }
                        />,
                      ]),
                ]}
              />
            </List>
            {projectVariablesEditorOpen && (
              <VariablesEditorDialog
                project={project}
                title={<Trans>Global Variables</Trans>}
                open
                variablesContainer={project.getVariables()}
                onCancel={() => setProjectVariablesEditorOpen(false)}
                onApply={() => {
                  if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
                  setProjectVariablesEditorOpen(false);
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
                hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                onComputeAllVariableNames={() =>
                  EventsRootVariablesFinder.findAllGlobalVariables(
                    project.getCurrentPlatform(),
                    project
                  )
                }
              />
            )}
            {projectPropertiesDialogOpen && (
              <ProjectPropertiesDialog
                open
                initialTab={projectPropertiesDialogInitialTab}
                project={project}
                onClose={() => setProjectPropertiesDialogOpen(false)}
                onApply={onSaveProjectProperties}
                onPropertiesApplied={onProjectPropertiesApplied}
                resourceManagementProps={resourceManagementProps}
                hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                i18n={i18n}
              />
            )}
            {!!editedPropertiesLayout && (
              <ScenePropertiesDialog
                open
                layout={editedPropertiesLayout}
                project={project}
                onApply={() => {
                  if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
                  onOpenLayoutProperties(null);
                }}
                onClose={() => onOpenLayoutProperties(null)}
                onEditVariables={() => {
                  onOpenLayoutVariables(editedPropertiesLayout);
                  onOpenLayoutProperties(null);
                }}
                resourceManagementProps={resourceManagementProps}
              />
            )}
            {!!editedVariablesLayout && (
              <SceneVariablesDialog
                open
                project={project}
                layout={editedVariablesLayout}
                onClose={() => onOpenLayoutVariables(null)}
                onApply={() => {
                  if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
                  onOpenLayoutVariables(null);
                }}
                hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
              />
            )}
            {extensionsSearchDialogOpen && (
              <ExtensionsSearchDialog
                project={project}
                onClose={() => setExtensionsSearchDialogOpen(false)}
                onInstallExtension={onInstallExtension}
                onCreateNew={() => {
                  onCreateNewExtension(project, i18n);
                }}
              />
            )}
            {openedExtensionShortHeader && openedExtensionName && (
              <InstalledExtensionDetails
                project={project}
                onClose={() => {
                  setOpenedExtensionShortHeader(null);
                  setOpenedExtensionName(null);
                }}
                onOpenEventsFunctionsExtension={onOpenEventsFunctionsExtension}
                extensionShortHeader={openedExtensionShortHeader}
                extensionName={openedExtensionName}
                onInstallExtension={onInstallExtension}
              />
            )}
            {openGameDetails && gameMatchingProjectUuid && (
              <GameDetailsDialog
                project={project}
                analyticsSource="projectManager"
                game={gameMatchingProjectUuid}
                onClose={() => setOpenGameDetails(false)}
                onGameDeleted={() => {
                  setOpenGameDetails(false);
                  fetchGames();
                }}
                onGameUpdated={() => {
                  fetchGames();
                }}
              />
            )}
          </div>
        )}
      </I18n>
    );
  },
  (prevProps, nextProps) => nextProps.freezeUpdate
);

const ProjectManagerWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Project manager</Trans>}
    scope="project-manager"
  >
    <ProjectManager {...props} />
  </ErrorBoundary>
);

export default ProjectManagerWithErrorBoundary;
