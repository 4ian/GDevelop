// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import EventsSheet, { type EventsSheetInterface } from '../EventsSheet';
import EditorMosaic, { mosaicContainsNode } from '../UI/EditorMosaic';
import EmptyMessage from '../UI/EmptyMessage';
import EventsFunctionConfigurationEditor from './EventsFunctionConfigurationEditor';
import EventsFunctionsList, {
  type EventsFunctionCreationParameters,
} from '../EventsFunctionsList';
import EventsBasedBehaviorsList from '../EventsBasedBehaviorsList';
import EventsBasedObjectsList from '../EventsBasedObjectsList';
import Background from '../UI/Background';
import OptionsEditorDialog from './OptionsEditorDialog';
import { showWarningBox } from '../UI/Messages/MessageBox';
import EventsBasedBehaviorEditorDialog from '../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog';
import EventsBasedObjectEditorDialog from '../EventsBasedObjectEditor/EventsBasedObjectEditorDialog';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import BehaviorMethodSelectorDialog from './BehaviorMethodSelectorDialog';
import ObjectMethodSelectorDialog from './ObjectMethodSelectorDialog';
import ExtensionFunctionSelectorDialog from './ExtensionFunctionSelectorDialog';
import {
  isBehaviorLifecycleEventsFunction,
  isObjectLifecycleEventsFunction,
  isExtensionLifecycleEventsFunction,
} from '../EventsFunctionsExtensionsLoader/MetadataDeclarationHelpers';
import FlatButton from '../UI/FlatButton';
import { Line } from '../UI/Grid';
import Divider from '@material-ui/core/Divider';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import EditorNavigator, {
  type EditorNavigatorInterface,
} from '../UI/EditorMosaic/EditorNavigator';
import ChooseEventsFunctionsExtensionEditor from './ChooseEventsFunctionsExtensionEditor';
import Check from '@material-ui/icons/Check';
import Tune from '@material-ui/icons/Tune';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { ParametersIndexOffsets } from '../EventsFunctionsExtensionsLoader';
import { sendEventsExtractedAsFunction } from '../Utils/Analytics/EventSender';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  setToolbar: (?React.Node) => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
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
  onBehaviorEdited?: () => Promise<void>,
  onObjectEdited?: () => Promise<void>,
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

const initialMosaicEditorNodes = {
  direction: 'row',
  first: {
    direction: 'column',
    first: 'free-functions-list',
    second: {
      direction: 'column',
      first: 'objects-list',
      second: 'behaviors-list',
      splitPercentage: 50,
    },
    splitPercentage: 33,
  },
  second: {
    direction: 'column',
    first: 'parameters',
    second: 'events-sheet',
    splitPercentage: 25,
  },
  splitPercentage: 25,
};

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
  _editorMosaic: ?EditorMosaic;
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
    eventsBasedObject: ?gdEventsBasedObject
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
    } else {
      gd.EventsFunctionTools.freeEventsFunctionToObjectsContainer(
        project,
        eventsFunction,
        this._globalObjectsContainer,
        this._objectsContainer
      );
    }
  };

  updateToolbar = () => {
    if (this.editor) {
      this.editor.updateToolbar();
    } else {
      this.props.setToolbar(null);
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

    this._loadEventsFunctionFrom(
      this.props.project,
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject
    );
    this.setState(
      {
        selectedEventsFunction,
        selectedEventsBasedBehavior,
        selectedEventsBasedObject,
      },
      () => {
        this.updateToolbar();

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

  _makeRenameFreeEventsFunction = (i18n: I18nType) => (
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return;
    }
    if (isExtensionLifecycleEventsFunction(newName)) {
      showWarningBox(
        i18n._(
          t`This name is reserved for a lifecycle function of the extension. Choose another name for your function.`
        ),
        { delayToNextTick: true }
      );
      return done(false);
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsFunction.getName(),
      newName
    );

    done(true);
  };

  _makeRenameBehaviorEventsFunction = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return done(false);
    }
    if (isBehaviorLifecycleEventsFunction(newName)) {
      showWarningBox(
        i18n._(
          t`This name is reserved for a lifecycle method of the behavior. Choose another name for your custom function.`
        ),
        { delayToNextTick: true }
      );
      return done(false);
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameBehaviorEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      eventsFunction.getName(),
      newName
    );

    done(true);
  };

  _makeRenameObjectEventsFunction = (i18n: I18nType) => (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return done(false);
    }
    if (isObjectLifecycleEventsFunction(newName)) {
      showWarningBox(
        i18n._(
          t`This name is reserved for a lifecycle method of the behavior. Choose another name for your custom function.`
        ),
        { delayToNextTick: true }
      );
      return done(false);
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameObjectEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      eventsFunction.getName(),
      newName
    );

    done(true);
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
      this._selectEventsFunction(null, this.state.selectedEventsBasedBehavior);
    }

    cb(true);
  };

  _selectEventsBasedBehavior = (
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior
  ) => {
    this.setState(
      {
        selectedEventsBasedBehavior,
        selectedEventsFunction: null,
        selectedEventsBasedObject: null,
      },
      () => {
        this.updateToolbar();
        if (selectedEventsBasedBehavior) {
          if (this._editorMosaic)
            this._editorMosaic.openEditor(
              'behavior-functions-list',
              'end',
              75,
              'column'
            );
          if (this._editorNavigator)
            this._editorNavigator.openEditor('behavior-functions-list');
        }
      }
    );
  };

  _selectEventsBasedObject = (
    selectedEventsBasedObject: ?gdEventsBasedObject
  ) => {
    this.setState(
      {
        selectedEventsBasedObject,
        selectedEventsFunction: null,
        selectedEventsBasedBehavior: null,
      },
      () => {
        this.updateToolbar();
        if (selectedEventsBasedObject) {
          if (this._editorMosaic)
            this._editorMosaic.openEditor(
              'behavior-functions-list',
              'end',
              75,
              'column'
            );
          if (this._editorNavigator)
            this._editorNavigator.openEditor('behavior-functions-list');
        }
      }
    );
  };

  _makeRenameEventsBasedBehavior = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return;
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsBasedBehavior(
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior.getName(),
      newName
    );

    done(true);
  };

  _makeRenameEventsBasedObject = (i18n: I18nType) => (
    eventsBasedObject: gdEventsBasedObject,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return;
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsBasedObject(
      project,
      eventsFunctionsExtension,
      eventsBasedObject.getName(),
      newName
    );

    done(true);
  };

  _onEventsBasedBehaviorRenamed = () => {
    // Name of a behavior changed, so notify parent
    // that a behavior was edited (to trigger reload of extensions)
    if (this.props.onBehaviorEdited) this.props.onBehaviorEdited();

    // Reload the selected events function, if any, as the behavior was
    // changed so objects containers need to be re-created (otherwise,
    // objects from objects containers will still refer to the old behavior name,
    // done before the call to gd.WholeProjectRefactorer.renameEventsBasedBehavior).
    if (this.state.selectedEventsFunction) {
      this._loadEventsFunctionFrom(
        this.props.project,
        this.state.selectedEventsFunction,
        this.state.selectedEventsBasedBehavior
      );
    }
  };

  _onEventsBasedObjectRenamed = () => {
    // Name of a object changed, so notify parent
    // that a object was edited (to trigger reload of extensions)
    if (this.props.onObjectEdited) this.props.onObjectEdited();

    // Reload the selected events function, if any, as the parent-object was
    // changed so child-objects containers need to be re-created (otherwise,
    // child-objects from child-objects containers will still refer to the old parent-object name,
    // done before the call to gd.WholeProjectRefactorer.renameEventsBasedObject).
    if (this.state.selectedEventsFunction) {
      this._loadEventsFunctionFrom(
        this.props.project,
        this.state.selectedEventsFunction,
        this.state.selectedEventsBasedBehavior,
        this.state.selectedEventsBasedObject
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
              this.state.selectedEventsBasedObject
            );
          }
        }
      }
    );
  };

  _editObject = (editedEventsBasedObject: ?gdEventsBasedObject) => {
    this.setState(
      state => {
        // If we're closing the properties of a behavior, ensure parameters
        // are up-to-date in all event functions of the behavior (the object
        // type might have changed).
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
          // If we're closing the properties of a behavior, notify parent
          // that a behavior was edited (to trigger reload of extensions)
          if (this.props.onObjectEdited) {
            await this.props.onObjectEdited();

            // Once extensions are reloaded, ensure the project stays valid by
            // filling any invalid required behavior property in the objects
            // of the project.
            //
            // We need to do that as "required behavior" properties may have been
            // added (or the type of the required behavior changed) in the dialog.
            // TODO EBO Do something like this but for children and their behaviors?
            // gd.WholeProjectRefactorer.fixInvalidRequiredBehaviorProperties(
            //   this.props.project
            // );
          }

          // Reload the selected events function, if any, as the behavior was
          // changed so objects containers need to be re-created. Notably, the
          // type of the object that is handled by the behavior may have changed.
          if (this.state.selectedEventsFunction) {
            this._loadEventsFunctionFrom(
              this.props.project,
              this.state.selectedEventsFunction,
              this.state.selectedEventsBasedBehavior,
              this.state.selectedEventsBasedObject
            );
          }
        }
      }
    );
  };

  _openFreeFunctionsListEditor = () => {
    if (this._editorNavigator)
      this._editorNavigator.openEditor('free-functions-list');
  };

  _openBehaviorsListEditor = () => {
    if (this._editorNavigator)
      this._editorNavigator.openEditor('behaviors-list');
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
    const { selectedEventsBasedBehavior, selectedEventsBasedObject } = this.state;
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

  _onConfigurationUpdated = (whatChanged?: 'type') => {
    if (whatChanged === 'type') {
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
      editedEventsBasedBehavior,
      editedEventsBasedObject,
    } = this.state;

    const editors = {
      'choose-editor': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: () => (
          <ChooseEventsFunctionsExtensionEditor
            eventsFunctionsExtension={eventsFunctionsExtension}
            onEditFreeFunctions={this._openFreeFunctionsListEditor}
            onEditBehaviors={this._openBehaviorsListEditor}
            onEditExtensionOptions={this._editOptions}
          />
        ),
      },
      parameters: {
        type: 'primary',
        title: t`Function Configuration`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <Background>
                {selectedEventsFunction &&
                this._globalObjectsContainer &&
                this._objectsContainer ? (
                  <EventsFunctionConfigurationEditor
                    project={project}
                    eventsFunction={selectedEventsFunction}
                    eventsBasedBehavior={selectedEventsBasedBehavior}
                    eventsBasedObject={selectedEventsBasedObject}
                    globalObjectsContainer={this._globalObjectsContainer}
                    objectsContainer={this._objectsContainer}
                    onConfigurationUpdated={this._onConfigurationUpdated}
                    // TODO EBO prepare a page
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
                        selectedEventsBasedObject
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
        noTitleBar: true,
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
                resourceSources={this.props.resourceSources}
                onChooseResource={this.props.onChooseResource}
                resourceExternalEditors={this.props.resourceExternalEditors}
                openInstructionOrExpression={
                  this.props.openInstructionOrExpression
                }
                setToolbar={this.props.setToolbar}
                onBeginCreateEventsFunction={this.onBeginCreateEventsFunction}
                onCreateEventsFunction={this.onCreateEventsFunction}
                onOpenSettings={this._editOptions}
                unsavedChanges={this.props.unsavedChanges}
                isActive={true}
              />
            </Background>
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
      'free-functions-list': {
        type: 'primary',
        title: t`Functions`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <EventsFunctionsList
                project={project}
                eventsFunctionsContainer={eventsFunctionsExtension}
                selectedEventsFunction={selectedEventsFunction}
                onSelectEventsFunction={selectedEventsFunction =>
                  this._selectEventsFunction(selectedEventsFunction, null)
                }
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                canRename={(eventsFunction: gdEventsFunction) => {
                  return !isExtensionLifecycleEventsFunction(
                    eventsFunction.getName()
                  );
                }}
                onRenameEventsFunction={this._makeRenameFreeEventsFunction(
                  i18n
                )}
                onAddEventsFunction={this._onAddFreeEventsFunction}
                onEventsFunctionAdded={() => {}}
                renderHeader={() => (
                  <React.Fragment>
                    <Line justifyContent="center">
                      <FlatButton
                        label={<Trans>Edit extension options</Trans>}
                        primary
                        onClick={() => this._editOptions()}
                      />
                    </Line>
                    <Divider />
                  </React.Fragment>
                )}
                unsavedChanges={this.props.unsavedChanges}
              />
            )}
          </I18n>
        ),
      },
      'behavior-functions-list': {
        type: 'primary',
        title: selectedEventsBasedObject ? t`Object functions` : t`Behavior functions`,
        renderEditor: () =>
        
        selectedEventsBasedObject ? (
          <I18n>
            {({ i18n }) => (
              <EventsFunctionsList
                project={project}
                eventsFunctionsContainer={selectedEventsBasedObject.getEventsFunctions()}
                selectedEventsFunction={selectedEventsFunction}
                onSelectEventsFunction={selectedEventsFunction =>
                  this._selectEventsFunction(
                    selectedEventsFunction,
                    selectedEventsBasedBehavior,
                    selectedEventsBasedObject
                  )
                }
                onDeleteEventsFunction={this._onDeleteEventsFunction}
                canRename={(eventsFunction: gdEventsFunction) => {
                  return !isObjectLifecycleEventsFunction(
                    eventsFunction.getName()
                  );
                }}
                onRenameEventsFunction={(
                  eventsFunction: gdEventsFunction,
                  newName: string,
                  done: boolean => void
                ) =>
                  this._makeRenameObjectEventsFunction(i18n)(
                    selectedEventsBasedObject,
                    eventsFunction,
                    newName,
                    done
                  )
                }
                onAddEventsFunction={this._onAddObjectEventsFunction}
                onEventsFunctionAdded={eventsFunction =>
                  this._onObjectEventsFunctionAdded(
                    selectedEventsBasedObject,
                    eventsFunction
                  )
                }
                renderHeader={() => (
                  <React.Fragment>
                    <Line justifyContent="center">
                      <FlatButton
                        label={<Trans>Edit object properties</Trans>}
                        primary
                        onClick={() =>
                          this._editObject(selectedEventsBasedObject)
                        }
                      />
                    </Line>
                    <Divider />
                  </React.Fragment>
                )}
                unsavedChanges={this.props.unsavedChanges}
              />
            )}
          </I18n>
        ) : selectedEventsBasedBehavior ? (
            <I18n>
              {({ i18n }) => (
                <EventsFunctionsList
                  project={project}
                  eventsFunctionsContainer={selectedEventsBasedBehavior.getEventsFunctions()}
                  selectedEventsFunction={selectedEventsFunction}
                  onSelectEventsFunction={selectedEventsFunction =>
                    this._selectEventsFunction(
                      selectedEventsFunction,
                      selectedEventsBasedBehavior,
                      selectedEventsBasedObject
                    )
                  }
                  onDeleteEventsFunction={this._onDeleteEventsFunction}
                  canRename={(eventsFunction: gdEventsFunction) => {
                    return !isBehaviorLifecycleEventsFunction(
                      eventsFunction.getName()
                    );
                  }}
                  onRenameEventsFunction={(
                    eventsFunction: gdEventsFunction,
                    newName: string,
                    done: boolean => void
                  ) =>
                    this._makeRenameBehaviorEventsFunction(i18n)(
                      selectedEventsBasedBehavior,
                      eventsFunction,
                      newName,
                      done
                    )
                  }
                  onAddEventsFunction={this._onAddBehaviorEventsFunction}
                  onEventsFunctionAdded={eventsFunction =>
                    this._onBehaviorEventsFunctionAdded(
                      selectedEventsBasedBehavior,
                      eventsFunction
                    )
                  }
                  renderHeader={() => (
                    <React.Fragment>
                      <Line justifyContent="center">
                        <FlatButton
                          label={<Trans>Edit behavior properties</Trans>}
                          primary
                          onClick={() =>
                            this._editBehavior(selectedEventsBasedBehavior)
                          }
                        />
                      </Line>
                      <Divider />
                    </React.Fragment>
                  )}
                  unsavedChanges={this.props.unsavedChanges}
                />
              )}
            </I18n>
          ) : (
            <Background>
              <EmptyMessage>
                <Trans>
                  Select a behavior or an to display the functions inside this
                  behavior.
                </Trans>
              </EmptyMessage>
            </Background>
          ),
      },

      'behaviors-list': {
        type: 'secondary',
        title: t`Behaviors`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <EventsBasedBehaviorsList
                project={project}
                eventsBasedBehaviorsList={eventsFunctionsExtension.getEventsBasedBehaviors()}
                selectedEventsBasedBehavior={selectedEventsBasedBehavior}
                onSelectEventsBasedBehavior={this._selectEventsBasedBehavior}
                onDeleteEventsBasedBehavior={this._onDeleteEventsBasedBehavior}
                onRenameEventsBasedBehavior={this._makeRenameEventsBasedBehavior(
                  i18n
                )}
                onEventsBasedBehaviorRenamed={
                  this._onEventsBasedBehaviorRenamed
                }
                onEditProperties={this._editBehavior}
                unsavedChanges={this.props.unsavedChanges}
              />
            )}
          </I18n>
        ),
      },
      'objects-list': {
        type: 'secondary',
        title: t`Objects`,
        toolbarControls: [],
        renderEditor: () => (
          <I18n>
            {({ i18n }) => (
              <EventsBasedObjectsList
                project={project}
                eventsBasedObjectsList={eventsFunctionsExtension.getEventsBasedObjects()}
                selectedEventsBasedObject={selectedEventsBasedObject}
                onSelectEventsBasedObject={this._selectEventsBasedObject}
                onDeleteEventsBasedObject={this._onDeleteEventsBasedObject}
                onRenameEventsBasedObject={this._makeRenameEventsBasedObject(
                  i18n
                )}
                onEventsBasedObjectRenamed={
                  this._onEventsBasedObjectRenamed
                }
                onEditProperties={this._editObject}
                unsavedChanges={this.props.unsavedChanges}
              />
            )}
          </I18n>
        ),
      },
    };

    return (
      <React.Fragment>
        <ResponsiveWindowMeasurer>
          {windowWidth =>
            windowWidth === 'small' ? (
              <EditorNavigator
                ref={editorNavigator =>
                  (this._editorNavigator = editorNavigator)
                }
                editors={editors}
                initialEditorName={'choose-editor'}
                transitions={{
                  'behaviors-list': {
                    previousEditor: 'choose-editor',
                  },
                  'behavior-functions-list': {
                    previousEditor: 'behaviors-list',
                  },
                  'free-functions-list': {
                    previousEditor: 'choose-editor',
                  },
                  'events-sheet': {
                    nextIcon: <Tune />,
                    nextLabel: <Trans>Parameters</Trans>,
                    nextEditor: 'parameters',
                    previousEditor: () => {
                      if (selectedEventsBasedBehavior || selectedEventsBasedObject)
                        return 'behavior-functions-list';
                      return 'free-functions-list';
                    },
                  },
                  parameters: {
                    nextIcon: <Check />,
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
                      mosaicContainsNode(initialMosaicEditorNodes, 'objects-list') ?
                      getDefaultEditorMosaicNode(
                        'events-functions-extension-editor'
                      ) || initialMosaicEditorNodes :
                      initialMosaicEditorNodes
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
        {
          objectMethodSelectorDialogOpen && selectedEventsBasedObject && (
            <ObjectMethodSelectorDialog
              eventsBasedObject={selectedEventsBasedObject}
              onCancel={() => this._onCloseObjectMethodSelectorDialog(null)}
              onChoose={parameters =>
                this._onCloseObjectMethodSelectorDialog(parameters)
              }
            />
          )
        }
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
        {editedEventsBasedBehavior && (
          <EventsBasedBehaviorEditorDialog
            project={project}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedBehavior={editedEventsBasedBehavior}
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this._editBehavior(null);
            }}
            onRenameProperty={(oldName, newName) =>
              this._onBehaviorPropertyRenamed(
                editedEventsBasedBehavior,
                oldName,
                newName
              )
            }
          />
        )}
        {editedEventsBasedObject && this._globalObjectsContainer && (
          <EventsBasedObjectEditorDialog
            project={project}
            globalObjectsContainer={this._globalObjectsContainer}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedObject={editedEventsBasedObject}
            onApply={() => {
              if (this.props.unsavedChanges)
                this.props.unsavedChanges.triggerUnsavedChanges();
              this._editObject(null);
            }}
            onRenameProperty={(oldName, newName) =>
              this._onObjectPropertyRenamed(
                editedEventsBasedObject,
                oldName,
                newName
              )
            }
          />
        )}
      </React.Fragment>
    );
  }
}
