// @flow
import * as React from 'react';
// import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ListIcon from './ListIcon';
import SvgIcon from '@material-ui/core/SvgIcon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { MarkdownText } from './MarkdownText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ListItem from '@material-ui/core/ListItem';

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
    if (this._input.current) {
      this._input.current.focus();
      this._input.current.onkeydown = e => {
        if (e.key === 'Escape' && this.props.onRequestClose)
          this.props.onRequestClose();
      };
    }
  }

  forceInputValueTo(newValue: string): void {
    if (this.state.inputValue !== null) {
      this.setState({
        inputValue: newValue,
      });
    }
  }

  disableDivider = (option: Object): boolean => {
    if (option.type === 'separator') {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const currentInputValue = (): string => {
      if (this.state.inputValue !== null) {
        return this.state.inputValue;
      } else {
        return this.props.value;
      }
    };

    const filterFunction = (options, state): Array<DataSource> => {
      var separatorCount = 0;
      const lowercaseInputValue = currentInputValue().toLowerCase();
      var optionList = options.filter(option => {
        if (!option.text) return true;
        if (option.type === 'seperator') {
          separatorCount++;
          return true;
        }
        return option.text.toLowerCase().indexOf(lowercaseInputValue) !== -1;
      });
      if (optionList.length === separatorCount) optionList = [];
      if (optionList[optionList.length - 1].type !== undefined)
        optionList.pop();
      return optionList;
    };

    const helperText = this.props.helperMarkdownText ? (
      <MarkdownText source={this.props.helperMarkdownText} />
    ) : null;

    const handleOptionLabel = (option: DataSource | null): string => {
      if (option.value) {
        return option.value;
      } else {
        return currentInputValue();
      }
    };

    const handleChange = (event: Event, option: DataSource | string): void => {
      if (option !== null) {
        if (option.value) {
          if (option.onClick) option.onClick();
          else {
            if (this.props.onChoose) this.props.onChoose(option.value);
            else this.props.onChange(option.value);
          }
        } else {
          /* option is just a string in this case, and it
             enables user to type something other than provided options. */

          this.props.onChange(option);
        }
        if (event.key) handleKeyDown(event.key);
        if (this.props.onRequestClose) this.props.onRequestClose();
      }
    };

    //Todo: Find a way to call this function everytime.
    const handleKeyDown = (key: string): void => {
      if (key === 'Enter' && this._input.current !== null)
        this._input.current.blur();
    };

    const handleInputChange = (
      e: Event,
      value: string,
      reason: string
    ): void => {
      this.setState({ inputValue: value });
    };

    const nullifyDefaultStyling = (params: Object): void => {
      const { InputProps, inputProps, InputLabelProps } = params;
      InputProps.className = null;
      InputProps.endAdornment = null;
      inputProps.className = null;
      InputLabelProps.disableAnimation = true;
      InputProps.style = styles.inputRoot;
      inputProps.style = styles.inputInput;
    };

    const renderItem = (option: DataSource, state: Object): React.Node => {
      if (option.type === 'separator') {
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

    const placeholder = () => {
      if (this.props.errorText) return this.props.errorText.props.id;
      else if (this.props.hintText && typeof this.props.hintText === 'string')
        return this.props.hintText;
      else return '';
    };

    return (
      <Autocomplete
        freeSolo
        clearOnEscape
        disableOpenOnFocus={this.props.openOnFocus}
        onChange={handleChange}
        style={{
          ...styles.container,
        }}
        inputValue={currentInputValue()}
        onInputChange={handleInputChange}
        options={this.props.dataSource}
        renderOption={renderItem}
        getOptionDisabled={this.disableDivider}
        ListboxProps={{
          style: {
            padding: 0,
            margin: 0,
          },
        }}
        getOptionLabel={handleOptionLabel}
        filterOptions={filterFunction}
        renderInput={params => {
          nullifyDefaultStyling(params);
          return (
            <TextField
              {...params}
              margin={this.props.margin}
              style={{ ...this.props.textFieldStyle }}
              label={this.props.floatingLabelText}
              inputRef={this._input}
              disabled={this.props.disabled}
              error={!!this.props.errorText}
              placeholder={placeholder()}
              helperText={helperText}
              fullWidth={this.props.fullWidth}
            />
          );
        }}
      />
    );
  }
}
