// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import EventsSheet, {
  type EventsSheetInterface,
  type EventsSheetSelectionSnapshot,
} from '../EventsSheet';
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
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import Background from '../UI/Background';
import {
  EventsBasedBehaviorOrObjectEditor,
  type EventsBasedBehaviorOrObjectEditorInterface,
} from '../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import ObjectMethodSelectorDialog from '../EventsFunctionsExtensionEditor/ObjectMethodSelectorDialog';
import { ResponsiveWindowMeasurer } from '../UI/Responsive/ResponsiveWindowMeasurer';
import EditorNavigator, {
  type EditorNavigatorInterface,
} from '../UI/EditorMosaic/EditorNavigator';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { sendEventsExtractedAsFunction } from '../Utils/Analytics/EventSender';
import ExtensionEditIcon from '../UI/CustomSvgIcons/ExtensionEdit';
import Tune from '../UI/CustomSvgIcons/Tune';
import Mark from '../UI/CustomSvgIcons/Mark';
import newNameGenerator from '../Utils/NewNameGenerator';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import PropertyListEditor, {
  type PropertyListEditorInterface,
} from '../EventsFunctionsExtensionEditor/PropertyListEditor';
import type { EventPath } from '../Utils/EventPath';
import type { SearchFilterParams } from '../Utils/Search';
import { type VariableDialogOpeningProps } from '../VariablesList/VariablesEditorDialog';
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
  onObjectEdited?: () => void,
  onFunctionEdited?: () => void,
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

type State = {|
  selectedEventsFunction: ?gdEventsFunction,
  objectMethodSelectorDialogOpen: boolean,
  onAddEventsFunctionCb: ?(
    parameters: ?EventsFunctionCreationParameters
  ) => void,
|};

const extensionEditIconReactNode = <ExtensionEditIcon />;

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

export default class PrefabDetailEditor extends React.Component<Props, State> {
  // $FlowFixMe[missing-local-annot]
  state = {
    selectedEventsFunction: null,
    objectMethodSelectorDialogOpen: false,
    onAddEventsFunctionCb: null,
  };
  editor: ?EventsSheetInterface;
  eventsFunctionList: ?EventsFunctionsListInterface;
  eventsBasedObjectEditor: ?EventsBasedBehaviorOrObjectEditorInterface;
  propertyListEditor: ?PropertyListEditorInterface;
  eventsFunctionConfigurationEditor: ?EventsFunctionConfigurationEditorInterface;
  _editorMosaic: ?EditorMosaicInterface;
  _editorNavigator: ?EditorNavigatorInterface;
  _globalObjectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  _objectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Function
  );
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

  componentDidMount() {
    if (this.props.initiallyFocusedFunctionName) {
      this.selectEventsFunctionByName(this.props.initiallyFocusedFunctionName);
    } else {
      this._selectPrefabConfiguration();
    }
  }

  componentWillUnmount() {
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
      this.props.setToolbar(null);
    }
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

  selectEventsBasedObjectByName = (eventBasedObjectName: string) => {
    if (this.props.eventsBasedObject.getName() === eventBasedObjectName) {
      this._selectPrefabConfiguration();
    }
  };

  _selectPrefabConfiguration = () => {
    this._updateProjectScopedContainerFrom({ eventsFunction: null });
    this.setState({ selectedEventsFunction: null }, () => {
      this.updateToolbar();
      if (this._editorMosaic) {
        this._editorMosaic.uncollapseEditor('parameters', 25);
      }
      const editorNavigator = this._editorNavigator;
      if (editorNavigator) {
        editorNavigator.openEditor('events-sheet');
      }
    });
  };

  _selectEventsFunction = (
    selectedEventsFunction: ?gdEventsFunction,
    _selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    _selectedEventsBasedObject: ?gdEventsBasedObject
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
      if (this._editorMosaic) {
        this._editorMosaic.uncollapseEditor('parameters', 25);
      }
      const editorNavigator = this._editorNavigator;
      if (editorNavigator) {
        if (!selectedEventsFunction.getEvents().getEventsCount()) {
          editorNavigator.openEditor('parameters');
        } else {
          editorNavigator.openEditor('events-sheet');
        }
      }
    });
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
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
            tentativeNewName
          ) ||
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

  _onEditorNavigatorEditorChanged = (_editorName: string) => {
    this.updateToolbar();
  };

  render(): any {
    const { project, eventsFunctionsExtension, eventsBasedObject } = this.props;
    const {
      selectedEventsFunction,
      objectMethodSelectorDialogOpen,
    } = this.state;

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
              <EventsSheet
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
                events={selectedEventsFunction.getEvents()}
                onOpenExternalEvents={() => {}}
                onOpenLayout={() => {}}
                resourceManagementProps={this.props.resourceManagementProps}
                openInstructionOrExpression={
                  this.props.openInstructionOrExpression
                }
                setToolbar={this.props.setToolbar}
                onBeginCreateEventsFunction={this.onBeginCreateEventsFunction}
                onCreateEventsFunction={this.onCreateEventsFunction}
                settingsIcon={extensionEditIconReactNode}
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
          ) : this._projectScopedContainersAccessor ? (
            <EventsBasedBehaviorOrObjectEditor
              ref={ref => (this.eventsBasedObjectEditor = ref)}
              project={project}
              projectScopedContainersAccessor={
                this._projectScopedContainersAccessor
              }
              eventsFunctionsExtension={eventsFunctionsExtension}
              eventsBasedObject={eventsBasedObject}
              unsavedChanges={this.props.unsavedChanges}
              onRenameProperty={(oldName, newName) =>
                this._onObjectPropertyRenamed(
                  eventsBasedObject,
                  oldName,
                  newName
                )
              }
              onRenameSharedProperty={() => {}}
              onPropertyTypeChanged={propertyName => {
                gd.WholeProjectRefactorer.changeEventsBasedObjectPropertyType(
                  project,
                  eventsFunctionsExtension,
                  eventsBasedObject,
                  propertyName
                );
              }}
              onPropertiesUpdated={() => {
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
              }}
              onOpenCustomObjectEditor={() =>
                this.props.onOpenCustomObjectEditor(eventsBasedObject)
              }
              onEventsBasedObjectChildrenEdited={
                this.props.onEventsBasedObjectChildrenEdited
              }
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          ) : (
            <Background>
              <EmptyMessage>
                <Trans>Choose a prefab function to edit it.</Trans>
              </EmptyMessage>
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
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                onRenameEventsFunction={this._makeRenameEventsFunction(i18n)}
                onAddEventsFunction={this._onAddEventsFunction}
                onEventsFunctionAdded={(_eventsFunction, _behavior, object) => {
                  this._onObjectEventsFunctionAdded(
                    object || eventsBasedObject
                  );
                }}
                selectedEventsBasedBehavior={null}
                onSelectEventsBasedBehavior={() => {}}
                onDeleteEventsBasedBehavior={(_behavior, cb) => cb(false)}
                onRenameEventsBasedBehavior={(_behavior, _newName, cb) =>
                  cb(false)
                }
                onEventsBasedBehaviorRenamed={() => {}}
                onEventsBasedBehaviorPasted={() => {}}
                selectedEventsBasedObject={
                  selectedEventsFunction ? null : eventsBasedObject
                }
                onSelectEventsBasedObject={() =>
                  this._selectPrefabConfiguration()
                }
                onDeleteEventsBasedObject={(_object, cb) => cb(false)}
                onRenameEventsBasedObject={(_object, _newName, cb) => cb(false)}
                onEventsBasedObjectRenamed={() => {}}
                onEventsBasedObjectPasted={() => {}}
                onAddEventsBasedObject={cb => cb(null)}
                onSelectExtensionProperties={() => {}}
                onSelectExtensionGlobalVariables={() => {}}
                onSelectExtensionSceneVariables={() => {}}
                onOpenCustomObjectEditor={() =>
                  this.props.onOpenCustomObjectEditor(eventsBasedObject)
                }
                onEventBasedObjectTypeChanged={
                  this.props.onEventBasedObjectTypeChanged
                }
              />
            )}
          </I18n>
        ),
      },
    };

    return (
      <React.Fragment>
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
                    nextIcon: <Tune />,
                    nextLabel: selectedEventsFunction ? (
                      <Trans>Parameters</Trans>
                    ) : (
                      <Trans>Property list</Trans>
                    ),
                    nextEditor: 'parameters',
                    previousEditor: () => {
                      if (selectedEventsFunction) {
                        this._selectPrefabConfiguration();
                      }
                      return 'functions-list';
                    },
                  },
                  parameters: {
                    nextIcon: <Mark />,
                    nextLabel: selectedEventsFunction ? (
                      <Trans>Validate these parameters</Trans>
                    ) : null,
                    nextEditor: selectedEventsFunction ? 'events-sheet' : null,
                    previousEditor: selectedEventsFunction
                      ? null
                      : () => 'events-sheet',
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
                    onPersistNodes={node =>
                      setDefaultEditorMosaicNode('prefab-detail-editor', node)
                    }
                    initialNodes={
                      mosaicContainsNode(
                        getDefaultEditorMosaicNode('prefab-detail-editor') ||
                          getInitialMosaicEditorNodes(),
                        'functions-list'
                      )
                        ? getDefaultEditorMosaicNode('prefab-detail-editor') ||
                          getInitialMosaicEditorNodes()
                        : // Force the mosaic to reset to default.
                          // $FlowFixMe[incompatible-type]
                          getInitialMosaicEditorNodes()
                    }
                  />
                )}
              </PreferencesContext.Consumer>
            )
          }
        </ResponsiveWindowMeasurer>
        {objectMethodSelectorDialogOpen && (
          <ObjectMethodSelectorDialog
            eventsBasedObject={eventsBasedObject}
            onCancel={() => this._onCloseObjectMethodSelectorDialog(null)}
            onChoose={parameters =>
              this._onCloseObjectMethodSelectorDialog(parameters)
            }
          />
        )}
      </React.Fragment>
    );
  }
}
