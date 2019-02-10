import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
import VariablesList from './index';
import styles from './styles';

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
      <FlatButton label="Cancel" onClick={onCancel} />,
      <FlatButton label="Apply" primary keyboardFocused onClick={onApply} />,
    ];

    return (
      <Dialog
        noMargin
        actions={actions}
        modal
        open={open}
        onRequestClose={onCancel}
        autoScrollBodyContent
      >
        {titleMessage && <div style={styles.titleMessage}>{titleMessage}</div>}
        <VariablesList
          variablesContainer={variablesContainer}
          emptyExplanationMessage={emptyExplanationMessage}
          emptyExplanationSecondMessage={emptyExplanationSecondMessage}
          onSizeUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
          }
          onEditObjectVariables={onEditObjectVariables}
        />
      </Dialog>
    );
  }
}

export default withSerializableObject(VariablesEditorDialog, {
  newObjectCreator: () => new gd.VariablesContainer(),
  propName: 'variablesContainer',
});
