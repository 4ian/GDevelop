// @flow weak
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import BehaviorsEditor from '../BehaviorsEditor';
import { Tabs, Tab } from 'material-ui/Tabs';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';

import { Column, Line } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';

const styles = {
  titleContainer: {
    padding: 0,
  },
};

type StateType = {|
  currentTab: string,
  newObjectName: string,
|};

export class ObjectEditorDialog extends Component<*, StateType> {
  state = {
    currentTab: 'properties',
    newObjectName: this.props.objectName,
  };

  _onChangeTab = (value: string) => {
    this.setState({
      currentTab: value,
    });
  };

  render() {
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        onClick={this.props.onCancel}
      />,
      <FlatButton
        key="apply"
        label={<Trans>Apply</Trans>}
        primary
        keyboardFocused
        onClick={() => {
          this.props.onRename(this.state.newObjectName);
          this.props.onApply();
        }}
      />,
    ];

    const EditorComponent = this.props.editorComponent;
    const { currentTab } = this.state;

    return (
      <Dialog
        key={this.props.object && this.props.object.ptr}
        secondaryActions={<HelpButton helpPagePath={this.props.helpPagePath} />}
        actions={actions}
        autoScrollBodyContent
        noMargin
        modal
        onRequestClose={this.props.onCancel}
        open={this.props.open}
        title={
          <div>
            <Tabs value={currentTab} onChange={this._onChangeTab}>
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
        titleStyle={styles.titleContainer}
      >
        <Line alignItems="baseline">
          <Column>Object Name:</Column>
          <Column expand>
            <SemiControlledTextField
              fullWidth
              commitOnBlur
              value={this.state.newObjectName}
              hintText={<Trans>Object Name</Trans>}
              onChange={text => {
                if (this.props.canRenameObject(text)) {
                  this.setState({ newObjectName: text });
                }
              }}
            />
          </Column>
        </Line>
        {currentTab === 'properties' && EditorComponent && (
          <EditorComponent
            object={this.props.object}
            project={this.props.project}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            onSizeUpdated={
              () =>
                this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
            }
            objectName={this.props.objectName}
          />
        )}
        {currentTab === 'behaviors' && (
          <BehaviorsEditor
            object={this.props.object}
            project={this.props.project}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            onSizeUpdated={
              () =>
                this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
            }
          />
        )}
      </Dialog>
    );
  }
}

type ContainerStateType = {|
  dialogComponent: ?Class<*>,
  editorComponent: ?Class<*>,
  castToObjectType: ?Function,
  helpPagePath: ?string,
  objectName: string,
|};

export default class ObjectEditorDialogContainer extends Component<*, *> {
  state: ContainerStateType = {
    dialogComponent: null,
    editorComponent: null,
    castToObjectType: null,
    helpPagePath: null,
    objectName: '',
  };

  componentWillMount() {
    this._loadFrom(this.props.object);
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.object !== newProps.object)
    ) {
      this._loadFrom(newProps.object);
    }
  }

  _loadFrom(object) {
    if (!object) return;

    const editorConfiguration = ObjectsEditorService.getEditorConfiguration(
      object.getType()
    );
    if (!editorConfiguration) {
      return this.setState({
        dialogComponent: null,
        editorComponent: null,
        castToObjectType: null,
      });
    }

    this.setState({
      dialogComponent: withSerializableObject(ObjectEditorDialog, {
        propName: 'object',
        newObjectCreator: () => editorConfiguration.createNewObject(object),
        useProjectToUnserialize: true,
      }),
      editorComponent: editorConfiguration.component,
      helpPagePath: editorConfiguration.helpPagePath,
      castToObjectType: editorConfiguration.castToObjectType,
      objectName: object.getName(),
    });
  }

  render() {
    if (
      !this.props.object ||
      !this.state.dialogComponent ||
      !this.state.castToObjectType
    )
      return null;

    const EditorDialog: Class<*> = this.state.dialogComponent;
    const { editorComponent, castToObjectType, helpPagePath } = this.state;

    return (
      <EditorDialog
        editorComponent={editorComponent}
        key={this.props.object && this.props.object.ptr}
        helpPagePath={helpPagePath}
        {...this.props}
        object={castToObjectType(this.props.object)}
        objectName={this.state.objectName}
      />
    );
  }
}
