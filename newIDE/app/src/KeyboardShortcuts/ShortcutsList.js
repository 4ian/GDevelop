// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import Text from '../UI/Text';
import EmptyMessage from '../UI/EmptyMessage';
import DetectShortcutDialog from './DetectShortcutDialog';
import { type ShortcutMap } from './DefaultShortcuts';
import { getShortcutDisplayName } from './index';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import ShortcutsListRow from './ShortcutsListRow';
import commandsList, {
  type CommandName,
  commandAreas,
} from '../CommandPalette/CommandsList';
import { ColumnStackLayout } from '../UI/Layout';

const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
};

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
      // $FlowFixMe[prop-missing]
      if (!areaWiseCommands[areaName]) areaWiseCommands[areaName] = [];
      // $FlowFixMe[prop-missing]
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

/**
 * Normalize a text for a search: case insensitive and ignoring spaces, so that
 * "ctrl+s" matches "Ctrl + S".
 */
export const normalizeForSearch = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '');

export type ShortcutRowData = {|
  commandName: CommandName,
  commandDisplayText: string,
  shortcutDisplayName: string,
  isDefault: boolean,
  /** The other commands using the same shortcut, if any. */
  clashingCommandNames: Array<CommandName>,
|};

export type ShortcutSectionData = {|
  areaName: string,
  title: string,
  rows: Array<ShortcutRowData>,
|};

/**
 * Get the shortcuts grouped by area, keeping only the commands matching the
 * search text (by name or by shortcut). Sections without any match are omitted.
 */
export const getShortcutSections = (
  i18n: I18n,
  userShortcutMap: ShortcutMap,
  searchText: string
): Array<ShortcutSectionData> => {
  const [
    areaWiseCommands,
    shortcutStringToCommands,
  ] = sortCommandsIntoAreasAndGetReverseMap(userShortcutMap);
  const normalizedSearchText = normalizeForSearch(searchText);

  return Object.keys(areaWiseCommands)
    .map(areaName => {
      const rows = areaWiseCommands[areaName]
        .map(
          (commandName: CommandName): ShortcutRowData | null => {
            // Get default and user-set shortcuts
            const userShortcut = userShortcutMap[commandName];
            const defaultShortcut = defaultShortcuts[commandName] || '';
            const shortcutString = getPatchedShortcutString(
              defaultShortcut,
              userShortcut
            );
            const shortcutDisplayName = getShortcutDisplayName(shortcutString);
            const commandDisplayText = i18n._(
              commandsList[commandName].displayText
            );

            const matchesSearch =
              !normalizedSearchText ||
              normalizeForSearch(commandDisplayText).includes(
                normalizedSearchText
              ) ||
              normalizeForSearch(shortcutDisplayName).includes(
                normalizedSearchText
              );
            if (!matchesSearch) return null;

            // Find the other commands using the same shortcut, if any.
            const clashingCommandNames = (
              shortcutStringToCommands[shortcutString] || []
            ).filter(otherCommandName => otherCommandName !== commandName);

            return {
              commandName,
              commandDisplayText,
              shortcutDisplayName,
              isDefault: shortcutString === defaultShortcut,
              clashingCommandNames,
            };
          }
        )
        .filter(Boolean);

      return {
        areaName,
        title: i18n._(commandAreas[areaName]),
        rows,
      };
    })
    .filter(section => section.rows.length > 0);
};

type Props = {|
  i18n: I18n,
  userShortcutMap: ShortcutMap,
  onEdit: (commandName: CommandName, shortcut: string) => void,
  /** Filter the displayed commands by name or by shortcut. */
  searchText?: string,
  /** Only display the commands of this area, without the area title. */
  areaName?: string,
|};

const ShortcutsList = (props: Props): React.Node => {
  const [
    editedShortcut,
    setEditedShortcut,
  ] = React.useState<null | CommandName>(null);

  const resetShortcut = (commandName: CommandName) => {
    props.onEdit(commandName, defaultShortcuts[commandName]);
  };

  const sections = getShortcutSections(
    props.i18n,
    props.userShortcutMap,
    props.searchText || ''
  ).filter(section => !props.areaName || section.areaName === props.areaName);

  return (
    <ColumnStackLayout noMargin expand>
      {sections.length > 0 ? (
        sections.map(section => (
          <div key={section.areaName} style={styles.section}>
            {!props.areaName && <Text size="block-title">{section.title}</Text>}
            <div style={styles.section}>
              {section.rows.map(row => (
                <ShortcutsListRow
                  i18n={props.i18n}
                  key={row.commandName}
                  shortcutString={row.shortcutDisplayName}
                  commandName={row.commandName}
                  isDefault={row.isDefault}
                  clashingCommandNames={row.clashingCommandNames}
                  onEditShortcut={() => setEditedShortcut(row.commandName)}
                  onResetShortcut={() => resetShortcut(row.commandName)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyMessage>
          <Trans>No shortcut matches your search.</Trans>
        </EmptyMessage>
      )}
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
