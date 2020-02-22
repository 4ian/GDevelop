// @flow
import * as React from 'react';
// eslint-disable-next-line
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { MarkdownText } from './MarkdownText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';

export type DataSource = Array<
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering. If empty, item is always shown.
      value: string, // The value to show on screen and to be selected
      onClick?: () => void, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderIcon?: ?() => React.Element<typeof ListIcon | typeof SvgIcon>,
    |}
>;

// Styles for the TextField and input
const useStyles = makeStyles({
  root: {
    flexWrap: 'wrap',
    '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
      flexGrow: 1,
      width: 'auto',
    },
  },
});

const styles = {
  container: {
    position: 'relative',
  },
};

// eslint-disable-next-line
type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void,
  dataSource: DataSource,

  id?: string,
  onBlur?: (event: {|
    currentTarget: {|
      value: string,
    |},
  |}) => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor | string,
  fullWidth?: boolean,
  margin?: 'none' | 'dense',
  textFieldStyle?: Object,
  openOnFocus?: boolean,
|};

// eslint-disable-next-line
type State = {|
  inputValue: string | null,
|};

// filters the option list
const filterFunction = (option, inputValue) => {
  if (typeof inputValue !== 'undefined') {
    const lowercaseInputValue = inputValue.toLowerCase();
    if (!option.text) return true;
    if (option.type === 'separator') return true;
    return option.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
  } else {
    return false;
  }
};

const renderMenu = option => {
  if (option.type !== 'seperator') {
    return (
      <MenuItem>
        {option.renderIcon && (
          <ListItemIcon>{option.renderIcon()}</ListItemIcon>
        )}
        {option.value}
      </MenuItem>
    );
  } else {
    return <Divider />;
  }
};

export default function SemiControlledAutoComplete(props) {
  const [state, setState] = React.useState({ inputValue: props.value });
  const [render, setRender] = React.useState(true);

  const helperText = props.helperMarkdownText ? (
    <MarkdownText source={props.helperMarkdownText} />
  ) : null;

  const classes = useStyles();

  // props.dataSource
  // .filter(option => filterFunction(option, currentInputValue))
  // .map(option => option.value)

  const handleChange = (event, value) => {
    if (typeof value !== 'string') {
      const data = props.dataSource.filter(
        option => option.value === value.value
      );
      if (data.length !== 0) {
        if (data[0].onClick) {
          data[0].onClick();
        }
      }
      props.onChange(value.value);
    } else {
      setState({ inputValue: value });
      props.onChange(state.inputValue);
    }
    setRender(false);
  };

  if (render) {
    return (
      <div
        style={{
          ...styles.container,
          flexGrow: props.fullWidth ? 1 : undefined,
        }}
      >
        <Autocomplete
          freeSolo
          disableClearable
          blurOnSelect
          clearOnEscape
          disableListWrap
          options={props.dataSource.filter(option =>
            filterFunction(option, state.inputValue)
          )}
          getOptionLabel={option => {
            if (typeof option !== 'string') {
              return option.value;
            } else {
              return '';
            }
          }}
          renderOption={(option, state) => renderMenu(option)}
          renderInput={params => (
            <TextField
              {...params}
              classes={{ root: classes.root }}
              label={props.floatingLabelText}
              error={!!props.errorText}
              helperText={props.helperText || helperText || props.errorText}
              disabled={props.disabled}
              style={props.textFieldStyle}
              onChange={event => {
                setState({ inputValue: event.target.value });
              }}
              // Todo: Implement i18n for placeholder, couldn't find a workaround.
              placeholder={props.hintText}
              variant="filled"
            />
          )}
          inputValue={state.inputValue}
          onInputChange={(event, inputValue, reason) => {
            setState({ inputValue });
          }}
          onChange={(event, value) => handleChange(event, value)}
        />
      </div>
    );
  } else {
    return null;
  }
}
