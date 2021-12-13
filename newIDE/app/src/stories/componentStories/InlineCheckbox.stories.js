// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import muiDecorator from '../ThemeDecorator';

import InlineCheckbox from '../../UI/InlineCheckbox';

export default {
  title: 'UI Building Blocks/Inline Checkbox',
  component: InlineCheckbox,
  decorators: [muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState(false);

  return (
    <InlineCheckbox
      checked={value}
      onCheck={(e, value) => setValue(value)}
      label="This is a checkbox"
    />
  );
};

export const Disabled = () => {
  return (
    <InlineCheckbox
      checked={true}
      onCheck={(e, value) => {}}
      label="This is a disabled checkbox"
      disabled
    />
  );
};

export const WithHelperText = () => {
  const [value, setValue] = React.useState(false);

  return (
    <InlineCheckbox
      checked={value}
      onCheck={(e, value) => setValue(value)}
      label="This is a checkbox"
      tooltipOrHelperText="This is a helper text, which warns the user about checking this checkbox"
    />
  );
};

export const WithoutLabel = () => {
  const [value, setValue] = React.useState(false);

  return (
    <InlineCheckbox
      checked={value}
      onCheck={(e, value) => setValue(value)}
      checkedIcon={<Visibility />}
      uncheckedIcon={<VisibilityOff />}
    />
  );
};

export const WithoutLabelAndWithTooltip = () => {
  const [value, setValue] = React.useState(false);

  return (
    <InlineCheckbox
      checked={value}
      onCheck={(e, value) => setValue(value)}
      checkedIcon={<Visibility />}
      uncheckedIcon={<VisibilityOff />}
      tooltipOrHelperText="This is a tooltip"
    />
  );
};
