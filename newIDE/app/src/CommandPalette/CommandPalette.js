// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CommandsContext from '../CommandPalette/CommandsContext';

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

  const handleCommandClick = command => {
    console.warn(`Called ${command.name} from palette!`);
    onClose();
    command.handler();
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          onClose={handleClose}
          aria-labelledby="command-palette"
          open={open}
          fullWidth
          hideBackdrop
          maxWidth="sm"
        >
          <DialogTitle>
            <TextField
              fullWidth
              label="Command"
              placeholder="Just a dummy searchbox for now"
              variant="outlined"
            />
          </DialogTitle>

          <List>
            {commandManager.getAllNamedCommands().map(command => (
              <ListItem
                button
                onClick={() => handleCommandClick(command)}
                key={command.name}
              >
                <ListItemAvatar>
                  <ChevronRightIcon />
                </ListItemAvatar>
                <ListItemText primary={i18n._(command.displayText)} />
              </ListItem>
            ))}
          </List>
        </Dialog>
      )}
    </I18n>
  );
};

export default CommandPalette;
