// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import BehaviorsEditor from '../BehaviorsEditor';
import { Tabs, Tab } from '../UI/Tabs';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { Column, Line } from '../UI/Grid';
import { type EditorProps } from './Editors/EditorProps.flow';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';

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
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  unsavedChanges?: UnsavedChanges,
  onUpdateBehaviorsSharedData: () => void,

  // Preview:
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

type InnerDialogProps = {|
  ...Props,
  editorComponent: ?Class<React.Component<EditorProps, any>>,
  objectName: string,
  helpPagePath: ?string,
  object: gdObject,
|};

const InnerDialog = (props: InnerDialogProps) => {
  const [currentTab, setCurrentTab] = React.useState('properties');
  const [newObjectName, setNewObjectName] = React.useState(props.objectName);
  const forceUpdate = useForceUpdate();
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: props.object,
    useProjectToUnserialize: props.project,
    onCancel: props.onCancel,
  });

  const EditorComponent = props.editorComponent;

  const onApply = () => {
    props.onApply();
    // Do the renaming *after* applying changes, as "withSerializableObject"
    // HOC will unserialize the object to apply modifications, which will
    // override the name.
    props.onRename(newObjectName);
  };

  return (
    <Dialog
      onApply={onApply}
      key={props.object && props.object.ptr}
      secondaryActions={[
        <HelpButton key="help-button" helpPagePath={props.helpPagePath} />,
        <HotReloadPreviewButton
          key="hot-reload-preview-button"
          {...props.hotReloadPreviewButtonProps}
        />,
      ]}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
        />,
        <FlatButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
        />,
      ]}
      noMargin
      onRequestClose={onCancelChanges}
      cannotBeDismissed={true}
      open={props.open}
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
            />
          </Tabs>
        </div>
      }
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
                hintText={t`Object Name`}
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
            object={props.object}
            project={props.project}
            resourceSources={props.resourceSources}
            onChooseResource={props.onChooseResource}
            resourceExternalEditors={props.resourceExternalEditors}
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
          resourceSources={props.resourceSources}
          onChooseResource={props.onChooseResource}
          resourceExternalEditors={props.resourceExternalEditors}
          onSizeUpdated={
            forceUpdate /*Force update to ensure dialog is properly positionned*/
          }
          onUpdateBehaviorsSharedData={props.onUpdateBehaviorsSharedData}
        />
      )}
    </Dialog>
  );
};

type State = {|
  editorComponent: ?Class<React.Component<EditorProps, any>>,
  castToObjectType: ?(object: gdObject) => gdObject,
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

  componentWillMount() {
    this._loadFrom(this.props.object);
  }

  componentWillReceiveProps(newProps: Props) {
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
    const { object } = this.props;
    const { editorComponent, castToObjectType, helpPagePath } = this.state;

    if (!object || !castToObjectType) return null;

    return (
      <InnerDialog
        {...this.props}
        editorComponent={editorComponent}
        key={this.props.object && this.props.object.ptr}
        helpPagePath={helpPagePath}
        object={castToObjectType(object)}
        objectName={this.state.objectName}
      />
    );
  }
}
