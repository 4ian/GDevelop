// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactTextField from '../../../UI/CompactTextField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactTextField',
  component: CompactTextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  return (
    <ColumnStackLayout expand>
      <CompactTextField value={value} onChange={setValue} />
      <CompactTextField value={value1} onChange={setValue1} errored />
      <CompactTextField
        value={value2}
        onChange={setValue2}
        placeholder="With placeholder"
      />
      <CompactTextField disabled value={'disabled field'} onChange={() => {}} />
      <CompactTextField
        value={value3}
        onChange={setValue3}
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactTextField
        value={value4}
        onChange={setValue4}
        errored
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactTextField
        value={value5}
        onChange={setValue5}
        placeholder="With placeholder"
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
      <CompactTextField
        disabled
        value={'disabled field'}
        onChange={() => {}}
        renderLeftIcon={className => <Angle className={className} />}
        leftIconTooltip={'Angle'}
      />
    </ColumnStackLayout>
  );
};
