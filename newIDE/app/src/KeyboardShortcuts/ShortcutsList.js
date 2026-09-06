// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import Text from '../UI/Text';
import EmptyMessage from '../UI/EmptyMessage';
import DetectShortcutDialog from './DetectShortcutDialog';
import defaultShortcuts, { type ShortcutMap } from './DefaultShortcuts';
import { getShortcutDisplayName } from './index';
import ShortcutsListRow from './ShortcutsListRow';
import commandsList, {
  type CommandName,
  commandAreas,
  getDisplayedCommandAreaNames,
} from '../CommandPalette/CommandsList';
import { ColumnStackLayout } from '../UI/Layout';

const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  // An area with its title, separated from the previous one.
  areaSection: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
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
 * The shortcuts of the commands handled by the in-game editor are only active
 * when the game preview has the focus, and the preview forwards to the IDE the
 * keys pressed with a modifier. So a shortcut without modifier can't clash
 * between the two contexts, while a shortcut with a modifier can (the in-game
 * editor takes it over when it has the focus).
 */
const getShortcutContextKey = (
  commandName: CommandName,
  shortcutString: string
): string => {
  const isIsolatedInGameEditorShortcut =
    !!commandsList[commandName].handledByInGameEditor &&
    !shortcutString.includes('+');
  return (
    (isIsolatedInGameEditorShortcut ? 'in-game-editor:' : 'ide:') +
    shortcutString
  );
};

/**
 * Sorts all commands into an object keyed by area name, and also creates a
 * reverse mapping from shortcut (in its context, see `getShortcutContextKey`)
 * to list of commands with that shortcut.
 */
const sortCommandsIntoAreasAndGetReverseMap = (
  userShortcutMap: ShortcutMap
) => {
  const areaWiseCommands: { [string]: Array<CommandName> } = {};
  const shortcutContextKeyToCommands: { [string]: Array<CommandName> } = {};
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
      const shortcutContextKey = getShortcutContextKey(name, shortcutString);
      shortcutContextKeyToCommands[shortcutContextKey] = (
        shortcutContextKeyToCommands[shortcutContextKey] || []
      ).concat(name);
    });

  return [areaWiseCommands, shortcutContextKeyToCommands];
};

/**
 * Normalize a text for a search: case insensitive and ignoring spaces, so that
 * "ctrl+s" matches "Ctrl + S".
 */
export const normalizeForSearch = (text: string): string =>
  text.toLowerCase().replace(/\s+/g, '');

type ShortcutRowData = {|
  commandName: CommandName,
  commandDisplayText: string,
  shortcutDisplayName: string,
  isDefault: boolean,
  /** The other commands using the same shortcut, if any. */
  clashingCommandNames: Array<CommandName>,
|};

type ShortcutSectionData = {|
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
    shortcutContextKeyToCommands,
  ] = sortCommandsIntoAreasAndGetReverseMap(userShortcutMap);
  const normalizedSearchText = normalizeForSearch(searchText);

  // The areas are displayed in the order of `commandAreas`, which is also the
  // order of the areas list in the preferences dialog.
  return getDisplayedCommandAreaNames()
    .filter(areaName => !!areaWiseCommands[areaName])
    .map(
      (areaName): ShortcutSectionData => {
        const rows: Array<ShortcutRowData> = areaWiseCommands[areaName]
          .map(
            (commandName: CommandName): ShortcutRowData | null => {
              // Get default and user-set shortcuts
              const userShortcut = userShortcutMap[commandName];
              const defaultShortcut = defaultShortcuts[commandName] || '';
              const shortcutString = getPatchedShortcutString(
                defaultShortcut,
                userShortcut
              );
              const shortcutDisplayName = getShortcutDisplayName(
                shortcutString
              );
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
                shortcutContextKeyToCommands[
                  getShortcutContextKey(commandName, shortcutString)
                ] || []
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
      }
    )
    .filter(section => section.rows.length > 0);
};

type Props = {|
  i18n: I18n,
  userShortcutMap: ShortcutMap,
  onEdit: (commandName: CommandName, shortcut: string) => void,
  /** Filter the displayed commands by name or by shortcut. */
  searchText?: string,
  /** Give an id to the element of each area, to be able to scroll to it. */
  getSectionElementId?: (areaName: string) => string,
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
  );

  return (
    <ColumnStackLayout noMargin expand>
      {sections.length > 0 ? (
        sections.map(section => (
          <div
            key={section.areaName}
            id={
              props.getSectionElementId
                ? props.getSectionElementId(section.areaName)
                : undefined
            }
            style={styles.areaSection}
          >
            <Text size="block-title">{section.title}</Text>
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
