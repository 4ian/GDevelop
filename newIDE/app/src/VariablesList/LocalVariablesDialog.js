// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';

type Props = {|
  open: boolean,
  project: gdProject,
  variablesContainer: gdVariablesContainer,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  initiallySelectedVariableName: string,
|};

const LocalVariablesDialog = ({
  project,
  variablesContainer,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
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
    [project]
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
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      preventRefactoringToDeleteInstructions
      id="local-variables-dialog"
      initiallySelectedVariableName={initiallySelectedVariableName}
    />
  );
};

export default LocalVariablesDialog;
