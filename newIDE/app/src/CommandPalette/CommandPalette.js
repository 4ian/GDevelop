// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import CommandsContext from '../CommandPalette/CommandsContext';
import { type NamedCommand } from '../CommandPalette/CommandManager';

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
  const [autocompleteOpen, openAutocomplete] = React.useState(true);
  const classes = useStyles();
  const { onClose, open } = props;
  const commandManager = React.useContext(CommandsContext);

  const handleClose = () => {
    onClose();
  };

  const handleCommandChoose = (e, command: NamedCommand) => {
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
          classes={classes}
          transitionDuration={0}
        >
          <Autocomplete
            open={autocompleteOpen}
            onClose={() => {
              openAutocomplete(false);
              handleClose();
            }}
            onOpen={() => openAutocomplete(true)}
            options={commandManager.getAllNamedCommands()}
            getOptionLabel={command => i18n._(command.displayText)}
            onChange={handleCommandChoose}
            openOnFocus
            renderInput={params => (
              <TextField
                {...params}
                placeholder={i18n._(t`Start typing a command...`)}
                variant="outlined"
                autoFocus
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
        </Dialog>
      )}
    </I18n>
  );
};

export default CommandPalette;
