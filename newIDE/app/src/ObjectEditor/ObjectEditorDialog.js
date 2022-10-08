// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { useEffect, Component, type ComponentType } from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import BehaviorsEditor from '../BehaviorsEditor';
import { Tabs, Tab } from '../UI/Tabs';
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

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

type InnerDialogProps = {|
  ...Props,
  editorComponent: ?ComponentType<EditorProps>,
  objectName: string,
  helpPagePath: ?string,
  object: gdObject,
|};

const InnerDialog = (props: InnerDialogProps) => {
  const [currentTab, setCurrentTab] = React.useState<ObjectEditorTab>(
    props.initialTab || 'properties'
  );
  const [newObjectName, setNewObjectName] = React.useState(props.objectName);
  const forceUpdate = useForceUpdate();
  const onCancelChanges = useSerializableObjectCancelableEditor({
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

  // TODO: Type this variable.
  const EditorComponent: any = props.editorComponent;

  const onApply = () => {
    props.onApply();
    // Do the renaming *after* applying changes, as "withSerializableObject"
    // HOC will unserialize the object to apply modifications, which will
    // override the name.
    props.onRename(newObjectName);
  };

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  useEffect(
    () => {
      if (currentTab === 'behaviors') {
        sendBehaviorsEditorShown({ parentEditor: 'object-editor-dialog' });
      }
    },
    [currentTab]
  );

  return (
    <Dialog
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
      noMargin
      noTitleMargin
      fullHeight
      flexBody
      title={
        <div>
          <Tabs value={currentTab} onChange={setCurrentTab}>
            <Tab
              label={<Trans>Properties</Trans>}
              value={'properties'}
              key={'properties'}
            />
            <Tab
              label={<Trans>Behaviors</Trans>}
              value={'behaviors'}
              key={'behaviors'}
              id="behaviors-tab"
            />
            <Tab
              label={<Trans>Variables</Trans>}
              value={'variables'}
              key={'variables'}
            />
            {objectMetadata.isUnsupportedBaseObjectCapability(
              'effect'
            ) ? null : (
              <Tab
                label={<Trans>Effects</Trans>}
                value={'effects'}
                key={'effects'}
              />
            )}
          </Tabs>
        </div>
      }
      id="object-editor-dialog"
    >
      {currentTab === 'properties' && EditorComponent && (
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
            <Column expand>
              <SemiControlledTextField
                fullWidth
                commitOnBlur
                floatingLabelText={<Trans>Object name</Trans>}
                floatingLabelFixed
                value={newObjectName}
                translatableHintText={t`Object Name`}
                onChange={text => {
                  if (text === newObjectName) return;

                  if (props.canRenameObject(text)) {
                    setNewObjectName(text);
                  }
                }}
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
          />
        </Column>
      )}
      {currentTab === 'behaviors' && (
        <BehaviorsEditor
          object={props.object}
          project={props.project}
          resourceManagementProps={props.resourceManagementProps}
          onSizeUpdated={
            forceUpdate /*Force update to ensure dialog is properly positionned*/
          }
          onUpdateBehaviorsSharedData={props.onUpdateBehaviorsSharedData}
        />
      )}
      {currentTab === 'variables' && (
        <Column expand noMargin>
          {props.object.getVariables().count() > 0 &&
            DismissableTutorialMessage && (
              <Line>
                <Column expand>{DismissableTutorialMessage}</Column>
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
          />
        </Column>
      )}
      {currentTab === 'effects' && (
        <EffectsList
          target="object"
          project={props.project}
          resourceManagementProps={props.resourceManagementProps}
          effectsContainer={props.object.getEffects()}
          onEffectsUpdated={
            forceUpdate /*Force update to ensure dialog is properly positionned*/
          }
        />
      )}
    </Dialog>
  );
};

type State = {|
  editorComponent: ?ComponentType<EditorProps>,
  castToObjectType: ?(
    objectConfiguration: gdObjectConfiguration
  ) => gdObjectConfiguration,
  helpPagePath: ?string,
  objectName: string,
|};

export default class ObjectEditorDialog extends Component<Props, State> {
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
