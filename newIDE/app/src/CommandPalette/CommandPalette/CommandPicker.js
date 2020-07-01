// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import filterOptions from './FilterOptions';
import {
  type NamedCommand,
  type NamedCompoundCommand,
} from '../CommandManager';

type Command = NamedCommand | NamedCompoundCommand<*>;

type Props = {
  onClose: () => void,
  onSelect: (command: Command) => void,
  commands: Array<Command>,
  i18n: I18n,
};

const CommandPicker = (props: Props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = (_, reason) => {
    if (reason === 'select-option') return;
    props.onClose();
  };

  const handleSelect = (_, command) => {
    props.onSelect(command);
  };

  return (
    <Autocomplete
      open={open}
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      options={props.commands}
      getOptionLabel={command => props.i18n._(command.displayText)}
      onChange={handleSelect}
      openOnFocus
      autoHighlight
      filterOptions={filterOptions}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={props.i18n._(t`Start typing a command...`)}
          variant="outlined"
          autoFocus
        />
      )}
      renderOption={command => (
        <>
          <ListItemIcon>
            <ChevronRightIcon />
          </ListItemIcon>
          <ListItemText primary={props.i18n._(command.displayText)} />
        </>
      )}
    />
  );
};

export default CommandPicker;
