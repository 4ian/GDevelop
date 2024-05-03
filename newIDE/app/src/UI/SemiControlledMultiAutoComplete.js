// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core';
import {
  AutocompletePaperComponent,
  autocompleteStyles,
} from './SemiControlledAutoComplete';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { textEllipsisStyle } from './TextEllipsis';
import Text from './Text';

const renderItem = (option: AutocompleteOption, state: Object): React.Node => (
  <ListItem dense component={'div'} style={autocompleteStyles.listItem}>
    <ListItemText
      style={autocompleteStyles.listItemText}
      primary={
        <div title={option.value} style={textEllipsisStyle}>
          {option.text}
        </div>
      }
    />
  </ListItem>
);

const styles = {
  listbox: {
    maxHeight: 250,
    overflowY: 'scroll',
  },
};

export type AutocompleteOption = {|
  text: string, // The text displayed
  value: string, // The internal value selected
  disabled?: boolean, // If the option is disabled by default
|};

export type DataSource = Array<?AutocompleteOption>;

const useChipStyles = makeStyles({
  root: {
    height: 25, // Make the chips smaller to fit the input.
  },
  deleteIcon: {
    cursor: 'default', // Hover is enough, no need for a different cursor.
  },
});

type Props = {|
  value: Array<AutocompleteOption>,
  onChange: AutocompleteOption => void,
  dataSource: DataSource,
  inputValue: ?string,
  onInputChange: (event: Object, value: string, reason: string) => void,

  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor,
  helperText?: React.Node,
  fullWidth?: boolean,
  error?: ?string,
  loading?: boolean,
  disabled?: boolean,
  optionsLimit?: number, // Allow limiting the number of options by disabling the autocomplete.
  disableAutoTranslate?: boolean,
|};

export type SemiControlledMultiAutoCompleteInterface = {|
  focusInput: () => void,
|};

const SemiControlledMultiAutoComplete = React.forwardRef<
  Props,
  SemiControlledMultiAutoCompleteInterface
>((props, ref) => {
  const chipStyles = useChipStyles();
  const inputRef = React.useRef<?TextField>(null);

  React.useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  }));

  return (
    <I18n>
      {({ i18n }) => (
        <Autocomplete
          multiple
          value={props.value}
          onChange={props.onChange}
          inputValue={props.inputValue}
          onInputChange={props.onInputChange}
          options={props.dataSource}
          PaperComponent={AutocompletePaperComponent}
          renderOption={renderItem}
          getOptionLabel={(option: AutocompleteOption) => option.text}
          getOptionDisabled={(option: AutocompleteOption) =>
            option.disabled ||
            !!props.value.find(
              element => element && element.value === option.value
            ) ||
            (props.optionsLimit && props.value.length >= props.optionsLimit)
          }
          getOptionSelected={(option, value) => option.value === value.value}
          loading={props.loading}
          ListboxProps={{
            className: props.disableAutoTranslate ? 'notranslate' : '',
            style: {
              ...autocompleteStyles.listbox,
              ...styles.listbox,
            },
          }}
          renderInput={params => (
            <TextField
              {...params}
              color="secondary"
              InputProps={{
                ...params.InputProps,
                placeholder: props.hintText && i18n._(props.hintText),
              }}
              label={props.floatingLabelText}
              helperText={props.error || props.helperText}
              variant="filled"
              error={!!props.error}
              inputRef={inputRef}
              disabled={props.disabled || props.loading}
            />
          )}
          fullWidth={props.fullWidth}
          disabled={props.disabled || props.loading}
          noOptionsText={
            <Text noMargin>
              <Trans>No options</Trans>
            </Text>
          }
          loadingText={
            <Text noMargin>
              <Trans>Loading...</Trans>
            </Text>
          }
          ChipProps={{
            classes: chipStyles,
            className: props.disableAutoTranslate ? 'notranslate' : '',
          }}
        />
      )}
    </I18n>
  );
});

export default SemiControlledMultiAutoComplete;
