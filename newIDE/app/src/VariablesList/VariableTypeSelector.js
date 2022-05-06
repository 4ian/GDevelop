// @flow
import * as React from 'react';

import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import VariableStringIcon from './Icons/VariableStringIcon';
import VariableNumberIcon from './Icons/VariableNumberIcon';
import VariableBooleanIcon from './Icons/VariableBooleanIcon';
import VariableArrayIcon from './Icons/VariableArrayIcon';
import VariableStructureIcon from './Icons/VariableStructureIcon';
const gd = global.gd;

type Props = {|
  variableType: Variable_Type,
  onChange: (newVariableType: Variable_Type) => void,
|};

const VariableTypeSelector = (props: Props) => {
  const variableTypeToIcon = {
    [gd.Variable.String]: VariableStringIcon,
    [gd.Variable.Number]: VariableNumberIcon,
    [gd.Variable.Boolean]: VariableBooleanIcon,
    [gd.Variable.Array]: VariableArrayIcon,
    [gd.Variable.Structure]: VariableStructureIcon,
  };
  console.log(props);
  const Icon = variableTypeToIcon[props.variableType];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
      <Icon fontSize="small" />
      <SelectField value={props.variableType} margin="none" stopPropagationOnClick>
        <SelectOption primaryText="String" value={gd.Variable.String} />
        <SelectOption primaryText="Number" value={gd.Variable.Number} />
        <SelectOption primaryText="Boolean" value={gd.Variable.Boolean} />
        <SelectOption primaryText="Array" value={gd.Variable.Array} />
        <SelectOption primaryText="Structure" value={gd.Variable.Structure} />
      </SelectField>
    </div>
  );
};

export default VariableTypeSelector;
