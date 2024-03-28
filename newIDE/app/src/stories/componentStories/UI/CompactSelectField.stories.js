// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSelectField from '../../../UI/CompactSelectField';
import { ColumnStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/CompactSelectField',
  component: CompactSelectField,
  decorators: [paperDecorator, muiDecorator],
};

const options = [
  <option>First option</option>,
  <option>Segundo</option>,
  <option>Troisième option</option>,
];

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  return (
    <ColumnStackLayout expand>
      <CompactSelectField value={value} onChange={setValue}>
        {options}
      </CompactSelectField>
      <CompactSelectField value={value1} onChange={setValue1} errored>
        {options}
      </CompactSelectField>
      <CompactSelectField value={value2} onChange={setValue2}>
        {[
          <option style={{ display: 'none' }}>Select an option</option>,
          ...options,
        ]}
      </CompactSelectField>
      <CompactSelectField disabled value={'disabled field'} onChange={() => {}}>
        {options}
      </CompactSelectField>
    </ColumnStackLayout>
  );
};
