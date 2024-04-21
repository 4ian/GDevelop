// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import IconButton from '@material-ui/core/IconButton';
import MUITextField from '@material-ui/core/TextField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from './CustomSvgIcons/Visibility';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { MarkdownText } from './MarkdownText';
import { useShouldAutofocusInput } from './Responsive/ScreenTypeMeasurer';
import { dataObjectToProps, type HTMLDataset } from '../Utils/HTMLDataset';

type ValueProps =
  // Support "text", "password" and "email" type:
  // "email" type is used to display appropriate keyboard on mobile.
  | {|
      type?: 'text' | 'password' | 'email',
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
  stopContextMenuPropagation?: boolean,

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
  dataset?: HTMLDataset,

  // Keyboard focus:
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',

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
  startAdornment?: ?React.Node,

  // Styling:
  margin?: 'none' | 'dense',
  fullWidth?: boolean,
  style?: {|
    fontSize?: 12 | 14 | 18 | '1.3em' | 'inherit', // 'inherit' should only be used on an event sheet where font size is adapted to zoom.
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
    fontSize?: '1em' | 14,

    // Allow to display monospaced font
    fontFamily?: '"Lucida Console", Monaco, monospace',
    padding?: 0,
  |},
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

export type TextFieldInterface = {|
  focus: FieldFocusFunction,
  blur: () => void,
  getInputNode: () => ?HTMLInputElement,
  getFieldWidth: () => ?number,
  getCaretPosition: () => ?number,
|};

/**
 * A text field based on Material-UI text field.
 */
const TextField = React.forwardRef<Props, TextFieldInterface>((props, ref) => {
  const inputRef = React.useRef<?HTMLInputElement>(null);
  const muiTextFieldRef = React.useRef<?MUITextField>(null);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState<boolean>(
    false
  );

  const focus: FieldFocusFunction = options => {
    const { current: input } = inputRef;
    if (input) {
      input.focus();

      if (options && options.selectAll) {
        input.select();
      }

      if (options && options.caretPosition === 'end' && props.value) {
        input.setSelectionRange(
          props.value.toString().length,
          props.value.toString().length
        );
      }
      if (options && Number.isInteger(options.caretPosition) && props.value) {
        const position = Number(options.caretPosition);
        input.setSelectionRange(position, position);
      }
    }
  };

  const blur = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const getInputNode = (): ?HTMLInputElement => {
    if (inputRef.current) {
      return inputRef.current;
    }

    return null;
  };

  const getFieldWidth = () => {
    if (muiTextFieldRef.current) {
      return muiTextFieldRef.current.clientWidth;
    }
    return null;
  };

  const getCaretPosition = () => {
    if (inputRef.current) {
      return inputRef.current.selectionStart;
    }
    return null;
  };

  React.useImperativeHandle(ref, () => ({
    focus,
    blur,
    getInputNode,
    getFieldWidth,
    getCaretPosition,
  }));

  const onChange = props.onChange || undefined;

  const helperText = props.helperMarkdownText ? (
    <MarkdownText source={props.helperMarkdownText} />
  ) : null;

  const shouldAutofocusInput = useShouldAutofocusInput();
  const shouldAutoFocusTextField = !props.autoFocus
    ? false
    : props.autoFocus === 'desktopAndMobileDevices'
    ? true
    : shouldAutofocusInput;

  return (
    <I18n>
      {({ i18n }) => (
        <MUITextField
          ref={muiTextFieldRef}
          color="secondary"
          // Value and change handling:
          type={
            props.type !== undefined
              ? props.type === 'password'
                ? isPasswordVisible
                  ? 'text'
                  : 'password'
                : props.type
              : undefined
          }
          value={props.value !== undefined ? props.value : undefined}
          defaultValue={
            props.defaultValue !== undefined ? props.defaultValue : undefined
          }
          onChange={
            onChange ? event => onChange(event, event.target.value) : undefined
          }
          onContextMenu={
            props.stopContextMenuPropagation
              ? e => e.stopPropagation()
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
          autoFocus={shouldAutoFocusTextField}
          // Multiline:
          multiline={props.multiline}
          rows={props.rows}
          rowsMax={props.rowsMax}
          // Styling:
          {...computeTextFieldStyleProps(props)}
          fullWidth={props.fullWidth}
          InputProps={{
            disableUnderline:
              props.underlineShow === undefined ? false : !props.underlineShow,
            style: {
              fontSize: props.style ? props.style.fontSize : undefined,
              fontStyle: props.style ? props.style.fontStyle : undefined,
              padding: props.style ? props.style.padding : undefined,
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
              autoCapitalize: 'off', // For Safari iOS, avoid auto-capitalization
              style: props.inputStyle,
              ...dataObjectToProps(props.dataset),
            },
            // Input adornment:
            endAdornment:
              props.type !== undefined && props.type === 'password' ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Visibility />
                  </IconButton>
                </InputAdornment>
              ) : props.endAdornment ? (
                <InputAdornment
                  position="end"
                  style={props.multiline ? { marginTop: -17 } : undefined}
                >
                  {props.endAdornment}
                </InputAdornment>
              ) : (
                undefined
              ),
            startAdornment: props.startAdornment ? (
              <InputAdornment position="start">
                {props.startAdornment}
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
          inputRef={inputRef}
          spellCheck="false"
        />
      )}
    </I18n>
  );
});

export default TextField;

// The "top" offset to add to the position of the TextField when
// it's used inside a ListItem "primaryText"
export const noMarginTextFieldInListItemTopOffset = 0;
