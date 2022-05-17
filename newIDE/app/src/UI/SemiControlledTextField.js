// @flow
import * as React from 'react';
import TextField from './TextField';

type State = {|
  focused: boolean,
  text: ?any,
|};

type Props = {|
  onChange: string => void,
  value: string,
  commitOnBlur?: boolean,
  onFocus?: ({
    currentTarget: {
      value: string,
    },
    preventDefault: () => void,
  }) => void,
  onBlur?: ({
    currentTarget: {
      value: string,
    },
  }) => void,
  type?: 'text' | 'number',

  // Some TextField props that can be reused:
  onClick?: (event: SyntheticPointerEvent<HTMLInputElement>) => void,
  onKeyPress?: (event: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onKeyUp?: (event: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onKeyDown?: (event: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  margin?: 'none' | 'dense',
  disabled?: boolean,
  errorText?: React.Node,
  floatingLabelFixed?: boolean,
  floatingLabelText?: React.Node,
  fullWidth?: boolean,
  hintText?: React.Node,
  helperMarkdownText?: ?string,
  id?: string,
  inputStyle?: Object,
  maxLength?: number,
  max?: number,
  min?: number,
  multiline?: boolean,
  name?: string,
  step?: number,
  style?: Object,
  rows?: number,
  rowsMax?: number,
  autoFocus?: boolean,
|};

/**
 * This component works like a material-ui TextField, except that
 * the value passed as props is not forced into the text field when the user
 * is typing. This is useful if the parent component can do modifications on the value:
 * the user won't be interrupted or have the value changed until he blurs the field.
 */
export default class SemiControlledTextField extends React.Component<
  Props,
  State
> {
  state = {
    focused: false,
    text: null,
  };

  _field: ?TextField = null;

  forceSetValue(text: string) {
    this.setState({ text });
  }

  forceSetSelection(selectionStart: number, selectionEnd: number) {
    const input = this.getInputNode();
    if (input) {
      input.selectionStart = selectionStart;
      input.selectionEnd = selectionEnd;
    }
  }

  focus() {
    if (this._field) this._field.focus();
  }

  getInputNode(): ?HTMLInputElement {
    if (this._field) return this._field.getInputNode();
  }

  render() {
    const {
      value,
      onChange,
      commitOnBlur,
      onFocus,
      onBlur,
      type,
      ...otherProps
    } = this.props;

    return (
      // $FlowFixMe
      <TextField
        {...otherProps}
        type={type || 'text'}
        ref={field => (this._field = field)}
        value={this.state.focused ? this.state.text : value}
        onFocus={event => {
          this.setState({
            focused: true,
            text: this.props.value,
          });

          if (onFocus) onFocus(event);
        }}
        onChange={(event, newValue) => {
          this.setState({
            text: newValue,
          });

          if (!commitOnBlur) onChange(newValue);
        }}
        onBlur={event => {
          onChange(event.currentTarget.value);
          this.setState({
            focused: false,
            text: null,
          });

          if (onBlur) onBlur(event);
        }}
      />
    );
  }
}
