// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import BehaviorsEditor from '../BehaviorsEditor';
import { Tabs } from '../UI/Tabs';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { Column, Line } from '../UI/Grid';
import { type EditorProps } from './Editors/EditorProps.flow';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import EffectsList from '../EffectsList';
import VariablesList from '../VariablesList/VariablesList';
import { sendBehaviorsEditorShown } from '../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import ErrorBoundary from '../UI/ErrorBoundary';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

export type ObjectEditorTab =
  | 'properties'
  | 'behaviors'
  | 'variables'
  | 'effects';

type Props = {|
  open: boolean,
  object: ?gdObject,

  onApply: () => void,
  onCancel: () => void,

  // Object renaming:
  onRename: string => void,
  getValidatedObjectOrGroupName: string => string,

  // Passed down to object editors:
  project: gdProject,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onComputeAllVariableNames: () => Array<string>,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges?: UnsavedChanges,
  onUpdateBehaviorsSharedData: () => void,
  initialTab: ?ObjectEditorTab,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
|};

type InnerDialogProps = {|
  ...Props,
  editorComponent: ?React.ComponentType<EditorProps>,
  objectName: string,
  helpPagePath: ?string,
  object: gdObject,
|};

const InnerDialog = (props: InnerDialogProps) => {
  const { showConfirmation } = useAlertDialog();
  const {
    openBehaviorEvents,
    object,
    project,
    layout,
    eventsFunctionsExtension,
    eventsBasedObject,
    helpPagePath,
    resourceManagementProps,
    getValidatedObjectOrGroupName,
    onCancel,
    onRename,
    initialTab,
    projectScopedContainersAccessor,
    onUpdateBehaviorsSharedData,
    onComputeAllVariableNames,
  } = props;
  const [currentTab, setCurrentTab] = React.useState<ObjectEditorTab>(
    initialTab || 'properties'
  );
  const [objectName, setObjectName] = React.useState(props.objectName);
  const forceUpdate = useForceUpdate();
  const {
    onCancelChanges,
    notifyOfChange,
    hasUnsavedChanges,
    getOriginalContentSerializedElement,
  } = useSerializableObjectCancelableEditor({
    serializableObject: object,
    useProjectToUnserialize: project,
    onCancel: onCancel,
    resetThenClearPersistentUuid: true,
  });

  // Don't use a memo for this because metadata from custom objects are built
  // from event-based object when extensions are refreshed after an extension
  // installation.
  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );

  const EditorComponent: ?React.ComponentType<EditorProps> =
    props.editorComponent;

  const onApply = async () => {
    props.onApply();

    const originalSerializedVariables = getOriginalContentSerializedElement().getChild(
      'variables'
    );
    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      object.getVariables()
    );
    if (changeset.hasRemovedVariables()) {
      // While we support refactoring that would remove all references (actions, conditions...)
      // it's both a bit dangerous for the user and we would need to show the user what
      // will be removed before doing so. For now, just clear the removed variables so they don't
      // trigger any refactoring.
      changeset.clearRemovedVariables();
    }

    gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
      project,
      object.getVariables(),
      changeset,
      originalSerializedVariables
    );
    object.clearPersistentUuid();

    // Do the renaming *after* applying changes, as "withSerializableObject"
    // HOC will unserialize the object to apply modifications, which will
    // override the name.
    onRename(objectName);
  };

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  React.useEffect(
    () => {
      if (currentTab === 'behaviors') {
        sendBehaviorsEditorShown({ parentEditor: 'object-editor-dialog' });
      }
    },
    [currentTab]
  );

  const askConfirmationAndOpenBehaviorEvents = React.useCallback(
    async (extensionName, behaviorName) => {
      if (hasUnsavedChanges()) {
        const answer = await showConfirmation({
          title: t`Discard changes and open events`,
          message: t`You've made some changes here. Are you sure you want to discard them and open the behavior events?`,
          confirmButtonLabel: t`Yes, discard my changes`,
          dismissButtonLabel: t`Stay there`,
        });
        if (!answer) return;
      }
      onCancelChanges();
      openBehaviorEvents(extensionName, behaviorName);
    },
    [hasUnsavedChanges, onCancelChanges, openBehaviorEvents, showConfirmation]
  );

  return (
    <Dialog
      title={<Trans>Edit {objectName}</Trans>}
      key={object && object.ptr}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          id="apply-button"
          primary
          onClick={onApply}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help-button" helpPagePath={helpPagePath} />,
        <HotReloadPreviewButton
          key="hot-reload-preview-button"
          {...props.hotReloadPreviewButtonProps}
        />,
      ]}
      onRequestClose={onCancelChanges}
      onApply={onApply}
      open={props.open}
      fullHeight
      flexBody
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              label: <Trans>Properties</Trans>,
              value: 'properties',
            },
            {
              label: <Trans>Behaviors</Trans>,
              value: 'behaviors',
              id: 'behaviors-tab',
            },
            {
              label: <Trans>Variables</Trans>,
              value: 'variables',
            },
            objectMetadata.hasDefaultBehavior(
              'EffectCapability::EffectBehavior'
            )
              ? {
                  label: <Trans>Effects</Trans>,
                  value: 'effects',
                }
              : null,
          ].filter(Boolean)}
        />
      }
      id="object-editor-dialog"
    >
      {currentTab === 'properties' && EditorComponent ? (
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
          <EditorComponent
            objectConfiguration={object.getConfiguration()}
            project={project}
            layout={layout}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedObject={eventsBasedObject}
            object={object}
            resourceManagementProps={resourceManagementProps}
            onSizeUpdated={
              forceUpdate /*Force update to ensure dialog is properly positioned*/
            }
            objectName={props.objectName}
            onObjectUpdated={notifyOfChange}
            renderObjectNameField={() => (
              <SemiControlledTextField
                fullWidth
                id="object-name"
                commitOnBlur
                floatingLabelText={<Trans>Object name</Trans>}
                floatingLabelFixed
                value={objectName}
                translatableHintText={t`Object Name`}
                onChange={newObjectName => {
                  if (newObjectName === objectName) return;

                  setObjectName(getValidatedObjectOrGroupName(newObjectName));
                  notifyOfChange();
                }}
                autoFocus="desktop"
              />
            )}
          />
        </Column>
      ) : null}
      {currentTab === 'behaviors' && (
        <BehaviorsEditor
          object={object}
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          resourceManagementProps={resourceManagementProps}
          onSizeUpdated={
            forceUpdate /*Force update to ensure dialog is properly positioned*/
          }
          onUpdateBehaviorsSharedData={onUpdateBehaviorsSharedData}
          onBehaviorsUpdated={notifyOfChange}
          openBehaviorEvents={askConfirmationAndOpenBehaviorEvents}
        />
      )}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          {object.getVariables().count() > 0 && DismissableTutorialMessage && (
            <Line>
              <Column noMargin expand>
                {DismissableTutorialMessage}
              </Column>
            </Line>
          )}
          <VariablesList
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            variablesContainer={object.getVariables()}
            areObjectVariables
            emptyPlaceholderTitle={
              <Trans>Add your first object variable</Trans>
            }
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on an object.
              </Trans>
            }
            helpPagePath={'/all-features/variables/object-variables'}
            onComputeAllVariableNames={onComputeAllVariableNames}
            onVariablesUpdated={notifyOfChange}
          />
        </Column>
      )}
      {currentTab === 'effects' && (
        <EffectsList
          target="object"
          // TODO (3D): declare the renderer type in object metadata.
          layerRenderingType="2d"
          project={project}
          resourceManagementProps={resourceManagementProps}
          effectsContainer={object.getEffects()}
          onEffectsRenamed={(oldName, newName) => {
            if (layout) {
              gd.WholeProjectRefactorer.renameObjectEffectInScene(
                project,
                layout,
                object,
                oldName,
                newName
              );
            } else if (eventsFunctionsExtension && eventsBasedObject) {
              gd.WholeProjectRefactorer.renameObjectEffectInEventsBasedObject(
                project,
                eventsFunctionsExtension,
                eventsBasedObject,
                object,
                oldName,
                newName
              );
            }
          }}
          onEffectsUpdated={() => {
            forceUpdate(); /*Force update to ensure dialog is properly positioned*/
            notifyOfChange();
          }}
        />
      )}
    </Dialog>
  );
};

type State = {|
  editorComponent: ?React.ComponentType<EditorProps>,
  castToObjectType: ?(
    objectConfiguration: gdObjectConfiguration
  ) => gdObjectConfiguration,
  helpPagePath: ?string,
  objectName: string,
|};

class ObjectEditorDialog extends React.Component<Props, State> {
  state = {
    editorComponent: null,
    castToObjectType: null,
    helpPagePath: null,
    objectName: '',
  };

  // This should be updated, see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html.
  UNSAFE_componentWillMount() {
    this._loadFrom(this.props.object);
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.object !== newProps.object)
    ) {
      this._loadFrom(newProps.object);
    }
  }

  _loadFrom(object: ?gdObject) {
    if (!object) return;

    const editorConfiguration = ObjectsEditorService.getEditorConfiguration(
      this.props.project,
      object.getType()
    );
    if (!editorConfiguration) {
      return this.setState({
        editorComponent: null,
        castToObjectType: null,
      });
    }

    this.setState({
      editorComponent: editorConfiguration.component,
      helpPagePath: editorConfiguration.helpPagePath,
      castToObjectType: editorConfiguration.castToObjectType,
      objectName: object.getName(),
    });
  }

  render() {
    const { object, initialTab } = this.props;
    const { editorComponent, castToObjectType, helpPagePath } = this.state;

    if (!object || !castToObjectType) return null;

    return (
      <InnerDialog
        {...this.props}
        editorComponent={editorComponent}
        key={this.props.object && this.props.object.ptr}
        helpPagePath={helpPagePath}
        object={object}
        objectName={this.state.objectName}
        initialTab={initialTab}
      />
    );
  }
}

const ObjectEditorWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Object editor</Trans>}
    scope="object-details"
    onClose={props.onCancel}
    showOnTop
  >
    <ObjectEditorDialog {...props} />
  </ErrorBoundary>
);

export default ObjectEditorWithErrorBoundary;
