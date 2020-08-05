// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import ListIcon from '../../UI/ListIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import filterOptions from './FilterOptions';
import { type NamedCommand, type CommandOption } from '../CommandManager';
import commandsList, { commandAreas } from '../CommandsList';

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

  const handleClose = (_, reason) => {
    if (reason === 'select-option') return;
    props.onClose();
  };

  const handleSelect = (_, item) => {
    props.onSelect(item);
  };

  const getItemText = (item: Item) => {
    if (item.text) return item.text;
    else if (item.name) {
      const { area, displayText } = commandsList[item.name];
      const areaText = commandAreas[area];
      return props.i18n._(areaText) + ': ' + props.i18n._(displayText);
    }
  };

  const getItemIcon = (item: Item) => {
    if (item.text && item.iconSrc) {
      return <ListIcon iconSize={24} src={item.iconSrc} />;
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
        <>
          <ListItemIcon>{getItemIcon(item)}</ListItemIcon>
          <ListItemText primary={getItemText(item)} />
        </>
      )}
    />
  );
};

export default AutocompletePicker;
