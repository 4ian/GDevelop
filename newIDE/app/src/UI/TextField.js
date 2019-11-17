// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { I18n } from '@lingui/react';
import MUITextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

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
  // Support "number" type (note that onChange returns a string):
  | {|
      type: 'number',
      value: number | string,
      onChange?: (event: {||}, value: string) => void,
    |}
  // Support an "uncontrolled" field:
  | {| defaultValue: string |}
  // Support an empty field with just a hint text:
  | {| hintText?: React.Node |};

// We support a subset of the props supported by Material-UI v0.x TextField
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  // Value and change handling:
  ...ValueProps,

  // DOM events:
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

  // Error handling:
  errorText?: React.Node,

  disabled?: boolean,
  floatingLabelFixed?: boolean,
  floatingLabelText?: React.Node,
  name?: string,
  hintText?: MessageDescriptor,
  id?: string,

  // Keyboard focus:
  autoFocus?: boolean,

  // Number text field:
  precision?: number,
  max?: number,
  min?: number,
  step?: number,

  // Support for multiline:
  multiLine?: boolean,
  rows?: number,
  rowsMax?: number,

  // Styling:
  margin?: 'none' | 'dense',
  fullWidth?: boolean,
  style?: {|
    fontSize?: 18,
    fontStyle?: 'normal' | 'italic',
    width?: number | '100%',
    flex?: 1,
    top?: number,
  |},
  inputStyle?: {|
    // Allow to customize color (replace by color prop?) // TO VERIFY
    color?: string,
    WebkitTextFillColor?: string,

    // Allow to display monospaced font
    fontFamily?: '"Lucida Console", Monaco, monospace',
    lineHeight?: 1.4,
  |},
  underlineFocusStyle?: {| borderColor: string |}, // TODO
  underlineShow?: boolean,
|};

/**
 * A text field based on Material-UI text field.
 */
export default class TextField extends React.Component<Props, {||}> {
  _input = React.createRef<HTMLInputElement>();

  focus() {
    if (this._input.current) {
      this._input.current.focus();
    }
  }

  blur() {
    if (this._input.current) {
      this._input.current.blur();
    }
  }

  getInputNode() {
    if (this._input.current) {
      return ReactDOM.findDOMNode(this._input.current);
    }

    return null;
  }

  render() {
    const { props } = this;
    const onChange = props.onChange || undefined;

    return (
      <I18n>
        {({ i18n }) => (
          <MUITextField
            variant={props.margin === 'none' ? 'standard' : 'filled'}
            // Value and change handling:
            type={props.type !== undefined ? props.type : undefined}
            value={props.value !== undefined ? props.value : undefined}
            defaultValue={
              props.defaultValue !== undefined ? props.defaultValue : undefined
            }
            onChange={
              onChange
                ? event => onChange(event, event.target.value)
                : undefined
            }
            // Error handling:
            error={!!props.errorText}
            helperText={props.errorText}
            disabled={props.disabled}
            InputLabelProps={{
              shrink: props.floatingLabelFixed ? true : undefined,
            }}
            label={props.floatingLabelText}
            name={props.name}
            placeholder={props.hintText ? i18n._(props.hintText) : undefined}
            id={props.id}
            // Keyboard focus:
            autoFocus={props.autoFocus}
            // Multiline:
            multiline={props.multiLine}
            rows={props.rows}
            rowsMax={props.rowsMax}
            // Styling:
            margin={props.margin || 'dense'}
            fullWidth={props.fullWidth}
            InputProps={{
              disableUnderline:
                props.underlineShow === undefined
                  ? false
                  : !props.underlineShow,
              style: {
                fontSize: props.style ? props.style.fontSize : undefined,
                fontStyle: props.style ? props.style.fontStyle : undefined,
                ...props.inputStyle,
              },
              inputProps: {
                onKeyPress: props.onKeyPress,
                onKeyUp: props.onKeyUp,
                // Number field props:
                max: props.max,
                min: props.min,
                step: props.step,
              },
            }}
            style={
              props.style
                ? {
                    width: props.style.width || undefined,
                    flex: props.style.flex || undefined,
                    top: props.style.top || undefined,
                  }
                : undefined
            }
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            inputRef={this._input}
          />
        )}
      </I18n>
    );
  }
}

// The "top" offset to add to the position of the TextField when
// it's used inside a ListItem "primaryText"
export const noMarginTextFieldInListItemTopOffset = -7;
