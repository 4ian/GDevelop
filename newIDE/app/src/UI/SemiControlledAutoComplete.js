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
  onBlur?: (event: SyntheticFocusEvent<HTMLInputElement>) => void,
  onRequestClose?: () => void,
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
  event: SyntheticKeyboardEvent<HTMLInputElement>,
  option: Option,
  props: Props
): void => {
  if (option.type !== 'separator') {
    if (option.onClick) option.onClick();
    else {
      props.onChoose
        ? props.onChoose(option.value)
        : props.onChange(option.value);
      if (props.onRequestClose) props.onRequestClose();
    }
  }
};

const getDefaultStylingProps = (
  params: Object,
  value: string,
  props: Props
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
      disabled: props.disabled,
      onKeyDown: (event: SyntheticKeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Escape' && props.onRequestClose)
          props.onRequestClose();
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
              if (option !== null) {
                handleChange(event, option, props);
                setIsMenuOpen(false);
              }
            }}
            open={isMenuOpen}
            style={styles.container}
            inputValue={currentInputValue}
            value={currentInputValue}
            onInputChange={handleInputChange}
            options={props.dataSource}
            renderOption={renderItem}
            getOptionDisabled={isOptionDisabled}
            ListboxProps={{
              // We need to stop the propagation since ClickAwayListener of InlinePopover does not
              // recognise listbox as a part of Autocomplete, which is fair since it's in a different DOM tree.
              // We have basically killed these events completely by using stopImmediatePropagation() since Portals dont
              // stop propagation by simply using stopPropagation(), more about this issue https://github.com/facebook/react/issues/11387
              // Material-UI has issues regarding this too, https://github.com/mui-org/material-ui/issues/18586.
              // This change was implemented in this PR https://github.com/4ian/GDevelop/pull/1586,
              // which is meant to solve this issue, https://github.com/4ian/GDevelop/issues/1562
              // Important takeaway: Never try to catch these events, our underlying assumption is that we don't need these events
              // anymore after selection of option. Stopping propagation of events is never a good idea,
              // but this is meant to be a hack and not a proper solution.
              onClick: (event: SyntheticMouseEvent<HTMLUListElement>) => {
                event.nativeEvent.stopImmediatePropagation();
              },
              onTouchEnd: (event: SyntheticTouchEvent<HTMLUListElement>) => {
                event.nativeEvent.stopImmediatePropagation();
              },
            }}
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
                ...other
              } = getDefaultStylingProps(params, currentInputValue, props);
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
                    onBlur: (
                      event: SyntheticFocusEvent<HTMLInputElement>
                    ): void => {
                      setInputValue(null);
                      setIsMenuOpen(false);
                      props.onChange(event.currentTarget.value);
                      if (props.onBlur) props.onBlur(event);
                    },
                    onMouseDown: (
                      event: SyntheticMouseEvent<HTMLInputElement>
                    ): void => {
                      if (input.current && !input.current.value.length)
                        setIsMenuOpen(!isMenuOpen);
                    },
                  }}
                  {...other}
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
