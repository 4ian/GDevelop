// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';
import Toggle from '../../UI/Toggle';
import { ColumnStackLayout } from '../../UI/Layout';

export default {
  title: 'UI Building Blocks/Toggle',
  component: Toggle,
  decorators: [paperDecorator],
};

const WithLeftLabel = () => {
  const [value, setValue] = React.useState<boolean>(false);
  return (
    <Toggle
      label="With a left label"
      labelPosition="left"
      onToggle={() => {
        setValue(!value);
      }}
      toggled={value}
    />
  );
};

const WithRightLabel = () => {
  const [value, setValue] = React.useState<boolean>(false);
  return (
    <Toggle
      labelPosition="right"
      onToggle={() => {
        setValue(!value);
      }}
      toggled={value}
      label="With a right label"
    />
  );
};

const Disabled = () => {
  const [value, setValue] = React.useState<boolean>(false);
  return (
    <Toggle
      label="Disabled"
      labelPosition="left"
      onToggle={() => {
        setValue(!value);
      }}
      toggled={value}
      disabled
    />
  );
};

export const AllOptions = () => (
  <ColumnStackLayout>
    <WithLeftLabel />
    <WithRightLabel />
    <Disabled />
  </ColumnStackLayout>
);
