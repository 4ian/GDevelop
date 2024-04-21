// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';

type Props = {|
  open: boolean,
  project: gdProject,
  layout: gdLayout,
  onApply: () => void,
  onClose: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

const SceneVariablesDialog = (props: Props) => {
  return (
    <VariablesEditorDialog
      project={props.project}
      open={props.open}
      variablesContainer={props.layout.getVariables()}
      onCancel={props.onClose}
      onApply={props.onApply}
      title={<Trans>{props.layout.getName()} variables</Trans>}
      emptyPlaceholderTitle={<Trans>Add your first scene variable</Trans>}
      emptyPlaceholderDescription={
        <Trans>These variables hold additional information on a scene.</Trans>
      }
      helpPagePath={'/all-features/variables/scene-variables'}
      hotReloadPreviewButtonProps={props.hotReloadPreviewButtonProps}
      onComputeAllVariableNames={() =>
        EventsRootVariablesFinder.findAllLayoutVariables(
          props.project.getCurrentPlatform(),
          props.project,
          props.layout
        )
      }
      id="scene-variables-dialog"
    />
  );
};

export default SceneVariablesDialog;
