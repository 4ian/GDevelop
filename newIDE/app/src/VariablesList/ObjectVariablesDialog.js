// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectName?: ?string,
  variablesContainer: gdVariablesContainer,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,
  onComputeAllVariableNames: () => Array<string>,
|};

const ObjectVariablesDialog = ({
  project,
  objectName,
  variablesContainer,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
  projectScopedContainersAccessor,
  onComputeAllVariableNames,
}: Props) => {
  const tabs = React.useMemo(
    () => [
      {
        id: 'object-variables',
        label: '',
        variablesContainer: variablesContainer,
        emptyPlaceholderTitle: <Trans>Add your first object variable</Trans>,
        emptyPlaceholderDescription: (
          <Trans>
            These variables hold additional information on an object.
          </Trans>
        ),
        onComputeAllVariableNames,
      },
    ],
    [onComputeAllVariableNames, variablesContainer]
  );

  return (
    <VariablesEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      areObjectVariables
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>{objectName} variables</Trans>}
      tabs={tabs}
      initiallySelectedVariableName={initiallySelectedVariableName}
      shouldCreateInitiallySelectedVariable={
        shouldCreateInitiallySelectedVariable
      }
      helpPagePath={'/all-features/variables/object-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="object-variables-dialog"
    />
  );
};

export default ObjectVariablesDialog;
