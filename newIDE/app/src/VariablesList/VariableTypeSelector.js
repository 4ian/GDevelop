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
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
const gd = global.gd;

type Props = {|
  variableType: Variable_Type,
  onChange: (newVariableType: string) => void,
  isHighlighted?: boolean,
  disabled?: boolean,
|};

const VariableTypeSelector = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  // TODO: find a way to have those next 3 consts outside of component
  // for performance issues without making the storybook bug.
  const options = React.useMemo(
    () => [
      <SelectOption
        key="string"
        primaryText={t`String`}
        value={gd.Variable.String}
      />,
      <SelectOption
        key="number"
        primaryText={t`Number`}
        value={gd.Variable.Number}
      />,
      <SelectOption
        key="boolean"
        primaryText={t`Boolean`}
        value={gd.Variable.Boolean}
      />,
      <SelectOption
        key="array"
        primaryText={t`Array`}
        value={gd.Variable.Array}
      />,
      <SelectOption
        key="structure"
        primaryText={t`Structure`}
        value={gd.Variable.Structure}
      />,
    ],
    []
  );
  const variableTypeToIcon = React.useMemo(
    () => ({
      [gd.Variable.String]: VariableStringIcon,
      [gd.Variable.Number]: VariableNumberIcon,
      [gd.Variable.Boolean]: VariableBooleanIcon,
      [gd.Variable.Array]: VariableArrayIcon,
      [gd.Variable.Structure]: VariableStructureIcon,
    }),
    []
  );
  const variableTypeToString = React.useMemo(
    () => ({
      [gd.Variable.String]: 'string',
      [gd.Variable.Number]: 'number',
      [gd.Variable.Boolean]: 'boolean',
      [gd.Variable.Array]: 'array',
      [gd.Variable.Structure]: 'structure',
    }),
    []
  );

  const Icon = variableTypeToIcon[props.variableType];

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
          props.onChange(variableTypeToString[event.target.value])
        }
        inputStyle={
          props.isHighlighted
            ? { color: gdevelopTheme.listItem.selectedTextColor }
            : undefined
        }
        disabled={props.disabled}
      >
        {options}
      </SelectField>
    </Line>
  );
};

export default VariableTypeSelector;
