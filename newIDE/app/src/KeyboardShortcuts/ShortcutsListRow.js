// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '@material-ui/core/Chip';
import IconButton from '../UI/IconButton';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import EditIcon from '@material-ui/icons/Edit';
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
        <Chip
          style={styles.shortcutChip}
          label={props.shortcutString || <Trans>No shortcut</Trans>}
        />
        <IconButton onClick={props.onEditShortcut} tooltip={t`Edit shortcut`}>
          <EditIcon />
        </IconButton>
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
