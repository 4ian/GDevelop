// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DetectShortcutDialog from './DetectShortcutDialog';
import Chip from '@material-ui/core/Chip';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import EditIcon from '@material-ui/icons/Edit';
import { type ShortcutMap } from './DefaultShortcuts';
import { parseShortcutIntoKeys } from './index';
import Window from '../Utils/Window';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';

type Props = {|
  i18n: I18n,
  shortcutMap: ShortcutMap,
  onEdit: (commandName: CommandName, shortcut: string) => void,
  onReset: () => void,
|};

const ShortcutsList = (props: Props) => {
  const [
    editedShortcut,
    setEditedShortcut,
  ] = React.useState<null | CommandName>(null);

  const resetAllShortcutsToDefault = () => {
    const answer = Window.showConfirmDialog(
      props.i18n._(t`Are you sure you want to reset all shortcuts to default?`),
      'question'
    );
    if (answer) props.onReset();
  };

  const resetShortcut = (commandName: CommandName) => {
    props.onEdit(commandName, defaultShortcuts[commandName]);
  };

  return (
    <>
      <Line>
        <RaisedButton
          label={<Trans>Reset all shortcuts to default</Trans>}
          onClick={resetAllShortcutsToDefault}
        />
      </Line>
      <List>
        {Object.keys(props.shortcutMap).map(commandName => {
          const isDefault =
            props.shortcutMap[commandName] === defaultShortcuts[commandName];
          const shortcutString = parseShortcutIntoKeys(
            props.shortcutMap[commandName]
          ).join(' + ');

          return (
            <ListItem key={commandName}>
              <ListItemText primary={props.i18n._(commandsList[commandName])} />
              <ListItemSecondaryAction>
                <Chip style={{ borderRadius: 3 }} label={shortcutString} />
                <IconButton
                  onClick={() => setEditedShortcut(commandName)}
                  tooltip={t`Edit shortcut`}
                >
                  <EditIcon />
                </IconButton>
                {!isDefault && (
                  <IconButton
                    onClick={() => resetShortcut(commandName)}
                    tooltip={t`Reset to default`}
                  >
                    <RotateLeftIcon />
                  </IconButton>
                )}
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
