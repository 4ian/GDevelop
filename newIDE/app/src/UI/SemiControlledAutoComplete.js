// @flow
import * as React from 'react';
import { useState } from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { MarkdownText } from './MarkdownText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ListItem from '@material-ui/core/ListItem';
import { computeTextFieldStyleProps } from './TextField';
import { makeStyles } from '@material-ui/core/styles';
import muiZIndex from '@material-ui/core/styles/zIndex';

type Option =
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering. If empty, item is always shown.
      value: string, // The value to show on screen and to be selected
      onClick?: () => void, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderIcon?: ?() => React.Element<typeof ListIcon | typeof SvgIcon>,
    |};

export type DataSource = Array<Option>;

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

type State = {|
  inputValue: string | null,
|};

type Interface = {|
  focus: () => void,
  forceInputValueTo: (newValue: string) => void,
|};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
  },
  listItem: {
    padding: 0,
    margin: 0,
  },
};

const useStyles = makeStyles({
  option: {
    cursor: 'default',
  },
  listbox: {
    padding: 0,
    margin: 0,
  },
  input: {
    width: 'auto',
    flexGrow: 1,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
  popper: {
    zIndex: muiZIndex.tooltip + 100,
  },
});

const renderItem = (option: Option, state: Object): React.Node => {
  if (option.type && option.type === 'separator') {
    return (
      <ListItem
        divider
        disableGutters
        component={'div'}
        style={styles.listItem}
      />
    );
  }
  return (
    <ListItem component={'div'} style={styles.listItem}>
      {option.renderIcon && <ListItemIcon>{option.renderIcon()}</ListItemIcon>}
      {option.value}
    </ListItem>
  );
};

const isOptionDisabled = (option: Option) =>
  option.type === 'separator' ? true : false;

const filterFunction = (
  options: DataSource,
  state: Object,
  value: string
): DataSource => {
  const lowercaseInputValue = value.toLowerCase();
  const optionList = options.filter(option => {
    if (option.type === 'separator') return true;
    if (!option.text) return true;
    return option.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
  });

  if (
    !optionList.filter(option => option.type !== 'separator' && option.value)
      .length
  )
    return [];

  // Remove divider(s) if they are at the start or end of array
  while (
    optionList[optionList.length - 1] !== undefined &&
    optionList[optionList.length - 1].type !== undefined
  )
    optionList.pop();
  while (optionList[0] !== undefined && optionList[0].type !== undefined)
    optionList.shift();

  return optionList;
};

const handleChange = (
  event: SyntheticKeyboardEvent<HTMLInputElement>,
  option: Option | string,
  props: Props,
  ref: { current: ?HTMLInputElement }
): void => {
  if (option !== null && option.type !== 'separator') {
    if (typeof option === 'string') props.onChange(option);
    else {
      if (option.onClick) option.onClick();
      else
        props.onChoose
          ? props.onChoose(option.value)
          : props.onChange(option.value);
    }
  }
  if (event.key === 'Enter' && ref.current) ref.current.blur();
};

const getDefaultStylingProps = (
  params: Object,
  value: string,
  props: Props,
  ref: { current: ?HTMLInputElement }
): Object => {
  const { InputProps, inputProps, InputLabelProps, ...other } = params;
  return {
    ...other,
    InputProps: {
      ...InputProps,
      className: null,
      endAdornment: null,
    },
    inputProps: {
      ...inputProps,
      className: null,
      onKeyDown: (event: SyntheticKeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') handleChange(event, value, props, ref);
      },
    },
  };
};

const getOptionLabel = (option: Option, value: string): string =>
  option.value ? option.value : value;

export default React.forwardRef<Props, Interface>(
  function SemiControlledAutoComplete(props: Props, ref) {
    const _input = React.useRef((null: ?HTMLInputElement));
    const [state, setState] = useState<State>({ inputValue: null });
    const classes = useStyles();

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        if (_input.current) _input.current.focus();
      },
      forceInputValueTo: (newValue: string) => {
        if (state.inputValue !== null) setState({ inputValue: newValue });
      },
    }));

    const currentInputValue =
      state.inputValue !== null ? state.inputValue : props.value;

    const helperText = props.helperMarkdownText ? (
      <MarkdownText source={props.helperMarkdownText} />
    ) : null;

    const handleInputChange = (
      event: SyntheticKeyboardEvent<HTMLInputElement>,
      value: string,
      reason: string
    ): void => setState({ inputValue: value });

    return (
      <I18n>
        {({ i18n }) => (
          <Autocomplete
            freeSolo
            blurOnSelect
            classes={classes}
            onChange={(event, option: Option | string) =>
              handleChange(event, option, props, _input)
            }
            style={styles.container}
            inputValue={currentInputValue}
            value={currentInputValue}
            onInputChange={handleInputChange}
            options={props.dataSource}
            renderOption={renderItem}
            getOptionDisabled={isOptionDisabled}
            getOptionLabel={(option: Option) =>
              getOptionLabel(option, currentInputValue)
            }
            filterOptions={(options: DataSource, state) =>
              filterFunction(options, state, currentInputValue)
            }
            renderInput={params => {
              const { InputProps, ...other } = getDefaultStylingProps(
                params,
                currentInputValue,
                props,
                _input
              );
              return (
                <TextField
                  InputProps={{
                    ...InputProps,
                    placeholder:
                      typeof props.hintText === 'string'
                        ? props.hintText
                        : i18n._(props.hintText),
                  }}
                  {...other}
                  {...computeTextFieldStyleProps(props)}
                  style={props.textFieldStyle}
                  label={props.floatingLabelText}
                  inputRef={_input}
                  disabled={props.disabled}
                  error={!!props.errorText}
                  helperText={helperText || props.errorText}
                  fullWidth={props.fullWidth}
                />
              );
            }}
          />
        )}
      </I18n>
    );
  }
);
