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
import {
  shouldCloseOrCancel,
  shouldSubmit,
} from './KeyboardShortcuts/InteractionKeys';

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
  onBlur?: (event: SyntheticFocusEvent<HTMLInputElement>) => void,
  onRequestClose?: () => void,
  onApply?: () => void,
  errorText?: React.Node,
  disabled?: boolean,
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  hintText?: MessageDescriptor | string,
  fullWidth?: boolean,
  margin?: 'none' | 'dense',
  textFieldStyle?: Object,
  openOnFocus?: boolean,
  style?: Object,
|};

export type SemiControlledAutoCompleteInterface = {|
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
    display: 'inline-block',
    whiteSpace: 'nowrap',
    width: 'calc(100%)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  input: HTMLInputElement,
  option: Option,
  props: Props
): void => {
  if (option.type === 'separator') return;
  else if (option.onClick) option.onClick();
  else {
    // Force the input to the selected value. We do this, bypassing inputValue state,
    // because the change could be immediately followed by a blur, in which case the blur
    // must have the updated value.
    // Search for "blur-value" in this file for the rest of this "workaround".
    input.value = option.value;

    // Call the props to notify of the change. Note that if the component is blurred just after,
    // onChange could be called again. Hence why we immediately set the input.value below.
    // Search for "blur-value" in this file for the rest of this "workaround".
    if (props.onChoose) {
      props.onChoose(option.value);
    } else {
      props.onChange(option.value);
    }

    // Call onApply (if specified) as an option was chosen.
    if (props.onApply) props.onApply();
    else if (props.onRequestClose) props.onRequestClose();
  }
};

const getDefaultStylingProps = (params: Object, props: Props): Object => {
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
      disabled: props.disabled,
      onKeyDown: (event: SyntheticKeyboardEvent<HTMLInputElement>): void => {
        if (shouldCloseOrCancel(event)) {
          if (props.onRequestClose) props.onRequestClose();
        } else if (shouldSubmit(event)) {
          // Make sure the current value is reported to the parent before
          // calling onApply (or onRequestClose), otherwise the parent would only
          // know about the previous value.
          props.onChange(event.currentTarget.value);

          if (props.onApply) props.onApply();
          else if (props.onRequestClose) props.onRequestClose();
        }
      },
    },
  };
};

const getOptionLabel = (option: Option, value: string): string =>
  option.value ? option.value : value;

export default React.forwardRef<Props, SemiControlledAutoCompleteInterface>(
  function SemiControlledAutoComplete(props: Props, ref) {
    const input = React.useRef((null: ?HTMLInputElement));
    const [inputValue, setInputValue] = useState((null: string | null));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const classes = useStyles();

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        if (input.current) input.current.focus();
      },
      forceInputValueTo: (newValue: string) => {
        if (inputValue !== null) setInputValue(newValue);
      },
    }));

    const currentInputValue = inputValue !== null ? inputValue : props.value;

    const helperText = props.helperMarkdownText ? (
      <MarkdownText source={props.helperMarkdownText} />
    ) : null;

    const handleInputChange = (
      event: SyntheticKeyboardEvent<HTMLInputElement>,
      value: string,
      reason: string
    ): void => {
      setInputValue(value);
      if (!isMenuOpen) setIsMenuOpen(true);
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Autocomplete
            freeSolo
            classes={classes}
            onChange={(
              event: SyntheticKeyboardEvent<HTMLInputElement>,
              option: Option | null
            ) => {
              if (option === null || !input.current) return;

              handleChange(input.current, option, props);
              setInputValue(null);
              setIsMenuOpen(false);
            }}
            open={isMenuOpen}
            style={{
              ...props.style,
              ...styles.container,
            }}
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
              const {
                InputProps,
                inputProps,
                ...otherStylingProps
              } = getDefaultStylingProps(params, props);
              return (
                <TextField
                  InputProps={{
                    ...InputProps,
                    placeholder:
                      typeof props.hintText === 'string'
                        ? props.hintText
                        : i18n._(props.hintText),
                  }}
                  inputProps={{
                    ...inputProps,
                    onFocus: (
                      event: SyntheticFocusEvent<HTMLInputElement>
                    ): void => {
                      setIsMenuOpen(true);
                      if (input.current)
                        input.current.selectionStart =
                          input.current.value.length;
                    },
                    // Redefine onBlur to call onChange when the component is blurred.
                    // We do this because the default behavior of the Autocomplete is not
                    // to call onChange when blurred (though it should according to the docs?).
                    onBlur: (
                      event: SyntheticFocusEvent<HTMLInputElement>
                    ): void => {
                      setInputValue(null);
                      setIsMenuOpen(false);

                      // Use the value of the input, rather than inputValue
                      // that could be not updated.
                      // Search for "blur-value" in this file for the rest of this "workaround".
                      props.onChange(event.currentTarget.value);

                      if (props.onBlur) props.onBlur(event);
                    },
                    onMouseDown: (
                      event: SyntheticMouseEvent<HTMLInputElement>
                    ): void => {
                      // Toggle the menu when clicked and empty
                      if (input.current && !input.current.value.length)
                        setIsMenuOpen(!isMenuOpen);
                    },
                  }}
                  {...otherStylingProps}
                  {...computeTextFieldStyleProps(props)}
                  style={props.textFieldStyle}
                  label={props.floatingLabelText}
                  inputRef={input}
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
