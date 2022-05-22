// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { Column, Line } from '../UI/Grid';
import VariablesList from './VariablesList';
import HelpButton from '../UI/HelpButton';

type Props = {|
  onCancel: () => void,
  onApply: () => void,
  open: boolean,
  onEditObjectVariables?: () => void,
  title: React.Node,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,
  variablesContainer: gdVariablesContainer,
  inheritedVariablesContainer?: gdVariablesContainer,
  hotReloadPreviewButtonProps?: ?HotReloadPreviewButtonProps,
  onComputeAllVariableNames: () => Array<string>,
  helpPagePath: ?string,
|};

const VariablesEditorDialog = ({
  onCancel,
  onApply,
  open,
  onEditObjectVariables,
  title,
  emptyPlaceholderTitle,
  emptyPlaceholderDescription,
  variablesContainer,
  inheritedVariablesContainer,
  hotReloadPreviewButtonProps,
  onComputeAllVariableNames,
  helpPagePath,
}: Props) => {
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: variablesContainer,
    onCancel,
  });
  const { DismissableTutorialMessage } =
    useDismissableTutorialMessage('intro-variables');

  return (
    <Dialog
      onApply={onApply}
      noMargin
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key="Cancel"
        />,
        <FlatButton
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
          key="Apply"
        />,
      ]}
      open={open}
      cannotBeDismissed={true}
      onRequestClose={onCancelChanges}
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
      title={title}
      flexBody
      fullHeight
    >
      <Column expand noMargin>
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
        />
      </Column>
    </Dialog>
  );
};

export default VariablesEditorDialog;
