// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import List from '@material-ui/core/List';
import Text from '../UI/Text';
import DetectShortcutDialog from './DetectShortcutDialog';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { type ShortcutMap } from './DefaultShortcuts';
import { getShortcutDisplayName } from './index';
import Window from '../Utils/Window';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import ShortcutsListRow from './ShortcutsListRow';
import commandsList, {
  type CommandName,
  commandAreas,
} from '../CommandPalette/CommandsList';

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

  const areaWiseCommands = {};
  Object.keys(commandsList)
    .filter(name => !commandsList[name].noShortcut)
    .forEach(name => {
      // Implement this
      const areaName = commandsList[name].area;
      if (!areaWiseCommands[areaName]) areaWiseCommands[areaName] = [];
      areaWiseCommands[areaName].push(name);
    });

  return (
    <>
      <Line>
        <RaisedButton
          label={<Trans>Reset all shortcuts to default</Trans>}
          onClick={resetAllShortcutsToDefault}
        />
      </Line>
      <List>
        {Object.keys(areaWiseCommands).map(areaName => (
          <React.Fragment key={areaName}>
            <Text size="title">{props.i18n._(commandAreas[areaName])}</Text>
            {areaWiseCommands[areaName].map(commandName => {
              const userShortcut = props.shortcutMap[commandName] || '';
              const defaultShortcut = defaultShortcuts[commandName] || '';
              const isDefault = userShortcut === defaultShortcut;
              const shortcutDisplayName = getShortcutDisplayName(userShortcut);
              return (
                <ShortcutsListRow
                  i18n={props.i18n}
                  key={commandName}
                  shortcutString={shortcutDisplayName}
                  commandName={commandName}
                  isDefault={isDefault}
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
    </>
  );
};

export default ShortcutsList;
