// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Line } from '../UI/Grid';
import ObjectsList from '../ObjectsList';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { showWarningBox } from '../UI/Messages/MessageBox';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import Window from '../Utils/Window';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import { type OnFetchNewlyAddedResourcesFunction } from '../ProjectsStorage/ResourceFetcher';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  onFetchNewlyAddedResources: OnFetchNewlyAddedResourcesFunction,
  globalObjectsContainer: gdObjectsContainer,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
|};

type State = {|
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
  selectedObjectNames: string[],
|};

export default class EventBasedObjectChildrenEditor extends React.Component<
  Props,
  State
> {
  _objectsList: ?ObjectsList;

  state = {
    editedObjectWithContext: null,
    editedObjectInitialTab: 'properties',
    selectedObjectNames: [],
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
      globalObjectsContainer,
      eventsBasedObject,
      object.getName(),
      /* isObjectGroup=*/ false,
      shouldRemoveReferences
    );
    done(true);
  };

  _canObjectOrGroupUseNewName = (newName: string, i18n: I18nType) => {
    const { eventsBasedObject } = this.props;

    if (
      eventsBasedObject.hasObjectNamed(newName) ||
      eventsBasedObject.getObjectGroups().has(newName)
    ) {
      showWarningBox(
        i18n._(t`Another object or group with this name already exists.`),
        {
          delayToNextTick: true,
        }
      );
      return false;
    } else if (!gd.Project.validateName(newName)) {
      showWarningBox(
        i18n._(
          t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
        ),
        { delayToNextTick: true }
      );
      return false;
    }

    return true;
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
    // TODO EBO Use a constant instead a hard coded value "Object".
    if (newName === 'Object') {
      showWarningBox(
        i18n._(
          t`"Object" is a reserved name, used for the parent object in the events (actions, conditions, expressions...). Please choose another name.`
        ),
        {
          delayToNextTick: true,
        }
      );
      return;
    }

    const { object } = objectWithContext;
    const { project, globalObjectsContainer, eventsBasedObject } = this.props;

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (object.getName() !== newName) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
        project,
        eventsBasedObject,
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

  _onObjectSelected = (selectedObjectName: string) => {
    if (!selectedObjectName) {
      this.setState({
        selectedObjectNames: [],
      });
    } else {
      this.setState({
        selectedObjectNames: [selectedObjectName],
      });
    }
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
    const { eventsBasedObject, project } = this.props;

    // TODO EBO When adding an object, filter the object types to excludes
    // object that depend (transitively) on this object to avoid cycles.
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
                objectsContainer={eventsBasedObject}
                layout={null}
                // TODO EBO Allow to use project resources as place holders
                resourceSources={[]}
                resourceExternalEditors={[]}
                onChooseResource={() => Promise.resolve([])}
                selectedObjectNames={this.state.selectedObjectNames}
                onEditObject={this.editObject}
                onDeleteObject={this._onDeleteObject(i18n)}
                canRenameObject={newName =>
                  this._canObjectOrGroupUseNewName(newName, i18n)
                }
                // Nothing special to do.
                onObjectCreated={() => {}}
                onObjectSelected={this._onObjectSelected}
                onRenameObject={(objectWithContext, newName, done) =>
                  this._onRenameObject(objectWithContext, newName, done, i18n)
                }
                // Instances can't be created from this context.
                onAddObjectInstance={() => {}}
                onObjectPasted={() => this.updateBehaviorsSharedData()}
                selectedObjectTags={[]}
                onChangeSelectedObjectTags={selectedObjectTags => {}}
                getAllObjectTags={() => []}
                ref={objectsList => (this._objectsList = objectsList)}
                unsavedChanges={null}
                // TODO EBO Hide the preview button or implement it.
                // Note that it will be hard to do hot reload as extensions need
                // to be generated.
                hotReloadPreviewButtonProps={{
                  hasPreviewsRunning: false,
                  launchProjectDataOnlyPreview: () => {},
                  launchProjectWithLoadingScreenPreview: () => {},
                }}
                onFetchNewlyAddedResources={
                  this.props.onFetchNewlyAddedResources
                }
              />
            </Line>
            {this.state.editedObjectWithContext && (
              <ObjectEditorDialog
                open
                object={this.state.editedObjectWithContext.object}
                initialTab={this.state.editedObjectInitialTab}
                project={project}
                resourceSources={[]}
                resourceExternalEditors={[]}
                onChooseResource={() => Promise.resolve([])}
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
                canRenameObject={newName =>
                  this._canObjectOrGroupUseNewName(newName, i18n)
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
              />
            )}
          </React.Fragment>
        )}
      </I18n>
    );
  }
}
