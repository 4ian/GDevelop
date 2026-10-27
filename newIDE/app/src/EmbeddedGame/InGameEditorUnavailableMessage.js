// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Divider from '@material-ui/core/Divider';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import Text from '../UI/Text';
import { Line, Spacer } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import RaisedButton from '../UI/RaisedButton';
import Grid3d from '../UI/CustomSvgIcons/Grid3d';
import Grid2d from '../UI/CustomSvgIcons/Grid2d';
import { type InGameEditorUnavailabilityReason } from './InGameEditorAvailability';

type Props = {|
  reason: InGameEditorUnavailabilityReason,
  onSwitchToInstancesEditor: () => void,
  marginBottom?: number,
|};

/**
 * Displayed instead of the 3D editor (the in-game editor) when it can't
 * render: on devices without WebGL2 (required by Three.js), or when the
 * 3D renderer could not be created.
 */
export const InGameEditorUnavailableMessage = ({
  reason,
  onSwitchToInstancesEditor,
  marginBottom,
}: Props): React.Node => (
  <div
    style={{
      position: 'relative',
      height: `calc(100% - ${marginBottom || 0}px)`,
    }}
  >
    <PlaceholderMessage>
      <ColumnStackLayout>
        <Line alignItems="center" noMargin>
          <Grid3d fontSize="large" />
          <Spacer />
          <Text size="block-title">
            {reason === 'webgl2-not-supported' ? (
              <Trans>The 3D editor is not available on this device.</Trans>
            ) : (
              <Trans>The 3D editor could not start.</Trans>
            )}
          </Text>
        </Line>
        <Divider />
        <AlertMessage kind="warning">
          {reason === 'webgl2-not-supported' ? (
            <Trans>
              The 3D editor requires WebGL2, which is not supported by this
              device. Updating your graphics drivers can solve this. In the
              meantime, you can use the 2D editor.
            </Trans>
          ) : (
            <Trans>
              The 3D rendering could not be initialized on this device.
              Restarting GDevelop or updating your graphics drivers can solve
              this. In the meantime, you can use the 2D editor.
            </Trans>
          )}
        </AlertMessage>
        <Line justifyContent="flex-end" noMargin>
          <RaisedButton
            primary
            icon={<Grid2d />}
            label={<Trans>Switch to the 2D editor</Trans>}
            onClick={onSwitchToInstancesEditor}
          />
        </Line>
      </ColumnStackLayout>
    </PlaceholderMessage>
  </div>
);
