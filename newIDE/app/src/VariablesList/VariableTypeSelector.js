// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Tooltip from '@material-ui/core/Tooltip';

import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import CompactSelectField from '../UI/CompactSelectField';
import SelectOption from '../UI/SelectOption';
import VariableStringIcon from './Icons/VariableStringIcon';
import VariableNumberIcon from './Icons/VariableNumberIcon';
import VariableBooleanIcon from './Icons/VariableBooleanIcon';
import VariableArrayIcon from './Icons/VariableArrayIcon';
import VariableStructureIcon from './Icons/VariableStructureIcon';
import VariableMixedTypesIcon from '../UI/CustomSvgIcons/Cross';
import WarningIcon from '../UI/CustomSvgIcons/Warning';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { tooltipEnterDelay } from '../UI/Tooltip';
import classes from './VariablesList.module.css';

const gd: libGDevelop = global.gd;

type Props = {|
  variableType: Variable_Type,
  onChange: (newVariableType: string, nodeId: string) => void,
  nodeId: string,
  /**
   * If true, only the icon of the type is displayed (and clicking on it opens
   * the type selection): useful when the horizontal space is scarce.
   */
  hideTypeName?: boolean,
  readOnlyWithIcon?: boolean,
  id?: string,
  errorMessage: MessageDescriptor | null,
  disabled?: boolean,
|};

let options;
let variableTypeToIcon;
let variableTypeToString;
let variableTypeToLabel;

const getOptions = (variableType: Variable_Type) => {
  if (!options) {
    options = [
      <SelectOption key="string" label={t`Text`} value={gd.Variable.String} />,
      <SelectOption
        key="number"
        label={t`Number`}
        value={gd.Variable.Number}
      />,
      <SelectOption
        key="boolean"
        label={t`Boolean`}
        value={gd.Variable.Boolean}
      />,
      <SelectOption key="array" label={t`Array`} value={gd.Variable.Array} />,
      <SelectOption
        key="structure"
        label={t`Structure`}
        value={gd.Variable.Structure}
      />,
    ];
  }
  // A variable with mixed types must be displayed as such, but this can't be
  // chosen: it's only the result of multiple variables being edited at once.
  return variableType === gd.Variable.MixedTypes
    ? [
        <SelectOption
          key="mixed-types"
          label={t`Mixed types`}
          value={gd.Variable.MixedTypes}
          disabled
        />,
        ...options,
      ]
    : options;
};

export const getVariableTypeToIcon = (): { [Variable_Type]: any } => {
  if (!variableTypeToIcon) {
    variableTypeToIcon = {
      [gd.Variable.MixedTypes]: VariableMixedTypesIcon,
      [gd.Variable.String]: VariableStringIcon,
      [gd.Variable.Number]: VariableNumberIcon,
      [gd.Variable.Boolean]: VariableBooleanIcon,
      [gd.Variable.Array]: VariableArrayIcon,
      [gd.Variable.Structure]: VariableStructureIcon,
    };
  }
  return variableTypeToIcon;
};

const getVariableTypeToString = (): { [string]: string } => {
  if (!variableTypeToString) {
    variableTypeToString = {
      [gd.Variable.String]: 'string',
      [gd.Variable.Number]: 'number',
      [gd.Variable.Boolean]: 'boolean',
      [gd.Variable.Array]: 'array',
      [gd.Variable.Structure]: 'structure',
    };
  }
  return variableTypeToString;
};

const getVariableTypeToLabel = (): { [Variable_Type]: MessageDescriptor } => {
  if (!variableTypeToLabel) {
    variableTypeToLabel = {
      [gd.Variable.MixedTypes]: t`Mixed types`,
      [gd.Variable.String]: t`Text`,
      [gd.Variable.Number]: t`Number`,
      [gd.Variable.Boolean]: t`Boolean`,
      [gd.Variable.Array]: t`Array`,
      [gd.Variable.Structure]: t`Structure`,
    };
  }
  return variableTypeToLabel;
};

const VariableTypeSelector: React.ComponentType<Props> = React.memo<Props>(
  ({
    variableType,
    onChange,
    nodeId,
    hideTypeName,
    readOnlyWithIcon,
    id,
    errorMessage,
    disabled,
  }: Props) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const Icon = getVariableTypeToIcon()[variableType];

    const renderIcon = (className?: string) =>
      errorMessage ? (
        <WarningIcon
          className={className}
          fontSize="small"
          htmlColor={gdevelopTheme.message.warning}
        />
      ) : (
        <Icon
          className={className}
          fontSize="small"
          htmlColor={
            variableType === gd.Variable.MixedTypes
              ? gdevelopTheme.message.error
              : undefined
          }
        />
      );
    const tooltipTitle = errorMessage || getVariableTypeToLabel()[variableType];

    if (readOnlyWithIcon || (disabled && hideTypeName)) {
      return (
        <I18n>
          {({ i18n }) => (
            <Tooltip
              title={i18n._(tooltipTitle)}
              placement="bottom"
              enterDelay={tooltipEnterDelay}
            >
              <div className={classes.typeSelectorReadOnly}>
                {renderIcon()}
                {!hideTypeName && (
                  <span className={classes.typeSelectorReadOnlyLabel}>
                    {i18n._(getVariableTypeToLabel()[variableType])}
                  </span>
                )}
              </div>
            </Tooltip>
          )}
        </I18n>
      );
    }

    const onChangeType = (newVariableType: string) =>
      onChange(getVariableTypeToString()[newVariableType], nodeId);

    if (hideTypeName) {
      return (
        <I18n>
          {({ i18n }) => (
            <Tooltip
              title={i18n._(tooltipTitle)}
              placement="bottom"
              enterDelay={tooltipEnterDelay}
            >
              <div className={classes.typeSelectorIconOnly}>
                {renderIcon()}
                <select
                  id={id}
                  value={variableType.toString()}
                  onChange={event => onChangeType(event.currentTarget.value)}
                  aria-label={i18n._(t`Variable type`)}
                >
                  {getOptions(variableType)}
                </select>
              </div>
            </Tooltip>
          )}
        </I18n>
      );
    }

    return (
      <CompactSelectField
        value={variableType.toString()}
        onChange={onChangeType}
        id={id}
        disabled={disabled}
        errored={!!errorMessage}
        renderOptionIcon={renderIcon}
      >
        {getOptions(variableType)}
      </CompactSelectField>
    );
  }
);

export default VariableTypeSelector;
