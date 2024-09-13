// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactTextAreaField } from '../../../UI/CompactTextAreaField';
import { ColumnStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';

export default {
  title: 'UI Building Blocks/CompactTextAreaField',
  component: CompactTextAreaField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <CompactTextAreaField
          value={value}
          onChange={setValue}
          id="default"
          label="Default"
        />
        <CompactTextAreaField
          value={value2}
          onChange={setValue2}
          placeholder="With placeholder"
          label="With placeholder"
        />
        <CompactTextAreaField
          disabled
          value={value3}
          onChange={setValue3}
          label="Disabled field"
        />
        <CompactTextAreaField
          value={value4}
          onChange={setValue4}
          label="With description"
          markdownDescription="This is a description"
        />
        <CompactTextAreaField
          value={value5}
          onChange={setValue5}
          errored
          label="Errored"
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
