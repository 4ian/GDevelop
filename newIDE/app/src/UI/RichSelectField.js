// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { computeTextFieldStyleProps } from './TextField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import { MarkdownText } from './MarkdownText';
import ChevronArrowBottom from './CustomSvgIcons/ChevronArrowBottom';

const INVALID_VALUE = '';
// $FlowFixMe[missing-local-annot]
const stopPropagation = event => event.stopPropagation();

const styles = {
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    // Avoid the default min-height of 48px, which is too big to display options.
    minHeight: 36,
  },
  adornment: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  selectedValue: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    // Keep the height of a text line, even if the adornment is taller, so that
    // the field has the same height as other text fields.
    height: '1.1876em',
  },
  menuList: {
    maxHeight: 400,
  },
};

const useSelectStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'default',
  },
});

export type RichSelectFieldOption = {|
  value: string,
  label: string,
  // Displayed before the label, in the list and for the selected value.
  adornment?: React.Node,
|};

export type RichSelectFieldInterface = {|
  focus: FieldFocusFunction,
|};

type Props = {|
  value: string,
  onChange: (value: string) => void,
  options: Array<RichSelectFieldOption>,
  fullWidth?: boolean,
  disabled?: boolean,
  stopPropagationOnClick?: boolean,
  id?: ?string,
  margin?: 'none' | 'dense',
  floatingLabelText?: React.Node,
  helperMarkdownText?: ?string,
  // If a hint text is specified, will be shown when the value is not
  // one of the options.
  translatableHintText?: MessageDescriptor,
  errorText?: React.Node,
|};

/**
 * A select field, similar to `SelectField`, but displaying its options in a
 * menu, which allows to display an adornment (icon, preview...) next to each
 * option. Prefer `SelectField` (using a native select) when no adornment is
 * needed.
 */
const RichSelectField: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<RichSelectFieldInterface>,
}> = React.forwardRef<Props, RichSelectFieldInterface>((props, ref) => {
  const inputRef = React.useRef<?HTMLInputElement>(null);
  const selectStyles = useSelectStyles();

  const focus: FieldFocusFunction = options => {
    if (inputRef.current) inputRef.current.focus();
  };

  React.useImperativeHandle(ref, () => ({
    focus,
  }));

  const hasValidValue = props.options.some(
    option => option.value === props.value
  );
  const displayedValue = hasValidValue ? props.value : INVALID_VALUE;

  const helperText = props.errorText ? (
    props.errorText
  ) : props.helperMarkdownText ? (
    <MarkdownText source={props.helperMarkdownText} />
  ) : null;

  const renderValue = (value: string): React.Node => {
    const option = props.options.find(option => option.value === value);
    if (!option) return null;

    return (
      <span style={styles.selectedValue}>
        {option.adornment ? (
          <span style={styles.adornment}>{option.adornment}</span>
        ) : null}
        <span>{option.label}</span>
      </span>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <TextField
          id={props.id}
          select
          color="secondary"
          // $FlowFixMe[incompatible-type]
          {...computeTextFieldStyleProps(props)}
          disabled={props.disabled}
          fullWidth={props.fullWidth}
          label={props.floatingLabelText}
          helperText={helperText}
          error={!!props.errorText}
          value={displayedValue}
          onClick={props.stopPropagationOnClick ? stopPropagation : undefined}
          onChange={event => {
            props.onChange(event.target.value);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          SelectProps={{
            native: false,
            displayEmpty: true,
            classes: selectStyles,
            IconComponent: ChevronArrowBottom,
            renderValue: (value: string) =>
              value === INVALID_VALUE
                ? props.translatableHintText
                  ? i18n._(props.translatableHintText)
                  : i18n._(t`Choose an option`)
                : renderValue(value),
            MenuProps: {
              // Counterintuitive, but necessary to have the menu displayed
              // below the field, see https://github.com/mui/material-ui/issues/7961#issuecomment-326116559.
              getContentAnchorEl: null,
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              MenuListProps: { dense: true, style: styles.menuList },
            },
          }}
          inputRef={inputRef}
        >
          {props.options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              style={styles.option}
            >
              {option.adornment ? (
                <span style={styles.adornment}>{option.adornment}</span>
              ) : null}
              <span>{option.label}</span>
            </MenuItem>
          ))}
        </TextField>
      )}
    </I18n>
  );
});

export default RichSelectField;
