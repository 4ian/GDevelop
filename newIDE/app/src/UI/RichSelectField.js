// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { computeTextFieldStyleProps } from './TextField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';
import { MarkdownText } from './MarkdownText';
import ChevronArrowBottom from './CustomSvgIcons/ChevronArrowBottom';
import IconButton from './IconButton';

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
  groupLabelOption: {
    minHeight: 0,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 12,
    // Override the faded style of disabled menu items.
    opacity: 0.7,
  },
  // A bigger click area than a small icon button, without making the option
  // taller.
  optionAction: {
    padding: 8,
    marginTop: -4,
    marginBottom: -4,
    marginRight: -8,
  },
  adornment: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // Long labels are truncated instead of widening the menu. The menu is still
  // at least as wide as the field.
  menuPaper: {
    maxWidth: 400,
  },
};

const useSelectStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'default',
  },
});

/** A button shown at the end of an option in the list. */
export type RichSelectFieldOptionAction = {|
  icon: React.Node,
  tooltip: MessageDescriptor,
  onClick: () => void,
|};

export type RichSelectFieldOption = {|
  value: string,
  label: string,
  // Displayed before the label, in the list and for the selected value.
  adornment?: React.Node,
  // Consecutive options of different groups are separated by a divider, and
  // the label of the group (from `groupLabels`), if any.
  group?: string,
  action?: RichSelectFieldOptionAction,
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
  groupLabels?: { [group: string]: MessageDescriptor },
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
    action,
  }: RichSelectFieldOption) => (
    <MenuItem key={value} value={value} style={styles.option}>
      {adornment ? <span style={styles.adornment}>{adornment}</span> : null}
      <span style={styles.label} title={label}>
        {label}
      </span>
      {action ? (
        <IconButton
          color="inherit"
          style={{ ...styles.optionAction }}
          tooltip={action.tooltip}
          onClick={event => {
            // Don't select the option.
            event.stopPropagation();
            setIsMenuOpen(false);
            action.onClick();
          }}
        >
          {action.icon}
        </IconButton>
      ) : null}
    </MenuItem>
  );

  const renderDivider = (key: string) => (
    <MenuItem key={key} disabled divider style={styles.dividerOption} />
  );

  const renderOptions = (i18n: I18nType): Array<React.Node> => {
    const items = [];
    props.options.forEach((option, index) => {
      const previousOption = index > 0 ? props.options[index - 1] : null;
      const startsGroup =
        !previousOption || previousOption.group !== option.group;
      if (startsGroup && previousOption) {
        items.push(renderDivider(`divider-before-${option.value}`));
      }
      const groupLabel =
        startsGroup && option.group && props.groupLabels
          ? props.groupLabels[option.group]
          : null;
      if (groupLabel) {
        items.push(
          <MenuItem
            key={`group-label-before-${option.value}`}
            disabled
            style={styles.groupLabelOption}
          >
            {i18n._(groupLabel)}
          </MenuItem>
        );
      }
      items.push(renderMenuItem(option));
    });
    return items;
  };

  const renderValue = (value: string): React.Node => {
    const option = props.options.find(option => option.value === value);
    if (!option) return null;

    return (
      <span style={styles.selectedValue}>
        {option.adornment ? (
          <span style={styles.adornment}>{option.adornment}</span>
        ) : null}
        <span style={styles.label}>{option.label}</span>
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
            open: isMenuOpen,
            onOpen: () => setIsMenuOpen(true),
            onClose: () => setIsMenuOpen(false),
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
              PaperProps: { style: styles.menuPaper },
            },
          }}
          inputRef={inputRef}
        >
          {renderOptions(i18n)}
          {extraOptions.length > 0
            ? renderDivider('extra-options-divider')
            : null}
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
