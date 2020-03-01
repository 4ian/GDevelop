// @flow
import * as React from 'react';
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

// type Option is defined in isolation to DataSource, since it needs to be
// passed as an object for some funtions.

export type DataSource = Array<Option>;

const styles = {
  container: {
    position: 'relative',
    width: '100%',
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
};

type Props = {|
  value: string,
  onChange: string => void,
  onRequestClose?: () => void,
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

export default class SemiControlledAutoComplete extends React.Component<
  Props,
  State
> {
  _input = React.createRef<HTMLInputElement>();

  state = {
    inputValue: null,
  };

  focus() {
    if (this._input.current) this._input.current.focus();
  }

  forceInputValueTo(newValue: string): void {
    if (this.state.inputValue !== null) {
      this.setState({
        inputValue: newValue,
      });
    }
  }

  isOptionDisabled = (option: Option): boolean => {
    // Writing shorthand, ie, return option.type === 'separator' fails flow test.
    // All the cases of type Option have to be explicitly handled.
    if (option.type === 'separator') return true;
    else return false;
  };

  render() {
    const getCurrentInputValue = (): string =>
      this.state.inputValue !== null ? this.state.inputValue : this.props.value;

    const filterFunction = (options: DataSource, state: Object): DataSource => {
      var separatorCount = 0;
      const lowercaseInputValue = getCurrentInputValue().toLowerCase();
      var optionList = options.filter(option => {
        if (option.type === 'separator') {
          separatorCount++;
          return true;
        }
        if (!option.text) return true;
        return option.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
      });

      // Empty the list if there are only dividers inside it
      if (optionList.length === separatorCount) optionList = [];

      // Remove divider(s) if they are at the start or end of array
      while (
        optionList[optionList.length - 1] !== undefined &&
        optionList[optionList.length - 1].type !== undefined
      )
        optionList.pop();
      while (
        optionList[optionList.length - 1] !== undefined &&
        optionList[0].type !== undefined
      )
        optionList.shift();

      return optionList;
    };

    const helperText = this.props.helperMarkdownText ? (
      <MarkdownText source={this.props.helperMarkdownText} />
    ) : null;

    const getOptionLabel = (option: Option): string => {
      // option.value ? option.value : getCurrentInputValue();
      // Writing shorthand will fail flow checks.
      // Explicitly define all the cases of type Option.
      if (option.value) return option.value;
      else return getCurrentInputValue();
    };

    const handleChange = (event, option: Option | string): void => {
      // Explicitly handle option.type to avoid flow errors
      if (option !== null && option.type !== 'separator') {
        if (typeof option === 'string') {
          this.props.onChange(option);
        } else {
          if (option.onClick) option.onClick();
          else {
            if (this.props.onChoose) this.props.onChoose(option.value);
            else this.props.onChange(option.value);
          }
        }
      }
      if (typeof event.key === 'string') handleKeyDown(event.key);
      if (this.props.onRequestClose) this.props.onRequestClose();
    };

    const handleKeyDown = (key: string): void => {
      if (key === 'Enter' && this._input.current !== null)
        this._input.current.blur();
    };

    const handleInputChange = (e, value: string, reason: string): void =>
      this.setState({ inputValue: value });

    const getDefaultStylingProps = (params: Object): Object => {
      var { InputProps, inputProps, InputLabelProps, ...other } = params;
      InputProps.className = null;
      InputProps.endAdornment = null;
      inputProps.className = null;
      InputProps.style = styles.inputRoot;
      inputProps.style = styles.inputInput;
      inputProps = {
        ...inputProps,
        onKeyDown: (e): void => {
          if (e.key === 'Escape' && this.props.onRequestClose)
            this.props.onRequestClose();
        },
      };
      return { InputProps, inputProps, InputLabelProps, ...other };
    };

    const renderItem = (option: Option, state: Object): React.Node => {
      if (option.type && option.type === 'separator') {
        return (
          <ListItem
            divider
            disableGutters
            component={'div'}
            style={{ padding: 0, margin: 0 }}
          />
        );
      } else {
        return (
          <ListItem component={'div'} style={{ padding: 0, margin: 0 }}>
            {option.renderIcon && (
              <ListItemIcon>{option.renderIcon()}</ListItemIcon>
            )}
            {option.value}
          </ListItem>
        );
      }
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Autocomplete
            freeSolo
            clearOnEscape
            disableOpenOnFocus={!this.props.openOnFocus}
            onChange={handleChange}
            style={{ ...styles.container }}
            inputValue={getCurrentInputValue()}
            onInputChange={handleInputChange}
            options={this.props.dataSource}
            renderOption={renderItem}
            getOptionDisabled={this.isOptionDisabled}
            ListboxProps={{
              style: {
                padding: 0,
                margin: 0,
              },
            }}
            getOptionLabel={getOptionLabel}
            filterOptions={filterFunction}
            renderInput={params => {
              var { InputProps, ...other } = getDefaultStylingProps(params);
              InputProps = {
                ...InputProps,
                placeholder:
                  typeof this.props.hintText === 'string'
                    ? this.props.hintText
                    : i18n._(this.props.hintText),
              };
              const defaultStylingProps = { InputProps, ...other };
              return (
                <TextField
                  {...defaultStylingProps}
                  {...computeTextFieldStyleProps(this.props)}
                  style={{ ...this.props.textFieldStyle }}
                  label={this.props.floatingLabelText}
                  inputRef={this._input}
                  disabled={this.props.disabled}
                  error={!!this.props.errorText}
                  helperText={helperText}
                  fullWidth={this.props.fullWidth}
                />
              );
            }}
          />
        )}
      </I18n>
    );
  }
}
