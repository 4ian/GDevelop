// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import Slider from '../../../UI/Slider';
import ValueStateHolder from '../../ValueStateHolder';

export default {
  title: 'UI Building Blocks/Slider',
  component: Slider,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ValueStateHolder
    initialValue={1}
    render={(value, onChange) => (
      <Slider
        onChange={newValue => {
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
