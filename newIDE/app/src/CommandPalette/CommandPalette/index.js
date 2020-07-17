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

type Props = {|
  open: boolean,
  onClose: () => void,
|};

const CommandPalette = (props: Props) => {
  const classes = useStyles();
  const commandManager = React.useContext(CommandsContext);
  const [commandPickerOpen, openCommandPicker] = React.useState(true);
  const [optionPickerOpen, openOptionPicker] = React.useState(false);
  const [
    selectedCommand,
    selectCommand,
  ] = React.useState<null | NamedCommandWithOptions<*>>(null);

  const handleCommandChoose = (command: NamedCommand) => {
    if (command.handler) {
      // Simple command
      command.handler();
      props.onClose();
    } else {
      // Command with options
      selectCommand(command);
      openCommandPicker(false);
      openOptionPicker(true);
    }
  };

  const handleOptionChoose = <T>(option: CommandOption<T>) => {
    option.handler();
    props.onClose();
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          onClose={props.onClose}
          aria-label="command-palette"
          open={props.open}
          fullWidth
          hideBackdrop
          maxWidth="sm"
          classes={classes}
          transitionDuration={0}
        >
          {commandPickerOpen && (
            // Command picker
            <AutocompletePicker
              i18n={i18n}
              items={commandManager.getAllNamedCommands()}
              placeholder={t`Start typing a command...`}
              onClose={props.onClose}
              onSelect={handleCommandChoose}
            />
          )}
          {optionPickerOpen && selectedCommand && (
            // Command options picker
            <AutocompletePicker
              i18n={i18n}
              items={selectedCommand.generateOptions()}
              placeholder={selectedCommand.displayText}
              onClose={props.onClose}
              onSelect={handleOptionChoose}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CommandPalette;
