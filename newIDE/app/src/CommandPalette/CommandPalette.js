// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AutoComplete from '../UI/SemiControlledAutoComplete';
import MUIAutocomplete from '@material-ui/lab/Autocomplete';
import CommandsContext from '../CommandPalette/CommandsContext';
import { type NamedCommand } from '../CommandPalette/CommandManager';

type Props = {|
  open: boolean,
  onClose: () => void,
|};

const CommandPalette = (props: Props) => {
  const { onClose, open } = props;
  const commandManager = React.useContext(CommandsContext);

  const handleClose = () => {
    onClose();
  };

  // const handleCommandChoose = commandText => {
  //   const command = commandManager
  //     .getAllNamedCommands()
  //     .find(c => c.displayText.id === commandText);
  //   if (!command) return;
  //   console.warn(`Called ${command.name} from palette!`);
  //   onClose();
  //   command.handler();
  // };

  const handleCommandChoose = (e, command: NamedCommand) => {
    console.warn(command);
    command && command.handler();
    props.onClose();
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          onClose={handleClose}
          aria-label="command-palette"
          open={open}
          fullWidth
          hideBackdrop
          maxWidth="sm"
          style={{ marginTop: 10 }}
        >
          <DialogTitle>
            <MUIAutocomplete
              options={commandManager.getAllNamedCommands()}
              getOptionLabel={command => i18n._(command.displayText)}
              onChange={handleCommandChoose}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Command Palette"
                  variant="outlined"
                  ref={r => {
                    console.warn('Ref:', r);
                    r && r.focus();
                  }}
                />
              )}
              renderOption={command => (
                <>
                  <ListItemIcon>
                    <ChevronRightIcon />
                  </ListItemIcon>
                  <ListItemText primary={i18n._(command.displayText)} />
                </>
              )}
            />
            {/* <AutoComplete
              dataSource={commandManager.getAllNamedCommands().map(command => ({
                text: i18n._(command.displayText),
                value: i18n._(command.displayText),
                renderIcon: () => <ChevronRightIcon />,
              }))}
              onChange={str => console.log(str)}
              onChoose={handleCommandChoose}
              value=""
              fullWidth
              ref={ref => ref && ref.focus()}
            /> */}
          </DialogTitle>
        </Dialog>
      )}
    </I18n>
  );
};

export default CommandPalette;
