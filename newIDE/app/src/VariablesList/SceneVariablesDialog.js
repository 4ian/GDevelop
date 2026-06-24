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
  layout: gdLayout,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps | null,
  initiallySelectedVariable: VariableDialogOpeningProps | null,
  isListLocked: boolean,
|};

const SceneVariablesDialog = ({
  project,
  layout,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  initiallySelectedVariable,
  isListLocked,
}: Props): React.Node => {
  const onComputeAllVariableNames = React.useCallback(
    () =>
      EventsRootVariablesFinder.findAllLayoutVariables(
        project.getCurrentPlatform(),
        project,
        layout
      ),
    [layout, project]
  );

  const tabs = React.useMemo(
    () => [
      {
        id: 'scene-variables',
        label: <Trans>Scene variables</Trans>,
        variablesContainer: layout.getVariables(),
        emptyPlaceholderTitle: <Trans>Add your first scene variable</Trans>,
        emptyPlaceholderDescription: (
          <Trans>These variables hold additional information on a scene.</Trans>
        ),
        onComputeAllVariableNames,
      },
    ],
    [layout, onComputeAllVariableNames]
  );

  const projectScopedContainersAccessor = React.useMemo(
    () =>
      new ProjectScopedContainersAccessor({
        project,
        layout,
      }),
    [layout, project]
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
          title={<Trans>{layout.getName()} variables</Trans>}
          // $FlowFixMe[incompatible-type]
          tabs={tabs}
          initiallySelectedVariable={initiallySelectedVariable}
          helpPagePath={'/all-features/variables/scene-variables'}
          scopeName={i18n._(t`Scene variables`)}
          hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
          id="scene-variables-dialog"
          isListLocked={isListLocked}
        />
      )}
    </I18n>
  );
};

export default SceneVariablesDialog;
