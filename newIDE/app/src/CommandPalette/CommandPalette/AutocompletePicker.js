// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import ListIcon from '../../UI/ListIcon';
import { useShortcutMap } from '../../KeyboardShortcuts';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Chip from '../../UI/Chip';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import filterOptions from './FilterOptions';
import { type NamedCommand, type CommandOption } from '../CommandManager';
import commandsList, { commandAreas } from '../CommandsList';
import { getShortcutDisplayName } from '../../KeyboardShortcuts';

const useStyles = makeStyles({
  listItemContainer: {
    width: '100%',
  },
});

const styles = {
  chip: {
    borderRadius: 3,
  },
};

type Item = NamedCommand | CommandOption;

type Props<T> = {|
  onClose: () => void,
  onSelect: (item: T) => void,
  items: Array<T>,
  placeholder: MessageDescriptor,
  i18n: I18nType,
|};

const AutocompletePicker = (
  props: Props<NamedCommand> | Props<CommandOption>
) => {
  const [open, setOpen] = React.useState(true);
  const shortcutMap = useShortcutMap();
  const classes = useStyles();

  const handleClose = (_, reason) => {
    if (reason === 'select-option') return;
    props.onClose();
  };

  const handleSelect = (_, item) => {
    props.onSelect(item);
  };

  const getItemHint = (item: Item) => {
    if (item.text) return null;
    else if (item.name) {
      const shortcutString = shortcutMap[item.name];
      if (!shortcutString) return null;
      const shortcutDisplayName = getShortcutDisplayName(shortcutString);
      return (
        <ListItemSecondaryAction>
          <Chip label={shortcutDisplayName} style={styles.chip} />
        </ListItemSecondaryAction>
      );
    }
  };

  const getItemText = (item: Item) => {
    if (item.text) return item.text;
    else if (item.name) {
      const { area, displayText } = commandsList[item.name];
      const areaText = commandAreas[area];
      return props.i18n._(areaText) + ' 〉' + props.i18n._(displayText);
    }
  };

  const getItemIcon = (item: Item) => {
    if (item.text && item.iconSrc) {
      return <ListIcon iconSize={20} src={item.iconSrc} />;
    } else return <ChevronRightIcon />;
  };

  return (
    <Autocomplete
      open={open}
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      options={props.items}
      getOptionLabel={getItemText}
      onChange={handleSelect}
      openOnFocus
      autoHighlight
      filterOptions={filterOptions}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={props.i18n._(props.placeholder)}
          variant="outlined"
          autoFocus
        />
      )}
      renderOption={item => (
        <ListItem
          dense
          component="div"
          ContainerComponent="div"
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon>{getItemIcon(item)}</ListItemIcon>
          <ListItemText primary={getItemText(item)} />
          {getItemHint(item)}
        </ListItem>
      )}
    />
  );
};

export default AutocompletePicker;
