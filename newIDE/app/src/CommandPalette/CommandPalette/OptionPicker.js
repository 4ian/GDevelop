// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListIcon from '../../UI/ListIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Autocomplete from '@material-ui/lab/Autocomplete';
import filterOptions from './FilterOptions';
import { type CompoundCommandOption } from '../CommandManager';

type Props = {
  onClose: () => void,
  onSelect: (option: CompoundCommandOption<*>) => void,
  options: Array<CompoundCommandOption<*>>,
  i18n: I18n,
};

const OptionPicker = (props: Props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = (_, reason) => {
    if (reason === 'select-option') return;
    props.onClose();
  };

  const handleSelect = (_, option) => {
    props.onSelect(option);
  };

  return (
    <Autocomplete
      open={open}
      onClose={handleClose}
      onOpen={() => setOpen(true)}
      options={props.options}
      getOptionLabel={option => option.text}
      onChange={handleSelect}
      openOnFocus
      autoHighlight
      filterOptions={filterOptions}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={props.i18n._(t`Choose an option...`)}
          variant="outlined"
          autoFocus
        />
      )}
      renderOption={option => (
        <>
          <ListItemIcon>
            {option.iconSrc ? (
              <ListIcon iconSize={24} src={option.iconSrc} />
            ) : (
              <ChevronRightIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={option.text} />
        </>
      )}
    />
  );
};

export default OptionPicker;
