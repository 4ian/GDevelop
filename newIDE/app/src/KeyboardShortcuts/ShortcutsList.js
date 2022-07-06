// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import List from '@material-ui/core/List';
import Text from '../UI/Text';
import DetectShortcutDialog from './DetectShortcutDialog';
import RaisedButton from '../UI/RaisedButton';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import { type ShortcutMap } from './DefaultShortcuts';
import { getShortcutDisplayName } from './index';
import Window from '../Utils/Window';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import ShortcutsListRow from './ShortcutsListRow';
import commandsList, {
  type CommandName,
  commandAreas,
} from '../CommandPalette/CommandsList';
import { ColumnStackLayout } from '../UI/Layout';

/**
 * Get shortcut string to be displayed after patching the default
 * shortcut with user-defined shortcut, if any.
 */
const getPatchedShortcutString = (
  defaultShortcut: string,
  userShortcut?: string
) => {
  // User shortcut can be empty string when user has removed a shortcut,
  // so we check userShortcut against null/undefined.
  return userShortcut == null ? defaultShortcut : userShortcut;
};

/**
 * Sorts all commands into an object keyed by area name, and also creates a
 * reverse mapping from shortcut string to list of commands with that shortcut.
 */
const sortCommandsIntoAreasAndGetReverseMap = (
  userShortcutMap: ShortcutMap
) => {
  const areaWiseCommands = {};
  const shortcutStringToCommands: { [string]: Array<CommandName> } = {};
  Object.keys(commandsList)
    .filter(name => !commandsList[name].noShortcut)
    .forEach(name => {
      // Sort commands by area
      const areaName = commandsList[name].area;
      if (!areaWiseCommands[areaName]) areaWiseCommands[areaName] = [];
      areaWiseCommands[areaName].push(name);

      // Add to shortcut-command mapping
      const userShortcut = userShortcutMap[name];
      const defaultShortcut = defaultShortcuts[name] || '';
      const shortcutString = getPatchedShortcutString(
        defaultShortcut,
        userShortcut
      );
      if (shortcutString === '') return;
      shortcutStringToCommands[shortcutString] = (
        shortcutStringToCommands[shortcutString] || []
      ).concat(name);
    });

  return [areaWiseCommands, shortcutStringToCommands];
};

type Props = {|
  i18n: I18n,
  userShortcutMap: ShortcutMap,
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
      props.i18n._(
        t`Are you sure you want to reset all shortcuts to their default values?`
      ),
      'question'
    );
    if (answer) props.onReset();
  };

  const resetShortcut = (commandName: CommandName) => {
    props.onEdit(commandName, defaultShortcuts[commandName]);
  };

  const [
    areaWiseCommands,
    shortcutStringToCommands,
  ] = sortCommandsIntoAreasAndGetReverseMap(props.userShortcutMap);

  const commandPaletteShortcut = getShortcutDisplayName(
    props.userShortcutMap['OPEN_COMMAND_PALETTE'] ||
      defaultShortcuts['OPEN_COMMAND_PALETTE']
  );

  return (
    <ColumnStackLayout noMargin>
      <DismissableAlertMessage
        kind="info"
        identifier="command-palette-shortcut"
      >
        <Trans>
          You can open the command palette by pressing {commandPaletteShortcut}.
        </Trans>
      </DismissableAlertMessage>
      <RaisedButton
        label={<Trans>Reset all shortcuts to default</Trans>}
        onClick={resetAllShortcutsToDefault}
        fullWidth
      />
      <List>
        {Object.keys(areaWiseCommands).map(areaName => (
          <React.Fragment key={areaName}>
            <Text size="block-title">
              {props.i18n._(commandAreas[areaName])}
            </Text>
            {areaWiseCommands[areaName].map(commandName => {
              // Get default and user-set shortcuts
              const userShortcut = props.userShortcutMap[commandName];
              const defaultShortcut = defaultShortcuts[commandName] || '';
              const shortcutString = getPatchedShortcutString(
                defaultShortcut,
                userShortcut
              );
              const shortcutDisplayName = getShortcutDisplayName(
                shortcutString
              );
              // Check if shortcut clashes with another command
              const clashingCommands = shortcutStringToCommands[shortcutString];
              const hasClash = clashingCommands && clashingCommands.length > 1;

              return (
                <ShortcutsListRow
                  i18n={props.i18n}
                  key={commandName}
                  shortcutString={shortcutDisplayName}
                  commandName={commandName}
                  isDefault={shortcutString === defaultShortcut}
                  isClashing={hasClash}
                  onEditShortcut={() => setEditedShortcut(commandName)}
                  onResetShortcut={() => resetShortcut(commandName)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </List>
      {editedShortcut && (
        <DetectShortcutDialog
          commandText={props.i18n._(commandsList[editedShortcut].displayText)}
          onClose={() => setEditedShortcut(null)}
          onSet={shortcut => {
            props.onEdit(editedShortcut, shortcut);
          }}
        />
      )}
    </ColumnStackLayout>
  );
};

export default ShortcutsList;
