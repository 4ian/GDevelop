// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import InstructionEditor from '.';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  instruction: gdInstruction,
  isCondition: boolean,
  resourceManagementProps: ResourceManagementProps,
  style?: Object,
  isNewInstruction: boolean,
  onCancel: () => void,
  onSubmit: () => void,
  open: boolean,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  anchorEl?: any, // Unused
  canPasteInstructions: boolean, // Unused
  onPasteInstructions: () => void, // Unused
|};
type State = {||};

export default class InstructionEditorDialog extends React.Component<
  Props,
  State
> {
  render() {
    const {
      isNewInstruction,
      onCancel,
      onSubmit,
      open,
      canPasteInstructions,
      onPasteInstructions,
      ...otherProps
    } = this.props;
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={onCancel}
      />,
      <DialogPrimaryButton
        key="ok"
        label={<Trans>Ok</Trans>}
        primary={true}
        onClick={onSubmit}
      />,
    ];

    return (
      <Dialog
        actions={actions}
        open={open}
        onRequestClose={onCancel}
        onApply={onSubmit}
        maxWidth={false}
        flexBody
        noMargin
      >
        <InstructionEditor {...otherProps} />
      </Dialog>
    );
  }
}
