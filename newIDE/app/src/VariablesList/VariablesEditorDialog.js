// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
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
import useAlertDialog from '../UI/Alert/useAlertDialog';

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
  id,
}: Props) => {
  const { showConfirmation } = useAlertDialog();
  const {
    onCancelChanges,
    notifyOfChange,
    getOriginalContentSerializedElement,
  } = useSerializableObjectCancelableEditor({
    serializableObject: variablesContainer,
    onCancel,
    resetThenClearPersistentUuid: true,
  });
  const removeReferencesToRemovedVariables = true;
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
        if (changeset.hasRemovedVariables()) {
          const shouldRemoveVariables = await showConfirmation({
            title: t`Remove actions and conditions?`,
            message: t`You've removed some variables. Do you want to also remove all the actions and conditions in events using them?`,
            confirmButtonLabel: t`Don't remove anything else`,
            dismissButtonLabel: t`Delete all references to these variables`,
          });
          if (shouldRemoveVariables) {
            changeset.clearRemovedVariables();
          }
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
      removeReferencesToRemovedVariables,
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
          commitChangesOnBlur
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
