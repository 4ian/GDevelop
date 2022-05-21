// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import Autocomplete from '@material-ui/lab/Autocomplete';

export type AutocompleteOption = {|
  text: string, // The text displayed
  value: string, // The internal value selected
|};

export type DataSource = Array<?AutocompleteOption>;

const styles = {
  chip: {
    // Make the chips smaller to fit the input
    height: 25,
  },
};

type Props = {|
  value: Array<AutocompleteOption>,
  onChange: (AutocompleteOption) => void,
  dataSource: DataSource,
  inputValue: ?string,
  onInputChange: (string) => void,

  floatingLabelText?: React.Node,
  hintText?: MessageDescriptor,
  helperText?: React.Node,
  fullWidth?: boolean,
  error?: ?string,
  loading?: boolean,
  optionsLimit?: number, // Allow limiting the number of options by disabling the autocomplete.
|};

export default function SemiControlledMultiAutoComplete(props: Props) {
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
          getOptionLabel={(option: AutocompleteOption) => option.text}
          getOptionDisabled={(option: AutocompleteOption) =>
            !!props.value.find(
              (element) => element && element.value === option.value
            ) ||
            (props.optionsLimit && props.value.length >= props.optionsLimit)
          }
          getOptionSelected={(option, value) => option.value === value.value}
          loading={props.loading}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                placeholder: props.hintText && i18n._(props.hintText),
              }}
              label={props.floatingLabelText}
              helperText={props.error || props.helperText}
              variant="filled"
              error={!!props.error}
              disabled={props.loading}
            />
          )}
          fullWidth={props.fullWidth}
          disabled={props.loading}
          ChipProps={{
            style: styles.chip,
          }}
        />
      )}
    </I18n>
  );
}
