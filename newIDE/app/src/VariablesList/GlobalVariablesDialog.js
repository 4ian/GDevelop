// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import VariablesEditorDialog, {
  type VariableDialogOpeningProps,
} from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  project: gdProject,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  initiallySelectedVariable: VariableDialogOpeningProps | null,
  isListLocked: boolean,
|};

const GlobalVariablesDialog = ({
  project,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  initiallySelectedVariable,
  isListLocked,
}: Props): React.Node => {
  const onComputeAllVariableNames = React.useCallback(
    () =>
      EventsRootVariablesFinder.findAllGlobalVariables(
        project.getCurrentPlatform(),
        project
      ),
    [project]
  );

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
        onComputeAllVariableNames,
      },
    ],
    [project, onComputeAllVariableNames]
  );

  const projectScopedContainersAccessor = React.useMemo(
    () =>
      new ProjectScopedContainersAccessor({
        project,
      }),
    [project]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <VariablesEditorDialog
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          open={open}
          onCancel={onCancel}
          onApply={onApply}
          title={<Trans>Global variables</Trans>}
          // $FlowFixMe[incompatible-type]
          tabs={tabs}
          initiallySelectedVariable={initiallySelectedVariable}
          helpPagePath={'/all-features/variables/global-variables'}
          scopeName={i18n._(t`Global variables`)}
          hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
          id="global-variables-dialog"
          isListLocked={isListLocked}
        />
      )}
    </I18n>
  );
};

export default GlobalVariablesDialog;
