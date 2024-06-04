// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';

type Props = {|
  open: boolean,
  project: gdProject,
  layout?: ?gdLayout,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectName?: ?string,
  variablesContainer: gdVariablesContainer,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  initiallySelectedVariableName?: string,
|};

const ObjectVariablesDialog = ({
  project,
  layout,
  objectName,
  variablesContainer,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
  initiallySelectedVariableName,
  projectScopedContainersAccessor,
}: Props) => {
  const onComputeAllVariableNames = React.useCallback(
    () =>
      project && layout && objectName
        ? EventsRootVariablesFinder.findAllObjectVariables(
            project.getCurrentPlatform(),
            project,
            layout,
            objectName
          )
        : [],
    [layout, objectName, project]
  );

  const tabs = React.useMemo(
    () => [
      {
        id: 'object-variables',
        label: <Trans>Object variables</Trans>,
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
      title={<Trans>Object variables</Trans>}
      tabs={tabs}
      initiallySelectedVariableName={initiallySelectedVariableName}
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
