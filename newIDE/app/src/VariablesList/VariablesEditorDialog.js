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
import { Column, Line } from '../UI/Grid';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';

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
  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-variables'
  );

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
      <Column expand noMargin>
        {variablesContainer.count() > 0 && DismissableTutorialMessage && (
          <Line>
            <Column expand>{DismissableTutorialMessage}</Column>
          </Line>
        )}
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
      </Column>
    </Dialog>
  );
};

export default VariablesEditorDialog;
