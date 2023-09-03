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

  // TODO: Deprecate/remove this?
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
    () => {
      if (inheritedVariablesContainer) {
        // No refactoring to do - this is a variable container of an instance
        // (or something else that overrides variables from another container),
        // which does not have an impact on the rest of the project.
      } else {
        gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
          project,
          getOriginalContentSerializedElement(),
          variablesContainer,
          removeReferencesToRemovedVariables
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
