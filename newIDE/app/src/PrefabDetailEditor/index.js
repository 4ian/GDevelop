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
} from '../EventsFunctionsExtensionEditor/EventsFunctionEditor';
import EditorMosaic, {
  type EditorMosaicNode,
  type EditorMosaicInterface,
  mosaicContainsNode,
} from '../UI/EditorMosaic';
import EmptyMessage from '../UI/EmptyMessage';
import EventsFunctionConfigurationEditor, {
  type EventsFunctionConfigurationEditorInterface,
} from '../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor';
import EventsFunctionsListWithErrorBoundary, {
  type EventsFunctionsListInterface,
} from '../EventsFunctionsList';
import { addFunctionsListToggleButtonToToolbar } from '../EventsFunctionsList/FunctionsListToggleButton';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import Background from '../UI/Background';
import { type EventsBasedBehaviorOrObjectEditorInterface } from '../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor';
import EventsBasedObjectEditor from '../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor/EventsBasedObjectEditor';
import { EventsBasedBehaviorOrObjectPropertiesEditor } from '../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor/EventsBasedBehaviorOrObjectPropertiesEditor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import ObjectMethodSelectorDialog from '../EventsFunctionsExtensionEditor/ObjectMethodSelectorDialog';
import { ensureOnSignalObjectEventsFunctionProperParameters } from '../EventsFunctionsExtensionEditor/OnSignalEventsFunctionParameters';
import { ResponsiveWindowMeasurer } from '../UI/Responsive/ResponsiveWindowMeasurer';
import EditorNavigator, {
  type EditorNavigatorInterface,
} from '../UI/EditorMosaic/EditorNavigator';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { sendEventsExtractedAsFunction } from '../Utils/Analytics/EventSender';
import EditSceneIcon from '../UI/CustomSvgIcons/EditScene';
import SettingsIcon from '../UI/CustomSvgIcons/Settings';
import Tune from '../UI/CustomSvgIcons/Tune';
import newNameGenerator from '../Utils/NewNameGenerator';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import PropertyListEditor, {
  type PropertyListEditorInterface,
} from '../EventsFunctionsExtensionEditor/PropertyListEditor';
import BehaviorsEditor from '../BehaviorsEditor';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import { Tabs } from '../UI/Tabs';
import type { EventPath } from '../Utils/EventPath';
import type { SearchFilterParams } from '../Utils/Search';
import { type VariableDialogOpeningProps } from '../VariablesList/VariablesEditorDialog';
import VariablesList from '../VariablesList/VariablesList';
import { type ExtensionFunctionEventsOutsideEditorChanges } from '../MainFrame/EditorContainers/BaseEditor';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
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
  openBehaviorEvents: (
    extensionName: string,
    behaviorName: string
  ) => void | Promise<void>,
  initiallyOpenSettingsDialog?: boolean,
  dialogOnly?: boolean,
  onPrefabSettingsDialogClose?: () => void,
  onObjectEdited?: () => void | Promise<void>,
  onFunctionEdited?: () => void | Promise<void>,
  initiallyFocusedFunctionName: ?string,
  unsavedChanges?: ?UnsavedChanges,
  onOpenCustomObjectEditor: gdEventsBasedObject => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onEventBasedObjectTypeChanged: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

type PrefabPropertySelection = {|
  propertyName: string,
  isSharedProperties: boolean,
|};
type PrefabSettingsTab =
  | 'configuration'
  | 'properties'
  | 'private-variables'
  | 'behaviors';
type PrefabBehaviorPropertiesSnapshot = { [propertyName: string]: string };
type PrefabBehaviorSnapshot = {
  [behaviorName: string]: {|
    type: string,
    properties: PrefabBehaviorPropertiesSnapshot,
  |},
};

const styles = {
  centeredContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  functionsListHeaderControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  prefabSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  prefabSettingsConfiguration: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: '0 16px 16px 16px',
  },
  prefabSettingsConfigurationContent: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  prefabSettingsBehaviors: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: '8px 16px 16px 16px',
  },
  prefabSettingsPrivateVariables: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    padding: '8px 16px 16px 16px',
  },
  prefabSettingsProperties: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  prefabSettingsSidebar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 300px',
    minWidth: 260,
    maxWidth: 360,
    minHeight: 0,
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
  },
  prefabSettingsSidebarHeader: {
    padding: '8px 16px',
  },
  prefabSettingsDetail: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'auto',
    padding: '8px 16px 16px 16px',
  },
};

type State = {|
  selectedEventsFunction: ?gdEventsFunction,
  objectMethodSelectorDialogOpen: boolean,
  onAddEventsFunctionCb: ?(
    parameters: ?EventsFunctionCreationParameters
  ) => void,
  parametersDialogOpen: boolean,
  prefabDetailsDialogOpen: boolean,
  prefabSettingsTab: PrefabSettingsTab,
  selectedPrefabProperty: ?PrefabPropertySelection,
|};

const getInitialMosaicEditorNodes = (): EditorMosaicNode => ({
  direction: 'row',
  first: 'functions-list',
  second: 'events-sheet',
  splitPercentage: 20,
});

export default class PrefabDetailEditor extends React.Component<Props, State> {
  // $FlowFixMe[missing-local-annot]
  state = {
    selectedEventsFunction: null,
    objectMethodSelectorDialogOpen: false,
    onAddEventsFunctionCb: null,
    parametersDialogOpen: false,
    prefabDetailsDialogOpen: false,
    prefabSettingsTab: 'properties',
    selectedPrefabProperty: null,
  };
  editor: ?EventsSheetInterface;
  eventsFunctionList: ?EventsFunctionsListInterface;
  eventsBasedObjectEditor: ?EventsBasedBehaviorOrObjectEditorInterface;
  propertyListEditor: ?PropertyListEditorInterface;
  prefabDetailsPropertyListEditor: ?PropertyListEditorInterface;
  eventsFunctionConfigurationEditor: ?EventsFunctionConfigurationEditorInterface;
  _editorMosaic: ?EditorMosaicInterface;
  _editorNavigator: ?EditorNavigatorInterface;
  _globalObjectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  _objectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Function
  );
  _prefabBehaviorEditorObjectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  _prefabBehaviorSnapshotsByObjectType: {
    [objectType: string]: PrefabBehaviorSnapshot,
  } = {};
  _prefabVariablesSnapshot: ?gdSerializerElement = null;
  _parameterVariablesContainer: gdVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Parameters
  );
  _propertyVariablesContainer: gdVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Properties
  );
  _parameterResourcesContainer: gdResourcesContainer = new gd.ResourcesContainer(
    gd.ResourcesContainer.Parameters
  );
  _propertyResourcesContainer: gdResourcesContainer = new gd.ResourcesContainer(
    gd.ResourcesContainer.Properties
  );
  _projectScopedContainersAccessor: ProjectScopedContainersAccessor | null = null;

  _normalizeOnSignalEventsFunctionParameters = (): boolean => {
    return ensureOnSignalObjectEventsFunctionProperParameters(
      this.props.eventsFunctionsExtension,
      this.props.eventsBasedObject
    );
  };

  componentDidMount() {
    if (
      this._normalizeOnSignalEventsFunctionParameters() &&
      this.props.unsavedChanges
    ) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }

    if (!this.props.dialogOnly) {
      if (this.props.initiallyFocusedFunctionName) {
        this.selectEventsFunctionByName(
          this.props.initiallyFocusedFunctionName
        );
      } else {
        this._selectFirstEventsFunctionOrPrefabConfiguration();
      }
    }
    if (this.props.initiallyOpenSettingsDialog) {
      this._openPrefabDetailsDialog();
    }
  }

  componentWillUnmount() {
    this._applyPrefabVariablesRefactoring();
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
    });
  };

  _updateProjectScopedContainerFrom = ({
    eventsFunction,
  }: {|
    eventsFunction?: ?gdEventsFunction,
  |}) => {
    const scope = {
      project: this.props.project,
      layout: null,
      externalEvents: null,
      eventsFunctionsExtension: this.props.eventsFunctionsExtension,
      eventsBasedBehavior: null,
      eventsBasedObject: this.props.eventsBasedObject,
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
      this.editor.updateToolbar();
    } else {
      this._setToolbar(null);
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

  getEditorSelectionSnapshot = (): ?EventsSheetSelectionSnapshot => {
    return this.editor ? this.editor.getEditorSelectionSnapshot() : null;
  };

  onExtensionFunctionEventsModifiedOutsideEditor = (
    changes: ExtensionFunctionEventsOutsideEditorChanges
  ) => {
    const { selectedEventsFunction } = this.state;
    const { eventsFunctionsExtension, eventsBasedObject } = this.props;

    if (eventsFunctionsExtension.getName() !== changes.extensionName) return;
    if (changes.parentKind !== 'object') return;
    if (eventsBasedObject.getName() !== changes.parentName) return;
    if (
      !selectedEventsFunction ||
      selectedEventsFunction.getName() !== changes.functionName
    ) {
      return;
    }

    if (this.editor) {
      this.editor.onEventsModifiedOutsideEditor({
        newOrChangedAiGeneratedEventIds:
          changes.newOrChangedAiGeneratedEventIds,
      });
    }
  };

  selectEventsFunctionByName = (
    functionName: string,
    _behaviorName?: ?string,
    _objectName?: ?string
  ) => {
    const eventsFunctions = this.props.eventsBasedObject.getEventsFunctions();
    if (eventsFunctions.hasEventsFunctionNamed(functionName)) {
      this._selectEventsFunction(
        eventsFunctions.getEventsFunction(functionName),
        null,
        this.props.eventsBasedObject
      );
    }
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

  _selectFirstEventsFunctionOrPrefabConfiguration = () => {
    const firstEventsFunction = this._getFirstEventsFunctionInFolder(
      this.props.eventsBasedObject.getEventsFunctions().getRootFolder()
    );
    if (firstEventsFunction) {
      this._selectEventsFunction(
        firstEventsFunction,
        null,
        this.props.eventsBasedObject
      );
    } else {
      this._selectPrefabConfiguration();
    }
  };

  selectEventsBasedObjectByName = (eventBasedObjectName: string) => {
    if (this.props.eventsBasedObject.getName() === eventBasedObjectName) {
      this._selectPrefabConfiguration();
    }
  };

  _selectPrefabConfiguration = () => {
    this._updateProjectScopedContainerFrom({ eventsFunction: null });
    this.setState({ selectedEventsFunction: null }, () => {
      this.updateToolbar();
      const editorNavigator = this._editorNavigator;
      if (editorNavigator) {
        editorNavigator.openEditor('events-sheet');
      }
    });
  };

  _selectEventsFunction = (
    selectedEventsFunction: ?gdEventsFunction,
    _selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    _selectedEventsBasedObject: ?gdEventsBasedObject,
    onSelected?: () => void
  ) => {
    if (!selectedEventsFunction) {
      this._selectPrefabConfiguration();
      return;
    }

    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }

    this._updateProjectScopedContainerFrom({
      eventsFunction: selectedEventsFunction,
    });
    this.setState({ selectedEventsFunction }, () => {
      this.updateToolbar();
      const editorNavigator = this._editorNavigator;
      if (editorNavigator) {
        editorNavigator.openEditor('events-sheet');
      }
      if (onSelected) onSelected();
    });
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
      this._openParametersDialog
    );
  };

  _makeRenameEventsFunction = (i18n: I18nType): any => (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    const object = eventsBasedObject || this.props.eventsBasedObject;
    const oldName = eventsFunction.getName();
    const oldFullName = eventsFunction.getFullName();
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
            tentativeNewName
          ) ||
          tentativeNewName === 'onSignal' ||
          object.getEventsFunctions().hasEventsFunctionNamed(tentativeNewName)
        ) {
          return true;
        }

        return false;
      }
    );

    gd.WholeProjectRefactorer.renameObjectEventsFunction(
      project,
      eventsFunctionsExtension,
      object,
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

  _makeMoveObjectEventsParameter = (i18n: I18nType): any => (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: boolean => void
  ) => {
    gd.WholeProjectRefactorer.moveObjectEventsFunctionParameter(
      this.props.project,
      this.props.eventsFunctionsExtension,
      eventsBasedObject,
      eventsFunction.getName(),
      oldIndex,
      newIndex
    );

    done(true);
  };

  _onDeleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsFunction &&
      // $FlowFixMe[incompatible-exact]
      gd.compare(eventsFunction, this.state.selectedEventsFunction)
    ) {
      this._selectPrefabConfiguration();
    }

    cb(true);
  };

  _onAddEventsFunction = (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      objectMethodSelectorDialogOpen: true,
      onAddEventsFunctionCb: parameters => {
        onAddEventsFunctionCb(parameters);
        this._onObjectEventsFunctionAdded(
          eventsBasedObject || this.props.eventsBasedObject
        );
      },
    });
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

  _onObjectEventsFunctionAdded = (eventsBasedObject: gdEventsBasedObject) => {
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedObject
    );
    ensureOnSignalObjectEventsFunctionProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedObject
    );
  };

  _notifyObjectPropertiesUpdated = () => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    if (this.props.onObjectEdited) {
      this.props.onObjectEdited();
    }
  };

  _onObjectPropertyRenamed = (
    eventsBasedObject: gdEventsBasedObject,
    oldName: string,
    newName: string
  ) => {
    gd.WholeProjectRefactorer.renameEventsBasedObjectProperty(
      this.props.project,
      this.props.eventsFunctionsExtension,
      eventsBasedObject,
      oldName,
      newName
    );
    this._notifyObjectPropertiesUpdated();
    const { selectedPrefabProperty } = this.state;
    if (
      selectedPrefabProperty &&
      !selectedPrefabProperty.isSharedProperties &&
      selectedPrefabProperty.propertyName === oldName
    ) {
      this.setState({
        selectedPrefabProperty: {
          ...selectedPrefabProperty,
          propertyName: newName,
        },
      });
    }
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
    gd.WholeProjectRefactorer.renameParameter(
      this.props.project,
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
    gd.WholeProjectRefactorer.changeParameterType(
      this.props.project,
      projectScopedContainers,
      eventsFunction,
      this._objectsContainer,
      parameterName
    );
  };

  _onConfigurationUpdated = () => {
    this.forceUpdate();
  };

  _getPrefabObjectType = (): string =>
    gd.PlatformExtension.getObjectFullType(
      this.props.eventsFunctionsExtension.getName(),
      this.props.eventsBasedObject.getName()
    );

  _makePrefabBehaviorSnapshot = (
    eventsBasedObject: gdEventsBasedObject
  ): PrefabBehaviorSnapshot => {
    const snapshot: PrefabBehaviorSnapshot = {};
    eventsBasedObject
      .getAllBehaviorNames()
      .toJSArray()
      .forEach(behaviorName => {
        const behavior = eventsBasedObject.getBehavior(behaviorName);
        const properties = behavior.getProperties();
        const propertySnapshot: PrefabBehaviorPropertiesSnapshot = {};
        properties
          .keys()
          .toJSArray()
          .forEach(propertyName => {
            propertySnapshot[propertyName] = properties
              .get(propertyName)
              .getValue();
          });
        snapshot[behaviorName] = {
          type: behavior.getTypeName(),
          properties: propertySnapshot,
        };
      });

    return snapshot;
  };

  _isBehaviorInheritedFromObjectType = (behavior: gdBehavior): boolean => {
    try {
      return behavior.isInheritedFromObjectType();
    } catch (error) {
      return false;
    }
  };

  _getBehaviorDefaultProperties = (
    behaviorTypeName: string
  ): ?gdMapStringPropertyDescriptor => {
    try {
      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        behaviorTypeName
      );
      return gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)
        ? null
        : behaviorMetadata.getProperties();
    } catch (error) {
      console.error(
        'Unable to read behavior metadata properties while syncing prefab behavior properties.',
        error
      );
      return null;
    }
  };

  _syncObjectInheritedBehaviorProperties = (
    object: gdObject,
    previousSnapshot: PrefabBehaviorSnapshot,
    nextSnapshot: PrefabBehaviorSnapshot
  ): boolean => {
    const { project } = this.props;
    let hasObjectChanged = false;

    const behaviorSignatureBefore = object
      .getAllBehaviorNames()
      .toJSArray()
      .map(behaviorName => {
        const behavior = object.getBehavior(behaviorName);
        return `${behaviorName}:${behavior.getTypeName()}:${this._isBehaviorInheritedFromObjectType(
          behavior
        ).toString()}`;
      })
      .join('\n');
    project.ensureObjectInheritedBehaviors(object);
    const behaviorSignatureAfter = object
      .getAllBehaviorNames()
      .toJSArray()
      .map(behaviorName => {
        const behavior = object.getBehavior(behaviorName);
        return `${behaviorName}:${behavior.getTypeName()}:${this._isBehaviorInheritedFromObjectType(
          behavior
        ).toString()}`;
      })
      .join('\n');
    if (behaviorSignatureBefore !== behaviorSignatureAfter) {
      hasObjectChanged = true;
    }

    Object.keys(nextSnapshot).forEach(behaviorName => {
      if (!object.hasBehaviorNamed(behaviorName)) return;

      const behavior = object.getBehavior(behaviorName);
      if (!this._isBehaviorInheritedFromObjectType(behavior)) return;

      const nextBehaviorSnapshot = nextSnapshot[behaviorName];
      if (behavior.getTypeName() !== nextBehaviorSnapshot.type) return;

      const previousBehaviorSnapshot = previousSnapshot[behaviorName];
      if (
        !previousBehaviorSnapshot ||
        previousBehaviorSnapshot.type !== nextBehaviorSnapshot.type
      ) {
        return;
      }

      const behaviorProperties = behavior.getProperties();
      const behaviorDefaultProperties = this._getBehaviorDefaultProperties(
        behavior.getTypeName()
      );
      Object.keys(nextBehaviorSnapshot.properties).forEach(propertyName => {
        if (!behaviorProperties.has(propertyName)) return;

        const previousPropertyValue =
          previousBehaviorSnapshot.properties[propertyName];
        const currentObjectPropertyValue = behaviorProperties
          .get(propertyName)
          .getValue();
        const defaultPropertyValue =
          behaviorDefaultProperties &&
          behaviorDefaultProperties.has(propertyName)
            ? behaviorDefaultProperties.get(propertyName).getValue()
            : undefined;

        if (
          previousPropertyValue === undefined ||
          currentObjectPropertyValue === previousPropertyValue ||
          currentObjectPropertyValue === defaultPropertyValue
        ) {
          behavior.updateProperty(
            propertyName,
            nextBehaviorSnapshot.properties[propertyName]
          );
          hasObjectChanged = true;
        }
      });
    });

    return hasObjectChanged;
  };

  _syncObjectsContainerInheritedBehaviorProperties = (
    objectType: string,
    previousSnapshot: PrefabBehaviorSnapshot,
    nextSnapshot: PrefabBehaviorSnapshot,
    objectsContainer: gdObjectsContainer
  ): boolean => {
    let hasChanged = false;
    for (let i = 0; i < objectsContainer.getObjectsCount(); i++) {
      const object = objectsContainer.getObjectAt(i);
      if (object.getType() !== objectType) continue;

      hasChanged =
        this._syncObjectInheritedBehaviorProperties(
          object,
          previousSnapshot,
          nextSnapshot
        ) || hasChanged;
    }

    return hasChanged;
  };

  _syncProjectObjectsInheritedBehaviorProperties = (
    objectType: string,
    previousSnapshot: PrefabBehaviorSnapshot,
    nextSnapshot: PrefabBehaviorSnapshot
  ): boolean => {
    const { project } = this.props;
    let hasChanged = false;

    hasChanged =
      this._syncObjectsContainerInheritedBehaviorProperties(
        objectType,
        previousSnapshot,
        nextSnapshot,
        project.getObjects()
      ) || hasChanged;
    for (let i = 0; i < project.getLayoutsCount(); i++) {
      hasChanged =
        this._syncObjectsContainerInheritedBehaviorProperties(
          objectType,
          previousSnapshot,
          nextSnapshot,
          project.getLayoutAt(i).getObjects()
        ) || hasChanged;
    }
    hasChanged =
      this._syncObjectsContainerInheritedBehaviorProperties(
        objectType,
        previousSnapshot,
        nextSnapshot,
        this._prefabBehaviorEditorObjectsContainer
      ) || hasChanged;

    return hasChanged;
  };

  _onPrefabBehaviorsUpdated = () => {
    const objectType = this._getPrefabObjectType();
    const previousSnapshot =
      this._prefabBehaviorSnapshotsByObjectType[objectType] || {};
    const nextSnapshot = this._makePrefabBehaviorSnapshot(
      this.props.eventsBasedObject
    );

    this._syncProjectObjectsInheritedBehaviorProperties(
      objectType,
      previousSnapshot,
      nextSnapshot
    );
    this._prefabBehaviorSnapshotsByObjectType[objectType] = nextSnapshot;

    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    if (this.props.onObjectEdited) {
      this.props.onObjectEdited();
    }
    this.forceUpdate();
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
    if (!this.state.selectedEventsFunction) {
      return;
    }
    this.setState({ parametersDialogOpen: true }, () => {
      if (this.eventsFunctionConfigurationEditor) {
        this.eventsFunctionConfigurationEditor.editEventsFunctionParameter(
          props
        );
      }
    });
  };

  _onEditorNavigatorEditorChanged = (_editorName: string) => {
    this.updateToolbar();
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

  _getFirstPrefabPropertySelection = (
    eventsBasedObject: gdEventsBasedObject
  ): ?PrefabPropertySelection => {
    const properties = eventsBasedObject.getPropertyDescriptors();
    const allPropertyFolderOrProperties = properties.getAllPropertyFolderOrProperty();
    for (let index = 0; index < allPropertyFolderOrProperties.size(); index++) {
      const propertyFolderOrProperty = allPropertyFolderOrProperties.at(index);
      if (!propertyFolderOrProperty.isFolder()) {
        return {
          propertyName: propertyFolderOrProperty.getProperty().getName(),
          isSharedProperties: false,
        };
      }
    }

    return null;
  };

  _isPrefabPropertySelectionValid = (
    eventsBasedObject: gdEventsBasedObject,
    selectedPrefabProperty: ?PrefabPropertySelection
  ): boolean => {
    if (!selectedPrefabProperty || selectedPrefabProperty.isSharedProperties) {
      return false;
    }

    const allPropertyFolderOrProperties = eventsBasedObject
      .getPropertyDescriptors()
      .getAllPropertyFolderOrProperty();
    for (let index = 0; index < allPropertyFolderOrProperties.size(); index++) {
      const propertyFolderOrProperty = allPropertyFolderOrProperties.at(index);
      if (
        !propertyFolderOrProperty.isFolder() &&
        propertyFolderOrProperty.getProperty().getName() ===
          selectedPrefabProperty.propertyName
      ) {
        return true;
      }
    }

    return false;
  };

  _syncPrefabDetailsPropertyListSelection = () => {
    const { selectedPrefabProperty } = this.state;
    if (!selectedPrefabProperty || !this.prefabDetailsPropertyListEditor) {
      return;
    }

    this.prefabDetailsPropertyListEditor.setSelectedProperty(
      selectedPrefabProperty.propertyName,
      selectedPrefabProperty.isSharedProperties
    );
  };

  _selectPrefabProperty = (
    propertyName: string,
    isSharedProperties: boolean
  ) => {
    this.setState(
      {
        selectedPrefabProperty: {
          propertyName,
          isSharedProperties,
        },
      },
      this._syncPrefabDetailsPropertyListSelection
    );
  };

  _ensurePrefabPropertySelection = (eventsBasedObject: gdEventsBasedObject) => {
    if (
      this._isPrefabPropertySelectionValid(
        eventsBasedObject,
        this.state.selectedPrefabProperty
      )
    ) {
      return;
    }

    this.setState(
      {
        selectedPrefabProperty: this._getFirstPrefabPropertySelection(
          eventsBasedObject
        ),
      },
      this._syncPrefabDetailsPropertyListSelection
    );
  };

  _setPrefabSettingsTab = (prefabSettingsTab: PrefabSettingsTab) => {
    this.setState({ prefabSettingsTab }, () => {
      if (prefabSettingsTab === 'properties') {
        this._ensurePrefabPropertySelection(this.props.eventsBasedObject);
        this._syncPrefabDetailsPropertyListSelection();
      }
    });
  };

  openPrefabSettingsDialog = () => {
    this._openPrefabDetailsDialog();
  };

  _startEditingPrefabVariables = () => {
    this._applyPrefabVariablesRefactoring();

    const variablesContainer = this.props.eventsBasedObject.getVariables();
    variablesContainer.resetPersistentUuid();
    const snapshot = new gd.SerializerElement();
    variablesContainer.serializeTo(snapshot);
    this._prefabVariablesSnapshot = snapshot;
  };

  _applyPrefabVariablesRefactoring = () => {
    const snapshot = this._prefabVariablesSnapshot;
    if (!snapshot) return;

    const variablesContainer = this.props.eventsBasedObject.getVariables();
    try {
      const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
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
      this._prefabVariablesSnapshot = null;
    }
  };

  _openPrefabDetailsDialog = (_eventsBasedObject?: ?gdEventsBasedObject) => {
    const objectType = this._getPrefabObjectType();
    const prefabBehaviorSnapshot = this._makePrefabBehaviorSnapshot(
      this.props.eventsBasedObject
    );
    const hasSyncedExistingObjects = this._syncProjectObjectsInheritedBehaviorProperties(
      objectType,
      prefabBehaviorSnapshot,
      prefabBehaviorSnapshot
    );
    this._prefabBehaviorSnapshotsByObjectType[
      objectType
    ] = prefabBehaviorSnapshot;
    if (hasSyncedExistingObjects) {
      if (this.props.unsavedChanges) {
        this.props.unsavedChanges.triggerUnsavedChanges();
      }
      if (this.props.onObjectEdited) {
        this.props.onObjectEdited();
      }
    }

    this._startEditingPrefabVariables();

    this.setState(
      {
        prefabDetailsDialogOpen: true,
        prefabSettingsTab: 'properties',
        selectedPrefabProperty: this._getFirstPrefabPropertySelection(
          this.props.eventsBasedObject
        ),
      },
      this._syncPrefabDetailsPropertyListSelection
    );
  };

  _closePrefabDetailsDialog = () => {
    this._applyPrefabVariablesRefactoring();
    this.setState({ prefabDetailsDialogOpen: false }, () => {
      if (this.props.onPrefabSettingsDialogClose) {
        this.props.onPrefabSettingsDialogClose();
      }
    });
  };

  _makePrefabDetailsProjectScopedContainersAccessor = (): ProjectScopedContainersAccessor =>
    new ProjectScopedContainersAccessor(
      {
        project: this.props.project,
        layout: null,
        externalEvents: null,
        eventsFunctionsExtension: this.props.eventsFunctionsExtension,
        eventsBasedBehavior: null,
        eventsBasedObject: this.props.eventsBasedObject,
        eventsFunction: null,
      },
      this._objectsContainer,
      this._parameterVariablesContainer,
      this._propertyVariablesContainer,
      this._parameterResourcesContainer,
      this._propertyResourcesContainer
    );

  _getPrefabBehaviorEditorObject = (objectType: string): gdObject => {
    const objectName = '__PrefabBehaviorEditorObject';
    if (
      this._prefabBehaviorEditorObjectsContainer.hasObjectNamed(objectName) &&
      this._prefabBehaviorEditorObjectsContainer
        .getObject(objectName)
        .getType() !== objectType
    ) {
      this._prefabBehaviorEditorObjectsContainer.removeObject(objectName);
    }

    if (
      !this._prefabBehaviorEditorObjectsContainer.hasObjectNamed(objectName)
    ) {
      this._prefabBehaviorEditorObjectsContainer.insertNewObject(
        this.props.project,
        objectType,
        objectName,
        0
      );
    }

    return this._prefabBehaviorEditorObjectsContainer.getObject(objectName);
  };

  render(): any {
    const { project, eventsFunctionsExtension, eventsBasedObject } = this.props;
    const {
      selectedEventsFunction,
      objectMethodSelectorDialogOpen,
      parametersDialogOpen,
      prefabDetailsDialogOpen,
      prefabSettingsTab,
      selectedPrefabProperty,
    } = this.state;
    const prefabDetailsProjectScopedContainersAccessor = prefabDetailsDialogOpen
      ? this._makePrefabDetailsProjectScopedContainersAccessor()
      : null;
    const prefabObjectType = this._getPrefabObjectType();
    const prefabBehaviorEditorObject = prefabDetailsDialogOpen
      ? this._getPrefabBehaviorEditorObject(prefabObjectType)
      : null;

    const scope = {
      project,
      layout: null,
      externalEvents: null,
      eventsFunctionsExtension,
      eventsBasedBehavior: null,
      eventsBasedObject,
      eventsFunction: selectedEventsFunction,
    };

    const editors = {
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
                    ref={ref => (this.eventsFunctionConfigurationEditor = ref)}
                    project={project}
                    projectScopedContainersAccessor={
                      this._projectScopedContainersAccessor
                    }
                    eventsFunction={selectedEventsFunction}
                    eventsBasedBehavior={null}
                    eventsBasedObject={eventsBasedObject}
                    eventsFunctionsContainer={eventsBasedObject.getEventsFunctions()}
                    eventsFunctionsExtension={eventsFunctionsExtension}
                    globalObjectsContainer={eventsBasedObject.getObjects()}
                    objectsContainer={this._objectsContainer}
                    onConfigurationUpdated={this._onConfigurationUpdated}
                    helpPagePath="/behaviors/events-based-objects"
                    onParametersOrGroupsUpdated={() => {
                      this._updateProjectScopedContainer();
                      this.forceUpdate();
                    }}
                    onMoveFreeEventsParameter={() => {}}
                    onMoveBehaviorEventsParameter={() => {}}
                    onMoveObjectEventsParameter={this._makeMoveObjectEventsParameter(
                      i18n
                    )}
                    onFunctionParameterWillBeRenamed={
                      this._onFunctionParameterWillBeRenamed
                    }
                    onFunctionParameterTypeChanged={
                      this._onFunctionParameterChangedOfType
                    }
                    parameterLayout="split"
                    onWillInstallExtension={this.props.onWillInstallExtension}
                    onExtensionInstalled={this.props.onExtensionInstalled}
                    unsavedChanges={this.props.unsavedChanges}
                  />
                ) : this._projectScopedContainersAccessor ? (
                  <PropertyListEditor
                    ref={ref => (this.propertyListEditor = ref)}
                    project={project}
                    projectScopedContainersAccessor={
                      this._projectScopedContainersAccessor
                    }
                    extension={eventsFunctionsExtension}
                    eventsBasedBehavior={null}
                    eventsBasedObject={eventsBasedObject}
                    onRenameProperty={(oldName, newName) => {
                      this._onObjectPropertyRenamed(
                        eventsBasedObject,
                        oldName,
                        newName
                      );
                    }}
                    onPropertiesUpdated={() => {
                      this._notifyObjectPropertiesUpdated();
                      if (this.eventsBasedObjectEditor) {
                        this.eventsBasedObjectEditor.forceUpdateProperties();
                      }
                    }}
                    onOpenConfiguration={() => {
                      if (this.eventsBasedObjectEditor) {
                        this.eventsBasedObjectEditor.scrollToConfiguration();
                      }
                    }}
                    onOpenProperty={(propertyName, isSharedProperties) => {
                      if (this.eventsBasedObjectEditor) {
                        this.eventsBasedObjectEditor.scrollToProperty(
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
                  />
                ) : (
                  <EmptyMessage>
                    <Trans>Choose a prefab function to edit it.</Trans>
                  </EmptyMessage>
                )}
              </Background>
            )}
          </I18n>
        ),
      },
      'events-sheet': {
        type: 'primary',
        noTitleBar: !!selectedEventsFunction,
        noSoftKeyboardAvoidance: true,
        title: selectedEventsFunction ? null : t`Prefab Configuration`,
        toolbarControls: [],
        renderEditor: () =>
          selectedEventsFunction &&
          this._projectScopedContainersAccessor &&
          this._globalObjectsContainer &&
          this._objectsContainer ? (
            <Background>
              <EventsFunctionEditor
                key={selectedEventsFunction.ptr}
                ref={editor => (this.editor = editor)}
                project={project}
                // $FlowFixMe[incompatible-type]
                scope={scope}
                globalObjectsContainer={eventsBasedObject.getObjects()}
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
                onOpenSettings={this._openParametersDialog}
                settingsIcon={<Tune />}
                settingsTooltip={t`Open parameters`}
                settingsButtonPosition="start"
                unsavedChanges={this.props.unsavedChanges}
                isActive={true}
                hotReloadPreviewButtonProps={
                  this.props.hotReloadPreviewButtonProps
                }
                onWillInstallExtension={this.props.onWillInstallExtension}
                onExtensionInstalled={this.props.onExtensionInstalled}
                editEventsFunctionParameter={this._editEventsFunctionParameter}
              />
            </Background>
          ) : (
            <Background>
              <div style={styles.centeredContent}>
                <RaisedButton
                  label={<Trans>Open visual editor for the object</Trans>}
                  primary
                  onClick={() =>
                    this.props.onOpenCustomObjectEditor(eventsBasedObject)
                  }
                />
              </div>
            </Background>
          ),
      },
      'functions-list': {
        type: 'primary',
        title: t`Functions attached`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <EventsFunctionsListWithErrorBoundary
                ref={eventsFunctionList =>
                  (this.eventsFunctionList = eventsFunctionList)
                }
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                focusedEventsBasedObject={eventsBasedObject}
                unsavedChanges={this.props.unsavedChanges}
                forceUpdateEditor={() => this.forceUpdate()}
                selectedEventsFunction={selectedEventsFunction}
                onSelectEventsFunction={this._selectEventsFunction}
                onOpenEventsFunctionSettings={this._openEventsFunctionSettings}
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                onRenameEventsFunction={this._makeRenameEventsFunction(i18n)}
                onAddEventsFunction={this._onAddEventsFunction}
                onEventsFunctionAdded={(_eventsFunction, _behavior, object) => {
                  this._onObjectEventsFunctionAdded(
                    object || eventsBasedObject
                  );
                }}
                onEventsFunctionMetadataChanged={() => {
                  if (this.props.onFunctionEdited)
                    this.props.onFunctionEdited();
                }}
                selectedEventsBasedBehavior={null}
                onSelectEventsBasedBehavior={() => {}}
                onDeleteEventsBasedBehavior={(_behavior, cb) => cb(false)}
                onRenameEventsBasedBehavior={(_behavior, _newName, cb) =>
                  cb(false)
                }
                onEventsBasedBehaviorRenamed={() => {}}
                onEventsBasedBehaviorPasted={() => {}}
                onEventsBasedBehaviorMetadataChanged={() => {}}
                selectedEventsBasedObject={eventsBasedObject}
                onSelectEventsBasedObject={() =>
                  this._selectPrefabConfiguration()
                }
                onDeleteEventsBasedObject={(_object, cb) => cb(false)}
                onRenameEventsBasedObject={(_object, _newName, cb) => cb(false)}
                onEventsBasedObjectRenamed={() => {}}
                onEventsBasedObjectPasted={() => {}}
                onEventsBasedObjectMetadataChanged={() => {
                  if (this.props.onObjectEdited) this.props.onObjectEdited();
                  this.props.onEventBasedObjectTypeChanged();
                }}
                onAddEventsBasedObject={cb => cb(null)}
                onSelectExtensionProperties={() => {}}
                onSelectExtensionGlobalVariables={() => {}}
                onSelectExtensionSceneVariables={() => {}}
                onOpenCustomObjectEditor={() =>
                  this.props.onOpenCustomObjectEditor(eventsBasedObject)
                }
                headerControls={
                  <div style={styles.functionsListHeaderControls}>
                    <FlatButton
                      fullWidth
                      label={<Trans>Open visual editor</Trans>}
                      leftIcon={<EditSceneIcon />}
                      onClick={() =>
                        this.props.onOpenCustomObjectEditor(eventsBasedObject)
                      }
                      id="open-visual-editor-button"
                    />
                    <FlatButton
                      fullWidth
                      label={<Trans>Prefab settings</Trans>}
                      leftIcon={<SettingsIcon />}
                      onClick={this._openPrefabDetailsDialog}
                      id="prefab-settings-button"
                    />
                  </div>
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
                  ref={editorNavigator =>
                    (this._editorNavigator = editorNavigator)
                  }
                  // $FlowFixMe[incompatible-type]
                  editors={editors}
                  initialEditorName={'functions-list'}
                  transitions={{
                    'events-sheet': {
                      previousEditor: () => {
                        if (selectedEventsFunction) {
                          this._selectPrefabConfiguration();
                        }
                        return 'functions-list';
                      },
                    },
                  }}
                  onEditorChanged={this._onEditorNavigatorEditorChanged}
                />
              ) : (
                <PreferencesContext.Consumer>
                  {({
                    getDefaultEditorMosaicNode,
                    setDefaultEditorMosaicNode,
                  }) => (
                    <EditorMosaic
                      ref={editorMosaic => (this._editorMosaic = editorMosaic)}
                      // $FlowFixMe[incompatible-type]
                      editors={editors}
                      centralNodeId="events-sheet"
                      onDragOrResizedEnded={this.updateToolbar}
                      onPersistNodes={node =>
                        setDefaultEditorMosaicNode('prefab-detail-editor', node)
                      }
                      initialNodes={(() => {
                        const defaultNode = getInitialMosaicEditorNodes();
                        const savedNode = getDefaultEditorMosaicNode(
                          'prefab-detail-editor'
                        );
                        return savedNode &&
                          mosaicContainsNode(savedNode, 'functions-list') &&
                          !mosaicContainsNode(savedNode, 'parameters')
                          ? savedNode
                          : defaultNode;
                      })()}
                    />
                  )}
                </PreferencesContext.Consumer>
              )
            }
          </ResponsiveWindowMeasurer>
        )}
        {objectMethodSelectorDialogOpen && (
          <ObjectMethodSelectorDialog
            eventsBasedObject={eventsBasedObject}
            onCancel={() => this._onCloseObjectMethodSelectorDialog(null)}
            onChoose={parameters =>
              this._onCloseObjectMethodSelectorDialog(parameters)
            }
          />
        )}
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
        {prefabDetailsDialogOpen &&
          prefabDetailsProjectScopedContainersAccessor && (
            <Dialog
              title={<Trans>Prefab settings</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  keyboardFocused
                  onClick={this._closePrefabDetailsDialog}
                />,
              ]}
              open
              onRequestClose={this._closePrefabDetailsDialog}
              maxWidth="lg"
              fullHeight
              flexColumnBody
              fixedContent={
                <Tabs
                  value={prefabSettingsTab}
                  onChange={this._setPrefabSettingsTab}
                  options={[
                    {
                      value: ('properties': PrefabSettingsTab),
                      label: <Trans>Editor Properties</Trans>,
                    },
                    {
                      value: ('private-variables': PrefabSettingsTab),
                      label: <Trans>Private Variables</Trans>,
                    },
                    {
                      value: ('behaviors': PrefabSettingsTab),
                      label: <Trans>Behaviors</Trans>,
                    },
                    {
                      value: ('configuration': PrefabSettingsTab),
                      label: <Trans>Configuration</Trans>,
                    },
                  ]}
                />
              }
            >
              <div style={styles.prefabSettingsContainer}>
                {prefabSettingsTab === 'configuration' && (
                  <div style={styles.prefabSettingsConfiguration}>
                    <div style={styles.prefabSettingsConfigurationContent}>
                      <EventsBasedObjectEditor
                        eventsFunctionsExtension={eventsFunctionsExtension}
                        eventsBasedObject={eventsBasedObject}
                        unsavedChanges={this.props.unsavedChanges}
                        onOpenCustomObjectEditor={() =>
                          this.props.onOpenCustomObjectEditor(eventsBasedObject)
                        }
                        onEventsBasedObjectChildrenEdited={
                          this.props.onEventsBasedObjectChildrenEdited
                        }
                        onConfigurationUpdated={
                          this._notifyObjectPropertiesUpdated
                        }
                        hideOpenVisualEditorButton
                      />
                    </div>
                  </div>
                )}
                {prefabSettingsTab === 'behaviors' && (
                  <div style={styles.prefabSettingsBehaviors}>
                    <BehaviorsEditor
                      project={project}
                      eventsFunctionsExtension={eventsFunctionsExtension}
                      object={eventsBasedObject}
                      objectType={prefabObjectType}
                      behaviorEditorObject={prefabBehaviorEditorObject}
                      layersContainer={eventsBasedObject.getLayers()}
                      isChildObject={false}
                      onUpdateBehaviorsSharedData={() =>
                        gd.WholeProjectRefactorer.updateBehaviorsSharedData(
                          project
                        )
                      }
                      resourceManagementProps={
                        this.props.resourceManagementProps
                      }
                      projectScopedContainersAccessor={
                        prefabDetailsProjectScopedContainersAccessor
                      }
                      onBehaviorsUpdated={this._onPrefabBehaviorsUpdated}
                      openBehaviorEvents={this.props.openBehaviorEvents}
                      onWillInstallExtension={this.props.onWillInstallExtension}
                      onExtensionInstalled={this.props.onExtensionInstalled}
                      isListLocked={false}
                      canUseWholeProjectRefactorer={false}
                      hideConstantPlaceholderHints
                    />
                  </div>
                )}
                {prefabSettingsTab === 'private-variables' && (
                  <div style={styles.prefabSettingsPrivateVariables}>
                    <VariablesList
                      projectScopedContainersAccessor={
                        prefabDetailsProjectScopedContainersAccessor
                      }
                      directlyStoreValueChangesWhileEditing
                      variablesContainer={eventsBasedObject.getVariables()}
                      emptyPlaceholderTitle={
                        <Trans>Add your first private variable</Trans>
                      }
                      emptyPlaceholderDescription={
                        <Trans>
                          These variables hold internal state for the prefab.
                        </Trans>
                      }
                      onComputeAllVariableNames={() => []}
                      onVariablesUpdated={this._notifyObjectPropertiesUpdated}
                      isListLocked={false}
                    />
                  </div>
                )}
                {prefabSettingsTab === 'properties' && (
                  <div style={styles.prefabSettingsProperties}>
                    <div style={styles.prefabSettingsSidebar}>
                      <div style={styles.prefabSettingsSidebarHeader}>
                        <Text noMargin size="block-title">
                          <Trans>Properties</Trans>
                        </Text>
                      </div>
                      <PropertyListEditor
                        ref={ref =>
                          (this.prefabDetailsPropertyListEditor = ref)
                        }
                        project={project}
                        projectScopedContainersAccessor={
                          prefabDetailsProjectScopedContainersAccessor
                        }
                        extension={eventsFunctionsExtension}
                        eventsBasedBehavior={null}
                        eventsBasedObject={eventsBasedObject}
                        hideConfigurationItem
                        onRenameProperty={(oldName, newName) => {
                          this._onObjectPropertyRenamed(
                            eventsBasedObject,
                            oldName,
                            newName
                          );
                        }}
                        onPropertiesUpdated={() => {
                          this._notifyObjectPropertiesUpdated();
                          if (this.eventsBasedObjectEditor) {
                            this.eventsBasedObjectEditor.forceUpdateProperties();
                          }
                          this._ensurePrefabPropertySelection(
                            eventsBasedObject
                          );
                          this.forceUpdate();
                        }}
                        onOpenConfiguration={() => {}}
                        onOpenProperty={this._selectPrefabProperty}
                        onEventsFunctionsAdded={() => {
                          if (this.eventsFunctionList) {
                            this.eventsFunctionList.forceUpdateList();
                          }
                          this._notifyObjectPropertiesUpdated();
                        }}
                      />
                    </div>
                    <div style={styles.prefabSettingsDetail}>
                      {selectedPrefabProperty ? (
                        <EventsBasedBehaviorOrObjectPropertiesEditor
                          project={project}
                          projectScopedContainersAccessor={
                            prefabDetailsProjectScopedContainersAccessor
                          }
                          extension={eventsFunctionsExtension}
                          eventsBasedBehavior={null}
                          eventsBasedObject={eventsBasedObject}
                          properties={eventsBasedObject.getPropertyDescriptors()}
                          behaviorObjectType=""
                          focusedPropertyName={
                            selectedPrefabProperty.propertyName
                          }
                          onRenameProperty={(oldName, newName) => {
                            this._onObjectPropertyRenamed(
                              eventsBasedObject,
                              oldName,
                              newName
                            );
                          }}
                          onPropertiesUpdated={() => {
                            this._notifyObjectPropertiesUpdated();
                            if (this.eventsBasedObjectEditor) {
                              this.eventsBasedObjectEditor.forceUpdateProperties();
                            }
                            if (this.prefabDetailsPropertyListEditor) {
                              this.prefabDetailsPropertyListEditor.forceUpdateList();
                            }
                            this.forceUpdate();
                          }}
                          onFocusProperty={propertyName =>
                            this._selectPrefabProperty(propertyName, false)
                          }
                          onPropertyTypeChanged={propertyName => {
                            gd.WholeProjectRefactorer.changeEventsBasedObjectPropertyType(
                              project,
                              eventsFunctionsExtension,
                              eventsBasedObject,
                              propertyName
                            );
                            this._notifyObjectPropertiesUpdated();
                          }}
                          onEventsFunctionsAdded={() => {
                            if (this.eventsFunctionList) {
                              this.eventsFunctionList.forceUpdateList();
                            }
                            this._notifyObjectPropertiesUpdated();
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
      </React.Fragment>
    );
  }
}
