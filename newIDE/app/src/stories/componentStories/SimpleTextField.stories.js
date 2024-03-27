// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { SimpleTextField } from '../../UI/SimpleTextField';
import { ColumnStackLayout } from '../../UI/Layout';
import paperDecorator from '../PaperDecorator';

export default {
  title: 'UI Building Blocks/SimpleTextField',
  component: SimpleTextField,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <SimpleTextField
      disabled={false}
      type="text"
      id="some-id-1"
      value={'Test 123'}
      onChange={action('onChange')}
    />
    <SimpleTextField
      disabled={false}
      type="number"
      id="some-id-2"
      value={'456.123'}
      onChange={action('onChange')}
    />
    <SimpleTextField
      disabled={false}
      type="text"
      id="some-id-3"
      italic
      value={'Test 456'}
      onChange={action('onChange')}
    />
    <SimpleTextField
      disabled={true}
      type="text"
      id="some-id-3"
      italic
      value={'Test 456'}
      onChange={action('onChange')}
    />
  </ColumnStackLayout>
);
