// @flow
import * as React from 'react';
import TextField from './TextField';
import {
  shouldValidate,
} from './KeyboardShortcuts/InteractionKeys';
const mexp = require('math-expression-evaluator');

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
  evaluateValue?: boolean,

  // Some TextField props that can be reused:
  onClick?: () => void,
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

  componentDidMount() {
    const input = this.getInputNode();
    input.addEventListener('wheel', this._onWheel.bind(this));
    input.addEventListener('keydown', this._onApply.bind(this));
    input.addEventListener('keyup', this._onApply.bind(this));
  }

  componentWillUnmount() {
    const input = this.getInputNode();
    input.removeEventListener('wheel', this._onWheel.bind(this));
    input.removeEventListener('keydown', this._onApply.bind(this));
  }

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

  _onWheel(evt) {
    const { focused, text } = this.state;

    if (!focused) return;
    if (Number.isInteger(text)) {
      let value = 0;
      if (evt.deltaY < 0) {
        // TODO use keyboard manager?
        value = evt.shiftKey ? 5 : 1;
      } else {
        // TODO use keyboard manager?
        value = evt.shiftKey ? -5 : -1;
      }
      this.setState({ text: text + value });
      this.props.onChange(text + value);
    }
  }

  _evaluateValue(value: string): number {
    // while an expression not returned a number an error is catched and return the current string of the unfinished expression.
    try {
      return mexp.eval(value);
    } catch (error) {
      return value;
    }
  }

  _onApply(evt) {
    const previousValue = this.state.text;
    let value = previousValue;
    if (shouldValidate(evt)) {
      value = this._evaluateValue(value);

      // the evaluated value isn't a number but a string of an unfinished expression (e.g. "0.1+")
      if (!isFinite(value)) {
        value = previousValue;
      }
      value = Number.parseFloat(value).toFixed(2); // 0.111+1 goes to 1.11 but react do an update after escpaing the input field and change to 1.1100000143051147
    }
    this.setState({ text: value });
    this.props.onChange(value);
  }

  render() {
    const {
      value,
      onChange,
      commitOnBlur,
      onFocus,
      onBlur,
      type,
      evaluateValue,
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
          let value = newValue;

          this.setState({
            text: newValue,
          });

          if (this.props.evaluateValue) {
            value = this._evaluateValue(newValue);
          }

          if (!commitOnBlur) onChange(value);
        }}
        onBlur={event => {
          let value = event.currentTarget.value;
          if (this.props.evaluateValue) {
            value = this._evaluateValue(value);
          }

          onChange(value);
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
