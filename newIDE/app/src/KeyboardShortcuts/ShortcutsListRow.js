// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '../UI/Chip';
import IconButton from '../UI/IconButton';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import WarningIcon from '@material-ui/icons/Warning';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';

const styles = {
  shortcutChip: {
    borderRadius: 3,
  },
};

type Props = {|
  i18n: I18n,
  commandName: CommandName,
  isDefault: boolean,
  shortcutString: string,
  isClashing: boolean,
  onEditShortcut: () => void,
  onResetShortcut: () => void,
|};

const ShortcutsListRow = (props: Props) => {
  return (
    <ListItem>
      <ListItemText
        primary={props.i18n._(commandsList[props.commandName].displayText)}
      />
      <ListItemSecondaryAction>
        {props.isClashing && (
          <IconButton tooltip={t`This shortcut clashes with another action.`}>
            <WarningIcon />
          </IconButton>
        )}
        <Chip
          style={styles.shortcutChip}
          label={props.shortcutString || <Trans>No shortcut</Trans>}
          onClick={props.onEditShortcut}
          color={props.shortcutString ? 'secondary' : 'default'}
        />
        {!props.isDefault && (
          <IconButton
            onClick={props.onResetShortcut}
            tooltip={t`Reset to default`}
          >
            <RotateLeftIcon />
          </IconButton>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default ShortcutsListRow;
