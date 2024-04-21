// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import CommandsContext from '../CommandsContext';
import {
  type NamedCommand,
  type GoToWikiCommand,
  type NamedCommandWithOptions,
  type CommandOption,
} from '../CommandManager';
import AutocompletePicker from './AutocompletePicker';
import commandsList, { type CommandName } from '../CommandsList';
import Window from '../../Utils/Window';
import Command from '../../UI/CustomSvgIcons/Command';
import {
  searchClient,
  type AlgoliaSearchHit,
  indexName,
} from '../../Utils/AlgoliaSearch';

import {
  InstantSearch,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch-hooks';
import { useDebounce } from '../../Utils/UseDebounce';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';

// Show the command palette dialog at the top of the screen
const useStyles = makeStyles({
  scrollPaper: {
    alignItems: 'flex-start',
  },
});

// Make dialog paper border radius match the autocomplete one.
const useStylesForPaper = makeStyles({
  rounded: {
    borderRadius: 4,
  },
});

export type CommandPaletteInterface = {|
  open: (open?: boolean) => void,
  launchCommand: (commandName: CommandName) => void,
|};

type PaletteMode = 'closed' | 'command' | 'option';

const CommandPalette = React.forwardRef<{||}, CommandPaletteInterface>(
  (props, ref) => {
    const classes = useStyles();
    const paperClasses = useStylesForPaper();
    const { isMobile } = useResponsiveWindowSize();
    const [searchText, setSearchText] = React.useState<string>('');
    const commandManager = React.useContext(CommandsContext);
    const [mode, setMode] = React.useState<PaletteMode>('closed');
    const [
      selectedCommand,
      selectCommand,
    ] = React.useState<null | NamedCommandWithOptions>(null);
    const { results, status } = useInstantSearch();
    const { refine } = useSearchBox();
    const [
      algoliaSearchStableStatus,
      setAlgoliaSearchStableStatus,
    ] = React.useState<'error' | 'ok'>('ok');

    React.useEffect(
      () => {
        if (algoliaSearchStableStatus === 'ok' && status === 'error') {
          setAlgoliaSearchStableStatus('error');
        } else if (algoliaSearchStableStatus === 'error' && status === 'idle') {
          setAlgoliaSearchStableStatus('ok');
        }
      },
      [status, algoliaSearchStableStatus]
    );
    const shouldHideAlgoliaSearchResults =
      !searchText || algoliaSearchStableStatus === 'error';
    /**
     * Takes a command and if simple command, executes handler.
     * If command with options, opens options of the palette.
     */
    const handleCommandChoose = React.useCallback(
      (command: NamedCommand | GoToWikiCommand) => {
        if (command.handler) {
          // Simple command
          command.handler();
          if (command.name !== 'OPEN_COMMAND_PALETTE') {
            // Don't close palette if the command is for opening it
            setMode('closed');
          }
        } else {
          // Command with options
          selectCommand(command);
          setMode('option');
        }
      },
      [selectCommand, setMode]
    );

    /**
     * Executes handler of a command option and closes palette
     */
    const handleOptionChoose = (option: CommandOption) => {
      option.handler();
      setMode('closed');
    };

    const openPalette = React.useCallback((open? = true) => {
      if (open) setMode('command');
      else setMode('closed');
    }, []);

    /**
     * Takes command name, gets command object from
     * manager and launches command accordingly
     */
    const launchCommand = React.useCallback(
      commandName => {
        const command = commandManager.getNamedCommand(commandName);
        if (!command) return;
        handleCommandChoose(command);
      },
      [handleCommandChoose, commandManager]
    );

    React.useImperativeHandle(ref, () => ({
      open: openPalette,
      launchCommand,
    }));

    const launchSearch = useDebounce(() => {
      if (searchText) {
        refine(searchText);
      }
    }, 200);

    React.useEffect(launchSearch, [searchText, launchSearch]);

    const allCommands: Array<NamedCommand | GoToWikiCommand> = React.useMemo(
      () => {
        const namedCommands = commandManager
          .getAllNamedCommands()
          .filter(command => !commandsList[command.name].ghost)
          // $FlowFixMe[incompatible-type]
          .map(command => ({ ...command, icon: <Command /> }));
        if (shouldHideAlgoliaSearchResults) return namedCommands;

        const algoliaCommands: Array<GoToWikiCommand> = results.hits.map(
          (hit: AlgoliaSearchHit) => {
            return {
              hit,
              handler: () => Window.openExternalURL(hit.url),
            };
          }
        );
        return namedCommands.concat(algoliaCommands);
      },
      [commandManager, results.hits, shouldHideAlgoliaSearchResults]
    );

    const closeDialog = React.useCallback(() => {
      setMode('closed');
    }, []);

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            onClose={closeDialog}
            aria-label="command-palette"
            open={mode !== 'closed'}
            fullWidth
            hideBackdrop
            maxWidth="sm"
            classes={classes}
            transitionDuration={0}
            PaperProps={{ classes: paperClasses }}
          >
            {mode === 'command' && (
              // Command picker
              <AutocompletePicker
                i18n={i18n}
                onInputChange={setSearchText}
                items={allCommands}
                placeholder={
                  isMobile
                    ? t`Search`
                    : t`Start typing a command or searching something...`
                }
                onClose={closeDialog}
                onSelect={handleCommandChoose}
              />
            )}
            {mode === 'option' && selectedCommand && (
              // Command options picker
              <AutocompletePicker
                i18n={i18n}
                items={selectedCommand.generateOptions()}
                placeholder={commandsList[selectedCommand.name]}
                onClose={closeDialog}
                onSelect={handleOptionChoose}
              />
            )}
          </Dialog>
        )}
      </I18n>
    );
  }
);

export const CommandPaletteWithAlgoliaSearch = React.forwardRef<
  {},
  CommandPaletteInterface
>((props, ref) => (
  <InstantSearch searchClient={searchClient} indexName={indexName}>
    <CommandPalette ref={ref} />
  </InstantSearch>
));

export default CommandPalette;
