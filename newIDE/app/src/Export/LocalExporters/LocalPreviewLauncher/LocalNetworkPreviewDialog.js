// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import TextField from '../../../UI/TextField';
import Text from '../../../UI/Text';
import { Line } from '../../../UI/Grid';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';

type Props = {|
  open: boolean,
  url: ?string,
  onClose: () => void,
  onExport: ?() => void,
  onRunPreviewLocally: () => void,
  error: ?any,
|};

export default class LocalNetworkDialog extends React.Component<Props, {}> {
  render() {
    const {
      url,
      open,
      error,
      onExport,
      onClose,
      onRunPreviewLocally,
    } = this.props;
    if (!open) return null;

    return (
      <Dialog
        title={<Trans>Preview</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary
            onClick={onClose}
          />,
        ]}
        secondaryActions={[
          onExport && (
            <FlatButton
              key="export"
              label={<Trans>Export game</Trans>}
              onClick={onExport}
            />
          ),
          <FlatButton
            key="run-preview-locally"
            label={<Trans>Run on this computer</Trans>}
            onClick={onRunPreviewLocally}
          />,
        ]}
        open={open}
        onRequestClose={onClose}
      >
        {error && (
          <Line>
            <Text>
              <Trans>
                Unable to start the server for the preview! Make sure that you
                are authorized to run servers on this computer. Otherwise, use
                classic preview to test your game.
              </Trans>
            </Text>
          </Line>
        )}
        {!error && !url && <PlaceholderLoader />}
        {!error && url && (
          <div>
            <Line>
              <Text>
                <Trans>
                  Your preview is ready! On your mobile or tablet, open your
                  browser and enter in the address bar:
                </Trans>
              </Text>
            </Line>
            <TextField value={url} fullWidth />
            <Line>
              <Text>
                <Trans>
                  Please note that your device should be connected on the same
                  network as this computer.
                </Trans>
              </Text>
            </Line>
          </div>
        )}
      </Dialog>
    );
  }
}
