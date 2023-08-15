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

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
|};

type State = {|
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  selectedObjectsWithContext: ObjectWithContext[],
  renamedObjectWithContext: ?ObjectWithContext,
|};

export default class EventBasedObjectChildrenEditor extends React.Component<
  Props,
  State
> {
  _objectsList: ?ObjectsListInterface;

  state = {
    editedObjectWithContext: null,
    editedObjectInitialTab: 'properties',
    selectedObjectsWithContext: [],
    renamedObjectWithContext: null,
  };

  _onDeleteObject = (i18n: I18nType) => (
    objectWithContext: ObjectWithContext,
    done: boolean => void
  ) => {
    const { object } = objectWithContext;
    const { project, globalObjectsContainer, eventsBasedObject } = this.props;

    const answer = Window.showYesNoCancelDialog(
      i18n._(
        t`Do you want to remove all references to this object in groups and events (actions and conditions using the object)?`
      )
    );

    if (answer === 'cancel') return;
    const shouldRemoveReferences = answer === 'yes';

    gd.WholeProjectRefactorer.objectOrGroupRemovedInEventsBasedObject(
      project,
      eventsBasedObject,
      // TODO: use EventsScope
      globalObjectsContainer,
      // $FlowFixMe gdObjectsContainer should be a member of gdEventsBasedObject instead of a base class.
      eventsBasedObject,
      object.getName(),
      /* isObjectGroup=*/ false,
      shouldRemoveReferences
    );
    done(true);
  };

  _getValidatedObjectOrGroupName = (newName: string, i18n: I18nType) => {
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

  _onRenameObjectStart = (objectWithContext: ?ObjectWithContext) => {
    const selectedObjectsWithContext = [];
    if (objectWithContext) {
      selectedObjectsWithContext.push(objectWithContext);
    }

    this.setState(
      {
        renamedObjectWithContext: objectWithContext,
        selectedObjectsWithContext,
      },
      () => {
        this.forceUpdateObjectsList();
      }
    );
  };

  _onRenameEditedObject = (newName: string, i18n: I18nType) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObject(editedObjectWithContext, newName, () => {}, i18n);
    }
  };

  _onRenameObject = (
    objectWithContext: ObjectWithContext,
    newName: string,
    done: boolean => void,
    i18n: I18nType
  ) => {
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

  _onObjectSelected = (objectWithContext: ?ObjectWithContext = null) => {
    const selectedObjectsWithContext = [];
    if (objectWithContext) {
      selectedObjectsWithContext.push(objectWithContext);
    }

    this.setState(
      {
        selectedObjectsWithContext,
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

    const selectedObjectNames = this.state.selectedObjectsWithContext.map(
      objWithContext => objWithContext.object.getName()
    );

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
                selectedObjectNames={selectedObjectNames}
                onEditObject={this.editObject}
                // Don't allow export as there is no assets.
                onExportObject={() => {}}
                onDeleteObject={this._onDeleteObject(i18n)}
                getValidatedObjectOrGroupName={newName =>
                  this._getValidatedObjectOrGroupName(newName, i18n)
                }
                // Nothing special to do.
                onObjectCreated={() => {}}
                onObjectSelected={this._onObjectSelected}
                renamedObjectWithContext={this.state.renamedObjectWithContext}
                onRenameObjectStart={this._onRenameObjectStart}
                onRenameObjectFinish={(objectWithContext, newName, done) =>
                  this._onRenameObject(objectWithContext, newName, done, i18n)
                }
                // Instances can't be created from this context.
                onAddObjectInstance={() => {}}
                onObjectPasted={() => this.updateBehaviorsSharedData()}
                selectedObjectTags={[]}
                onChangeSelectedObjectTags={selectedObjectTags => {}}
                getAllObjectTags={() => []}
                ref={
                  // $FlowFixMe Make this component functional.
                  objectsList => (this._objectsList = objectsList)
                }
                unsavedChanges={null}
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
                getValidatedObjectOrGroupName={newName =>
                  this._getValidatedObjectOrGroupName(newName, i18n)
                }
                onRename={newName => {
                  this._onRenameEditedObject(newName, i18n);
                }}
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
