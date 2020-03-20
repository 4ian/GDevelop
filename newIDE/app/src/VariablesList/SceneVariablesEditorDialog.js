// @flow
import React, { Component } from 'react';
import VariablesEditorDialog from './VariablesEditorDialog.js';
import { Trans } from '@lingui/macro';

export default class SceneVariableEditorDialog extends Component {
  render() {
    const { layout, open, onEditLayoutVariables } = this.props;
    return (
      <VariablesEditorDialog
        open={open}
        variablesContainer={layout.getVariables()}
        onCancel={() => onEditLayoutVariables()}
        onApply={() => onEditLayoutVariables()}
        title={<Trans>Scene Variables</Trans>}
        emptyExplanationMessage={
          <Trans>
            Scene variables can be used to store any value or text during the
            game.
          </Trans>
        }
        emptyExplanationSecondMessage={
          <Trans>
            For example, you can have a variable called Score representing the
            current score of the player.
          </Trans>
        }
      />
    );
  }
}
