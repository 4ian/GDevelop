// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import optionalRequire from '../Utils/OptionalRequire';
import AlertMessage from '../UI/AlertMessage';
import { Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import { adaptAcceleratorString } from '../UI/AcceleratorString';
import { getElectronAccelerator } from '../KeyboardShortcuts';
import { type ShortcutMap } from '../KeyboardShortcuts/DefaultShortcuts';
import { Column } from '../UI/Grid';
const electron = optionalRequire('electron');

const styles = {
  shortcutReminders: {
    opacity: 0.7,
  },
};

export const ShortcutsReminder = ({
  shortcutMap,
}: {|
  shortcutMap: ShortcutMap,
|}) => {
  const windowWidth = useResponsiveWindowWidth();

  if (windowWidth === 'small') return null;
  if (!!electron) return null;

  return (
    <Column noMargin>
      <AlertMessage kind="info">
        <Trans>Find these actions on the Menu close to the “Home” tab.</Trans>
      </AlertMessage>
      <Spacer />
      <div style={styles.shortcutReminders}>
        <Line noMargin justifyContent="space-between">
          <Text size="body2" noMargin>
            <Trans>Save</Trans>
          </Text>
          <Text size="body2" noMargin>
            <Trans>
              {adaptAcceleratorString(
                getElectronAccelerator(shortcutMap['SAVE_PROJECT'])
              )}
            </Trans>
          </Text>
        </Line>
        <Line noMargin justifyContent="space-between">
          <Text size="body2" noMargin>
            <Trans>Save as...</Trans>
          </Text>
          <Text size="body2" noMargin>
            <Trans>
              {adaptAcceleratorString(
                getElectronAccelerator(shortcutMap['SAVE_PROJECT_AS'])
              )}
            </Trans>
          </Text>
        </Line>
        <Line noMargin justifyContent="space-between">
          <Text size="body2" noMargin>
            <Trans>Export</Trans>
          </Text>
          <Text size="body2" noMargin>
            <Trans>
              {adaptAcceleratorString(
                getElectronAccelerator(shortcutMap['EXPORT_GAME'])
              )}
            </Trans>
          </Text>
        </Line>
        <Line noMargin justifyContent="space-between">
          <Text size="body2" noMargin>
            <Trans>Close</Trans>
          </Text>
          <Text size="body2" noMargin>
            <Trans>
              {adaptAcceleratorString(
                getElectronAccelerator(shortcutMap['CLOSE_PROJECT'])
              )}
            </Trans>
          </Text>
        </Line>
      </div>
      <Spacer />
    </Column>
  );
};
