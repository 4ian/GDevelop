// @flow
import * as React from 'react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import TextField, { type TextFieldInterface } from './TextField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';

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
  translatableHintText?: MessageDescriptor,
  hintText?: string,
  helperMarkdownText?: ?string,
  id?: string,
  inputStyle?: Object,
  maxLength?: number,
  precision?: number,
  max?: number,
  min?: number,
  multiline?: boolean,
  name?: string,
  step?: number,
  style?: Object,
  rows?: number,
  rowsMax?: number,
  autoFocus?: 'desktop' | 'desktopAndMobileDevices',
  endAdornment?: React.Node,
|};

export type SemiControlledTextFieldInterface = {|
  focus: FieldFocusFunction,
  forceSetValue: (text: string) => void,
  forceSetSelection: (start: number, end: number) => void,
  getInputNode: () => ?HTMLInputElement,
  getFieldWidth: () => ?number,
  getCaretPosition: () => ?number,
|};

/**
 * This component works like a material-ui TextField, except that
 * the value passed as props is not forced into the text field when the user
 * is typing. This is useful if the parent component can do modifications on the value:
 * the user won't be interrupted or have the value changed until he blurs the field.
 */
const SemiControlledTextField = React.forwardRef<
  Props,
  SemiControlledTextFieldInterface
>((props, ref) => {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [text, setText] = React.useState<?string>(null);
  const textFieldRef = React.useRef<?TextFieldInterface>(null);

  const forceSetValue = (text: string) => {
    setText(text);
  };

  const forceSetSelection = (selectionStart: number, selectionEnd: number) => {
    const input = getInputNode();
    if (input) {
      input.selectionStart = selectionStart;
      input.selectionEnd = selectionEnd;
    }
  };

  const focus: FieldFocusFunction = options => {
    if (textFieldRef.current) textFieldRef.current.focus(options);
  };

  const getInputNode = (): ?HTMLInputElement => {
    if (textFieldRef.current) return textFieldRef.current.getInputNode();
  };

  const getFieldWidth = () => {
    if (textFieldRef.current) return textFieldRef.current.getFieldWidth();
  };

  const getCaretPosition = () => {
    if (textFieldRef.current) return textFieldRef.current.getCaretPosition();
  };

  React.useImperativeHandle(ref, () => ({
    focus,
    getInputNode,
    forceSetSelection,
    forceSetValue,
    getFieldWidth,
    getCaretPosition,
  }));

  const {
    value,
    onChange,
    commitOnBlur,
    onFocus,
    onBlur,
    type,
    ...otherProps
  } = props;

  return (
    // $FlowFixMe
    <TextField
      {...otherProps}
      type={type || 'text'}
      ref={textFieldRef}
      value={focused ? text : value}
      onFocus={event => {
        setFocused(true);
        setText(value);

        if (onFocus) onFocus(event);
      }}
      onChange={(event, newValue) => {
        setText(newValue);
        if (!commitOnBlur) onChange(newValue);
      }}
      onBlur={event => {
        onChange(event.currentTarget.value);
        setFocused(false);
        setText(null);

        if (onBlur) onBlur(event);
      }}
    />
  );
});

export default SemiControlledTextField;
