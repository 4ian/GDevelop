// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { Column, Line } from '../UI/Grid';
import VariablesList from './VariablesList';
import HelpButton from '../UI/HelpButton';

const gd: libGDevelop = global.gd;

type Props = {|
  onCancel: () => void,
  onApply: () => void,
  open: boolean,
  onEditObjectVariables?: () => void,
  title: React.Node,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,

  project: gdProject,
  variablesContainer: gdVariablesContainer,
  inheritedVariablesContainer?: gdVariablesContainer,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,

  /**
   * Deprecated - will be removed once we don't want to display completions
   * for variables not declared but still used in events.
   */
  onComputeAllVariableNames: () => Array<string>,
  helpPagePath: ?string,
  id?: string,

  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
|};

const VariablesEditorDialog = ({
  onCancel,
  onApply,
  open,
  onEditObjectVariables,
  title,
  emptyPlaceholderTitle,
  emptyPlaceholderDescription,
  project,
  variablesContainer,
  inheritedVariablesContainer,
  hotReloadPreviewButtonProps,
  onComputeAllVariableNames,
  helpPagePath,
  preventRefactoringToDeleteInstructions,
  id,
}: Props) => {
  const {
    onCancelChanges,
    notifyOfChange,
    getOriginalContentSerializedElement,
  } = useSerializableObjectCancelableEditor({
    serializableObject: variablesContainer,
    onCancel,
    resetThenClearPersistentUuid: true,
  });
  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

  const onRefactorAndApply = React.useCallback(
    async () => {
      if (inheritedVariablesContainer) {
        // No refactoring to do - this is a variable container of an instance
        // (or something else that overrides variables from another container),
        // which does not have an impact on the rest of the project.
      } else {
        const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
          project,
          getOriginalContentSerializedElement(),
          variablesContainer
        );
        if (
          preventRefactoringToDeleteInstructions ||
          // While we support refactoring that would remove all references (actions, conditions...)
          // it's both a bit dangerous for the user and we would need to show the user what
          // will be removed before doing so. For now, just clear the removed variables so they don't
          // trigger any refactoring.
          true
        ) {
          // Clear the removed variables from the changeset, so they do not trigger
          // deletion of actions/conditions or events using them.
          changeset.clearRemovedVariables();
        }

        gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
          project,
          variablesContainer,
          changeset
        );
      }

      variablesContainer.clearPersistentUuid();
      onApply();
    },
    [
      onApply,
      project,
      getOriginalContentSerializedElement,
      variablesContainer,
      inheritedVariablesContainer,
      preventRefactoringToDeleteInstructions,
    ]
  );

  return (
    <Dialog
      title={title}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key="Cancel"
        />,
        <DialogPrimaryButton
          label={<Trans>Apply</Trans>}
          primary
          onClick={onRefactorAndApply}
          key="Apply"
          id="apply-button"
        />,
      ]}
      secondaryActions={[
        onEditObjectVariables ? (
          <FlatButton
            key="edit-object-variables"
            label={<Trans>Edit Object Variables</Trans>}
            primary={false}
            onClick={onEditObjectVariables}
          />
        ) : null,
        hotReloadPreviewButtonProps ? (
          <HotReloadPreviewButton
            key="hot-reload-preview-button"
            {...hotReloadPreviewButtonProps}
          />
        ) : null,
        helpPagePath ? (
          <HelpButton helpPagePath={helpPagePath} key="help" />
        ) : null,
      ]}
      onRequestClose={onCancelChanges}
      onApply={onRefactorAndApply}
      open={open}
      flexBody
      fullHeight
      id={id}
    >
      <Column expand noMargin noOverflowParent>
        {variablesContainer.count() > 0 && DismissableTutorialMessage && (
          <Line>
            <Column expand>{DismissableTutorialMessage}</Column>
          </Line>
        )}
        <VariablesList
          variablesContainer={variablesContainer}
          inheritedVariablesContainer={inheritedVariablesContainer}
          emptyPlaceholderTitle={emptyPlaceholderTitle}
          emptyPlaceholderDescription={emptyPlaceholderDescription}
          onComputeAllVariableNames={onComputeAllVariableNames}
          helpPagePath={helpPagePath}
          onVariablesUpdated={notifyOfChange}
        />
      </Column>
    </Dialog>
  );
};

export default VariablesEditorDialog;
