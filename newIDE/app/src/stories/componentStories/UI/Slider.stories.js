// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import SliderComponent from '../../../UI/Slider';
import ValueStateHolder from '../../ValueStateHolder';
import { Line } from '../../../UI/Grid';

export default {
  title: 'Slider',
  component: SliderComponent,
  decorators: [paperDecorator, muiDecorator],
};

export const Slider = () => (
  <ValueStateHolder
    initialValue={1}
    render={(value, onChange) => (
      <SliderComponent
        onChange={(newValue) => {
          action('onChange')(newValue);
          onChange(newValue);
        }}
        value={value}
        min={-1}
        max={1}
        step={0.1}
      />
    )}
  />
);
