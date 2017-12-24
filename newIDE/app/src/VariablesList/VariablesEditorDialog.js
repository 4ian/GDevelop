import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
import VariablesList from './index';
const gd = global.gd;

export class VariablesEditorDialog extends Component {
  render() {
    const actions = [
      <FlatButton label="Cancel" onClick={this.props.onCancel} />,
      <FlatButton
        label="Apply"
        primary
        keyboardFocused
        onClick={this.props.onApply}
      />,
    ];

    return (
      <Dialog
        noMargin
        actions={actions}
        modal
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        autoScrollBodyContent
      >
        <VariablesList
          variablesContainer={this.props.variablesContainer}
          emptyExplanationMessage={this.props.emptyExplanationMessage}
          emptyExplanationSecondMessage={
            this.props.emptyExplanationSecondMessage
          }
        />
      </Dialog>
    );
  }
}

export default withSerializableObject(VariablesEditorDialog, {
  newObjectCreator: () => new gd.VariablesContainer(),
  propName: 'variablesContainer',
});
