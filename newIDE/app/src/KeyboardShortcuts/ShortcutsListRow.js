// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import { Tooltip } from '@material-ui/core';
import Chip from '../UI/Chip';
import IconButton from '../UI/IconButton';
import SettingsRow from '../UI/SettingsRow';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import Warning from '../UI/CustomSvgIcons/Warning';
import Undo from '../UI/CustomSvgIcons/Undo';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

// The reset button always has its own column, even when it's not displayed,
// so that the shortcuts stay aligned on their right edge across all rows.
const resetButtonColumnWidth = 40;

const styles = {
  clashWarningCell: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 8,
  },
  shortcutCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  resetButtonCell: {
    width: resetButtonColumnWidth,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shortcutChip: {
    borderRadius: 3,
    maxWidth: '100%',
  },
};

type Props = {|
  i18n: I18n,
  commandName: CommandName,
  isDefault: boolean,
  shortcutString: string,
  /** The other commands using the same shortcut, if any. */
  clashingCommandNames: Array<CommandName>,
  onEditShortcut: () => void,
  onResetShortcut: () => void,
|};

const ShortcutsListRow = (props: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();

  const commandDisplayText = props.i18n._(
    commandsList[props.commandName].displayText
  );
  const clashingCommandsDisplayText = props.clashingCommandNames
    .map(clashingCommandName =>
      props.i18n._(commandsList[clashingCommandName].displayText)
    )
    .join(', ');

  return (
    <SettingsRow label={commandDisplayText}>
      {props.clashingCommandNames.length > 0 && (
        <div style={styles.clashWarningCell}>
          <Tooltip
            title={
              <Trans>
                This shortcut is also used by: {clashingCommandsDisplayText}
              </Trans>
            }
          >
            <Warning />
          </Tooltip>
        </div>
      )}
      <div style={styles.shortcutCell}>
        <Chip
          style={styles.shortcutChip}
          label={props.shortcutString || <Trans>No shortcut</Trans>}
          onClick={props.onEditShortcut}
          color={props.shortcutString ? 'secondary' : 'default'}
          size={isMobile ? 'small' : 'medium'}
        />
      </div>
      <div style={styles.resetButtonCell}>
        {!props.isDefault && (
          <IconButton
            onClick={props.onResetShortcut}
            tooltip={t`Reset to default`}
            size="small"
          >
            <Undo />
          </IconButton>
        )}
      </div>
    </SettingsRow>
  );
};

export default ShortcutsListRow;
