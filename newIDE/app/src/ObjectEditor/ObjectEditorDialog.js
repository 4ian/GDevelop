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
  canRenameObject: string => boolean,

  // Passed down to object editors:
  project: gdProject,
  onComputeAllVariableNames: () => Array<string>,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges?: UnsavedChanges,
  onUpdateBehaviorsSharedData: () => void,
  initialTab: ?ObjectEditorTab,

  // Passed down to the behaviors editor:
  eventsFunctionsExtension?: gdEventsFunctionsExtension,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

type InnerDialogProps = {|
  ...Props,
  editorComponent: ?React.ComponentType<EditorProps>,
  objectName: string,
  helpPagePath: ?string,
  object: gdObject,
|};

const InnerDialog = (props: InnerDialogProps) => {
  const [currentTab, setCurrentTab] = React.useState<ObjectEditorTab>(
    props.initialTab || 'properties'
  );
  const [objectName, setObjectName] = React.useState(props.objectName);
  const forceUpdate = useForceUpdate();
  const {
    onCancelChanges,
    notifyOfChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: props.object,
    useProjectToUnserialize: props.project,
    onCancel: props.onCancel,
  });

  const objectMetadata = React.useMemo(
    () =>
      gd.MetadataProvider.getObjectMetadata(
        props.project.getCurrentPlatform(),
        props.object.getType()
      ),
    [props.project, props.object]
  );

  const EditorComponent: ?React.ComponentType<EditorProps> =
    props.editorComponent;

  const onApply = () => {
    props.onApply();
    // Do the renaming *after* applying changes, as "withSerializableObject"
    // HOC will unserialize the object to apply modifications, which will
    // override the name.
    props.onRename(objectName);
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

  return (
    <Dialog
      title={<Trans>Edit {objectName}</Trans>}
      key={props.object && props.object.ptr}
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
        <HelpButton key="help-button" helpPagePath={props.helpPagePath} />,
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
            objectMetadata.isUnsupportedBaseObjectCapability('effect')
              ? null
              : {
                  label: <Trans>Effects</Trans>,
                  value: 'effects',
                },
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
          <Line>
            <Column expand noMargin>
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

                  if (props.canRenameObject(newObjectName)) {
                    setObjectName(newObjectName);
                    notifyOfChange();
                  }
                }}
                autoFocus // Focus the name when the dialog is opened.
              />
            </Column>
          </Line>
          <EditorComponent
            objectConfiguration={props.object.getConfiguration()}
            project={props.project}
            resourceManagementProps={props.resourceManagementProps}
            onSizeUpdated={
              forceUpdate /*Force update to ensure dialog is properly positionned*/
            }
            objectName={props.objectName}
            onObjectUpdated={notifyOfChange}
          />
        </Column>
      ) : null}
      {currentTab === 'behaviors' && (
        <BehaviorsEditor
          object={props.object}
          project={props.project}
          eventsFunctionsExtension={props.eventsFunctionsExtension}
          resourceManagementProps={props.resourceManagementProps}
          onSizeUpdated={
            forceUpdate /*Force update to ensure dialog is properly positionned*/
          }
          onUpdateBehaviorsSharedData={props.onUpdateBehaviorsSharedData}
          onBehaviorsUpdated={notifyOfChange}
        />
      )}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          {props.object.getVariables().count() > 0 &&
            DismissableTutorialMessage && (
              <Line>
                <Column noMargin expand>
                  {DismissableTutorialMessage}
                </Column>
              </Line>
            )}
          <VariablesList
            commitChangesOnBlur
            variablesContainer={props.object.getVariables()}
            emptyPlaceholderTitle={
              <Trans>Add your first object variable</Trans>
            }
            emptyPlaceholderDescription={
              <Trans>
                These variables hold additional information on an object.
              </Trans>
            }
            helpPagePath={'/all-features/variables/object-variables'}
            onComputeAllVariableNames={props.onComputeAllVariableNames}
            onVariablesUpdated={notifyOfChange}
          />
        </Column>
      )}
      {currentTab === 'effects' && (
        <EffectsList
          target="object"
          project={props.project}
          resourceManagementProps={props.resourceManagementProps}
          effectsContainer={props.object.getEffects()}
          onEffectsUpdated={() => {
            forceUpdate(); /*Force update to ensure dialog is properly positionned*/
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

export default class ObjectEditorDialog extends React.Component<Props, State> {
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
