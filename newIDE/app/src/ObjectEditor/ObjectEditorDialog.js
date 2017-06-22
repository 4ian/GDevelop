import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog from '../UI/Dialog';

export default class ObjectEditorDialog extends Component {
  constructor(props) {
    super(props);

    this._loadFrom(props.object);
  }

  _onApply = () => {
    if (this.props.onApply) this.props.onApply();
  };

  _loadFrom(object) {
    if (!object) return;

    this.editorComponent = ObjectsEditorService.getEditor(object.getType());
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.object !== newProps.object)
    ) {
      this._loadFrom(newProps.object);
    }
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary onTouchTap={this.props.onCancel} />,
      <FlatButton
        label="Apply"
        primary
        keyboardFocused
        onTouchTap={this._onApply}
      />,
    ];

    const EditorComponent = this.editorComponent;

    return (
      <Dialog
        noMargin
        actions={actions}
        modal
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        autoScrollBodyContent
      >
        {EditorComponent &&
          <EditorComponent
            object={this.props.object}
            project={this.props.project}
            resourceSources={this.props.resourceSources}
          />}
      </Dialog>
    );
  }
}
