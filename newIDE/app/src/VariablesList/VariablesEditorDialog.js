// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import VariablesList from './index';
import useForceUpdate from '../Utils/UseForceUpdate';
import HotReloadPreviewButton, {
  type HotReloadPreviewButtonProps,
} from '../HotReload/HotReloadPreviewButton';

type Props = {|
  onCancel: () => void,
  onApply: () => void,
  open: boolean,
  onEditObjectVariables?: () => void,
  title: React.Node,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,
  variablesContainer: gdVariablesContainer,
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
  hotReloadPreviewButtonProps,
  onComputeAllVariableNames,
  helpPagePath,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: variablesContainer,
    onCancel,
  });

  return (
    <Dialog
      onApply={onApply}
      noMargin
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key={'Cancel'}
        />,
        <FlatButton
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
          key={'Apply'}
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
      ]}
      title={title}
      flexBody
      fullHeight
    >
      <VariablesList
        commitVariableValueOnBlur={
          // Reduce the number of re-renders by saving the variable value only when the field is blurred.
          // We don't do that by default because the VariablesList can be used in a component like
          // InstancePropertiesEditor, that can be unmounted at any time, before the text fields get a
          // chance to be blurred.
          true
        }
        variablesContainer={variablesContainer}
        emptyPlaceholderTitle={emptyPlaceholderTitle}
        emptyPlaceholderDescription={emptyPlaceholderDescription}
        onSizeUpdated={
          forceUpdate /*Force update to ensure dialog is properly positioned*/
        }
        onComputeAllVariableNames={onComputeAllVariableNames}
        helpPagePath={helpPagePath}
      />
    </Dialog>
  );
};

export default VariablesEditorDialog;
