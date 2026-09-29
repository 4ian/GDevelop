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

// Menu item values of the extra options. They are never passed to `onChange`.
const getExtraOptionValue = (index: number): string =>
  `__rich_select_field_extra_option_${index}__`;

const styles = {
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    // Avoid the default min-height of 48px, which is too big to display options.
    minHeight: 36,
  },
  dividerOption: {
    minHeight: 0,
    padding: 0,
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

/** An action shown after the options, below a divider. It is not a choice. */
export type RichSelectFieldExtraOption = {|
  label: MessageDescriptor,
  onClick: () => void,
|};

export type RichSelectFieldInterface = {|
  focus: FieldFocusFunction,
|};

type Props = {|
  value: string,
  onChange: (value: string) => void,
  options: Array<RichSelectFieldOption>,
  extraOptions?: Array<RichSelectFieldExtraOption>,
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

  const extraOptions = props.extraOptions || [];
  const onChange = (value: string) => {
    const extraOption = extraOptions.find(
      (option, index) => getExtraOptionValue(index) === value
    );
    if (extraOption) {
      extraOption.onClick();
      return;
    }
    props.onChange(value);
  };

  const renderMenuItem = ({
    value,
    label,
    adornment,
  }: RichSelectFieldOption) => (
    <MenuItem key={value} value={value} style={styles.option}>
      {adornment ? <span style={styles.adornment}>{adornment}</span> : null}
      <span>{label}</span>
    </MenuItem>
  );

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
          onChange={event => onChange(event.target.value)}
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
          {props.options.map(renderMenuItem)}
          {extraOptions.length > 0 ? (
            <MenuItem
              key="extra-options-divider"
              disabled
              divider
              style={styles.dividerOption}
            />
          ) : null}
          {extraOptions.map((option, index) =>
            renderMenuItem({
              value: getExtraOptionValue(index),
              label: i18n._(option.label),
            })
          )}
        </TextField>
      )}
    </I18n>
  );
});

export default RichSelectField;
