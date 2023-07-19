// @flow
import * as React from 'react';
import { useState } from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MarkdownText } from './MarkdownText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ListItem from '@material-ui/core/ListItem';
import { computeTextFieldStyleProps } from './TextField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import { makeStyles } from '@material-ui/core/styles';
import muiZIndex from '@material-ui/core/styles/zIndex';
import {
  shouldCloseOrCancel,
  shouldSubmit,
  shouldValidate,
} from './KeyboardShortcuts/InteractionKeys';
import { textEllipsisStyle } from './TextEllipsis';
import Paper from './Paper';

export const AutocompletePaperComponent = (props: any) => (
  // Use light background so that it's in contrast with background that
  // is either dark or medium (in dialogs).
  <Paper {...props} background="light" />
);

type Option =
  | {|
      type: 'separator',
    |}
  | {|
      text: string, // The text used for filtering. If empty, item is always shown.
      value: string, // The value to show on screen and to be selected
      translatableValue?: MessageDescriptor,
      onClick?: () => void | Promise<void>, // If defined, will be called when the item is clicked. onChange/onChoose won't be called.
      renderIcon?: ?() => React.Element<typeof ListIcon | typeof SvgIcon>,
    |};

export type DataSource = Array<Option>;

type Props = {|
  value: string,
  onChange: string => void,
  onChoose?: string => void,
  dataSource: DataSource,

  id?: ?string,
  onBlur?: (event: SyntheticFocusEvent<HTMLInputElement>) => void,
  onClick?: (event: SyntheticPointerEvent<HTMLInputElement>) => void,
  commitOnInputChange?: boolean,
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
  inputStyle?: Object,
|};

export type SemiControlledAutoCompleteInterface = {|
  focus: FieldFocusFunction,
  forceInputValueTo: (newValue: string) => void,
|};

export const autocompleteStyles = {
  container: {
    position: 'relative',
    width: '100%',
  },
  listItem: {
    // Make the list items very dense:
    padding: 0,
    margin: 0,
  },
  listbox: { padding: 0, margin: 0 },
  listItemText: {
    margin: '1px 0',
  },
};

const useStyles = makeStyles({
  option: {
    cursor: 'default',
  },
  listbox: autocompleteStyles.listbox,
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

const makeRenderItem = (i18n: I18nType) => (
  option: Option,
  state: Object
): React.Node => {
  if (option.type && option.type === 'separator') {
    return (
      <ListItem
        divider
        disableGutters
        component={'div'}
        style={autocompleteStyles.listItem}
      />
    );
  }

  const value = option.translatableValue
    ? i18n._(option.translatableValue)
    : option.value;
  return (
    <ListItem
      dense={true}
      component={'div'}
      style={autocompleteStyles.listItem}
    >
      {option.renderIcon && <ListItemIcon>{option.renderIcon()}</ListItemIcon>}
      <ListItemText
        style={autocompleteStyles.listItemText}
        primary={
          <div title={value} style={textEllipsisStyle}>
            {value}
          </div>
        }
      />
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
    !optionList.filter(
      option =>
        option.type !== 'separator' &&
        (option.value || option.translatableValue)
    ).length
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
      style: props.inputStyle,
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
        } else if (shouldValidate(event)) {
          // Make sure the current value is reported to the parent.
          // Otherwise a parent like an InlineParameterEditor would close when detecting
          // the validation (Enter key pressed) without having the latest value.
          props.onChange(event.currentTarget.value);
        }
      },
    },
  };
};

const getOptionLabel = (option: Option, value: string): string =>
  option.value ? option.value : value;

export default React.forwardRef<Props, SemiControlledAutoCompleteInterface>(
  function SemiControlledAutoComplete(props, ref) {
    const input = React.useRef((null: ?HTMLInputElement));
    const [inputValue, setInputValue] = useState((null: string | null));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const classes = useStyles();

    const focus: FieldFocusFunction = options => {
      const inputElement = input.current;
      if (inputElement) {
        inputElement.focus();
        if (options && options.selectAll) {
          inputElement.select();
        }
      }
    };

    React.useImperativeHandle(ref, () => ({
      focus,
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
      if (props.commitOnInputChange) props.onChange(value);
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
              ...autocompleteStyles.container,
            }}
            inputValue={currentInputValue}
            value={currentInputValue}
            onInputChange={handleInputChange}
            PaperComponent={AutocompletePaperComponent}
            options={props.dataSource}
            renderOption={makeRenderItem(i18n)}
            getOptionDisabled={isOptionDisabled}
            getOptionLabel={(option: Option) =>
              getOptionLabel(option, currentInputValue)
            }
            filterOptions={(options: DataSource, state) =>
              filterFunction(options, state, currentInputValue)
            }
            id={props.id}
            renderInput={params => {
              const {
                InputProps,
                inputProps,
                ...otherStylingProps
              } = getDefaultStylingProps(params, props);
              return (
                <TextField
                  color="secondary"
                  InputProps={{
                    ...InputProps,
                    placeholder:
                      typeof props.hintText === 'string'
                        ? props.hintText
                        : i18n._(props.hintText),
                  }}
                  inputProps={{
                    ...inputProps,
                    onClick: props.onClick,
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
