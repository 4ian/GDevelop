// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { Column, Line } from '../../../UI/Grid';
import Breadcrumbs from '../../../UI/Breadcrumbs';

export default {
  title: 'UI Building Blocks/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <Column>
    <Line>
      <Breadcrumbs
        steps={[
          { label: t`Home`, onClick: action('Click on home'), href: '/' },
        ]}
      />
    </Line>
    <Line>
      <Breadcrumbs
        steps={[
          { label: t`Home` },
          {
            label: t`Categories`,
            onClick: action('Click on categories'),
            href: '/categories',
          },
        ]}
      />
    </Line>
  </Column>
);
