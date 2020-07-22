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

// Show the command palette dialog at the top of the screen
const useStyles = makeStyles({
  scrollPaper: {
    alignItems: 'flex-start',
  },
});

export type CommandPaletteInterface = {|
  open: (open?: boolean) => void,
  launchCommand: (commandName: string) => void,
|};

type PaletteMode = 'closed' | 'command' | 'option';

const CommandPalette = React.forwardRef<{||}, CommandPaletteInterface>(
  (props, ref) => {
    const classes = useStyles();
    const commandManager = React.useContext(CommandsContext);
    const [mode, setMode] = React.useState<PaletteMode>('closed');
    const [
      selectedCommand,
      selectCommand,
    ] = React.useState<null | NamedCommandWithOptions>(null);

    const handleCommandChoose = (command: NamedCommand) => {
      if (command.handler) {
        // Simple command
        command.handler();
        setMode('closed');
      } else {
        // Command with options
        selectCommand(command);
        setMode('option');
      }
    };

    const handleOptionChoose = (option: CommandOption) => {
      option.handler();
      setMode('closed');
    };

    React.useImperativeHandle(ref, () => ({
      open: (open? = true) => {
        setMode('command');
      },
      launchCommand: commandName => {
        // not implemented yet
        console.log('Received order for command', commandName);
      },
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
                items={commandManager.getAllNamedCommands()}
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
                placeholder={selectedCommand.displayText}
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
