// @flow
import * as React from 'react';
import TextField from './TextField';

type State = {|
  focused: boolean,
  text: ?string,
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

  // Some TextField props that can be reused:
  disabled?: boolean,
  errorText?: React.Node,
  floatingLabelFixed?: boolean,
  floatingLabelText?: React.Node,
  fullWidth?: boolean,
  hintText?: React.Node,
  id?: string,
  inputStyle?: Object,
  max?: number,
  min?: number,
  multiLine?: boolean,
  name?: string,
  step?: number,
  style?: Object,
  type?: string,
  rows?: number,
  rowsMax?: number,
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

  focus() {
    if (this._field) this._field.focus();
  }

  getInputNode() {
    if (this._field) return this._field.getInputNode();
  }

  render() {
    const {
      value,
      onChange,
      commitOnBlur,
      onFocus,
      onBlur,
      ...otherProps
    } = this.props;

    return (
      // $FlowFixMe - not sure why Flow can't infer that we're using the "string version" of TextField.
      <TextField
        {...otherProps}
        type="text"
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
