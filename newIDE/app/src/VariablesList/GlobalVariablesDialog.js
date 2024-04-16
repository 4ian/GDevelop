// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';

type Props = {|
  open: boolean,
  project: gdProject,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
|};

const GlobalVariablesDialog = ({
  project,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
}: Props) => {
  const tabs = React.useMemo(
    () => [
      {
        id: 'global-variables',
        label: <Trans>Global variables</Trans>,
        variablesContainer: project.getVariables(),
        emptyPlaceholderTitle: <Trans>Add your first global variable</Trans>,
        emptyPlaceholderDescription: (
          <Trans>
            These variables hold additional information on a project.
          </Trans>
        ),
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
      helpPagePath={'/all-features/variables/global-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      onComputeAllVariableNames={() =>
        EventsRootVariablesFinder.findAllGlobalVariables(
          project.getCurrentPlatform(),
          project
        )
      }
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="global-variables-dialog"
    />
  );
};

export default GlobalVariablesDialog;
