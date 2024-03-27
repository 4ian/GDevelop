// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { Column, Line } from '../../../UI/Grid';
import Breadcrumbs from '../../../UI/Breadcrumbs';

export default {
  title: 'UI Building Blocks/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [paperDecorator],
};

export const Default = () => (
  <Column>
    <Line>
      <Breadcrumbs
        steps={[
          {
            label: <span>Home</span>,
            onClick: action('Click on home'),
            href: '/',
          },
        ]}
      />
    </Line>
    <Line>
      <Breadcrumbs
        steps={[
          { label: <span>Home</span> },
          {
            label: <span>Categories</span>,
            onClick: action('Click on categories'),
            href: '/categories',
          },
        ]}
      />
    </Line>
  </Column>
);
