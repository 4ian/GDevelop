// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import { Column } from '../UI/Grid';
import ObjectsList from '../ObjectsList';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import { showWarningBox } from '../UI/Messages/MessageBox';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import Window from '../Utils/Window';
import ObjectEditorDialog from '../ObjectEditor/ObjectEditorDialog';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
|};

type State = {|
  editedObjectWithContext: ?ObjectWithContext,
  editedObjectInitialTab: ?ObjectEditorTab,
|};

export default class EventBasedObjectChildrenEditor extends React.Component<
  Props,
  State
> {
  _objectsList: ?ObjectsList;

  state = {
    editedObjectWithContext: null,
    editedObjectInitialTab: 'properties',
  };

  _onDeleteObject = (i18n: I18nType) => (
    objectWithContext: ObjectWithContext,
    done: boolean => void
  ) => {
    const { object } = objectWithContext;
    const { project, eventsBasedObject } = this.props;
    const layout = eventsBasedObject.getLayout();

    const answer = Window.showYesNoCancelDialog(
      i18n._(
        t`Do you want to remove all references to this object in groups and events (actions and conditions using the object)?`
      )
    );

    if (answer === 'cancel') return;
    const shouldRemoveReferences = answer === 'yes';

    gd.WholeProjectRefactorer.objectOrGroupRemovedInLayout(
      project,
      layout,
      object.getName(),
      /* isObjectGroup=*/ false,
      shouldRemoveReferences
    );
    done(true);
  };

  _canObjectOrGroupUseNewName = (newName: string) => {
    const { eventsBasedObject } = this.props;
    const layout = eventsBasedObject.getLayout();

    if (
      layout.hasObjectNamed(newName) ||
      layout.getObjectGroups().has(newName)
    ) {
      showWarningBox('Another object or group with this name already exists.', {
        delayToNextTick: true,
      });
      return false;
    } else if (!gd.Project.validateName(newName)) {
      showWarningBox(
        'This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.',
        { delayToNextTick: true }
      );
      return false;
    }

    return true;
  };

  _onRenameEditedObject = (newName: string) => {
    const { editedObjectWithContext } = this.state;

    if (editedObjectWithContext) {
      this._onRenameObject(editedObjectWithContext, newName, () => {});
    }
  };

  _onRenameObject = (
    objectWithContext: ObjectWithContext,
    newName: string,
    done: boolean => void
  ) => {
    const { object } = objectWithContext;
    const { project, eventsBasedObject } = this.props;
    const layout = eventsBasedObject.getLayout();

    // newName is supposed to have been already validated

    // Avoid triggering renaming refactoring if name has not really changed
    if (object.getName() !== newName) {
      gd.WholeProjectRefactorer.objectOrGroupRenamedInLayout(
        project,
        layout,
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

  updateBehaviorsSharedData = () => {
    const { project, eventsBasedObject } = this.props;
    const layout = eventsBasedObject.getLayout();
    layout.updateBehaviorsSharedData(project);
  };

  forceUpdateObjectsList = () => {
    if (this._objectsList) this._objectsList.forceUpdateList();
  };

  render() {
    const { eventsBasedObject, project } = this.props;

    return (
      <React.Fragment>
        <I18n>
          {({ i18n }) => (
            <Column
              noMargin
              expand
              useFullHeight={
                true /* Ensure editors with large/scrolling children won't grow outside of the dialog. */
              }
              noOverflowParent={
                true /* Ensure editors with large/scrolling children won't grow outside of the dialog. */
              }
            >
              <ObjectsList
                getThumbnail={ObjectsRenderingService.getThumbnail.bind(
                  ObjectsRenderingService
                )}
                project={project}
                objectsContainer={eventsBasedObject.getLayout()}
                layout={eventsBasedObject.getLayout()}
                // TODO EBO An object doesn't have scene events.
                events={eventsBasedObject.getLayout().getEvents()}
                // TODO EBO Allow to use project resources as place holders?
                resourceSources={[]}
                resourceExternalEditors={[]}
                onChooseResource={() => Promise.resolve([])}
                selectedObjectNames={[]}
                onEditObject={this.editObject}
                onDeleteObject={this._onDeleteObject(i18n)}
                canRenameObject={this._canObjectOrGroupUseNewName}
                // Instances can't be created from this context. What does this do actually?
                onObjectCreated={() => {}} // {this._onObjectCreated}
                // Object selection has no impact.
                onObjectSelected={() => {}}
                onRenameObject={this._onRenameObject}
                // Instances can't be created from this context.
                onAddObjectInstance={() => {}}
                onObjectPasted={() => this.updateBehaviorsSharedData()}
                // TODO EBO Handle tag filtering
                selectedObjectTags={[]}
                onChangeSelectedObjectTags={selectedObjectTags => {}}
                getAllObjectTags={() => []}
                ref={objectsList => (this._objectsList = objectsList)}
                unsavedChanges={null}
                hotReloadPreviewButtonProps={{
                  hasPreviewsRunning: false,
                  launchProjectDataOnlyPreview: () => {},
                  launchProjectWithLoadingScreenPreview: () => {},
                }}
              />
            </Column>
          )}
        </I18n>
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
              const { editedObjectWithContext } = this.state;
              if (!editedObjectWithContext) return [];

              return EventsRootVariablesFinder.findAllObjectVariables(
                project.getCurrentPlatform(),
                project,
                eventsBasedObject.getLayout(),
                editedObjectWithContext.object
              );
            }}
            onCancel={() => {
              this.editObject(null);
            }}
            canRenameObject={this._canObjectOrGroupUseNewName}
            onRename={newName => {
              this._onRenameEditedObject(newName);
            }}
            onApply={() => {
              this.editObject(null);
              this.updateBehaviorsSharedData();
              this.forceUpdateObjectsList();
            }}
            hotReloadPreviewButtonProps={{
              hasPreviewsRunning: false,
              launchProjectDataOnlyPreview: () => {},
              launchProjectWithLoadingScreenPreview: () => {},
            }}
            onUpdateBehaviorsSharedData={() => this.updateBehaviorsSharedData()}
          />
        )}
      </React.Fragment>
    );
  }
}
