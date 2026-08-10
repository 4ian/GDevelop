// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import {
  type EventsSheetInterface,
  type EventsSheetSelectionSnapshot,
} from '../EventsSheet';
import EventsFunctionEditor, {
  editableEventsFunctionCapabilities,
} from './EventsFunctionEditor';
import { type GameplayTestsCallbacks } from '../GameplayTests/GameplayTestRunner';
import EditorMosaic, {
  type EditorMosaicNode,
  type EditorMosaicInterface,
  type Editor,
  mosaicContainsNode,
} from '../UI/EditorMosaic';
import EmptyMessage from '../UI/EmptyMessage';
import EventsFunctionConfigurationEditor, {
  type EventsFunctionConfigurationEditorInterface,
} from './EventsFunctionConfigurationEditor';
import EventsFunctionsListWithErrorBoundary, {
  type EventsFunctionsListInterface,
} from '../EventsFunctionsList';
import { addFunctionsListToggleButtonToToolbar } from '../EventsFunctionsList/FunctionsListToggleButton';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import { type EventsBasedObjectCreationParameters } from '../EventsFunctionsList/EventsBasedObjectTreeViewItemContent';
import Background from '../UI/Background';
import OptionsEditorDialog from './OptionsEditorDialog';
import {
  EventsBasedBehaviorOrObjectEditor,
  type EventsBasedBehaviorOrObjectEditorInterface,
} from './EventsBasedBehaviorOrObjectEditor';
import EventsBasedBehaviorOrObjectEditorDialog from './EventsBasedBehaviorOrObjectEditor/EventsBasedBehaviorOrObjectEditorDialog';
import EventsBasedBehaviorEditor from './EventsBasedBehaviorOrObjectEditor/EventsBasedBehaviorEditor';
import { EventsBasedBehaviorOrObjectPropertiesEditor } from './EventsBasedBehaviorOrObjectEditor/EventsBasedBehaviorOrObjectPropertiesEditor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import BehaviorMethodSelectorDialog from './BehaviorMethodSelectorDialog';
import ObjectMethodSelectorDialog from './ObjectMethodSelectorDialog';
import ExtensionFunctionSelectorDialog from './ExtensionFunctionSelectorDialog';
import EventsBasedObjectSelectorDialog from './EventsBasedObjectSelectorDialog';
import {
  ensureOnSignalBehaviorEventsFunctionProperParameters,
  ensureOnSignalObjectEventsFunctionProperParameters,
} from './OnSignalEventsFunctionParameters';
import { ResponsiveWindowMeasurer } from '../UI/Responsive/ResponsiveWindowMeasurer';
import EditorNavigator, {
  type EditorNavigatorInterface,
} from '../UI/EditorMosaic/EditorNavigator';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { ParametersIndexOffsets } from '../EventsFunctionsExtensionsLoader';
import { sendEventsExtractedAsFunction } from '../Utils/Analytics/EventSender';
import { ToolbarGroup } from '../UI/Toolbar';
import IconButton from '../UI/IconButton';
import ExtensionEditIcon from '../UI/CustomSvgIcons/ExtensionEdit';
import SettingsIcon from '../UI/CustomSvgIcons/Settings';
import Tune from '../UI/CustomSvgIcons/Tune';
import Mark from '../UI/CustomSvgIcons/Mark';
import newNameGenerator from '../Utils/NewNameGenerator';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import GlobalAndSceneVariablesDialog from '../VariablesList/GlobalAndSceneVariablesDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import PropertyListEditor, {
  type PropertyListEditorInterface,
} from './PropertyListEditor';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { Tabs } from '../UI/Tabs';
import type { EventPath } from '../Utils/EventPath';
import type { SearchFilterParams } from '../Utils/Search';
import { type VariableDialogOpeningProps } from '../VariablesList/VariablesEditorDialog';
import VariablesList from '../VariablesList/VariablesList';

const gd: libGDevelop = global.gd;

type ExtensionFunctionEventsOutsideEditorChanges = {|
  extensionName: string,
  parentKind: 'extension' | 'behavior' | 'object',
  parentName: string | null,
  functionName: string,
  newOrChangedAiGeneratedEventIds: Set<string>,
|};

export type ExtensionItemConfigurationAttribute =
  | 'type'
  | 'isPrivate'
  | 'isAsync'
  | 'isDeprecated';

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  setToolbar: (?React.Node) => void,
  resourceManagementProps: ResourceManagementProps,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction,
    editorIdentifier:
      | 'scene-events-editor'
      | 'extension-events-editor'
      | 'external-events-editor'
  ) => Promise<void>,
  onBehaviorEdited?: () => void | Promise<void>,
  onObjectEdited?: () => void | Promise<void>,
  onFunctionEdited?: () => void | Promise<void>,
  initiallyFocusedFunctionName: ?string,
  initiallyFocusedBehaviorName: ?string,
  initiallyFocusedObjectName: ?string,
  focusedEventsBasedBehavior?: ?gdEventsBasedBehavior,
  focusedEventsFunction?: ?gdEventsFunction,
  initiallyOpenSettingsDialog?: boolean,
  dialogOnly?: boolean,
  onBehaviorSettingsDialogClose?: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onOpenCustomObjectEditor: (gdEventsBasedObject) => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onRenamedEventsBasedObject: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    oldName: string,
    newName: string
  ) => void,
  onDeletedEventsBasedObject: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    name: string
  ) => void,
  onEventBasedObjectTypeChanged: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  gameplayTestsCallbacks: GameplayTestsCallbacks,
|};

type DetailSettingsTab = 'properties' | 'private-variables' | 'configuration';
type DetailPropertySelection = {|
  propertyName: string,
  isSharedProperties: boolean,
|};

type State = {|
  selectedEventsFunction: ?gdEventsFunction,
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  editedEventsBasedBehavior: ?gdEventsBasedBehavior,
  selectedEventsBasedObject: ?gdEventsBasedObject,
  editedEventsBasedObject: ?gdEventsBasedObject,
  editOptionsDialogOpen: boolean,
  behaviorMethodSelectorDialogOpen: boolean,
  objectMethodSelectorDialogOpen: boolean,
  extensionFunctionSelectorDialogOpen: boolean,
  eventsBasedObjectSelectorDialogOpen: boolean,
  variablesEditorOpen: { isGlobalTabInitiallyOpen: boolean } | null,
  eventsBasedEntityPropertiesDialogOpen: VariableDialogOpeningProps | null,
  onAddEventsFunctionCb: ?(
    parameters: ?EventsFunctionCreationParameters
  ) => void,
  onAddEventsBasedObjectCb: ?(
    parameters: ?EventsBasedObjectCreationParameters
  ) => void,
  parametersDialogOpen: boolean,
  detailSettingsDialogOpen: boolean,
  detailSettingsTab: DetailSettingsTab,
  selectedDetailProperty: ?DetailPropertySelection,
|};

const extensionEditIconReactNode = <ExtensionEditIcon />;

const styles = {
  centeredContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  behaviorDetailIntroduction: {
    maxWidth: 640,
  },
  detailSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  detailSettingsConfiguration: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: '0 16px 16px 16px',
  },
  detailSettingsConfigurationContent: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  detailSettingsPrivateVariables: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    padding: '8px 16px 16px 16px',
  },
  detailSettingsProperties: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  detailSettingsSidebar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 300px',
    minWidth: 260,
    maxWidth: 360,
    minHeight: 0,
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
  },
  detailSettingsSidebarHeader: {
    padding: '8px 16px',
  },
  detailSettingsDetail: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
    padding: '8px 16px 16px 16px',
  },
};

// The event based object editor is hidden in releases
// because it's not handled by GDJS.
const getInitialMosaicEditorNodes = (): EditorMosaicNode => ({
  direction: 'row',
  first: 'functions-list',
  second: {
    direction: 'row',
    first: 'events-sheet',
    second: 'parameters',
    splitPercentage: 80,
  },
  splitPercentage: 20,
});

const getDetailMosaicEditorNodes = (): EditorMosaicNode => ({
  direction: 'row',
  first: 'functions-list',
  second: 'events-sheet',
  splitPercentage: 20,
});

const getFirstPropertySelection = (
  properties: gdPropertiesContainer,
  isSharedProperties: boolean
): ?DetailPropertySelection => {
  const allPropertyFolderOrProperties =
    properties.getAllPropertyFolderOrProperty();
  for (let index = 0; index < allPropertyFolderOrProperties.size(); index++) {
    const propertyFolderOrProperty = allPropertyFolderOrProperties.at(index);
    if (!propertyFolderOrProperty.isFolder()) {
      return {
        propertyName: propertyFolderOrProperty.getProperty().getName(),
        isSharedProperties,
      };
    }
  }

  return null;
};

const isPropertySelectionValid = (
  properties: gdPropertiesContainer,
  selectedProperty: ?DetailPropertySelection,
  isSharedProperties: boolean
): boolean => {
  if (
    !selectedProperty ||
    selectedProperty.isSharedProperties !== isSharedProperties
  ) {
    return false;
  }

  const allPropertyFolderOrProperties =
    properties.getAllPropertyFolderOrProperty();
  for (let index = 0; index < allPropertyFolderOrProperties.size(); index++) {
    const propertyFolderOrProperty = allPropertyFolderOrProperties.at(index);
    if (
      !propertyFolderOrProperty.isFolder() &&
      propertyFolderOrProperty.getProperty().getName() ===
        selectedProperty.propertyName
    ) {
      return true;
    }
  }

  return false;
};

export default class EventsFunctionsExtensionEditor extends React.Component<
  Props,
  State,
> {
  // $FlowFixMe[missing-local-annot]
  state = {
    selectedEventsFunction: null,
    selectedEventsBasedBehavior: null,
    editedEventsBasedBehavior: null,
    selectedEventsBasedObject: null,
    editedEventsBasedObject: null,
    editOptionsDialogOpen: false,
    behaviorMethodSelectorDialogOpen: false,
    objectMethodSelectorDialogOpen: false,
    extensionFunctionSelectorDialogOpen: false,
    eventsBasedObjectSelectorDialogOpen: false,
    variablesEditorOpen: null,
    eventsBasedEntityPropertiesDialogOpen: null,
    onAddEventsFunctionCb: null,
    onAddEventsBasedObjectCb: null,
    parametersDialogOpen: false,
    detailSettingsDialogOpen: false,
    detailSettingsTab: 'properties',
    selectedDetailProperty: null,
  };
  editor: ?EventsSheetInterface;
  eventsFunctionList: ?EventsFunctionsListInterface;
  eventsBasedBehaviorEditor: ?EventsBasedBehaviorOrObjectEditorInterface;
  eventsBasedObjectEditor: ?EventsBasedBehaviorOrObjectEditorInterface;
  propertyListEditor: ?PropertyListEditorInterface;
  detailPropertyListEditor: ?PropertyListEditorInterface;
  eventsFunctionConfigurationEditor: ?EventsFunctionConfigurationEditorInterface;
  _editorMosaic: ?EditorMosaicInterface;
  _editorNavigator: ?EditorNavigatorInterface;
  // Create an empty "context" of objects.
  // Avoid recreating containers if they were already created, so that
  // we keep the same objects in memory and avoid remounting components
  // (like ObjectGroupsList) because objects "ptr" changed.
  /** An empty list for when one is asked */
  _globalObjectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  /** The objects from function parameters. */
  _objectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Function
  );
  _parameterVariablesContainer: gdVariablesContainer =
    new gd.VariablesContainer(gd.VariablesContainer.Parameters);
  _propertyVariablesContainer: gdVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Properties
  );
  _parameterResourcesContainer: gdResourcesContainer =
    new gd.ResourcesContainer(gd.ResourcesContainer.Parameters);
  _propertyResourcesContainer: gdResourcesContainer = new gd.ResourcesContainer(
    gd.ResourcesContainer.Properties
  );
  _behaviorVariablesContainerBeingEdited: ?gdVariablesContainer = null;
  _behaviorVariablesSnapshot: ?gdSerializerElement = null;
  _projectScopedContainersAccessor: ProjectScopedContainersAccessor | null =
    null;

  _normalizeOnSignalEventsFunctionParameters = (): boolean => {
    const { eventsFunctionsExtension } = this.props;
    let hasChanged = false;

    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    for (let i = 0; i < eventsBasedObjects.getCount(); ++i) {
      hasChanged =
        ensureOnSignalObjectEventsFunctionProperParameters(
          eventsFunctionsExtension,
          eventsBasedObjects.getAt(i)
        ) || hasChanged;
    }

    const eventsBasedBehaviors =
      eventsFunctionsExtension.getEventsBasedBehaviors();
    for (let i = 0; i < eventsBasedBehaviors.getCount(); ++i) {
      hasChanged =
        ensureOnSignalBehaviorEventsFunctionProperParameters(
          eventsFunctionsExtension,
          eventsBasedBehaviors.getAt(i)
        ) || hasChanged;
    }

    return hasChanged;
  };

  componentDidMount() {
    if (
      this._normalizeOnSignalEventsFunctionParameters() &&
      this.props.unsavedChanges
    ) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }

    if (!this.props.dialogOnly) {
      if (this.props.focusedEventsBasedBehavior) {
        if (this.props.initiallyFocusedFunctionName) {
          this.selectEventsFunctionByName(
            this.props.initiallyFocusedFunctionName,
            this.props.focusedEventsBasedBehavior.getName(),
            null
          );
        } else {
          this._selectFirstEventsFunctionOrBehaviorConfiguration(
            this.props.focusedEventsBasedBehavior
          );
        }
      } else if (this.props.focusedEventsFunction) {
        this._selectEventsFunction(
          this.props.focusedEventsFunction,
          null,
          null
        );
      } else if (this.props.initiallyFocusedFunctionName) {
        this.selectEventsFunctionByName(
          this.props.initiallyFocusedFunctionName,
          this.props.initiallyFocusedBehaviorName,
          this.props.initiallyFocusedObjectName
        );
      } else if (this.props.initiallyFocusedBehaviorName) {
        this.selectEventsBasedBehaviorByName(
          this.props.initiallyFocusedBehaviorName
        );
      } else if (this.props.initiallyFocusedObjectName) {
        this.selectEventsBasedObjectByName(
          this.props.initiallyFocusedObjectName
        );
      }
    }
    if (this.props.initiallyOpenSettingsDialog) {
      this.openBehaviorSettingsDialog();
    }
  }

  componentWillUnmount() {
    this._applyBehaviorVariablesRefactoring();
    if (this._globalObjectsContainer) this._globalObjectsContainer.delete();
    if (this._objectsContainer) this._objectsContainer.delete();
    if (this._parameterVariablesContainer)
      this._parameterVariablesContainer.delete();
    if (this._propertyVariablesContainer)
      this._propertyVariablesContainer.delete();
    if (this._parameterResourcesContainer)
      this._parameterResourcesContainer.delete();
    if (this._propertyResourcesContainer)
      this._propertyResourcesContainer.delete();
  }

  _updateProjectScopedContainer = () => {
    this._updateProjectScopedContainerFrom({
      eventsFunction: this.state.selectedEventsFunction,
      eventsBasedBehavior: this.state.selectedEventsBasedBehavior,
      eventsBasedObject: this.state.selectedEventsBasedObject,
    });
  };

  _updateProjectScopedContainerFrom = ({
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunction,
  }: {|
    eventsBasedBehavior?: ?gdEventsBasedBehavior,
    eventsBasedObject?: ?gdEventsBasedObject,
    eventsFunction?: ?gdEventsFunction,
  |}) => {
    const scope = {
      project: this.props.project,
      layout: null,
      externalEvents: null,
      eventsFunctionsExtension: this.props.eventsFunctionsExtension,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunction,
    };
    this._projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      // $FlowFixMe[incompatible-type]
      scope,
      this._objectsContainer,
      this._parameterVariablesContainer,
      this._propertyVariablesContainer,
      this._parameterResourcesContainer,
      this._propertyResourcesContainer
    );
  };

  updateToolbar = () => {
    if (this.editor) {
      // If the scene editor is open, let it handle the toolbar.
      this.editor.updateToolbar();
    } else if (this.props.focusedEventsBasedBehavior) {
      // Behavior detail pages expose behavior settings from the left panel.
      this._setToolbar(null);
    } else {
      // Otherwise, show the extension settings buttons.
      this._setToolbar(
        <ToolbarGroup lastChild>
          <IconButton
            size="small"
            color="default"
            onClick={this._editOptions}
            tooltip={t`Open extension settings`}
          >
            <ExtensionEditIcon />
          </IconButton>
        </ToolbarGroup>
      );
    }
  };

  _isFunctionsListCollapsed = (): boolean =>
    !!this._editorMosaic &&
    this._editorMosaic.isEditorCollapsed('functions-list');

  _toggleFunctionsList = (): boolean => {
    const editorMosaic = this._editorMosaic;
    if (!editorMosaic) {
      if (this._editorNavigator) {
        this._editorNavigator.openEditor('functions-list');
      }
      return false;
    }

    const isCollapsed = this._isFunctionsListCollapsed();
    if (isCollapsed) {
      editorMosaic.uncollapseEditor('functions-list', 20);
    } else {
      editorMosaic.collapseEditor('functions-list');
    }
    return !isCollapsed;
  };

  _setToolbar = (editorToolbar: ?React.Node): void => {
    this.props.setToolbar(
      addFunctionsListToggleButtonToToolbar(editorToolbar, {
        isFunctionsListCollapsed: this._isFunctionsListCollapsed,
        onToggleFunctionsList: this._toggleFunctionsList,
      })
    );
  };

  setGlobalSearchResults = (
    eventPaths: Array<EventPath>,
    focusedEventPath: EventPath,
    searchText: string,
    searchFilters?: SearchFilterParams
  ) => {
    if (this.editor) {
      this.editor.setGlobalSearchResults(
        eventPaths,
        focusedEventPath,
        searchText,
        searchFilters
      );
    }
  };

  clearGlobalSearchResults = () => {
    if (this.editor) {
      this.editor.clearGlobalSearchResults();
    }
  };

  scrollToEventPath = (eventPath: EventPath) => {
    if (this.editor) {
      this.editor.scrollToEventPath(eventPath);
    }
  };

  selectAllEvents = () => {
    if (this.editor) {
      this.editor.selectAllEvents();
    }
  };

  onExtensionFunctionEventsModifiedOutsideEditor = (
    changes: ExtensionFunctionEventsOutsideEditorChanges
  ) => {
    const {
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
    } = this.state;

    if (this.props.eventsFunctionsExtension.getName() !== changes.extensionName)
      return;
    if (
      !selectedEventsFunction ||
      selectedEventsFunction.getName() !== changes.functionName
    )
      return;

    if (changes.parentKind === 'behavior') {
      if (
        !selectedEventsBasedBehavior ||
        selectedEventsBasedBehavior.getName() !== changes.parentName
      )
        return;
    } else if (changes.parentKind === 'object') {
      if (
        !selectedEventsBasedObject ||
        selectedEventsBasedObject.getName() !== changes.parentName
      )
        return;
    } else if (selectedEventsBasedBehavior || selectedEventsBasedObject) {
      return;
    }

    if (this.editor) {
      this.editor.onEventsModifiedOutsideEditor({
        newOrChangedAiGeneratedEventIds:
          changes.newOrChangedAiGeneratedEventIds,
      });
    }
  };

  getEditorSelectionSnapshot = (): ?EventsSheetSelectionSnapshot => {
    return this.editor ? this.editor.getEditorSelectionSnapshot() : null;
  };

  _getFirstEventsFunctionInFolder = (
    functionFolderOrFunction: gdFunctionFolderOrFunction
  ): ?gdEventsFunction => {
    for (
      let childIndex = 0;
      childIndex < functionFolderOrFunction.getChildrenCount();
      childIndex++
    ) {
      const child = functionFolderOrFunction.getChildAt(childIndex);
      if (!child.isFolder()) {
        return child.getFunction();
      }
      const firstEventsFunction = this._getFirstEventsFunctionInFolder(child);
      if (firstEventsFunction) {
        return firstEventsFunction;
      }
    }

    return null;
  };

  _selectFirstEventsFunctionOrBehaviorConfiguration = (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => {
    const firstEventsFunction = this._getFirstEventsFunctionInFolder(
      eventsBasedBehavior.getEventsFunctions().getRootFolder()
    );
    if (firstEventsFunction) {
      this._selectEventsFunction(
        firstEventsFunction,
        eventsBasedBehavior,
        null
      );
    } else {
      this._selectEventsBasedBehavior(eventsBasedBehavior);
    }
  };

  selectEventsFunctionByName = (
    functionName: string,
    behaviorName: ?string,
    objectName: ?string
  ) => {
    const { eventsFunctionsExtension } = this.props;

    if (behaviorName) {
      // Behavior function
      const eventsBasedBehaviors =
        eventsFunctionsExtension.getEventsBasedBehaviors();
      if (eventsBasedBehaviors.has(behaviorName)) {
        const eventsBasedBehavior = eventsBasedBehaviors.get(behaviorName);
        const behaviorEventsFunctions =
          eventsBasedBehavior.getEventsFunctions();
        if (behaviorEventsFunctions.hasEventsFunctionNamed(functionName)) {
          this._selectEventsFunction(
            behaviorEventsFunctions.getEventsFunction(functionName),
            eventsBasedBehavior,
            null
          );
        }
      }
    } else if (objectName) {
      const eventsBasedObjects =
        eventsFunctionsExtension.getEventsBasedObjects();
      if (eventsBasedObjects.has(objectName)) {
        const eventsBasedObject = eventsBasedObjects.get(objectName);
        const eventsFunctions = eventsBasedObject.getEventsFunctions();
        if (eventsFunctions.hasEventsFunctionNamed(functionName)) {
          this._selectEventsFunction(
            eventsFunctions.getEventsFunction(functionName),
            null,
            eventsBasedObject
          );
        }
      }
    } else {
      // Free function
      const eventsFunctions = eventsFunctionsExtension.getEventsFunctions();
      if (eventsFunctions.hasEventsFunctionNamed(functionName)) {
        this._selectEventsFunction(
          eventsFunctions.getEventsFunction(functionName),
          null,
          null
        );
      }
    }
  };

  _selectEventsFunction = (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject,
    onSelected?: () => void
  ) => {
    this.onSelectionChanged(null, null);
    if (!selectedEventsFunction) {
      this.setState(
        {
          selectedEventsFunction: null,
          selectedEventsBasedBehavior,
          selectedEventsBasedObject,
        },
        () => this.updateToolbar()
      );
      return;
    }

    // Users may have change a function declaration.
    // Reload metadata just in case.
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }

    this._updateProjectScopedContainerFrom({
      eventsFunction: selectedEventsFunction,
      eventsBasedBehavior: selectedEventsBasedBehavior,
      eventsBasedObject: selectedEventsBasedObject,
    });
    this.setState(
      {
        selectedEventsFunction,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
      },
      () => {
        this.updateToolbar();

        if (this._editorMosaic) {
          // The `parameters` side panel may have been collapsed from
          // a previous release.
          this._editorMosaic.uncollapseEditor('parameters', 25);
        }
        if (this._editorNavigator) {
          // Open the parameters of the function if it's a new, empty function.
          if (
            selectedEventsFunction &&
            !selectedEventsFunction.getEvents().getEventsCount()
          ) {
            // $FlowFixMe[incompatible-use]
            this._editorNavigator.openEditor('parameters');
          } else {
            // $FlowFixMe[incompatible-use]
            this._editorNavigator.openEditor('events-sheet');
          }
        }
        if (onSelected) onSelected();
      }
    );
  };

  _openEventsFunctionSettings = (
    eventsFunction: gdEventsFunction,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject
  ) => {
    this._selectEventsFunction(
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      () => {
        if (
          this.props.focusedEventsBasedBehavior ||
          this.props.focusedEventsFunction
        ) {
          this._openParametersDialog();
        } else if (this._editorNavigator) {
          this._editorNavigator.openEditor('parameters');
        }
      }
    );
  };

  _makeRenameEventsFunction =
    (i18n: I18nType): any =>
    (
      eventsBasedBehavior: ?gdEventsBasedBehavior,
      eventsBasedObject: ?gdEventsBasedObject,
      eventsFunction: gdEventsFunction,
      newName: string,
      done: (boolean) => void
    ) => {
      if (eventsBasedBehavior) {
        this._renameBehaviorEventsFunction(
          i18n,
          eventsBasedBehavior,
          eventsFunction,
          newName,
          done
        );
      } else if (eventsBasedObject) {
        this._renameObjectEventsFunction(
          i18n,
          eventsBasedObject,
          eventsFunction,
          newName,
          done
        );
      } else {
        this._renameFreeEventsFunction(i18n, eventsFunction, newName, done);
      }
    };

  _renameFreeEventsFunction = (
    i18n: I18nType,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: (boolean) => void
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    const oldName = eventsFunction.getName();
    const oldFullName = eventsFunction.getFullName();

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      (tentativeNewName) => {
        if (
          gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
            tentativeNewName
          ) ||
          eventsFunctionsExtension
            .getEventsFunctions()
            .hasEventsFunctionNamed(tentativeNewName)
        ) {
          return true;
        }

        return false;
      }
    );

    gd.WholeProjectRefactorer.renameEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsFunction.getName(),
      safeAndUniqueNewName
    );
    eventsFunction.setName(safeAndUniqueNewName);
    if (!oldFullName || oldFullName === oldName) {
      eventsFunction.setFullName(safeAndUniqueNewName);
    }

    done(true);
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }
  };

  _renameBehaviorEventsFunction = (
    i18n: I18nType,
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: (boolean) => void
  ) => {
    const oldName = eventsFunction.getName();
    const oldFullName = eventsFunction.getFullName();
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      (tentativeNewName) => {
        if (
          gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
            tentativeNewName
          ) ||
          eventsBasedBehavior
            .getEventsFunctions()
            .hasEventsFunctionNamed(tentativeNewName)
        ) {
          return true;
        }

        return false;
      }
    );

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameBehaviorEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      eventsFunction.getName(),
      safeAndUniqueNewName
    );
    eventsFunction.setName(safeAndUniqueNewName);
    if (!oldFullName || oldFullName === oldName) {
      eventsFunction.setFullName(safeAndUniqueNewName);
    }

    done(true);
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }
  };

  _renameObjectEventsFunction = (
    i18n: I18nType,
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: (boolean) => void
  ) => {
    const oldName = eventsFunction.getName();
    const oldFullName = eventsFunction.getFullName();
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      (tentativeNewName) => {
        if (
          gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
            tentativeNewName
          ) ||
          tentativeNewName === 'onSignal' ||
          eventsBasedObject
            .getEventsFunctions()
            .hasEventsFunctionNamed(tentativeNewName)
        ) {
          return true;
        }

        return false;
      }
    );

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameObjectEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      eventsFunction.getName(),
      safeAndUniqueNewName
    );
    eventsFunction.setName(safeAndUniqueNewName);
    if (!oldFullName || oldFullName === oldName) {
      eventsFunction.setFullName(safeAndUniqueNewName);
    }

    done(true);
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }
  };

  _makeMoveFreeEventsParameter =
    (i18n: I18nType): any =>
    (
      eventsFunction: gdEventsFunction,
      oldIndex: number,
      newIndex: number,
      done: (boolean) => void
    ) => {
      // Don't ask for user confirmation as this change is easy to revert.

      const { project, eventsFunctionsExtension } = this.props;
      gd.WholeProjectRefactorer.moveEventsFunctionParameter(
        project,
        eventsFunctionsExtension,
        eventsFunction.getName(),
        oldIndex + ParametersIndexOffsets.FreeFunction,
        newIndex + ParametersIndexOffsets.FreeFunction
      );

      done(true);
    };

  _makeMoveBehaviorEventsParameter =
    (i18n: I18nType): any =>
    (
      eventsBasedBehavior: gdEventsBasedBehavior,
      eventsFunction: gdEventsFunction,
      oldIndex: number,
      newIndex: number,
      done: (boolean) => void
    ) => {
      // Don't ask for user confirmation as this change is easy to revert.

      const { project, eventsFunctionsExtension } = this.props;
      gd.WholeProjectRefactorer.moveBehaviorEventsFunctionParameter(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        eventsFunction.getName(),
        oldIndex,
        newIndex
      );

      done(true);
    };

  _makeMoveObjectEventsParameter =
    (i18n: I18nType): any =>
    (
      eventsBasedObject: gdEventsBasedObject,
      eventsFunction: gdEventsFunction,
      oldIndex: number,
      newIndex: number,
      done: (boolean) => void
    ) => {
      // Don't ask for user confirmation as this change is easy to revert.

      const { project, eventsFunctionsExtension } = this.props;
      gd.WholeProjectRefactorer.moveObjectEventsFunctionParameter(
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        eventsFunction.getName(),
        oldIndex,
        newIndex
      );

      done(true);
    };

  _onDeleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    cb: (boolean) => void
  ) => {
    if (
      this.state.selectedEventsFunction &&
      // $FlowFixMe[incompatible-exact]
      gd.compare(eventsFunction, this.state.selectedEventsFunction)
    ) {
      this._selectEventsFunction(null, null, null);
    }

    cb(true);
  };

  selectEventsBasedBehaviorByName = (behaviorName: string) => {
    const { eventsFunctionsExtension } = this.props;
    const eventsBasedBehaviorsList =
      eventsFunctionsExtension.getEventsBasedBehaviors();
    if (eventsBasedBehaviorsList.has(behaviorName)) {
      this._selectEventsBasedBehavior(
        eventsBasedBehaviorsList.get(behaviorName)
      );
    }
  };

  selectEventsBasedObjectByName = (eventBasedObjectName: string) => {
    const { eventsFunctionsExtension } = this.props;
    const eventsBasedObjectsList =
      eventsFunctionsExtension.getEventsBasedObjects();
    if (eventsBasedObjectsList.has(eventBasedObjectName)) {
      this._selectEventsBasedObject(
        eventsBasedObjectsList.get(eventBasedObjectName)
      );
    }
  };

  onSelectionChanged = (
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => {
    this._editBehavior(selectedEventsBasedBehavior);
    this._editObject(selectedEventsBasedObject);
  };

  _selectEventsBasedBehavior = (
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior
  ) => {
    this.onSelectionChanged(selectedEventsBasedBehavior, null);
    this._updateProjectScopedContainerFrom({
      eventsBasedBehavior: selectedEventsBasedBehavior,
    });
    this.setState(
      {
        selectedEventsBasedBehavior,
        selectedEventsFunction: null,
        selectedEventsBasedObject: null,
      },
      () => {
        this.updateToolbar();
        if (this._editorMosaic) {
          // The `parameters` side panel may have been collapsed from
          // a previous release.
          this._editorMosaic.uncollapseEditor('parameters', 25);
        }
        if (selectedEventsBasedBehavior) {
          if (this._editorNavigator) {
            this._editorNavigator.openEditor('events-sheet');
          }
        }
      }
    );
  };

  _selectEventsBasedObject = (
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => {
    this.onSelectionChanged(null, selectedEventsBasedObject);
    this._updateProjectScopedContainerFrom({
      eventsBasedObject: selectedEventsBasedObject,
    });
    this.setState(
      {
        selectedEventsBasedObject,
        selectedEventsFunction: null,
        selectedEventsBasedBehavior: null,
      },
      () => {
        this.updateToolbar();
        if (this._editorMosaic) {
          // The `parameters` side panel may have been collapsed from
          // a previous release.
          this._editorMosaic.uncollapseEditor('parameters', 25);
        }
        if (selectedEventsBasedObject) {
          if (this._editorNavigator)
            this._editorNavigator.openEditor('events-sheet');
        }
      }
    );
  };

  _makeRenameEventsBasedBehavior =
    (i18n: I18nType): any =>
    (
      eventsBasedBehavior: gdEventsBasedBehavior,
      newName: string,
      done: (boolean) => void
    ) => {
      const { project, eventsFunctionsExtension } = this.props;
      const oldName = eventsBasedBehavior.getName();
      const oldFullName = eventsBasedBehavior.getFullName();
      const safeAndUniqueNewName = newNameGenerator(
        gd.Project.getSafeName(newName),
        (tentativeNewName) => {
          if (
            eventsFunctionsExtension
              .getEventsBasedBehaviors()
              .has(tentativeNewName)
          ) {
            return true;
          }

          return false;
        }
      );

      gd.WholeProjectRefactorer.renameEventsBasedBehavior(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior.getName(),
        safeAndUniqueNewName
      );
      eventsBasedBehavior.setName(safeAndUniqueNewName);
      if (!oldFullName || oldFullName === oldName) {
        eventsBasedBehavior.setFullName(safeAndUniqueNewName);
      }

      done(true);
    };

  _makeRenameEventsBasedObject =
    (i18n: I18nType): any =>
    (
      eventsBasedObject: gdEventsBasedObject,
      newName: string,
      done: (boolean) => void
    ) => {
      const { project, eventsFunctionsExtension, onRenamedEventsBasedObject } =
        this.props;
      const oldName = eventsBasedObject.getName();
      const oldFullName = eventsBasedObject.getFullName();
      const safeAndUniqueNewName = newNameGenerator(
        gd.Project.getSafeName(newName),
        (tentativeNewName) => {
          if (
            eventsFunctionsExtension
              .getEventsBasedObjects()
              .has(tentativeNewName)
          ) {
            return true;
          }

          return false;
        }
      );

      gd.WholeProjectRefactorer.renameEventsBasedObject(
        project,
        eventsFunctionsExtension,
        eventsBasedObject.getName(),
        safeAndUniqueNewName
      );
      eventsBasedObject.setName(safeAndUniqueNewName);
      if (!oldFullName || oldFullName === oldName) {
        eventsBasedObject.setFullName(safeAndUniqueNewName);
      }

      done(true);
      onRenamedEventsBasedObject(
        eventsFunctionsExtension,
        oldName,
        safeAndUniqueNewName
      );
    };

  _onEventsBasedBehaviorPasted = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    sourceExtensionName: string,
    sourceEventsBasedBehaviorName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    if (eventsFunctionsExtension.getName() !== sourceExtensionName) {
      gd.WholeProjectRefactorer.updateExtensionNameInEventsBasedBehavior(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        sourceExtensionName
      );
    }
    if (eventsBasedBehavior.getName() !== sourceEventsBasedBehaviorName) {
      gd.WholeProjectRefactorer.updateBehaviorNameInEventsBasedBehavior(
        project,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        sourceEventsBasedBehaviorName
      );
    }
  };

  // Gameplay tests: delegate to the MainFrame-provided callbacks, bound to
  // this extension (its name is the tests "scope").
  _onOpenGameplayTest = (testName: string) => {
    this.props.gameplayTestsCallbacks.onOpenGameplayTest(
      {
        type: 'extension',
        extensionName: this.props.eventsFunctionsExtension.getName(),
      },
      testName
    );
  };

  _onRenameGameplayTest = (oldName: string, newName: string) => {
    this.props.gameplayTestsCallbacks.onRenameGameplayTest(
      {
        type: 'extension',
        extensionName: this.props.eventsFunctionsExtension.getName(),
      },
      oldName,
      newName
    );
    if (this.eventsFunctionList) this.eventsFunctionList.forceUpdateList();
  };

  _onDeleteGameplayTest = (test: gdTest) => {
    this.props.gameplayTestsCallbacks.onDeleteGameplayTest(
      {
        type: 'extension',
        extensionName: this.props.eventsFunctionsExtension.getName(),
      },
      test
    );
  };

  _onRunGameplayTest = (testName: string) => {
    this.props.gameplayTestsCallbacks.onRunGameplayTest(
      {
        type: 'extension',
        extensionName: this.props.eventsFunctionsExtension.getName(),
      },
      testName
    );
  };

  _onEventsBasedObjectPasted = (
    eventsBasedObject: gdEventsBasedObject,
    sourceExtensionName: string,
    sourceEventsBasedObjectName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    if (eventsFunctionsExtension.getName() !== sourceExtensionName) {
      gd.WholeProjectRefactorer.updateExtensionNameInEventsBasedObject(
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        sourceExtensionName
      );
    }
    if (eventsBasedObject.getName() !== sourceEventsBasedObjectName) {
      gd.WholeProjectRefactorer.updateObjectNameInEventsBasedObject(
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        sourceEventsBasedObjectName
      );
    }
    // Some custom object instances may target the pasted event-based object name.
    // It can happen when an event-based object is deleted and another one is
    // pasted to replace it.
    this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject);
  };

  _onEventsBasedBehaviorRenamed = () => {
    // Name of a behavior changed, so notify parent
    // that a behavior was edited (to trigger reload of extensions)
    if (this.props.onBehaviorEdited) {
      this.props.onBehaviorEdited();
    }

    // Reload the selected events function, if any, as the behavior was
    // changed so objects containers need to be re-created (otherwise,
    // objects from objects containers will still refer to the old behavior name,
    // done before the call to gd.WholeProjectRefactorer.renameEventsBasedBehavior).
    if (this.state.selectedEventsFunction) {
      this._updateProjectScopedContainer();
    }
  };

  _onEventsBasedBehaviorMetadataChanged = () => {
    if (this.props.onBehaviorEdited) {
      this.props.onBehaviorEdited();
    }
  };

  _onEventsBasedObjectRenamed = (eventsBasedObject: gdEventsBasedObject) => {
    // Name of an object changed, so notify parent
    // that an object was edited (to trigger reload of extensions)
    if (this.props.onObjectEdited) {
      this.props.onObjectEdited();
    }

    // Reload the selected events function, if any, as the parent-object was
    // changed so child-objects containers need to be re-created (otherwise,
    // child-objects from child-objects containers will still refer to the old parent-object name,
    // done before the call to gd.WholeProjectRefactorer.renameEventsBasedObject).
    if (this.state.selectedEventsFunction) {
      this._updateProjectScopedContainer();
    }
    // Some custom object instances may target the new event-based object name.
    // It can happen when an event-based object is deleted and another one is
    // renamed to replace it.
    this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
  };

  _onEventsBasedObjectMetadataChanged = () => {
    // Object metadata is cached in the platform extension registry. Refresh it
    // immediately after adding, deleting, pasting or changing visibility so
    // object choosers do not keep showing a stale list until the editor closes.
    if (this.props.onObjectEdited) {
      this.props.onObjectEdited();
    }
    this.props.onEventBasedObjectTypeChanged();
  };

  _onDeleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: (boolean) => void
  ) => {
    if (
      this.state.selectedEventsBasedBehavior &&
      // $FlowFixMe[incompatible-exact]
      gd.compare(eventsBasedBehavior, this.state.selectedEventsBasedBehavior)
    ) {
      this._selectEventsBasedBehavior(null);
    }

    cb(true);
  };

  _onDeleteEventsBasedObject = (
    eventsBasedObject: gdEventsBasedObject,
    cb: (boolean) => void
  ) => {
    if (
      this.state.selectedEventsBasedObject &&
      // $FlowFixMe[incompatible-exact]
      gd.compare(eventsBasedObject, this.state.selectedEventsBasedObject)
    ) {
      this._selectEventsBasedObject(null);
    }

    cb(true);

    const {
      eventsFunctionsExtension,
      onDeletedEventsBasedObject,
      onEventsBasedObjectChildrenEdited,
    } = this.props;
    onDeletedEventsBasedObject(
      eventsFunctionsExtension,
      eventsBasedObject.getName()
    );
    onEventsBasedObjectChildrenEdited(eventsBasedObject);
  };

  _onCloseExtensionFunctionSelectorDialog = (
    parameters: ?EventsFunctionCreationParameters
  ) => {
    const { onAddEventsFunctionCb } = this.state;
    this.setState(
      {
        extensionFunctionSelectorDialogOpen: false,
        onAddEventsFunctionCb: null,
      },
      () => {
        if (onAddEventsFunctionCb) onAddEventsFunctionCb(parameters);
      }
    );
  };

  _onCloseEventsBasedObjectSelectorDialog = (
    parameters: ?EventsBasedObjectCreationParameters
  ) => {
    const { onAddEventsBasedObjectCb } = this.state;
    this.setState(
      {
        eventsBasedObjectSelectorDialogOpen: false,
        onAddEventsBasedObjectCb: null,
      },
      () => {
        if (onAddEventsBasedObjectCb) onAddEventsBasedObjectCb(parameters);
      }
    );
  };

  _onAddEventsBasedObject = (
    onAddEventsBasedObjectCb: (
      parameters: ?EventsBasedObjectCreationParameters
    ) => void
  ) => {
    this.setState({
      eventsBasedObjectSelectorDialogOpen: true,
      onAddEventsBasedObjectCb,
    });
  };

  _onAddEventsFunction = (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    if (eventsBasedBehavior) {
      this._onAddBehaviorEventsFunction(
        eventsBasedBehavior,
        onAddEventsFunctionCb
      );
    } else if (eventsBasedObject) {
      this._onAddObjectEventsFunction(eventsBasedObject, onAddEventsFunctionCb);
    } else {
      this._onAddFreeEventsFunction(onAddEventsFunctionCb);
    }
  };

  _onAddFreeEventsFunction = (
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      extensionFunctionSelectorDialogOpen: true,
      onAddEventsFunctionCb,
    });
  };

  _onAddBehaviorEventsFunction = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      behaviorMethodSelectorDialogOpen: true,
      onAddEventsFunctionCb: (parameters) => {
        onAddEventsFunctionCb(parameters);
        this._onBehaviorEventsFunctionAdded(eventsBasedBehavior);
      },
    });
  };

  _onAddObjectEventsFunction = (
    eventsBasedObject: gdEventsBasedObject,
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      objectMethodSelectorDialogOpen: true,
      onAddEventsFunctionCb: (parameters) => {
        onAddEventsFunctionCb(parameters);
        this._onObjectEventsFunctionAdded(eventsBasedObject);
      },
    });
  };

  _onCloseBehaviorMethodSelectorDialog = (
    parameters: ?EventsFunctionCreationParameters
  ) => {
    const { onAddEventsFunctionCb } = this.state;
    this.setState(
      {
        behaviorMethodSelectorDialogOpen: false,
        onAddEventsFunctionCb: null,
      },
      () => {
        if (onAddEventsFunctionCb) onAddEventsFunctionCb(parameters);
      }
    );
  };

  _onCloseObjectMethodSelectorDialog = (
    parameters: ?EventsFunctionCreationParameters
  ) => {
    const { onAddEventsFunctionCb } = this.state;
    this.setState(
      {
        objectMethodSelectorDialogOpen: false,
        onAddEventsFunctionCb: null,
      },
      () => {
        if (onAddEventsFunctionCb) onAddEventsFunctionCb(parameters);
      }
    );
  };

  _onEventsFunctionAdded = (
    selectedEventsFunction: gdEventsFunction,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject
  ) => {
    if (eventsBasedBehavior) {
      this._onBehaviorEventsFunctionAdded(eventsBasedBehavior);
    } else if (eventsBasedObject) {
      this._onObjectEventsFunctionAdded(eventsBasedObject);
    }
  };

  _onEventsFunctionMetadataChanged = () => {
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }
  };

  _onBehaviorEventsFunctionAdded = (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => {
    // This will create the mandatory parameters for the newly added function.
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedBehavior
    );
    ensureOnSignalBehaviorEventsFunctionProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedBehavior
    );
  };

  _onObjectEventsFunctionAdded = (eventsBasedObject: gdEventsBasedObject) => {
    // This will create the mandatory parameters for the newly added function.
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedObject
    );
    ensureOnSignalObjectEventsFunctionProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedObject
    );
  };

  _notifyBehaviorPropertiesUpdated = () => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    if (this.props.onBehaviorEdited) {
      this.props.onBehaviorEdited();
    }
  };

  _notifyObjectPropertiesUpdated = () => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    if (this.props.onObjectEdited) {
      this.props.onObjectEdited();
    }
  };

  _onBehaviorPropertyRenamed = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    oldName: string,
    newName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsBasedBehaviorProperty(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      oldName,
      newName
    );
    this._notifyBehaviorPropertiesUpdated();
  };

  _onBehaviorSharedPropertyRenamed = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    oldName: string,
    newName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsBasedBehaviorSharedProperty(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      oldName,
      newName
    );
    this._notifyBehaviorPropertiesUpdated();
  };

  _onObjectPropertyRenamed = (
    eventsBasedObject: gdEventsBasedObject,
    oldName: string,
    newName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsBasedObjectProperty(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      oldName,
      newName
    );
    this._notifyObjectPropertiesUpdated();
  };

  _onFunctionParameterWillBeRenamed = (
    eventsFunction: gdEventsFunction,
    oldName: string,
    newName: string
  ) => {
    if (!this._projectScopedContainersAccessor) {
      return;
    }
    const projectScopedContainers = this._projectScopedContainersAccessor.get();
    const { project } = this.props;
    gd.WholeProjectRefactorer.renameParameter(
      project,
      projectScopedContainers,
      eventsFunction,
      this._objectsContainer,
      oldName,
      newName
    );
  };

  _onFunctionParameterChangedOfType = (
    eventsFunction: gdEventsFunction,
    parameterName: string
  ) => {
    if (!this._projectScopedContainersAccessor) {
      return;
    }
    const projectScopedContainers = this._projectScopedContainersAccessor.get();
    const { project } = this.props;
    gd.WholeProjectRefactorer.changeParameterType(
      project,
      projectScopedContainers,
      eventsFunction,
      this._objectsContainer,
      parameterName
    );
  };

  _editOptions = (open: boolean = true) => {
    this.setState({
      editOptionsDialogOpen: open,
    });
  };

  _editVariables = (
    options: { isGlobalTabInitiallyOpen: boolean } | null = {
      isGlobalTabInitiallyOpen: false,
    }
  ) => {
    this.setState({
      variablesEditorOpen: options,
    });
  };

  _editBehavior = (
    editedEventsBasedBehavior: ?gdEventsBasedBehavior,
    onDone?: () => void
  ) => {
    this.setState(
      (state) => {
        // If we're closing the properties of a behavior, ensure parameters
        // are up-to-date in all event functions of the behavior (the object
        // type might have changed).
        if (state.editedEventsBasedBehavior && !editedEventsBasedBehavior) {
          gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
            this.props.eventsFunctionsExtension,
            state.editedEventsBasedBehavior
          );
        }

        return {
          editedEventsBasedBehavior,
        };
      },
      async () => {
        // TODO: Is this logic the same as in _onEventsBasedBehaviorRenamed?

        if (!editedEventsBasedBehavior) {
          // If we're closing the properties of a behavior, notify parent
          // that a behavior was edited (to trigger reload of extensions)
          if (this.props.onBehaviorEdited) {
            await this.props.onBehaviorEdited();

            // Once extensions are reloaded, ensure the project stays valid by
            // filling any invalid required behavior property in the objects
            // of the project.
            //
            // We need to do that as "required behavior" properties may have been
            // added (or the type of the required behavior changed) in the dialog.
            gd.WholeProjectRefactorer.fixInvalidRequiredBehaviorProperties(
              this.props.project
            );
          }

          // Reload the selected events function, if any, as the behavior was
          // changed so objects containers need to be re-created. Notably, the
          // type of the object that is handled by the behavior may have changed.
          if (this.state.selectedEventsFunction) {
            this._updateProjectScopedContainer();
          }
        }
        if (onDone) onDone();
      }
    );
  };

  _editObject = (editedEventsBasedObject: ?gdEventsBasedObject) => {
    this.setState(
      (state) => {
        // If we're closing the properties of an object, ensure parameters
        // are up-to-date in all event functions of the object.
        if (state.editedEventsBasedObject && !editedEventsBasedObject) {
          gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
            this.props.eventsFunctionsExtension,
            state.editedEventsBasedObject
          );
        }

        return {
          editedEventsBasedObject,
        };
      },
      async () => {
        // TODO: Is this logic the same as in _onEventsBasedObjectRenamed?

        if (!editedEventsBasedObject) {
          // If we're closing the properties of a object, notify parent
          // that a object was edited (to trigger reload of extensions)
          if (this.props.onObjectEdited) {
            await this.props.onObjectEdited();
          }

          // Reload the selected events function, if any, as the object was
          // changed so objects containers need to be re-created. Notably, the
          // type of the object that is handled by the object may have changed.
          if (this.state.selectedEventsFunction) {
            this._updateProjectScopedContainer();
          }
        }
      }
    );
  };

  _onEditorNavigatorEditorChanged = (editorName: string) => {
    // It's important that this method is the same across renders,
    // to avoid confusing EditorNavigator into thinking it's changed
    // and immediately calling it, which would trigger an infinite loop.
    // Search for "callback-prevent-infinite-rerendering" in the codebase.

    this.updateToolbar();

    if (editorName === 'behaviors-list') {
      this._selectEventsBasedBehavior(null);
    } else if (
      editorName === 'free-functions-list' ||
      editorName === 'behavior-functions-list'
    ) {
      this._selectEventsFunction(null, this.state.selectedEventsBasedBehavior);
    }
  };

  _onConfigurationUpdated = (
    attribute: ?ExtensionItemConfigurationAttribute
  ) => {
    if (
      attribute === 'type' ||
      attribute === 'isPrivate' ||
      attribute === 'isAsync'
    ) {
      // Force an update to ensure the icon of the edited function is updated.
      this.forceUpdate();
    }

    // Do nothing otherwise to avoid costly and useless extra renders.
  };

  onBeginCreateEventsFunction = () => {
    sendEventsExtractedAsFunction({
      step: 'begin',
      parentEditor: 'extension-events-editor',
    });
  };

  onCreateEventsFunction = async (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    await this.props.onCreateEventsFunction(
      extensionName,
      eventsFunction,
      'extension-events-editor'
    );
  };

  _editEventsFunctionParameter = (props: VariableDialogOpeningProps) => {
    if (!this.eventsFunctionConfigurationEditor) {
      return;
    }
    this.eventsFunctionConfigurationEditor.editEventsFunctionParameter(props);
  };

  _openEventsBasedEntityPropertyEditorDialog = (
    props: VariableDialogOpeningProps
  ) => {
    this.setState({
      eventsBasedEntityPropertiesDialogOpen: props,
    });
  };

  _openParametersDialog = () => {
    if (!this.state.selectedEventsFunction) {
      return;
    }
    this.setState({ parametersDialogOpen: true });
  };

  _closeParametersDialog = () => {
    this.setState({ parametersDialogOpen: false });
  };

  _getFirstBehaviorPropertySelection = (
    eventsBasedBehavior: gdEventsBasedBehavior
  ): ?DetailPropertySelection => {
    const behaviorPropertySelection = getFirstPropertySelection(
      eventsBasedBehavior.getPropertyDescriptors(),
      false
    );
    if (behaviorPropertySelection) {
      return behaviorPropertySelection;
    }

    return getFirstPropertySelection(
      eventsBasedBehavior.getSharedPropertyDescriptors(),
      true
    );
  };

  _isBehaviorPropertySelectionValid = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    selectedProperty: ?DetailPropertySelection
  ): boolean => {
    return (
      isPropertySelectionValid(
        eventsBasedBehavior.getPropertyDescriptors(),
        selectedProperty,
        false
      ) ||
      isPropertySelectionValid(
        eventsBasedBehavior.getSharedPropertyDescriptors(),
        selectedProperty,
        true
      )
    );
  };

  _syncDetailPropertyListSelection = () => {
    const { selectedDetailProperty } = this.state;
    if (!selectedDetailProperty || !this.detailPropertyListEditor) {
      return;
    }

    this.detailPropertyListEditor.setSelectedProperty(
      selectedDetailProperty.propertyName,
      selectedDetailProperty.isSharedProperties
    );
  };

  _selectDetailProperty = (
    propertyName: string,
    isSharedProperties: boolean
  ) => {
    this.setState(
      {
        selectedDetailProperty: {
          propertyName,
          isSharedProperties,
        },
      },
      this._syncDetailPropertyListSelection
    );
  };

  _ensureDetailPropertySelection = (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => {
    if (
      this._isBehaviorPropertySelectionValid(
        eventsBasedBehavior,
        this.state.selectedDetailProperty
      )
    ) {
      return;
    }

    this.setState(
      {
        selectedDetailProperty:
          this._getFirstBehaviorPropertySelection(eventsBasedBehavior),
      },
      this._syncDetailPropertyListSelection
    );
  };

  _setDetailSettingsTab = (detailSettingsTab: DetailSettingsTab) => {
    this.setState({ detailSettingsTab }, () => {
      if (
        detailSettingsTab === 'properties' &&
        this.props.focusedEventsBasedBehavior
      ) {
        this._ensureDetailPropertySelection(
          this.props.focusedEventsBasedBehavior
        );
        this._syncDetailPropertyListSelection();
      }
    });
  };

  openBehaviorSettingsDialog = () => {
    this._openDetailSettingsDialog();
  };

  _startEditingBehaviorVariables = () => {
    this._applyBehaviorVariablesRefactoring();

    const focusedEventsBasedBehavior = this.props.focusedEventsBasedBehavior;
    if (!focusedEventsBasedBehavior) return;

    const variablesContainer = focusedEventsBasedBehavior.getVariables();
    variablesContainer.resetPersistentUuid();
    const snapshot = new gd.SerializerElement();
    variablesContainer.serializeTo(snapshot);
    this._behaviorVariablesContainerBeingEdited = variablesContainer;
    this._behaviorVariablesSnapshot = snapshot;
  };

  _applyBehaviorVariablesRefactoring = () => {
    const snapshot = this._behaviorVariablesSnapshot;
    if (!snapshot) return;

    const variablesContainer = this._behaviorVariablesContainerBeingEdited;
    if (!variablesContainer) {
      snapshot.delete();
      this._behaviorVariablesContainerBeingEdited = null;
      this._behaviorVariablesSnapshot = null;
      return;
    }

    try {
      const changeset =
        gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
          snapshot,
          variablesContainer
        );
      gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
        this.props.project,
        variablesContainer,
        changeset,
        snapshot
      );
    } finally {
      variablesContainer.clearPersistentUuid();
      snapshot.delete();
      this._behaviorVariablesContainerBeingEdited = null;
      this._behaviorVariablesSnapshot = null;
    }
  };

  _openDetailSettingsDialog = () => {
    const focusedEventsBasedBehavior = this.props.focusedEventsBasedBehavior;
    if (!focusedEventsBasedBehavior) {
      return;
    }

    this._editBehavior(focusedEventsBasedBehavior);
    this._startEditingBehaviorVariables();
    this.setState(
      {
        detailSettingsDialogOpen: true,
        detailSettingsTab: 'properties',
        selectedDetailProperty: this._getFirstBehaviorPropertySelection(
          focusedEventsBasedBehavior
        ),
      },
      this._syncDetailPropertyListSelection
    );
  };

  _closeDetailSettingsDialog = () => {
    this._applyBehaviorVariablesRefactoring();
    this.setState({ detailSettingsDialogOpen: false }, () => {
      this._editBehavior(null, this.props.onBehaviorSettingsDialogClose);
    });
  };

  _makeDetailProjectScopedContainersAccessor =
    (): ?ProjectScopedContainersAccessor => {
      if (!this.props.focusedEventsBasedBehavior) {
        return null;
      }

      return new ProjectScopedContainersAccessor(
        {
          project: this.props.project,
          layout: null,
          externalEvents: null,
          eventsFunctionsExtension: this.props.eventsFunctionsExtension,
          eventsBasedBehavior: this.props.focusedEventsBasedBehavior,
          eventsBasedObject: null,
          eventsFunction: null,
        },
        this._objectsContainer,
        this._parameterVariablesContainer,
        this._propertyVariablesContainer,
        this._parameterResourcesContainer,
        this._propertyResourcesContainer
      );
    };

  render(): any {
    const { project, eventsFunctionsExtension } = this.props;

    const {
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
      editOptionsDialogOpen,
      behaviorMethodSelectorDialogOpen,
      objectMethodSelectorDialogOpen,
      extensionFunctionSelectorDialogOpen,
      eventsBasedObjectSelectorDialogOpen,
      variablesEditorOpen,
      eventsBasedEntityPropertiesDialogOpen,
      parametersDialogOpen,
      detailSettingsDialogOpen,
      detailSettingsTab,
      selectedDetailProperty,
    } = this.state;
    const { focusedEventsBasedBehavior, focusedEventsFunction } = this.props;
    const isBehaviorDetailMode = !!focusedEventsBasedBehavior;
    const isFunctionDetailMode = !!focusedEventsFunction;
    const isDetailMode = isBehaviorDetailMode || isFunctionDetailMode;
    const detailSettingsProjectScopedContainersAccessor =
      detailSettingsDialogOpen
        ? this._makeDetailProjectScopedContainersAccessor()
        : null;

    const scope = {
      project,
      layout: null,
      externalEvents: null,
      eventsFunctionsExtension,
      eventsBasedBehavior: selectedEventsBasedBehavior,
      eventsBasedObject: selectedEventsBasedObject,
      eventsFunction: selectedEventsFunction,
    };

    const selectedEventsBasedEntity =
      selectedEventsBasedBehavior || selectedEventsBasedObject;

    const isLifecycleEventsFunction =
      !!selectedEventsFunction &&
      (selectedEventsBasedBehavior
        ? gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
            selectedEventsFunction.getName()
          )
        : selectedEventsBasedObject
        ? gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
            selectedEventsFunction.getName()
          )
        : gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
            selectedEventsFunction.getName()
          ));

    const editors: {
      [string]: Editor,
    } = {
      parameters: {
        type: 'primary',
        title: selectedEventsFunction
          ? t`Function Configuration`
          : t`Properties`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <Background maxWidth>
                {selectedEventsFunction &&
                this._objectsContainer &&
                this._projectScopedContainersAccessor ? (
                  <EventsFunctionConfigurationEditor
                    ref={(ref) =>
                      (this.eventsFunctionConfigurationEditor = ref)
                    }
                    project={project}
                    projectScopedContainersAccessor={
                      this._projectScopedContainersAccessor
                    }
                    eventsFunction={selectedEventsFunction}
                    eventsBasedBehavior={selectedEventsBasedBehavior}
                    eventsBasedObject={selectedEventsBasedObject}
                    eventsFunctionsContainer={
                      (selectedEventsBasedEntity &&
                        selectedEventsBasedEntity.getEventsFunctions()) ||
                      eventsFunctionsExtension.getEventsFunctions()
                    }
                    eventsFunctionsExtension={eventsFunctionsExtension}
                    globalObjectsContainer={
                      selectedEventsBasedObject
                        ? selectedEventsBasedObject.getObjects()
                        : null
                    }
                    objectsContainer={this._objectsContainer}
                    onConfigurationUpdated={this._onConfigurationUpdated}
                    helpPagePath={
                      selectedEventsBasedObject
                        ? '/behaviors/events-based-objects'
                        : selectedEventsBasedBehavior
                          ? '/behaviors/events-based-behaviors'
                          : '/events/functions'
                    }
                    onParametersOrGroupsUpdated={() => {
                      this._updateProjectScopedContainer();
                      this.forceUpdate();
                    }}
                    onMoveFreeEventsParameter={this._makeMoveFreeEventsParameter(
                      i18n
                    )}
                    onMoveBehaviorEventsParameter={this._makeMoveBehaviorEventsParameter(
                      i18n
                    )}
                    onMoveObjectEventsParameter={this._makeMoveObjectEventsParameter(
                      i18n
                    )}
                    onFunctionParameterWillBeRenamed={
                      this._onFunctionParameterWillBeRenamed
                    }
                    onFunctionParameterTypeChanged={
                      this._onFunctionParameterChangedOfType
                    }
                    parameterLayout={isDetailMode ? 'split' : undefined}
                    onWillInstallExtension={this.props.onWillInstallExtension}
                    onExtensionInstalled={this.props.onExtensionInstalled}
                    unsavedChanges={this.props.unsavedChanges}
                  />
                ) : (selectedEventsBasedObject ||
                    selectedEventsBasedBehavior) &&
                  this._projectScopedContainersAccessor ? (
                  <PropertyListEditor
                    ref={(ref) => (this.propertyListEditor = ref)}
                    project={project}
                    projectScopedContainersAccessor={
                      this._projectScopedContainersAccessor
                    }
                    extension={eventsFunctionsExtension}
                    eventsBasedBehavior={selectedEventsBasedBehavior}
                    eventsBasedObject={selectedEventsBasedObject}
                    onRenameProperty={(oldName, newName) => {
                      if (selectedEventsBasedBehavior) {
                        this._onBehaviorPropertyRenamed(
                          selectedEventsBasedBehavior,
                          oldName,
                          newName
                        );
                      } else if (selectedEventsBasedObject) {
                        this._onObjectPropertyRenamed(
                          selectedEventsBasedObject,
                          oldName,
                          newName
                        );
                      }
                    }}
                    onPropertiesUpdated={() => {
                      if (selectedEventsBasedBehavior) {
                        this._notifyBehaviorPropertiesUpdated();
                      } else if (selectedEventsBasedObject) {
                        this._notifyObjectPropertiesUpdated();
                      }
                      const eventsBasedEntityEditor =
                        this.eventsBasedBehaviorEditor ||
                        this.eventsBasedObjectEditor;
                      if (eventsBasedEntityEditor) {
                        eventsBasedEntityEditor.forceUpdateProperties();
                      }
                    }}
                    onOpenConfiguration={(propertyName) => {
                      const eventsBasedEntityEditor =
                        this.eventsBasedBehaviorEditor ||
                        this.eventsBasedObjectEditor;
                      if (eventsBasedEntityEditor) {
                        eventsBasedEntityEditor.scrollToConfiguration();
                      }
                    }}
                    onOpenProperty={(propertyName, isSharedProperties) => {
                      const eventsBasedEntityEditor =
                        this.eventsBasedBehaviorEditor ||
                        this.eventsBasedObjectEditor;
                      if (eventsBasedEntityEditor) {
                        eventsBasedEntityEditor.scrollToProperty(
                          propertyName,
                          isSharedProperties
                        );
                      }
                    }}
                    onEventsFunctionsAdded={() => {
                      if (this.eventsFunctionList) {
                        this.eventsFunctionList.forceUpdateList();
                      }
                      if (selectedEventsBasedBehavior) {
                        this._notifyBehaviorPropertiesUpdated();
                      } else if (selectedEventsBasedObject) {
                        this._notifyObjectPropertiesUpdated();
                      }
                    }}
                  />
                ) : (
                  <EmptyMessage>
                    <Trans>
                      Choose a function, or a function of a behavior, to set the
                      parameters that it accepts.
                    </Trans>
                  </EmptyMessage>
                )}
              </Background>
            )}
          </I18n>
        ),
      },
      'events-sheet': {
        type: 'primary',
        noTitleBar:
          !!selectedEventsFunction ||
          (!selectedEventsBasedBehavior && !selectedEventsBasedObject),
        noSoftKeyboardAvoidance: true,
        title: selectedEventsBasedBehavior
          ? isBehaviorDetailMode
            ? t`Behavior introduction`
            : t`Behavior Configuration`
          : selectedEventsBasedObject
            ? t`Object Configuration`
            : null,
        toolbarControls: [],
        renderEditor: () =>
          selectedEventsFunction &&
          this._projectScopedContainersAccessor &&
          this._globalObjectsContainer &&
          this._objectsContainer ? (
            <Background>
              <EventsFunctionEditor
                key={selectedEventsFunction.ptr}
                ref={(editor) => (this.editor = editor)}
                project={project}
                // $FlowFixMe[incompatible-type]
                scope={scope}
                globalObjectsContainer={
                  selectedEventsBasedObject
                    ? selectedEventsBasedObject.getObjects()
                    : this._globalObjectsContainer
                }
                objectsContainer={this._objectsContainer}
                projectScopedContainersAccessor={
                  // $FlowFixMe[incompatible-type]
                  this._projectScopedContainersAccessor
                }
                eventsFunction={selectedEventsFunction}
                capabilities={editableEventsFunctionCapabilities}
                onOpenExternalEvents={() => {}}
                onOpenLayout={() => {}}
                resourceManagementProps={this.props.resourceManagementProps}
                openInstructionOrExpression={
                  this.props.openInstructionOrExpression
                }
                setToolbar={this._setToolbar}
                onBeginCreateEventsFunction={this.onBeginCreateEventsFunction}
                onCreateEventsFunction={this.onCreateEventsFunction}
                onOpenSettings={
                  isDetailMode ? this._openParametersDialog : this._editOptions
                }
                settingsIcon={
                  isDetailMode ? <Tune /> : extensionEditIconReactNode
                }
                settingsTooltip={isDetailMode ? t`Open parameters` : undefined}
                settingsButtonPosition={isDetailMode ? 'start' : undefined}
                unsavedChanges={this.props.unsavedChanges}
                isActive={true}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
                onWillInstallExtension={this.props.onWillInstallExtension}
                onExtensionInstalled={this.props.onExtensionInstalled}
                editEventsFunctionParameter={
                  isLifecycleEventsFunction
                    ? null
                    : this._editEventsFunctionParameter
                }
                openEventsBasedEntityPropertyEditorDialog={
                  selectedEventsBasedEntity
                    ? this._openEventsBasedEntityPropertyEditorDialog
                    : null
                }
              />
            </Background>
          ) : selectedEventsBasedBehavior && isBehaviorDetailMode ? (
            <Background>
              <EmptyMessage>
                <div style={styles.behaviorDetailIntroduction}>
                  <Text size="block-title" align="center" noMargin>
                    <Trans>Behavior introduction</Trans>
                  </Text>
                  <Text align="center" color="secondary">
                    <Trans>
                      Use this page to manage the functions attached to this
                      behavior. Select a function on the left to edit its
                      events, use + to create functions, or open Behavior
                      settings to edit the behavior configuration and
                      properties.
                    </Trans>
                  </Text>
                </div>
              </EmptyMessage>
            </Background>
          ) : selectedEventsBasedBehavior &&
            this._projectScopedContainersAccessor ? (
            <EventsBasedBehaviorOrObjectEditor
              ref={(ref) => (this.eventsBasedBehaviorEditor = ref)}
              project={project}
              projectScopedContainersAccessor={
                this._projectScopedContainersAccessor
              }
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedBehavior={selectedEventsBasedBehavior}
              unsavedChanges={this.props.unsavedChanges}
              onRenameProperty={(oldName, newName) =>
                this._onBehaviorPropertyRenamed(
                  selectedEventsBasedBehavior,
                  oldName,
                  newName
                )
              }
              onRenameSharedProperty={(oldName, newName) =>
                this._onBehaviorSharedPropertyRenamed(
                  selectedEventsBasedBehavior,
                  oldName,
                  newName
                )
              }
              onPropertyTypeChanged={(propertyName) => {
                gd.WholeProjectRefactorer.changeEventsBasedBehaviorPropertyType(
                  project,
                  eventsFunctionsExtension,
                  selectedEventsBasedBehavior,
                  propertyName
                );
                this._notifyBehaviorPropertiesUpdated();
              }}
              onPropertiesUpdated={() => {
                this._notifyBehaviorPropertiesUpdated();
                if (this.propertyListEditor) {
                  this.propertyListEditor.forceUpdateList();
                }
              }}
              onFocusProperty={(propertyName, isSharedProperties) => {
                if (this.propertyListEditor) {
                  this.propertyListEditor.setSelectedProperty(
                    propertyName,
                    isSharedProperties
                  );
                }
              }}
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
                this._notifyBehaviorPropertiesUpdated();
              }}
              onConfigurationUpdated={(attribute) => {
                this._onConfigurationUpdated(attribute);
                this._notifyBehaviorPropertiesUpdated();
              }}
              onOpenCustomObjectEditor={() => {}}
              onEventsBasedObjectChildrenEdited={() => {}}
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          ) : selectedEventsBasedObject &&
            this._projectScopedContainersAccessor ? (
            <EventsBasedBehaviorOrObjectEditor
              ref={(ref) => (this.eventsBasedObjectEditor = ref)}
              project={project}
              projectScopedContainersAccessor={
                this._projectScopedContainersAccessor
              }
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedObject={selectedEventsBasedObject}
              unsavedChanges={this.props.unsavedChanges}
              onRenameProperty={(oldName, newName) =>
                this._onObjectPropertyRenamed(
                  selectedEventsBasedObject,
                  oldName,
                  newName
                )
              }
              onRenameSharedProperty={() => {}}
              onPropertyTypeChanged={(propertyName) => {
                gd.WholeProjectRefactorer.changeEventsBasedObjectPropertyType(
                  project,
                  eventsFunctionsExtension,
                  selectedEventsBasedObject,
                  propertyName
                );
                this._notifyObjectPropertiesUpdated();
              }}
              onPropertiesUpdated={() => {
                this._notifyObjectPropertiesUpdated();
                if (this.propertyListEditor) {
                  this.propertyListEditor.forceUpdateList();
                }
              }}
              onFocusProperty={(propertyName, isSharedProperties) => {
                if (this.propertyListEditor) {
                  this.propertyListEditor.setSelectedProperty(
                    propertyName,
                    isSharedProperties
                  );
                }
              }}
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
                this._notifyObjectPropertiesUpdated();
              }}
              onOpenCustomObjectEditor={() =>
                this.props.onOpenCustomObjectEditor(selectedEventsBasedObject)
              }
              onEventsBasedObjectChildrenEdited={
                this.props.onEventsBasedObjectChildrenEdited
              }
              onConfigurationUpdated={(attribute) => {
                this._onConfigurationUpdated(attribute);
                this._notifyObjectPropertiesUpdated();
              }}
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          ) : (
            <Background>
              <EmptyMessage>
                <Trans>
                  Choose a function, or a function of a behavior, to edit its
                  events.
                </Trans>
              </EmptyMessage>
            </Background>
          ),
      },
      'functions-list': {
        type: 'primary',
        title: t`Functions`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <EventsFunctionsListWithErrorBoundary
                ref={(eventsFunctionList) =>
                  (this.eventsFunctionList = eventsFunctionList)
                }
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                focusedEventsBasedBehavior={focusedEventsBasedBehavior}
                focusedEventsFunction={focusedEventsFunction}
                unsavedChanges={this.props.unsavedChanges}
                forceUpdateEditor={() => this.forceUpdate()}
                // Free functions
                selectedEventsFunction={selectedEventsFunction}
                onSelectEventsFunction={this._selectEventsFunction}
                onOpenEventsFunctionSettings={
                  this._openEventsFunctionSettings
                }
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                onRenameEventsFunction={this._makeRenameEventsFunction(i18n)}
                onAddEventsFunction={this._onAddEventsFunction}
                onEventsFunctionAdded={this._onEventsFunctionAdded}
                onEventsFunctionMetadataChanged={
                  this._onEventsFunctionMetadataChanged
                }
                // Behaviors
                selectedEventsBasedBehavior={selectedEventsBasedBehavior}
                onSelectEventsBasedBehavior={this._selectEventsBasedBehavior}
                onDeleteEventsBasedBehavior={this._onDeleteEventsBasedBehavior}
                onRenameEventsBasedBehavior={this._makeRenameEventsBasedBehavior(
                  i18n
                )}
                onEventsBasedBehaviorRenamed={
                  this._onEventsBasedBehaviorRenamed
                }
                onEventsBasedBehaviorPasted={this._onEventsBasedBehaviorPasted}
                onEventsBasedBehaviorMetadataChanged={
                  this._onEventsBasedBehaviorMetadataChanged
                }
                // Objects
                selectedEventsBasedObject={selectedEventsBasedObject}
                onSelectEventsBasedObject={this._selectEventsBasedObject}
                onDeleteEventsBasedObject={this._onDeleteEventsBasedObject}
                onRenameEventsBasedObject={this._makeRenameEventsBasedObject(
                  i18n
                )}
                onEventsBasedObjectRenamed={this._onEventsBasedObjectRenamed}
                onEventsBasedObjectPasted={this._onEventsBasedObjectPasted}
                onEventsBasedObjectMetadataChanged={
                  this._onEventsBasedObjectMetadataChanged
                }
                onAddEventsBasedObject={this._onAddEventsBasedObject}
                // Gameplay tests
                onOpenGameplayTest={this._onOpenGameplayTest}
                onRenameGameplayTest={this._onRenameGameplayTest}
                onDeleteGameplayTest={this._onDeleteGameplayTest}
                onRunGameplayTest={this._onRunGameplayTest}
                onSelectExtensionProperties={() => this._editOptions(true)}
                onSelectExtensionGlobalVariables={() =>
                  this._editVariables({ isGlobalTabInitiallyOpen: true })
                }
                onSelectExtensionSceneVariables={() => this._editVariables()}
                onOpenCustomObjectEditor={this.props.onOpenCustomObjectEditor}
                headerControls={
                  isBehaviorDetailMode ? (
                    <FlatButton
                      fullWidth
                      label={<Trans>Behavior settings</Trans>}
                      leftIcon={<SettingsIcon />}
                      onClick={this._openDetailSettingsDialog}
                      id="behavior-settings-button"
                    />
                  ) : isFunctionDetailMode ? (
                    <FlatButton
                      fullWidth
                      label={<Trans>Function settings</Trans>}
                      leftIcon={<Tune />}
                      onClick={this._openParametersDialog}
                      id="function-settings-button"
                    />
                  ) : null
                }
              />
            )}
          </I18n>
        ),
      },
    };

    return (
      <React.Fragment>
        {!this.props.dialogOnly && (
          <ResponsiveWindowMeasurer>
            {({ isMobile }) =>
              isMobile ? (
                <EditorNavigator
                  ref={(editorNavigator) =>
                    (this._editorNavigator = editorNavigator)
                  }
                  // $FlowFixMe[incompatible-type]
                  editors={editors}
                  initialEditorName={'functions-list'}
                  transitions={{
                    'events-sheet': {
                      nextIcon: <Tune />,
                      nextLabel: selectedEventsFunction ? (
                        <Trans>Parameters</Trans>
                      ) : (
                        <Trans>Property list</Trans>
                      ),
                      nextEditor: 'parameters',
                      previousEditor: () => {
                        this._selectEventsFunction(null, null, null);
                        return 'functions-list';
                      },
                    },
                    parameters: {
                      nextIcon: <Mark />,
                      nextLabel: selectedEventsFunction ? (
                        <Trans>Validate these parameters</Trans>
                      ) : null,
                      nextEditor: selectedEventsFunction
                        ? 'events-sheet'
                        : null,
                      previousEditor: selectedEventsFunction
                        ? null
                        : () => {
                            if (this.propertyListEditor) {
                              const selection =
                                this.propertyListEditor.getSelectedProperty();
                              if (selection) {
                                const { propertyName, isSharedProperties } =
                                  selection;
                                // Scroll to the selected property.
                                // Ideally, we'd wait for the list to be updated to scroll, but
                                // to simplify the code, we just wait a few ms for a new render
                                // to be done.
                                setTimeout(() => {
                                  const eventsBasedEntityEditor =
                                    this.eventsBasedBehaviorEditor ||
                                    this.eventsBasedObjectEditor;
                                  if (eventsBasedEntityEditor) {
                                    eventsBasedEntityEditor.scrollToProperty(
                                      propertyName,
                                      isSharedProperties
                                    );
                                  }
                                }, 100); // A few ms is enough for a new render to be done.
                              }
                            }
                            return 'events-sheet';
                          },
                    },
                  }}
                  onEditorChanged={
                    // It's important that this callback is the same across renders,
                    // to avoid confusing EditorNavigator into thinking it's changed
                    // and immediately calling it, which would trigger an infinite loop.
                    // Search for "callback-prevent-infinite-rerendering" in the codebase.
                    this._onEditorNavigatorEditorChanged
                  }
                />
              ) : (
                <PreferencesContext.Consumer>
                  {({
                    getDefaultEditorMosaicNode,
                    setDefaultEditorMosaicNode,
                  }) => (
                    <EditorMosaic
                      ref={(editorMosaic) =>
                        (this._editorMosaic = editorMosaic)
                      }
                      // $FlowFixMe[incompatible-type]
                      editors={editors}
                      centralNodeId="events-sheet"
                      onDragOrResizedEnded={this.updateToolbar}
                      onPersistNodes={(node) =>
                        setDefaultEditorMosaicNode(
                          isDetailMode
                            ? 'events-functions-extension-detail-editor'
                            : 'events-functions-extension-editor',
                          node
                        )
                      }
                      initialNodes={(() => {
                        if (isDetailMode) {
                          const defaultNode = getDetailMosaicEditorNodes();
                          const savedNode = getDefaultEditorMosaicNode(
                            'events-functions-extension-detail-editor'
                          );
                          return savedNode &&
                            mosaicContainsNode(savedNode, 'functions-list') &&
                            !mosaicContainsNode(savedNode, 'parameters')
                            ? savedNode
                            : defaultNode;
                        }

                        // Settings from older release may not have the unified
                        // function list.
                        return mosaicContainsNode(
                          getDefaultEditorMosaicNode(
                            'events-functions-extension-editor'
                            // $FlowFixMe[incompatible-type]
                          ) || getInitialMosaicEditorNodes(),
                          'functions-list'
                        )
                          ? getDefaultEditorMosaicNode(
                              'events-functions-extension-editor'
                              // $FlowFixMe[incompatible-type]
                            ) || getInitialMosaicEditorNodes()
                          : // Force the mosaic to reset to default.
                            // $FlowFixMe[incompatible-type]
                            getInitialMosaicEditorNodes();
                      })()}
                    />
                  )}
                </PreferencesContext.Consumer>
              )
            }
          </ResponsiveWindowMeasurer>
        )}
        {editOptionsDialogOpen && (
          <OptionsEditorDialog
            project={project}
            resourceManagementProps={this.props.resourceManagementProps}
            eventsFunctionsExtension={eventsFunctionsExtension}
            open
            onClose={() => this._editOptions(false)}
          />
        )}
        {variablesEditorOpen && project && (
          <GlobalAndSceneVariablesDialog
            isGlobalTabInitiallyOpen={
              variablesEditorOpen.isGlobalTabInitiallyOpen
            }
            projectScopedContainersAccessor={
              new ProjectScopedContainersAccessor({
                project,
                eventsFunctionsExtension,
              })
            }
            open
            onCancel={() => this._editVariables(null)}
            onApply={() => this._editVariables(null)}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            isListLocked={false}
            initiallySelectedVariable={null}
          />
        )}
        {eventsBasedEntityPropertiesDialogOpen &&
          this._projectScopedContainersAccessor &&
          (selectedEventsBasedBehavior ? (
            <EventsBasedBehaviorOrObjectEditorDialog
              initiallySelectedProperty={eventsBasedEntityPropertiesDialogOpen}
              onClose={() => {
                this.setState({
                  eventsBasedEntityPropertiesDialogOpen: null,
                });
              }}
              project={project}
              projectScopedContainersAccessor={
                this._projectScopedContainersAccessor
              }
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedBehavior={selectedEventsBasedBehavior}
              unsavedChanges={this.props.unsavedChanges}
              onRenameProperty={(oldName, newName) =>
                this._onBehaviorPropertyRenamed(
                  selectedEventsBasedBehavior,
                  oldName,
                  newName
                )
              }
              onRenameSharedProperty={(oldName, newName) =>
                this._onBehaviorSharedPropertyRenamed(
                  selectedEventsBasedBehavior,
                  oldName,
                  newName
                )
              }
              onPropertyTypeChanged={(propertyName) => {
                gd.WholeProjectRefactorer.changeEventsBasedBehaviorPropertyType(
                  project,
                  eventsFunctionsExtension,
                  selectedEventsBasedBehavior,
                  propertyName
                );
              }}
              onPropertiesUpdated={() => {
                this.forceUpdate();
              }}
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
              }}
              onConfigurationUpdated={this._onConfigurationUpdated}
              onOpenCustomObjectEditor={() => {}}
              onEventsBasedObjectChildrenEdited={() => {}}
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          ) : selectedEventsBasedObject ? (
            <EventsBasedBehaviorOrObjectEditorDialog
              initiallySelectedProperty={eventsBasedEntityPropertiesDialogOpen}
              onClose={() => {
                this.setState({
                  eventsBasedEntityPropertiesDialogOpen: null,
                });
              }}
              project={project}
              projectScopedContainersAccessor={
                this._projectScopedContainersAccessor
              }
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedObject={selectedEventsBasedObject}
              unsavedChanges={this.props.unsavedChanges}
              onRenameProperty={(oldName, newName) =>
                this._onObjectPropertyRenamed(
                  selectedEventsBasedObject,
                  oldName,
                  newName
                )
              }
              onRenameSharedProperty={() => {}}
              onPropertyTypeChanged={(propertyName) => {
                gd.WholeProjectRefactorer.changeEventsBasedObjectPropertyType(
                  project,
                  eventsFunctionsExtension,
                  selectedEventsBasedObject,
                  propertyName
                );
              }}
              onPropertiesUpdated={() => {
                this.forceUpdate();
              }}
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
              }}
              onOpenCustomObjectEditor={() =>
                this.props.onOpenCustomObjectEditor(selectedEventsBasedObject)
              }
              onEventsBasedObjectChildrenEdited={
                this.props.onEventsBasedObjectChildrenEdited
              }
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          ) : null)}
        {parametersDialogOpen && selectedEventsFunction && (
          <Dialog
            title={<Trans>Function parameters</Trans>}
            actions={[
              <FlatButton
                key="close"
                label={<Trans>Close</Trans>}
                primary
                keyboardFocused
                onClick={this._closeParametersDialog}
              />,
            ]}
            open
            onRequestClose={this._closeParametersDialog}
            maxWidth="md"
            fullHeight
            flexColumnBody
            disableContentScroll
          >
            {editors.parameters.renderEditor()}
          </Dialog>
        )}
        {detailSettingsDialogOpen &&
          focusedEventsBasedBehavior &&
          detailSettingsProjectScopedContainersAccessor && (
            <Dialog
              title={<Trans>Behavior settings</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  keyboardFocused
                  onClick={this._closeDetailSettingsDialog}
                />,
              ]}
              open
              onRequestClose={this._closeDetailSettingsDialog}
              maxWidth="lg"
              fullHeight
              flexColumnBody
              fixedContent={
                <Tabs
                  value={detailSettingsTab}
                  onChange={this._setDetailSettingsTab}
                  options={[
                    {
                      value: ('properties': DetailSettingsTab),
                      label: <Trans>Editor Properties</Trans>,
                    },
                    {
                      value: ('private-variables': DetailSettingsTab),
                      label: <Trans>Private Variables</Trans>,
                    },
                    {
                      value: ('configuration': DetailSettingsTab),
                      label: <Trans>Configuration</Trans>,
                    },
                  ]}
                />
              }
            >
              <div style={styles.detailSettingsContainer}>
                {detailSettingsTab === 'configuration' && (
                  <div style={styles.detailSettingsConfiguration}>
                    <div style={styles.detailSettingsConfigurationContent}>
                      <EventsBasedBehaviorEditor
                        project={project}
                        eventsFunctionsExtension={eventsFunctionsExtension}
                        eventsBasedBehavior={focusedEventsBasedBehavior}
                        unsavedChanges={this.props.unsavedChanges}
                        onConfigurationUpdated={(attribute) => {
                          this._onConfigurationUpdated(attribute);
                          this._notifyBehaviorPropertiesUpdated();
                        }}
                      />
                    </div>
                  </div>
                )}
                {detailSettingsTab === 'private-variables' && (
                  <div style={styles.detailSettingsPrivateVariables}>
                    <VariablesList
                      projectScopedContainersAccessor={
                        detailSettingsProjectScopedContainersAccessor
                      }
                      directlyStoreValueChangesWhileEditing
                      variablesContainer={focusedEventsBasedBehavior.getVariables()}
                      emptyPlaceholderTitle={
                        <Trans>Add your first private variable</Trans>
                      }
                      emptyPlaceholderDescription={
                        <Trans>
                          These variables hold internal state for the behavior.
                        </Trans>
                      }
                      onComputeAllVariableNames={() => []}
                      onVariablesUpdated={this._notifyBehaviorPropertiesUpdated}
                      isListLocked={false}
                    />
                  </div>
                )}
                {detailSettingsTab === 'properties' && (
                  <div style={styles.detailSettingsProperties}>
                    <div style={styles.detailSettingsSidebar}>
                      <div style={styles.detailSettingsSidebarHeader}>
                        <Text noMargin size="block-title">
                          <Trans>Properties</Trans>
                        </Text>
                      </div>
                      <PropertyListEditor
                        ref={(ref) => (this.detailPropertyListEditor = ref)}
                        project={project}
                        projectScopedContainersAccessor={
                          detailSettingsProjectScopedContainersAccessor
                        }
                        extension={eventsFunctionsExtension}
                        eventsBasedBehavior={focusedEventsBasedBehavior}
                        eventsBasedObject={null}
                        hideConfigurationItem
                        onRenameProperty={(oldName, newName) => {
                          this._onBehaviorPropertyRenamed(
                            focusedEventsBasedBehavior,
                            oldName,
                            newName
                          );
                        }}
                        onPropertiesUpdated={() => {
                          this._notifyBehaviorPropertiesUpdated();
                          if (this.eventsBasedBehaviorEditor) {
                            this.eventsBasedBehaviorEditor.forceUpdateProperties();
                          }
                          this._ensureDetailPropertySelection(
                            focusedEventsBasedBehavior
                          );
                          this.forceUpdate();
                        }}
                        onOpenConfiguration={() => {}}
                        onOpenProperty={this._selectDetailProperty}
                        onEventsFunctionsAdded={() => {
                          if (this.eventsFunctionList) {
                            this.eventsFunctionList.forceUpdateList();
                          }
                          this._notifyBehaviorPropertiesUpdated();
                        }}
                      />
                    </div>
                    <div style={styles.detailSettingsDetail}>
                      {selectedDetailProperty ? (
                        <EventsBasedBehaviorOrObjectPropertiesEditor
                          project={project}
                          projectScopedContainersAccessor={
                            detailSettingsProjectScopedContainersAccessor
                          }
                          extension={eventsFunctionsExtension}
                          eventsBasedBehavior={focusedEventsBasedBehavior}
                          eventsBasedObject={null}
                          properties={
                            selectedDetailProperty.isSharedProperties
                              ? focusedEventsBasedBehavior.getSharedPropertyDescriptors()
                              : focusedEventsBasedBehavior.getPropertyDescriptors()
                          }
                          isSharedProperties={
                            selectedDetailProperty.isSharedProperties
                          }
                          behaviorObjectType={focusedEventsBasedBehavior.getObjectType()}
                          focusedPropertyName={
                            selectedDetailProperty.propertyName
                          }
                          onRenameProperty={(oldName, newName) => {
                            if (selectedDetailProperty.isSharedProperties) {
                              this._onBehaviorSharedPropertyRenamed(
                                focusedEventsBasedBehavior,
                                oldName,
                                newName
                              );
                            } else {
                              this._onBehaviorPropertyRenamed(
                                focusedEventsBasedBehavior,
                                oldName,
                                newName
                              );
                            }
                          }}
                          onPropertiesUpdated={() => {
                            this._notifyBehaviorPropertiesUpdated();
                            if (this.eventsBasedBehaviorEditor) {
                              this.eventsBasedBehaviorEditor.forceUpdateProperties();
                            }
                            if (this.detailPropertyListEditor) {
                              this.detailPropertyListEditor.forceUpdateList();
                            }
                            this.forceUpdate();
                          }}
                          onFocusProperty={(propertyName) =>
                            this._selectDetailProperty(
                              propertyName,
                              selectedDetailProperty.isSharedProperties
                            )
                          }
                          onPropertyTypeChanged={(propertyName) => {
                            gd.WholeProjectRefactorer.changeEventsBasedBehaviorPropertyType(
                              project,
                              eventsFunctionsExtension,
                              focusedEventsBasedBehavior,
                              propertyName
                            );
                            this._notifyBehaviorPropertiesUpdated();
                          }}
                          onEventsFunctionsAdded={() => {
                            if (this.eventsFunctionList) {
                              this.eventsFunctionList.forceUpdateList();
                            }
                            this._notifyBehaviorPropertiesUpdated();
                          }}
                          onWillInstallExtension={
                            this.props.onWillInstallExtension
                          }
                          onExtensionInstalled={this.props.onExtensionInstalled}
                        />
                      ) : (
                        <div style={styles.centeredContent}>
                          <Text align="center" color="secondary">
                            <Trans>Create a property with + to edit it.</Trans>
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Dialog>
          )}
        {objectMethodSelectorDialogOpen && selectedEventsBasedObject && (
          <ObjectMethodSelectorDialog
            eventsBasedObject={selectedEventsBasedObject}
            onCancel={() => this._onCloseObjectMethodSelectorDialog(null)}
            onChoose={(parameters) =>
              this._onCloseObjectMethodSelectorDialog(parameters)
            }
          />
        )}
        {behaviorMethodSelectorDialogOpen && selectedEventsBasedBehavior && (
          <BehaviorMethodSelectorDialog
            eventsBasedBehavior={selectedEventsBasedBehavior}
            onCancel={() => this._onCloseBehaviorMethodSelectorDialog(null)}
            onChoose={(parameters) =>
              this._onCloseBehaviorMethodSelectorDialog(parameters)
            }
          />
        )}
        {extensionFunctionSelectorDialogOpen && eventsFunctionsExtension && (
          <ExtensionFunctionSelectorDialog
            eventsFunctionsContainer={eventsFunctionsExtension.getEventsFunctions()}
            onCancel={() => this._onCloseExtensionFunctionSelectorDialog(null)}
            onChoose={(parameters) =>
              this._onCloseExtensionFunctionSelectorDialog(parameters)
            }
          />
        )}
        {eventsBasedObjectSelectorDialogOpen && (
          <EventsBasedObjectSelectorDialog
            onCancel={() => this._onCloseEventsBasedObjectSelectorDialog(null)}
            onChoose={(parameters) =>
              this._onCloseEventsBasedObjectSelectorDialog(parameters)
            }
          />
        )}
      </React.Fragment>
    );
  }
}
