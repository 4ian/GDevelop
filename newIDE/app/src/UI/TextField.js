// @flow
import * as React from 'react';
import MUITextField from 'material-ui/TextField';

type ValueProps =
  // Support "text" and "password" type:
  | {|
      type?: 'text' | 'password',
      value: string,
      onChange?: (
        event: {| target: {| value: string |} |},
        text: string
      ) => void,
    |}
  // Support "number" type:
  | {|
      type: 'number',
      value: number,
      onChange?: (event: {||}, value: number) => void,
    |}
  // Support an "uncontrolled" field:
  | {| defaultValue: string |}
  // Support an empty field with just a hint text:
  | {| hintText?: React.Node |};

// We support a subset of the props supported by Material-UI v0.x TextField
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  ...ValueProps,
  fullWidth?: boolean,
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
  onKeyPress?: (event: {| charCode: number, key: string |}) => void,
  onKeyUp?: (event: {| charCode: number, key: string |}) => void,

  disabled?: boolean,
  errorText?: React.Node,
  floatingLabelFixed?: boolean,
  floatingLabelText?: React.Node,
  fullWidth?: boolean,
  hintText?: React.Node,
  id?: string,
  inputStyle?: Object,
  precision?: number,
  max?: number,
  min?: number,
  multiLine?: boolean,
  name?: string,
  step?: number,
  style?: Object,
  rows?: number,
  rowsMax?: number,
  autoFocus?: boolean,

  underlineFocusStyle?: {| borderColor: string |},
  underlineShow?: boolean,
|};

/**
 * A text field based on Material-UI text field.
 */
export default class TextField extends React.Component<Props, {||}> {
  _muiTextField = React.createRef<MUITextField>();

  focus() {
    if (this._muiTextField.current) {
      this._muiTextField.current.focus();
    }
  }

  blur() {
    if (this._muiTextField.current) {
      this._muiTextField.current.blur();
    }
  }

  getInputNode() {
    if (this._muiTextField.current) {
      return this._muiTextField.current.getInputNode();
    }
  }

  render() {
    return <MUITextField {...this.props} ref={this._muiTextField} />;
  }
}
