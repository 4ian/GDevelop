import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
import VariablesList from './index';

const gd = global.gd;

export class VariablesEditorDialog extends Component {
  render() {
    const {
      onCancel,
      onApply,
      open,
      onEditObjectVariables,
      titleMessage,
      emptyExplanationMessage,
      emptyExplanationSecondMessage,
      variablesContainer,
    } = this.props;
    const actions = [
      <FlatButton label="Cancel" onClick={onCancel} key={'Cancel'} />,
      <FlatButton
        label="Apply"
        primary
        keyboardFocused
        onClick={onApply}
        key={'Apply'}
      />,
    ];
    const secondaryActions =
      onEditObjectVariables === undefined ? (
        ''
      ) : (
        <FlatButton
          label="Edit Object Variables"
          key="InstanceEditObjectVariables"
          primary={false}
          onClick={onEditObjectVariables}
        />
      );

    return (
      <Dialog
        noMargin
        actions={actions}
        modal
        open={open}
        onRequestClose={onCancel}
        autoScrollBodyContent
        secondaryActions={secondaryActions}
        title={titleMessage}
      >
        <VariablesList
          variablesContainer={variablesContainer}
          emptyExplanationMessage={emptyExplanationMessage}
          emptyExplanationSecondMessage={emptyExplanationSecondMessage}
          onSizeUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
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
