// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';

type Props = {|
  open: boolean,
  layout: gdLayout,
  onApply: () => void,
  onClose: () => void,
|};

export default (props: Props) => {
  return (
    <VariablesEditorDialog
      open={props.open}
      variablesContainer={props.layout.getVariables()}
      onCancel={props.onClose}
      onApply={props.onApply}
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
};
