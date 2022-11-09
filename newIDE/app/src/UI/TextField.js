// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import MUITextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { MarkdownText } from './MarkdownText';

type ValueProps =
  // Support "text" and "password" type:
  | {|
      type?: 'text' | 'password' | 'search',
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
  | {| translatableHintText?: MessageDescriptor, hintText?: string |};

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

  // Advanced DOM events, for exceptional usage:
  onClick?: (event: SyntheticPointerEvent<HTMLInputElement>) => void,
  onKeyPress?: (event: SyntheticKeyboardEvent<>) => void,
  onKeyUp?: (event: SyntheticKeyboardEvent<>) => void,
  onKeyDown?: (event: SyntheticKeyboardEvent<>) => void,

  // Error handling/Validation:
  errorText?: React.Node,
  required?: boolean,

  // Accessibility:
  disabled?: boolean,
  readOnly?: boolean,

  // Labels:
  floatingLabelFixed?: boolean,
  floatingLabelText?: React.Node,
  name?: string,
  translatableHintText?: MessageDescriptor,
  hintText?: string,
  helperMarkdownText?: ?string,
  id?: string,

  // Keyboard focus:
  autoFocus?: boolean,

  // String text field:
  maxLength?: number,

  // Number text field:
  precision?: number,
  max?: number,
  min?: number,
  step?: number,

  // Support for multiline:
  multiline?: boolean,
  rows?: number,
  rowsMax?: number,

  // Support for adornments:
  endAdornment?: ?React.Node,

  // Styling:
  margin?: 'none' | 'dense',
  fullWidth?: boolean,
  style?: {|
    fontSize?: 14 | 18 | '1.3em',
    fontStyle?: 'normal' | 'italic',
    width?: number | '30%' | '70%' | '100%',
    flex?: 1,
    top?: number,
    padding?: number,
  |},
  inputStyle?: {|
    // Allow to customize color (replace by color prop?) // TO VERIFY
    color?: string,
    WebkitTextFillColor?: string,
    fontSize?: '1em',

    // Allow to display monospaced font
    fontFamily?: '"Lucida Console", Monaco, monospace',
    lineHeight?: 1.4 | 1.5,
    padding?: 0,
  |},
  underlineFocusStyle?: {| borderColor: string |}, // TODO
  underlineShow?: boolean,
|};

/**
 * Compute the `variant`, `margin` and `hiddenLabel` props for a material-ui `TextField`
 * to give it the proper style according to its usage.
 *
 * 1. A traditional `TextField` is by default "filled"
 *    (see material-ui component doc: https://material-ui.com/components/text-fields/
 *     and [Material Design specification](https://material.io/components/text-fields/#specs)).
 *
 *   The filled background gives them more emphasize compared compared to a single underline
 *   (as done in previous GDevelop versions). They have a label indicating what they refer to.
 *
 * 2. Sometimes, a floating label would not provide more information and is considered to be
 *   obvious (thanks to the existing value, dialog title or button label).
 *
 *   In this case, not specifying a label is fine (`floatingLabelText` is undefined or empty).
 *   This will lead to a filled text field without the extra space for the label.
 *
 *   A `placeholder` should still be passed so that the user can know what the field is about
 *     when not filled.
 *   Example: this is particularly adapted to file/folder pickers (see `LocalFilePicker`,
 *     `LocalFolderPicker`) or a `SearchPanel`.
 *
 * 3. `TextField` in `MiniToolbar` are usually less changed by the user than other text fields
 *   (for example, they are the animation name or the object name in a Sprite editor.
 *   These are not changed a lot compared to behaviours or object properties).
 *
 *   They also are already in a MiniToolbar that has an "emphasis" with the slightly
 *   different background color of `MiniToolbar`. Finally, `MiniToolbar` is also small in height.
 *
 *   In these cases, use `none` for `margin`.
 *   This will generate a text field without filled background (just an underline).
 *
 * 4. `TextField` can be used with `margin="none"` and also the underline hidden,
 *   in the very special case of an embedded text field in another form control (like `SearchBar`).
 */
export const computeTextFieldStyleProps = (props: {
  margin?: 'none' | 'dense',
  floatingLabelText?: React.Node,
}) => {
  return {
    // Use "filled" variant by default, unless `margin` is "none" (see 1. and 2.)
    variant: props.margin === 'none' ? 'standard' : 'filled',
    // Use "dense" fields by default, unless `margin` is "none" (see 3.)
    margin: props.margin === 'none' ? 'none' : 'dense',
    // For variant "standard", if there is no label, no extra space is taken. For variant "filled",
    // even when no label is passed, there is a space for it. Remove this space if no
    // label is provided. (see 2.)
    hiddenLabel: props.margin !== 'none' && !props.floatingLabelText,
  };
};

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

  getInputNode(): ?HTMLInputElement {
    if (this._input.current) {
      return this._input.current;
    }

    return null;
  }

  render() {
    const { props } = this;
    const onChange = props.onChange || undefined;

    const helperText = props.helperMarkdownText ? (
      <MarkdownText source={props.helperMarkdownText} />
    ) : null;

    return (
      <I18n>
        {({ i18n }) => (
          <MUITextField
            color="secondary"
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
            helperText={props.errorText || helperText}
            disabled={props.disabled}
            required={props.required}
            InputLabelProps={{
              shrink: props.floatingLabelFixed ? true : undefined,
            }}
            label={props.floatingLabelText}
            name={props.name}
            placeholder={
              props.hintText
                ? props.hintText
                : props.translatableHintText
                ? i18n._(props.translatableHintText)
                : undefined
            }
            id={props.id}
            // Keyboard focus:
            autoFocus={props.autoFocus}
            // Multiline:
            multiline={props.multiline}
            rows={props.rows}
            rowsMax={props.rowsMax}
            // Styling:
            {...computeTextFieldStyleProps(props)}
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
              readOnly: props.readOnly,
              inputProps: {
                onKeyPress: props.onKeyPress,
                onKeyUp: props.onKeyUp,
                onKeyDown: props.onKeyDown,
                onClick: props.onClick,
                // String field props:
                maxLength: props.maxLength,
                // Number field props:
                max: props.max,
                min: props.min,
                step: props.step,
              },
              // Input adornment:
              endAdornment: props.endAdornment ? (
                <InputAdornment position="end">
                  {props.endAdornment}
                </InputAdornment>
              ) : (
                undefined
              ),
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
            spellCheck="false"
          />
        )}
      </I18n>
    );
  }
}

// The "top" offset to add to the position of the TextField when
// it's used inside a ListItem "primaryText"
export const noMarginTextFieldInListItemTopOffset = 0;
