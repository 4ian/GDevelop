import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { withSerializableObject } from '../Utils/SerializableObjectEditorContainer';
import VariablesList from './index';

const gd: libGDevelop = global.gd;

export class VariablesEditorDialog extends Component {
  render() {
    const {
      onCancel,
      onApply,
      open,
      onEditObjectVariables,
      title,
      emptyExplanationMessage,
      emptyExplanationSecondMessage,
      variablesContainer,
    } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Cancel</Trans>}
        onClick={this.props.onCancel}
        key={'Cancel'}
      />,
      <FlatButton
        label={<Trans>Apply</Trans>}
        primary
        keyboardFocused
        onClick={onApply}
        key={'Apply'}
      />,
    ];
    const secondaryActions = onEditObjectVariables ? (
      <FlatButton
        label={<Trans>Edit Object Variables</Trans>}
        primary={false}
        onClick={onEditObjectVariables}
      />
    ) : null;

    return (
      <Dialog
        noMargin
        actions={actions}
        open={open}
        cannotBeDismissed={true}
        onRequestClose={onCancel}
        secondaryActions={secondaryActions}
        title={title}
      >
        <VariablesList
          commitVariableValueOnBlur={
            // Reduce the number of re-renders by saving the variable value only when the field is blurred.
            // We don't do that by default because the VariablesList can be used in a component like
            // InstancePropertiesEditor, that can be unmounted at any time, before the text fields get a
            // chance to be blurred.
            true
          }
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
