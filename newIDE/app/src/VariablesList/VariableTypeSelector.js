// @flow
import * as React from 'react';
import { t } from '@lingui/macro';

import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import VariableStringIcon from './Icons/VariableStringIcon';
import VariableNumberIcon from './Icons/VariableNumberIcon';
import VariableBooleanIcon from './Icons/VariableBooleanIcon';
import VariableArrayIcon from './Icons/VariableArrayIcon';
import VariableStructureIcon from './Icons/VariableStructureIcon';
import { Line, Spacer } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
const gd = global.gd;

type Props = {|
  variableType: Variable_Type,
  onChange: (newVariableType: string) => void,
  isHighlighted?: boolean,
  disabled?: boolean,
  id?: string,
|};

let options;
let variableTypeToIcon;
let variableTypeToString;

const getOptions = () => {
  if (!options) {
    options = [
      <SelectOption
        key="string"
        label={t`String`}
        value={gd.Variable.String}
      />,
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
  return options;
};

const getVariableTypeToIcon = () => {
  if (!variableTypeToIcon) {
    variableTypeToIcon = {
      [gd.Variable.String]: VariableStringIcon,
      [gd.Variable.Number]: VariableNumberIcon,
      [gd.Variable.Boolean]: VariableBooleanIcon,
      [gd.Variable.Array]: VariableArrayIcon,
      [gd.Variable.Structure]: VariableStructureIcon,
    };
  }
  return variableTypeToIcon;
};

const getVariableTypeToString = () => {
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

const VariableTypeSelector = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const Icon = getVariableTypeToIcon()[props.variableType];

  return (
    <Line alignItems="center" noMargin>
      <Icon
        fontSize="small"
        htmlColor={
          props.isHighlighted
            ? gdevelopTheme.listItem.selectedTextColor
            : undefined
        }
      />
      <Spacer />
      <SelectField
        value={props.variableType}
        margin="none"
        stopPropagationOnClick
        onChange={event =>
          props.onChange(getVariableTypeToString()[event.target.value])
        }
        inputStyle={
          props.isHighlighted
            ? { color: gdevelopTheme.listItem.selectedTextColor }
            : undefined
        }
        disabled={props.disabled}
        id={props.id}
      >
        {getOptions()}
      </SelectField>
    </Line>
  );
};

export default VariableTypeSelector;
