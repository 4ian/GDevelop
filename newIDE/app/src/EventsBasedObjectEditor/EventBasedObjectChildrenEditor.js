// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Line } from '../UI/Grid';
import ObjectsList, { type ObjectsListInterface } from '../ObjectsList';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import Window from '../Utils/Window';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import { emptyStorageProvider } from '../ProjectsStorage/ProjectStorageProviders';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  getObjectFolderOrObjectUnifiedName,
  type ObjectFolderOrObjectWithContext,
} from '../ObjectsList/EnumerateObjectFolderOrObject';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  unsavedChanges?: ?UnsavedChanges,
|};

type State = {|
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  selectedObjectFolderOrObjectsWithContext: ObjectFolderOrObjectWithContext[],
|};

export default class EventBasedObjectChildrenEditor extends React.Component<
  Props,
  State
> {
  _objectsList: ?ObjectsListInterface;

  state = {
    editedObjectWithContext: null,
    editedObjectInitialTab: 'properties',
    selectedObjectFolderOrObjectsWithContext: [],
  };

  _onDeleteObjects = (i18n: I18nType) => (
    objectsWithContext: ObjectWithContext[],
    done: boolean => void
  ) => {
    const message =
      objectsWithContext.length === 1
        ? t`Do you want to remove all references to this object in groups and events (actions and conditions using the object)?`
        : t`Do you want to remove all references to these objects in groups and events (actions and conditions using the objects)?`;

    const answer = Window.showYesNoCancelDialog(i18n._(message));

    if (answer === 'cancel') return;
    const shouldRemoveReferences = answer === 'yes';

    const { project, globalObjectsContainer, eventsBasedObject } = this.props;

    objectsWithContext.forEach(objectWithContext => {
      const { object } = objectWithContext;
      gd.WholeProjectRefactorer.objectOrGroupRemovedInEventsBasedObject(
        project,
        eventsBasedObject,
        globalObjectsContainer,
        // $FlowFixMe gdObjectsContainer should be a member of gdEventsBasedObject instead of a base class.
        eventsBasedObject,
        object.getName(),
        /* isObjectGroup=*/ false,
        shouldRemoveReferences
      );
    });
    done(true);
  };

  _getValidatedObjectOrGroupName = (newName: string) => {
    const { eventsBasedObject } = this.props;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName => {
        if (
          eventsBasedObject.hasObjectNamed(tentativeNewName) ||
          eventsBasedObject.getObjectGroups().has(tentativeNewName) ||
          // TODO EBO Use a constant instead a hard coded value "Object".
          tentativeNewName === 'Object'
        ) {
          return true;
        }

        return false;
      }
    );

    return safeAndUniqueNewName;
  };

  _onRenameEditedObject = (newName: string) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObject(editedObjectWithContext, newName);
    }
  };

  _onRenameObject = (objectWithContext: ObjectWithContext, newName: string) => {
    const { object } = objectWithContext;
    const { project, globalObjectsContainer, eventsBasedObject } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (object.getName() !== newName) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
        project,
        globalObjectsContainer,
        eventsBasedObject,
        object.getName(),
        newName,
        /* isObjectGroup=*/ false
      );
    }

    object.setName(newName);
  };

  _onRenameObjectFolderOrObjectFinish = (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { objectFolderOrObject, global } = objectFolderOrObjectWithContext;

    const unifiedName = getObjectFolderOrObjectUnifiedName(
      objectFolderOrObject
    );
    // Avoid triggering renaming refactoring if name has not really changed
    if (unifiedName === newName) {
      this._onObjectFolderOrObjectWithContextSelected(
        objectFolderOrObjectWithContext
      );
      done(false);
      return;
    }
    // newName is supposed to have been already validated.

    if (objectFolderOrObject.isFolder()) {
      objectFolderOrObject.setFolderName(newName);
      done(true);
      return;
    }

    const object = objectFolderOrObject.getObject();

    this._onRenameObject({ object, global }, newName);
    this._onObjectFolderOrObjectWithContextSelected(
      objectFolderOrObjectWithContext
    );
    done(true);
  };

  editObject = (editedObject: ?gdObject, initialTab: ?ObjectEditorTab) => {
    if (editedObject) {
      this.setState({
        editedObjectWithContext: {
          object: editedObject,
          global: false,
        },
        editedObjectInitialTab: initialTab || 'properties',
      });
    } else {
      this.setState({
        editedObjectWithContext: null,
        editedObjectInitialTab: 'properties',
      });
    }
  };

  _onObjectFolderOrObjectWithContextSelected = (
    objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext = null
  ) => {
    const selectedObjectFolderOrObjectsWithContext = [];
    if (objectFolderOrObjectWithContext) {
      selectedObjectFolderOrObjectsWithContext.push(
        objectFolderOrObjectWithContext
      );
    }

    this.setState(
      {
        selectedObjectFolderOrObjectsWithContext,
      },
      () => {
        this.forceUpdateObjectsList();
      }
    );
  };

  updateBehaviorsSharedData = () => {
    // TODO EBO Decide how BehaviorsSharedData of child-objects should work.
    // - Use a shared data per object instance
    // BehaviorsSharedData is configured on the CustomObject instead of the
    // scene and each CustomObject instance will have it own data.
    // - Use the layout shared data
    // Find all layouts that are using this object and update them
    // (something a bit like UsedExtensionsFinder, but the other way around).
    // const { project, eventsBasedObject } = this.props;
    // const layout = eventsBasedObject.getLayout();
    // layout.updateBehaviorsSharedData(project);
  };

  forceUpdateObjectsList = () => {
    if (this._objectsList) this._objectsList.forceUpdateList();
  };

  render() {
    const { eventsBasedObject, project, eventsFunctionsExtension } = this.props;
    const { selectedObjectFolderOrObjectsWithContext } = this.state;

    // TODO EBO When adding an object, filter the object types to excludes
    // object that depend (transitively) on this object to avoid cycles.

    // TODO EBO Add a button icon to mark some objects solid or not.

    return (
      <I18n>
        {({ i18n }) => (
          <React.Fragment>
            <Line expand useFullHeight>
              <ObjectsList
                getThumbnail={ObjectsRenderingService.getThumbnail.bind(
                  ObjectsRenderingService
                )}
                project={project}
                unsavedChanges={this.props.unsavedChanges}
                // $FlowFixMe gdObjectsContainer should be a member of gdEventsBasedObject instead of a base class.
                objectsContainer={eventsBasedObject}
                layout={null}
                // TODO EBO Allow to use project resources as place holders
                resourceManagementProps={{
                  resourceSources: [],
                  resourceExternalEditors: [],
                  onChooseResource: async () => [],
                  getStorageProvider: () => emptyStorageProvider,
                  onFetchNewlyAddedResources: async () => {},
                  getStorageProviderResourceOperations: () => null,
                }}
                selectedObjectFolderOrObjectsWithContext={
                  selectedObjectFolderOrObjectsWithContext
                }
                onEditObject={this.editObject}
                // Don't allow export as there is no assets.
                onExportAssets={() => {}}
                onDeleteObjects={this._onDeleteObjects(i18n)}
                getValidatedObjectOrGroupName={
                  this._getValidatedObjectOrGroupName
                }
                // Nothing special to do.
                onObjectCreated={() => {}}
                onObjectFolderOrObjectWithContextSelected={
                  this._onObjectFolderOrObjectWithContextSelected
                }
                onRenameObjectFolderOrObjectWithContextFinish={
                  this._onRenameObjectFolderOrObjectFinish
                }
                // Instances can't be created from this context.
                onAddObjectInstance={() => {}}
                onObjectPasted={() => this.updateBehaviorsSharedData()}
                ref={objectsList => (this._objectsList = objectsList)}
                // TODO EBO Hide the preview button or implement it.
                // Note that it will be hard to do hot reload as extensions need
                // to be generated.
                hotReloadPreviewButtonProps={{
                  hasPreviewsRunning: false,
                  launchProjectDataOnlyPreview: () => {},
                  launchProjectWithLoadingScreenPreview: () => {},
                }}
                canInstallPrivateAsset={() => false}
                canSetAsGlobalObject={false}
              />
            </Line>
            {this.state.editedObjectWithContext && (
              <ObjectEditorDialog
                open
                object={this.state.editedObjectWithContext.object}
                initialTab={this.state.editedObjectInitialTab}
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                resourceManagementProps={{
                  resourceSources: [],
                  resourceExternalEditors: [],
                  onChooseResource: async () => [],
                  getStorageProvider: () => emptyStorageProvider,
                  onFetchNewlyAddedResources: async () => {},
                  getStorageProviderResourceOperations: () => null,
                }}
                onComputeAllVariableNames={() => {
                  return [];
                  // TODO EBO Find undeclared variables in the parent events.

                  // const { editedObjectWithContext } = this.state;
                  // if (!editedObjectWithContext) return [];
                  // return EventsRootVariablesFinder.findAllObjectVariables(
                  //   project.getCurrentPlatform(),
                  //   project,
                  //   eventsBasedObject,
                  //   editedObjectWithContext.object
                  // );
                }}
                onCancel={() => {
                  this.editObject(null);
                }}
                getValidatedObjectOrGroupName={
                  this._getValidatedObjectOrGroupName
                }
                onRename={this._onRenameEditedObject}
                onApply={() => {
                  this.editObject(null);
                  this.updateBehaviorsSharedData();
                  this.forceUpdateObjectsList();
                }}
                // TODO EBO Hide the preview button or implement it.
                // Note that it will be hard to do hot reload as extensions need
                // to be generated.
                hotReloadPreviewButtonProps={{
                  hasPreviewsRunning: false,
                  launchProjectDataOnlyPreview: () => {},
                  launchProjectWithLoadingScreenPreview: () => {},
                }}
                onUpdateBehaviorsSharedData={() =>
                  this.updateBehaviorsSharedData()
                }
                // TODO EBO Go to the behavior extension tab.
                openBehaviorEvents={() => {}}
              />
            )}
          </React.Fragment>
        )}
      </I18n>
    );
  }
}
