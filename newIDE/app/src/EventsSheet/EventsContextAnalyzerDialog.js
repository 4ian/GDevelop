// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';

type Props = {|
  open: boolean,
  onClose: () => void,
  objectsNames: Array<string>,
  objectOrGroupNames: Array<string>,
|};

export default class EventsContextAnalyzerDialog extends React.Component<
  Props,
  {}
> {
  render() {
    const { open, onClose, objectsNames, objectOrGroupNames } = this.props;
    if (!objectsNames || !objectOrGroupNames) return null;
    const actions = [
      <FlatButton
        label={<Trans>Close</Trans>}
        primary={true}
        onClick={this.props.onClose}
      />,
    ];

    return (
      <Dialog actions={actions} open={open} onRequestClose={onClose}>
        <p>
          <Trans>
            Objects or groups being directly referenced in the events:{' '}
            {objectOrGroupNames.join(', ')}
          </Trans>
        </p>
        <p>
          <Trans>
            All objects potentially used in events: {objectsNames.join(', ')}
          </Trans>
        </p>
      </Dialog>
    );
  }
}
