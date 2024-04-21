// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
import { Line } from '../../../UI/Grid';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import ShareLink from '../../../UI/ShareDialog/ShareLink';
import QrCode from '../../../UI/QrCode';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';

type Props = {|
  open: boolean,
  /**
   * url without protocol, for example '192.168.1.16:2929'
   */
  url: ?string,
  onClose: () => void,
  onExport: ?() => void,
  onRunPreviewLocally: () => void,
  error: ?any,
|};

const LocalNetworkPreviewDialog = ({
  url,
  open,
  error,
  onExport,
  onClose,
  onRunPreviewLocally,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  if (!open) return null;
  const urlWithProtocol = url ? `http://${url}` : '';

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
      maxWidth="sm"
    >
      {error && (
        <Line>
          <Text>
            <Trans>
              Unable to start the server for the preview! Make sure that you are
              authorized to run servers on this computer. Otherwise, use classic
              preview to test your game.
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
          <ShareLink url={url} />
          {urlWithProtocol && (
            <>
              <Line>
                <Text>
                  <Trans>Or flash this QR code:</Trans>
                </Text>
              </Line>
              <Line justifyContent="center">
                <QrCode url={urlWithProtocol} size={isMobile ? 100 : 150} />
              </Line>
            </>
          )}
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
};

export default LocalNetworkPreviewDialog;
