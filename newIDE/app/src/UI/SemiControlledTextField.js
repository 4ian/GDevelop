// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';

type State = {
  focused: boolean,
  text: ?string,
  commitOnBlur?: boolean,
};

/**
 * This component works like a material-ui TextField, except that
 * the value passed as props is not forced into the text field when the user
 * is typing. This is useful if the parent component can do modifications on the value:
 * the user won't be interrupted or have the value changed until he blurs the field.
 */
export default class SemiControlledTextField extends React.Component<*, State> {
  state = {
    focused: false,
    text: null,
  };

  render() {
    const { value, onChange, commitOnBlur, ...otherProps } = this.props;

    return (
      <TextField
        {...otherProps}
        value={this.state.focused ? this.state.text : value}
        onFocus={() => {
          this.setState({
            focused: true,
            text: this.props.value,
          });
        }}
        onChange={(event, newValue) => {
          this.setState({
            text: newValue,
          });

          if (!commitOnBlur) onChange(newValue);
        }}
        onBlur={event => {
          onChange(event.target.value);
          this.setState({
            focused: false,
            text: null,
          });
        }}
      />
    );
  }
}
