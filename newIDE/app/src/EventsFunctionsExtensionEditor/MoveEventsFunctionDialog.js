// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsFunctionExtensionSelectorDialog from './EventsFunctionExtensionSelectorDialog';

type Props = {|
  project: gdProject,
  onCancel: () => void,
  onChoose: (destinationExtensionName: string) => void,
  excludedExtensionName: string,
|};

export default function MoveEventsBasedObjectDialog({
  project,
  onChoose,
  onCancel,
  excludedExtensionName,
}: Props): React.Node {
  return (
    <EventsFunctionExtensionSelectorDialog
      project={project}
      message={
        <Trans>Choose the extension where the function should be moved.</Trans>
      }
      onCancel={onCancel}
      onChoose={onChoose}
      excludedExtensionName={excludedExtensionName}
    />
  );
}
