import { Trans } from '@lingui/macro';
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
        modal
        open={open}
        onRequestClose={onCancel}
        autoScrollBodyContent
        secondaryActions={secondaryActions}
        title={title}
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
