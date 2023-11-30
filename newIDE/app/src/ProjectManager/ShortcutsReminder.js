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

const shortcuts = [
  {
    label: <Trans>Save</Trans>,
    shortcutMapKey: 'SAVE_PROJECT',
  },
  {
    label: <Trans>Save as...</Trans>,
    shortcutMapKey: 'SAVE_PROJECT_AS',
  },
  {
    label: <Trans>Export</Trans>,
    shortcutMapKey: 'EXPORT_GAME',
  },
  {
    label: <Trans>Close</Trans>,
    shortcutMapKey: 'CLOSE_PROJECT',
  },
];

export const ShortcutsReminder = ({
  shortcutMap,
}: {|
  shortcutMap: ShortcutMap,
|}) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';

  if (isMobileScreen) return null;
  if (!!electron) return null;

  return (
    <Column noMargin>
      <AlertMessage kind="info">
        <Trans>Find these actions on the Menu close to the “Home” tab.</Trans>
      </AlertMessage>
      <Spacer />
      <div style={styles.shortcutReminders}>
        {shortcuts.map(({ label, shortcutMapKey }, index) => (
          <Line noMargin justifyContent="space-between" key={index}>
            <Text size="body2" noMargin>
              {label}
            </Text>
            <Text size="body2" noMargin>
              {adaptAcceleratorString(
                getElectronAccelerator(shortcutMap[shortcutMapKey])
              )}
            </Text>
          </Line>
        ))}
      </div>
      <Spacer />
    </Column>
  );
};
