// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EventsFunctionExtensionSelectorDialog from './EventsFunctionExtensionSelectorDialog';

type Props = {|
  project: gdProject,
  onCancel: () => void,
  onChoose: (destinationExtensionName: string) => void,
|};

export default function MoveEventsBasedBehaviorDialog({
  project,
  onChoose,
  onCancel,
}: Props): React.Node {
  return (
    <EventsFunctionExtensionSelectorDialog
      project={project}
      message={
        <Trans>
          Choose the extension where the custom behavior should be moved.
        </Trans>
      }
      onCancel={onCancel}
      onChoose={onChoose}
    />
  );
}
