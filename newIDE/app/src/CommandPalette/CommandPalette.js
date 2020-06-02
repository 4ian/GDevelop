// @flow
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CommandsContext from '../CommandPalette/CommandsContext';

type Props = {
  open: boolean,
  onClose: () => void,
};

const CommandPalette = (props: Props) => {
  const { onClose, open } = props;
  const mng = React.useContext(CommandsContext);

  const handleClose = () => {
    onClose();
  };

  const handleCommandClick = cmd => {
    console.warn(`Called ${cmd.name} from palette!`);
    onClose();
    cmd.handler();
  };

  return (
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
        {mng.getGlobalCommands().map(cmd => (
          <ListItem
            button
            onClick={() => handleCommandClick(cmd)}
            key={cmd.name}
          >
            <ListItemAvatar>
              <ChevronRightIcon />
            </ListItemAvatar>
            <ListItemText primary={cmd.displayText} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default CommandPalette;
