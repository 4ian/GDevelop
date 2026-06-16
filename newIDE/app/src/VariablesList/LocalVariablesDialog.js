// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import VariablesEditorDialog, {
  type VariableDialogOpeningProps,
} from './VariablesEditorDialog';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  open: boolean,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  variablesContainer: gdVariablesContainer,
  loopIndexVariableName?: ?string,
  onRenameLoopIndexVariable?: (newName: string) => void,
  onRemoveLoopIndexVariable?: () => void,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  initiallySelectedVariable: VariableDialogOpeningProps | null,
  isListLocked: boolean,
|};

const LocalVariablesDialog = ({
  project,
  projectScopedContainersAccessor,
  variablesContainer,
  loopIndexVariableName,
  onRenameLoopIndexVariable,
  onRemoveLoopIndexVariable,
  open,
  onCancel,
  onApply,
  initiallySelectedVariable,
  isListLocked,
}: Props): React.Node => {
  const tabs = React.useMemo(
    () => [
      {
        id: 'local-variables',
        label: '',
        variablesContainer,
        // $FlowFixMe[missing-empty-array-annot]
        onComputeAllVariableNames: () => [],
        loopIndexVariableName: loopIndexVariableName || '',
        onRenameLoopIndexVariable,
        onRemoveLoopIndexVariable,
      },
    ],
    [
      variablesContainer,
      loopIndexVariableName,
      onRenameLoopIndexVariable,
      onRemoveLoopIndexVariable,
    ]
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
          title={<Trans>Local variables</Trans>}
          // $FlowFixMe[incompatible-type]
          tabs={tabs}
          helpPagePath={'/all-features/variables/local-variables'}
          scopeName={i18n._(t`Local variables`)}
          id="local-variables-dialog"
          initiallySelectedVariable={initiallySelectedVariable}
          hotReloadPreviewButtonProps={null}
          isListLocked={isListLocked}
        />
      )}
    </I18n>
  );
};

export default LocalVariablesDialog;
