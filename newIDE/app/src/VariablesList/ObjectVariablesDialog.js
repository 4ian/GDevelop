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
  objectName: string | null,
  initialInstances: gdInitialInstancesContainer | null,
  variablesContainer: gdVariablesContainer,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  initiallySelectedVariableName?: string,
  shouldCreateInitiallySelectedVariable?: boolean,
  onComputeAllVariableNames: () => Array<string>,
  isListLocked: boolean,
|};

const ObjectVariablesDialog = ({
  project,
  objectName,
  initialInstances,
  variablesContainer,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  initiallySelectedVariableName,
  shouldCreateInitiallySelectedVariable,
  projectScopedContainersAccessor,
  onComputeAllVariableNames,
  isListLocked,
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
      objectName={objectName}
      initialInstances={initialInstances}
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
      id="object-variables-dialog"
      isListLocked={isListLocked}
    />
  );
};

export default ObjectVariablesDialog;
