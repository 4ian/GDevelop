// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactTextField from '../../../UI/CompactTextField';
import { ColumnStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/CompactTextField',
  component: CompactTextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
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
    </ColumnStackLayout>
  );
};
