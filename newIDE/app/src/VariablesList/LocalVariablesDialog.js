// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  variablesContainer: gdVariablesContainer,
  indexVariableName?: ?string,
  onRenameIndexVariable?: (newName: string) => void,
  onRemoveIndexVariable?: () => void,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  initiallySelectedVariableName: string,
  shouldCreateInitiallySelectedVariable?: boolean,
  isListLocked: boolean,
|};

const LocalVariablesDialog = ({
  project,
  projectScopedContainersAccessor,
  variablesContainer,
  indexVariableName,
  onRenameIndexVariable,
  onRemoveIndexVariable,
  open,
  onCancel,
  onApply,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
  isListLocked,
}: Props) => {
  const tabs = React.useMemo(
    () => [
      {
        id: 'local-variables',
        label: '',
        variablesContainer,
        onComputeAllVariableNames: () => [],
        indexVariableName: indexVariableName || '',
        onRenameIndexVariable,
        onRemoveIndexVariable,
      },
    ],
    [
      variablesContainer,
      indexVariableName,
      onRenameIndexVariable,
      onRemoveIndexVariable,
    ]
  );

  return (
    <VariablesEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>Local variables</Trans>}
      tabs={tabs}
      helpPagePath={'/all-features/variables/local-variables'}
      id="local-variables-dialog"
      initiallySelectedVariableName={initiallySelectedVariableName}
      shouldCreateInitiallySelectedVariable={
        shouldCreateInitiallySelectedVariable
      }
      hotReloadPreviewButtonProps={null}
      isListLocked={isListLocked}
    />
  );
};

export default LocalVariablesDialog;
