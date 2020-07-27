// @flow
import * as React from 'react';
import { type I18n } from '@lingui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DetectShortcutDialog from './DetectShortcutDialog';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import { type ShortcutMap } from './DefaultShortcuts';
import { parseShortcutIntoKeys } from './index';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';

type Props = {|
  i18n: I18n,
  shortcutMap: ShortcutMap,
  onEdit: (commandName: CommandName, shortcut: string) => void,
|};

const ShortcutsList = (props: Props) => {
  const [
    editedShortcut,
    setEditedShortcut,
  ] = React.useState<null | CommandName>(null);

  return (
    <>
      <List>
        {Object.keys(props.shortcutMap).map(commandName => {
          const shortcutString = parseShortcutIntoKeys(
            props.shortcutMap[commandName]
          ).join(' + ');

          return (
            <ListItem key={commandName}>
              <ListItemText primary={props.i18n._(commandsList[commandName])} />
              <ListItemSecondaryAction>
                <Chip style={{ borderRadius: 3 }} label={shortcutString} />
                <IconButton onClick={() => setEditedShortcut(commandName)}>
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      {editedShortcut && (
        <DetectShortcutDialog
          commandText={props.i18n._(commandsList[editedShortcut])}
          onClose={() => setEditedShortcut(null)}
          onSet={shortcut => {
            props.onEdit(editedShortcut, shortcut);
          }}
        />
      )}
    </>
  );
};

export default ShortcutsList;
