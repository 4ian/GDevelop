// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { computeTextFieldStyleProps } from './TextField';
import { MarkdownText } from './MarkdownText';

type ValueProps = {|
  value: number | string,
  // event and index should not be used, and be removed eventually
  onChange?: (
    event: {| target: {| value: string |} |},
    index: number,
    text: string // Note that even for number values, a string is returned
  ) => void,
|};

// We support a subset of the props supported by Material-UI v0.x SelectField
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  ...ValueProps,
  fullWidth?: boolean,
  children: React.Node,
  disabled?: boolean,

  style?: {
    flex?: 1,
    width?: 'auto',
  },
  inputStyle?: {| fontSize: 14 |},
  margin?: 'none' | 'dense',

  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  helperText?: React.Node,

  // If a hint text is specified, will be shown as an option for the empty
  // value (""), disabled.
  hintText?: MessageDescriptor,
|};

const INVALID_VALUE = '';

/**
 * A select field based on Material-UI select field.
 * To be used with `SelectOption`.
 */
export default class SelectField extends React.Component<Props, {||}> {
  _input = React.createRef<HTMLInputElement>();

  focus() {
    if (this._input.current) this._input.current.focus();
  }

  render() {
    const { props } = this;
    const onChange = props.onChange || undefined;

    // Dig into children props to see if the current value is valid or not.
    let hasValidValue = true;
    const childrenValues = React.Children.map(props.children, child => {
      if (child === null || !child.props) return null;

      return child.props.value;
    });
    if (!childrenValues) {
      console.error(
        'SelectField has been passed no or invalid children. Only SelectOption and null are supported.'
      );
    } else {
      hasValidValue =
        childrenValues.filter(childValue => childValue === props.value)
          .length !== 0;
    }
    const displayedValue = hasValidValue ? props.value : INVALID_VALUE;

    const helperText = props.helperMarkdownText ? (
      <MarkdownText source={props.helperMarkdownText} />
    ) : (
      props.helperText || null
    );

    return (
      <I18n>
        {({ i18n }) => (
          <TextField
            select
            {...computeTextFieldStyleProps(props)}
            disabled={props.disabled}
            fullWidth={props.fullWidth}
            label={props.floatingLabelText}
            helperText={helperText}
            value={displayedValue}
            onChange={
              onChange
                ? event => {
                    onChange(event, -1, event.target.value);
                  }
                : undefined
            }
            InputProps={{ style: props.inputStyle }}
            InputLabelProps={{
              shrink: true,
            }}
            SelectProps={{
              native: true,
            }}
            style={props.style}
            inputRef={this._input}
          >
            {!hasValidValue ? (
              <option value={INVALID_VALUE} disabled>
                {props.hintText
                  ? i18n._(props.hintText)
                  : i18n._(t`Choose an option`)}
              </option>
            ) : null}
            {props.children}
          </TextField>
        )}
      </I18n>
    );
  }
}
