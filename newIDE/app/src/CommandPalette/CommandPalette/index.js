// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import CommandsContext from '../CommandsContext';
import {
  type NamedCommand,
  type NamedCompoundCommand,
  type CompoundCommandOption,
} from '../CommandManager';
import CommandPicker from './CommandPicker';
import OptionPicker from './OptionPicker';

// Show the command palette dialog at the top of the screen
const useStyles = makeStyles({
  scrollPaper: {
    alignItems: 'flex-start',
  },
});

type Command = NamedCommand | NamedCompoundCommand<*>;

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
    selectedCompoundCommand,
    selectCompoundCommand,
  ] = React.useState<null | NamedCompoundCommand<*>>(null);

  const handleCommandChoose = (command: Command) => {
    if (!command.options) {
      // Simple command
      command.handler();
      props.onClose();
    } else {
      // Compound command
      selectCompoundCommand(command);
      openCommandPicker(false);
      openOptionPicker(true);
    }
  };

  const handleOptionChoose = <T>(option: CompoundCommandOption<T>) => {
    option.handler();
    props.onClose();
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          onClose={() => props.onClose()}
          aria-label="command-palette"
          open={props.open}
          fullWidth
          hideBackdrop
          maxWidth="sm"
          classes={classes}
          transitionDuration={0}
        >
          {commandPickerOpen && (
            <CommandPicker
              i18n={i18n}
              commands={commandManager.getAllCommands()}
              onClose={() => props.onClose()}
              onSelect={handleCommandChoose}
            />
          )}
          {optionPickerOpen && selectedCompoundCommand && (
            <OptionPicker
              i18n={i18n}
              options={selectedCompoundCommand.options}
              onClose={() => props.onClose()}
              onSelect={handleOptionChoose}
            />
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default CommandPalette;
