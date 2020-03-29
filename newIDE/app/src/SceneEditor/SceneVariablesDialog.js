// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';

type Props = {|
  open: boolean,
  layout: gdLayout,
  onApply?: () => void,
  onClose: () => void,
|};

export default class SceneVariablesDialog extends React.Component<Props, {||}> {
  render() {
    return (
      <VariablesEditorDialog
        open={this.props.open}
        variablesContainer={this.props.layout.getVariables()}
        onCancel={this.props.onClose}
        onApply={this.props.onApply}
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
