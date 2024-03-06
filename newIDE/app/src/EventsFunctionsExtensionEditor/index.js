// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import EventsSheet, { type EventsSheetInterface } from '../EventsSheet';
import EditorMosaic, {
  type EditorMosaicInterface,
  mosaicContainsNode,
} from '../UI/EditorMosaic';
import EmptyMessage from '../UI/EmptyMessage';
import EventsFunctionConfigurationEditor from './EventsFunctionConfigurationEditor';
import EventsFunctionsListWithErrorBoundary, {
  type EventsFunctionsListInterface,
} from '../EventsFunctionsList';
import { type EventsFunctionCreationParameters } from '../EventsFunctionsList/EventsFunctionTreeViewItemContent';
import Background from '../UI/Background';
import OptionsEditorDialog from './OptionsEditorDialog';
import EventsBasedBehaviorEditorPanel from '../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorPanel';
import EventsBasedObjectEditorPanel from '../EventsBasedObjectEditor/EventsBasedObjectEditorPanel';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import BehaviorMethodSelectorDialog from './BehaviorMethodSelectorDialog';
import ObjectMethodSelectorDialog from './ObjectMethodSelectorDialog';
import ExtensionFunctionSelectorDialog from './ExtensionFunctionSelectorDialog';
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
import Tune from '../UI/CustomSvgIcons/Tune';
import Mark from '../UI/CustomSvgIcons/Mark';
import newNameGenerator from '../Utils/NewNameGenerator';
const gd: libGDevelop = global.gd;

export type ExtensionItemConfigurationAttribute =
  | 'type'
  | 'isPrivate'
  | 'isAsync';

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
  ) => void,
  onBehaviorEdited?: () => void,
  onObjectEdited?: () => void,
  onFunctionEdited?: () => void,
  initiallyFocusedFunctionName: ?string,
  initiallyFocusedBehaviorName: ?string,
  unsavedChanges?: ?UnsavedChanges,
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
  onAddEventsFunctionCb: ?(
    parameters: ?EventsFunctionCreationParameters
  ) => void,
|};

const extensionEditIconReactNode = <ExtensionEditIcon />;

// The event based object editor is hidden in releases
// because it's not handled by GDJS.
const getInitialMosaicEditorNodes = () => ({
  direction: 'row',
  first: 'functions-list',
  second: {
    direction: 'column',
    first: 'parameters',
    second: 'events-sheet',
    splitPercentage: 25,
  },
  splitPercentage: 25,
});

export default class EventsFunctionsExtensionEditor extends React.Component<
  Props,
  State
> {
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
    onAddEventsFunctionCb: null,
  };
  editor: ?EventsSheetInterface;
  eventsFunctionList: ?EventsFunctionsListInterface;
  _editorMosaic: ?EditorMosaicInterface;
  _editorNavigator: ?EditorNavigatorInterface;
  // Create an empty "context" of objects.
  // Avoid recreating containers if they were already created, so that
  // we keep the same objects in memory and avoid remounting components
  // (like ObjectGroupsList) because objects "ptr" changed.
  _globalObjectsContainer: gdObjectsContainer = new gd.ObjectsContainer();
  _objectsContainer: gdObjectsContainer = new gd.ObjectsContainer();

  componentDidMount() {
    if (this.props.initiallyFocusedFunctionName) {
      this.selectEventsFunctionByName(
        this.props.initiallyFocusedFunctionName,
        this.props.initiallyFocusedBehaviorName
      );
    } else if (this.props.initiallyFocusedBehaviorName) {
      this.selectEventsBasedBehaviorByName(
        this.props.initiallyFocusedBehaviorName
      );
    }
  }

  componentWillUnmount() {
    if (this._globalObjectsContainer) this._globalObjectsContainer.delete();
    if (this._objectsContainer) this._objectsContainer.delete();
  }

  _loadEventsFunctionFrom = (
    project: gdProject,
    eventsFunction: gdEventsFunction,
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    eventsFunctionsExtension: ?gdEventsFunctionsExtension
  ) => {
    // Initialize this "context" of objects with the function
    // (as done during code generation).
    if (eventsBasedBehavior) {
      gd.EventsFunctionTools.behaviorEventsFunctionToObjectsContainer(
        project,
        eventsBasedBehavior,
        eventsFunction,
        this._globalObjectsContainer,
        this._objectsContainer
      );
    } else if (eventsBasedObject) {
      gd.EventsFunctionTools.objectEventsFunctionToObjectsContainer(
        project,
        eventsBasedObject,
        eventsFunction,
        this._globalObjectsContainer,
        this._objectsContainer
      );
    } else if (eventsFunctionsExtension) {
      gd.EventsFunctionTools.freeEventsFunctionToObjectsContainer(
        project,
        eventsFunctionsExtension,
        eventsFunction,
        this._globalObjectsContainer,
        this._objectsContainer
      );
    } else {
      throw new Error(
        'No extension, behavior or object was specified when loading a function'
      );
    }
  };

  updateToolbar = () => {
    if (this.editor) {
      // If the scene editor is open, let it handle the toolbar.
      this.editor.updateToolbar();
    } else {
      // Otherwise, show the extension settings buttons.
      this.props.setToolbar(
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

  selectEventsFunctionByName = (
    functionName: string,
    behaviorName: ?string
  ) => {
    const { eventsFunctionsExtension } = this.props;

    if (behaviorName) {
      // Behavior function
      const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
      if (eventsBasedBehaviors.has(behaviorName)) {
        const eventsBasedBehavior = eventsBasedBehaviors.get(behaviorName);
        const behaviorEventsFunctions = eventsBasedBehavior.getEventsFunctions();
        if (behaviorEventsFunctions.hasEventsFunctionNamed(functionName)) {
          this._selectEventsFunction(
            behaviorEventsFunctions.getEventsFunction(functionName),
            eventsBasedBehavior
          );
        }
      }
    } else {
      // Free function
      if (eventsFunctionsExtension.hasEventsFunctionNamed(functionName)) {
        this._selectEventsFunction(
          eventsFunctionsExtension.getEventsFunction(functionName),
          null
        );
      }
    }
  };

  _selectEventsFunction = (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
    selectedEventsBasedObject: ?gdEventsBasedObject
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

    this._loadEventsFunctionFrom(
      this.props.project,
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
      this.props.eventsFunctionsExtension
    );
    this.setState(
      {
        selectedEventsFunction,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
      },
      () => {
        this.updateToolbar();

        if (this._editorMosaic) {
          this._editorMosaic.uncollapseEditor('parameters', 25);
        }
        if (this._editorNavigator) {
          // Open the parameters of the function if it's a new, empty function.
          if (
            selectedEventsFunction &&
            !selectedEventsFunction.getEvents().getEventsCount()
          ) {
            this._editorNavigator.openEditor('parameters');
          } else {
            this._editorNavigator.openEditor('events-sheet');
          }
        }
      }
    );
  };

  _makeRenameEventsFunction = (i18n: I18nType) => (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
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
    done: boolean => void
  ) => {
    const { project, eventsFunctionsExtension } = this.props;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
            tentativeNewName
          ) ||
          eventsFunctionsExtension.hasEventsFunctionNamed(tentativeNewName)
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
    done: boolean => void
  ) => {
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
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
    done: boolean => void
  ) => {
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
            tentativeNewName
          ) ||
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

    done(true);
    if (this.props.onFunctionEdited) {
      this.props.onFunctionEdited();
    }
  };

  _makeMoveFreeEventsParameter = (i18n: I18nType) => (
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: boolean => void
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

  _makeMoveBehaviorEventsParameter = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: boolean => void
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

  _makeMoveObjectEventsParameter = (i18n: I18nType) => (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: boolean => void
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
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsFunction &&
      gd.compare(eventsFunction, this.state.selectedEventsFunction)
    ) {
      this._selectEventsFunction(null, null, null);
    }

    cb(true);
  };

  selectEventsBasedBehaviorByName = (behaviorName: string) => {
    const { eventsFunctionsExtension } = this.props;
    const eventsBasedBehaviorsList = eventsFunctionsExtension.getEventsBasedBehaviors();
    if (eventsBasedBehaviorsList.has(behaviorName)) {
      this._selectEventsBasedBehavior(
        eventsBasedBehaviorsList.get(behaviorName)
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
    this.setState(
      {
        selectedEventsBasedBehavior,
        selectedEventsFunction: null,
        selectedEventsBasedObject: null,
      },
      () => {
        this.updateToolbar();
        if (selectedEventsBasedBehavior) {
          if (this._editorMosaic) {
            this._editorMosaic.collapseEditor('parameters');
          }
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
    this.setState(
      {
        selectedEventsBasedObject,
        selectedEventsFunction: null,
        selectedEventsBasedBehavior: null,
      },
      () => {
        this.updateToolbar();
        if (selectedEventsBasedObject) {
          if (this._editorMosaic) {
            this._editorMosaic.collapseEditor('parameters');
          }
          if (this._editorNavigator)
            this._editorNavigator.openEditor('events-sheet');
        }
      }
    );
  };

  _makeRenameEventsBasedBehavior = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    done: boolean => void
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
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

    done(true);
  };

  _makeRenameEventsBasedObject = (i18n: I18nType) => (
    eventsBasedObject: gdEventsBasedObject,
    newName: string,
    done: boolean => void
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          eventsFunctionsExtension.getEventsBasedObjects().has(tentativeNewName)
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

    done(true);
  };

  _onEventsBasedBehaviorPasted = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    sourceExtensionName: string
  ) => {
    const { project, eventsFunctionsExtension } = this.props;
    if (eventsFunctionsExtension.getName() === sourceExtensionName) {
      return;
    }
    gd.WholeProjectRefactorer.updateExtensionNameInEventsBasedBehavior(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      sourceExtensionName
    );
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
      this._loadEventsFunctionFrom(
        this.props.project,
        this.state.selectedEventsFunction,
        this.state.selectedEventsBasedBehavior,
        this.state.selectedEventsBasedObject,
        this.props.eventsFunctionsExtension
      );
    }
  };

  _onEventsBasedObjectRenamed = () => {
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
      this._loadEventsFunctionFrom(
        this.props.project,
        this.state.selectedEventsFunction,
        this.state.selectedEventsBasedBehavior,
        this.state.selectedEventsBasedObject,
        this.props.eventsFunctionsExtension
      );
    }
  };

  _onDeleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsBasedBehavior &&
      gd.compare(eventsBasedBehavior, this.state.selectedEventsBasedBehavior)
    ) {
      this._selectEventsBasedBehavior(null);
    }

    cb(true);
  };

  _onDeleteEventsBasedObject = (
    eventsBasedObject: gdEventsBasedObject,
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsBasedObject &&
      gd.compare(eventsBasedObject, this.state.selectedEventsBasedObject)
    ) {
      this._selectEventsBasedObject(null);
    }

    cb(true);
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

  _onAddEventsFunction = (
    eventsBasedBehavior: ?gdEventsBasedBehavior,
    eventsBasedObject: ?gdEventsBasedObject,
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    if (eventsBasedBehavior) {
      this._onAddBehaviorEventsFunction(onAddEventsFunctionCb);
    } else if (eventsBasedObject) {
      this._onAddObjectEventsFunction(onAddEventsFunctionCb);
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
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      behaviorMethodSelectorDialogOpen: true,
      onAddEventsFunctionCb,
    });
  };

  _onAddObjectEventsFunction = (
    onAddEventsFunctionCb: (
      parameters: ?EventsFunctionCreationParameters
    ) => void
  ) => {
    this.setState({
      objectMethodSelectorDialogOpen: true,
      onAddEventsFunctionCb,
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

  _onBehaviorEventsFunctionAdded = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction
  ) => {
    // This will create the mandatory parameters for the newly added function.
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedBehavior
    );
  };

  _onObjectEventsFunctionAdded = (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction
  ) => {
    // This will create the mandatory parameters for the newly added function.
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      this.props.eventsFunctionsExtension,
      eventsBasedObject
    );
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
  };

  _editOptions = (open: boolean = true) => {
    this.setState({
      editOptionsDialogOpen: open,
    });
  };

  _editBehavior = (editedEventsBasedBehavior: ?gdEventsBasedBehavior) => {
    this.setState(
      state => {
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
            this._loadEventsFunctionFrom(
              this.props.project,
              this.state.selectedEventsFunction,
              this.state.selectedEventsBasedBehavior,
              this.state.selectedEventsBasedObject,
              this.props.eventsFunctionsExtension
            );
          }
        }
      }
    );
  };

  _editObject = (editedEventsBasedObject: ?gdEventsBasedObject) => {
    this.setState(
      state => {
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
            this._loadEventsFunctionFrom(
              this.props.project,
              this.state.selectedEventsFunction,
              this.state.selectedEventsBasedBehavior,
              this.state.selectedEventsBasedObject,
              this.props.eventsFunctionsExtension
            );
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

  _getFunctionGroupNames = (): Array<string> => {
    const groupNames = new Set<string>();
    // Look only in the edited function container because
    // functions from the extension or different behaviors
    // won't use the same groups names.
    // An independent autocompletion is done for each of them.
    const {
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
    } = this.state;
    if (selectedEventsBasedBehavior) {
      const eventFunctionContainer = selectedEventsBasedBehavior.getEventsFunctions();
      for (
        let index = 0;
        index < eventFunctionContainer.getEventsFunctionsCount();
        index++
      ) {
        const groupName = eventFunctionContainer
          .getEventsFunctionAt(index)
          .getGroup();
        if (groupName) {
          groupNames.add(groupName);
        }
      }
    } else if (selectedEventsBasedObject) {
      const eventFunctionContainer = selectedEventsBasedObject.getEventsFunctions();
      for (
        let index = 0;
        index < eventFunctionContainer.getEventsFunctionsCount();
        index++
      ) {
        const groupName = eventFunctionContainer
          .getEventsFunctionAt(index)
          .getGroup();
        if (groupName) {
          groupNames.add(groupName);
        }
      }
    } else {
      const { eventsFunctionsExtension } = this.props;
      for (
        let index = 0;
        index < eventsFunctionsExtension.getEventsFunctionsCount();
        index++
      ) {
        const groupName = eventsFunctionsExtension
          .getEventsFunctionAt(index)
          .getGroup();
        if (groupName) {
          groupNames.add(groupName);
        }
      }
    }
    return [...groupNames].sort((a, b) => a.localeCompare(b));
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

  onCreateEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    this.props.onCreateEventsFunction(
      extensionName,
      eventsFunction,
      'extension-events-editor'
    );
  };

  render() {
    const { project, eventsFunctionsExtension } = this.props;
    const {
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
      editOptionsDialogOpen,
      behaviorMethodSelectorDialogOpen,
      objectMethodSelectorDialogOpen,
      extensionFunctionSelectorDialogOpen,
    } = this.state;

    const selectedEventsBasedEntity =
      selectedEventsBasedBehavior || selectedEventsBasedObject;

    const editors = {
      parameters: {
        type: 'primary',
        title: t`Function Configuration`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <Background maxWidth>
                {selectedEventsFunction &&
                this._globalObjectsContainer &&
                this._objectsContainer ? (
                  <EventsFunctionConfigurationEditor
                    project={project}
                    eventsFunction={selectedEventsFunction}
                    eventsBasedBehavior={selectedEventsBasedBehavior}
                    eventsBasedObject={selectedEventsBasedObject}
                    eventsFunctionsContainer={
                      (selectedEventsBasedEntity &&
                        selectedEventsBasedEntity.getEventsFunctions()) ||
                      eventsFunctionsExtension
                    }
                    globalObjectsContainer={this._globalObjectsContainer}
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
                      this._loadEventsFunctionFrom(
                        project,
                        selectedEventsFunction,
                        selectedEventsBasedBehavior,
                        selectedEventsBasedObject,
                        this.props.eventsFunctionsExtension
                      );
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
                    unsavedChanges={this.props.unsavedChanges}
                    getFunctionGroupNames={this._getFunctionGroupNames}
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
          ? t`Behavior Configuration`
          : selectedEventsBasedObject
          ? t`Object Configuration`
          : null,
        toolbarControls: [],
        renderEditor: () =>
          selectedEventsFunction &&
          this._globalObjectsContainer &&
          this._objectsContainer ? (
            <Background>
              <EventsSheet
                key={selectedEventsFunction.ptr}
                ref={editor => (this.editor = editor)}
                project={project}
                scope={{
                  project,
                  layout: null,
                  externalEvents: null,
                  eventsFunctionsExtension,
                  eventsBasedBehavior: selectedEventsBasedBehavior,
                  eventsBasedObject: selectedEventsBasedObject,
                  eventsFunction: selectedEventsFunction,
                }}
                globalObjectsContainer={this._globalObjectsContainer}
                objectsContainer={this._objectsContainer}
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
                onOpenSettings={this._editOptions}
                settingsIcon={extensionEditIconReactNode}
                unsavedChanges={this.props.unsavedChanges}
                isActive={true}
              />
            </Background>
          ) : selectedEventsBasedBehavior ? (
            <EventsBasedBehaviorEditorPanel
              project={project}
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
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
              }}
              onConfigurationUpdated={this._onConfigurationUpdated}
            />
          ) : selectedEventsBasedObject && this._globalObjectsContainer ? (
            <EventsBasedObjectEditorPanel
              project={project}
              globalObjectsContainer={this._globalObjectsContainer}
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
              onEventsFunctionsAdded={() => {
                if (this.eventsFunctionList) {
                  this.eventsFunctionList.forceUpdateList();
                }
              }}
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
                ref={eventsFunctionList =>
                  (this.eventsFunctionList = eventsFunctionList)
                }
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                unsavedChanges={this.props.unsavedChanges}
                forceUpdateEditor={() => this.forceUpdate()}
                // Free functions
                selectedEventsFunction={selectedEventsFunction}
                onSelectEventsFunction={(
                  selectedEventsFunction,
                  selectedEventsBasedBehavior,
                  selectedEventsBasedObject
                ) =>
                  this._selectEventsFunction(
                    selectedEventsFunction,
                    selectedEventsBasedBehavior,
                    selectedEventsBasedObject
                  )
                }
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                onRenameEventsFunction={this._makeRenameEventsFunction(i18n)}
                onAddEventsFunction={this._onAddEventsFunction}
                onEventsFunctionAdded={() => {}}
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
                // Objects
                selectedEventsBasedObject={selectedEventsBasedObject}
                onSelectEventsBasedObject={this._selectEventsBasedObject}
                onDeleteEventsBasedObject={this._onDeleteEventsBasedObject}
                onRenameEventsBasedObject={this._makeRenameEventsBasedObject(
                  i18n
                )}
                onEventsBasedObjectRenamed={this._onEventsBasedObjectRenamed}
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
                editors={editors}
                initialEditorName={'functions-list'}
                transitions={{
                  'events-sheet': {
                    nextIcon: <Tune />,
                    nextLabel: <Trans>Parameters</Trans>,
                    nextEditor: 'parameters',
                    previousEditor: () => 'functions-list',
                  },
                  parameters: {
                    nextIcon: <Mark />,
                    nextLabel: <Trans>Validate these parameters</Trans>,
                    nextEditor: 'events-sheet',
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
                    ref={editorMosaic => (this._editorMosaic = editorMosaic)}
                    editors={editors}
                    onPersistNodes={node =>
                      setDefaultEditorMosaicNode(
                        'events-functions-extension-editor',
                        node
                      )
                    }
                    initialNodes={
                      // Settings from older release may not have the unified
                      // function list.
                      mosaicContainsNode(
                        getDefaultEditorMosaicNode(
                          'events-functions-extension-editor'
                        ) || getInitialMosaicEditorNodes(),
                        'functions-list'
                      )
                        ? getDefaultEditorMosaicNode(
                            'events-functions-extension-editor'
                          ) || getInitialMosaicEditorNodes()
                        : // Force the mosaic to reset to default.
                          getInitialMosaicEditorNodes()
                    }
                  />
                )}
              </PreferencesContext.Consumer>
            )
          }
        </ResponsiveWindowMeasurer>
        {editOptionsDialogOpen && (
          <OptionsEditorDialog
            eventsFunctionsExtension={eventsFunctionsExtension}
            open
            onClose={() => this._editOptions(false)}
          />
        )}
        {objectMethodSelectorDialogOpen && selectedEventsBasedObject && (
          <ObjectMethodSelectorDialog
            eventsBasedObject={selectedEventsBasedObject}
            onCancel={() => this._onCloseObjectMethodSelectorDialog(null)}
            onChoose={parameters =>
              this._onCloseObjectMethodSelectorDialog(parameters)
            }
          />
        )}
        {behaviorMethodSelectorDialogOpen && selectedEventsBasedBehavior && (
          <BehaviorMethodSelectorDialog
            eventsBasedBehavior={selectedEventsBasedBehavior}
            onCancel={() => this._onCloseBehaviorMethodSelectorDialog(null)}
            onChoose={parameters =>
              this._onCloseBehaviorMethodSelectorDialog(parameters)
            }
          />
        )}
        {extensionFunctionSelectorDialogOpen && eventsFunctionsExtension && (
          <ExtensionFunctionSelectorDialog
            eventsFunctionsExtension={eventsFunctionsExtension}
            onCancel={() => this._onCloseExtensionFunctionSelectorDialog(null)}
            onChoose={parameters =>
              this._onCloseExtensionFunctionSelectorDialog(parameters)
            }
          />
        )}
      </React.Fragment>
    );
  }
}
