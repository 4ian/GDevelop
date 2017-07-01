import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import ObjectsEditorService from './ObjectsEditorService';
import Dialog from '../UI/Dialog';

export default class ObjectEditorDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editor: null,
    };
  }

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

  _onApply = () => {
    if (this.props.onApply) this.props.onApply();
  };

  _loadFrom(object) {
    if (!object) return;

    this.setState({
      editor: ObjectsEditorService.getEditor(object.getType()),
    });
  }

  render() {
    const { editor } = this.state;
    if (!editor) return null;

    const actions = [
      <FlatButton label="Cancel" primary onTouchTap={this.props.onCancel} />,
      <FlatButton
        label="Apply"
        primary
        keyboardFocused
        onTouchTap={this._onApply}
      />,
    ];

    const EditorComponent = editor.component;
    const containerProps = editor.containerProps;

    return (
      <Dialog
        actions={actions}
        autoScrollBodyContent
        {...containerProps}
        modal
        onRequestClose={this.props.onCancel}
        open={this.props.open}
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
