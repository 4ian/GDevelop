// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';

type Props = {|
  open: boolean,
  project: gdProject,
  variablesContainer: gdVariablesContainer,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  initiallySelectedVariableName: string,
|};

const LocalVariablesDialog = ({
  project,
  variablesContainer,
  open,
  onCancel,
  onApply,
  initiallySelectedVariableName,
}: Props) => {
  const tabs = React.useMemo(
    () => [
      {
        id: 'local-variables',
        label: '',
        variablesContainer,
        onComputeAllVariableNames: () => [],
      },
    ],
    [variablesContainer]
  );

  return (
    <VariablesEditorDialog
      project={project}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>Global variables</Trans>}
      tabs={tabs}
      helpPagePath={'/all-features/variables/local-variables'}
      preventRefactoringToDeleteInstructions
      id="local-variables-dialog"
      initiallySelectedVariableName={initiallySelectedVariableName}
    />
  );
};

export default LocalVariablesDialog;
