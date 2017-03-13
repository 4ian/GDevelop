import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import VariablesList from './index';
const gd = global.gd;

export default class VariablesEditorDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editedVariablesContainer: new gd.VariablesContainer(),
    };
    this._loadFrom(props.variablesContainer);
  }

  _onApply = () => {
    this._save();
    if (this.props.onApply) this.props.onApply();
  };

  _loadFrom(variablesContainer) {
    if (!variablesContainer) return;

    const serializedElement = new gd.SerializerElement();
    variablesContainer.serializeTo(serializedElement);
    this.state.editedVariablesContainer.unserializeFrom(serializedElement);
    serializedElement.delete();
  }

  _save() {
    if (!this.props.variablesContainer) return;

    const serializedElement = new gd.SerializerElement();
    this.state.editedVariablesContainer.serializeTo(serializedElement);
    this.props.variablesContainer.unserializeFrom(serializedElement);
    serializedElement.delete();
  }

  componentWillUnmount() {
    this.state.editedVariablesContainer.delete();
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open &&
        this.props.variablesContainer !== newProps.variablesContainer)
    ) {
      this._loadFrom(newProps.variablesContainer);
    }
  }

  render() {
    const actions = [
      (
        <FlatButton
          label="Cancel"
          primary={true}
          onTouchTap={this.props.onCancel}
        />
      ),
      (
        <FlatButton
          label="Apply"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this._onApply}
        />
      ),
    ];

    return (
      <Dialog
        noMargin
        actions={actions}
        modal={true}
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        autoScrollBodyContent={true}
      >
        <VariablesList
          variablesContainer={this.state.editedVariablesContainer}
        />
      </Dialog>
    );
  }
}
