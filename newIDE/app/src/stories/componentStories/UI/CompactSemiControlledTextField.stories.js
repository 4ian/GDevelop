// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSemiControlledTextField from '../../../UI/CompactSemiControlledTextField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactSemiControlledTextField',
  component: CompactSemiControlledTextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  const [value6, setValue6] = React.useState<number>(0);
  return (
    <ColumnStackLayout expand>
      <CompactSemiControlledTextField value={value} onChange={setValue} />
      <CompactSemiControlledTextField value={value1} onChange={setValue1} errored />
      <CompactSemiControlledTextField
        value={value2}
        onChange={setValue2}
        placeholder="With placeholder"
      />
      <CompactSemiControlledTextField disabled value={'disabled field'} onChange={() => {}} />
      <CompactSemiControlledTextField
        value={value3}
        onChange={setValue3}
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactSemiControlledTextField
        value={value4}
        onChange={setValue4}
        errored
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactSemiControlledTextField
        value={value5}
        onChange={setValue5}
        placeholder="With placeholder"
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactSemiControlledTextField
        disabled
        value={'disabled field'}
        onChange={() => {}}
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <Text>Numbers</Text>
      <CompactSemiControlledTextField
        type="number"
        value={value6}
        onChange={valueAsString => {
          if (!valueAsString) setValue6(valueAsString);
          else setValue6(parseInt(valueAsString, 10) || 0);
        }}
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
        useLeftIconAsNumberControl
      />
    </ColumnStackLayout>
  );
};
