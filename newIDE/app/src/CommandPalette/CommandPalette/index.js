// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import CommandsContext from '../CommandsContext';
import {
  type NamedCommand,
  type NamedCommandWithOptions,
  type CommandOption,
} from '../CommandManager';
import AutocompletePicker from './AutocompletePicker';
import commandsList, { type CommandName } from '../CommandsList';

// Show the command palette dialog at the top of the screen
const useStyles = makeStyles({
  scrollPaper: {
    alignItems: 'flex-start',
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
    const commandManager = React.useContext(CommandsContext);
    const [mode, setMode] = React.useState<PaletteMode>('closed');
    const [selectedCommand, selectCommand] =
      React.useState<null | NamedCommandWithOptions>(null);

    // Takes a command and if simple command, executes handler
    // If command with options, opens options of the palette
    const handleCommandChoose = React.useCallback(
      (command: NamedCommand) => {
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

    // Executes handler of a command option and closes palette
    const handleOptionChoose = (option: CommandOption) => {
      option.handler();
      setMode('closed');
    };

    // Opens the palette in command mode
    const openPalette = React.useCallback((open? = true) => {
      if (open) setMode('command');
      else setMode('closed');
    }, []);

    // Takes command name, gets command object from
    // manager and launches command accordingly
    const launchCommand = React.useCallback(
      (commandName) => {
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

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            onClose={() => setMode('closed')}
            aria-label="command-palette"
            open={mode !== 'closed'}
            fullWidth
            hideBackdrop
            maxWidth="sm"
            classes={classes}
            transitionDuration={0}
          >
            {mode === 'command' && (
              // Command picker
              <AutocompletePicker
                i18n={i18n}
                items={
                  (commandManager
                    .getAllNamedCommands()
                    .filter(
                      (command) => !commandsList[command.name].ghost
                    ): Array<NamedCommand>)
                }
                placeholder={t`Start typing a command...`}
                onClose={() => setMode('closed')}
                onSelect={handleCommandChoose}
              />
            )}
            {mode === 'option' && selectedCommand && (
              // Command options picker
              <AutocompletePicker
                i18n={i18n}
                items={selectedCommand.generateOptions()}
                placeholder={commandsList[selectedCommand.name]}
                onClose={() => setMode('closed')}
                onSelect={handleOptionChoose}
              />
            )}
          </Dialog>
        )}
      </I18n>
    );
  }
);

export default CommandPalette;
