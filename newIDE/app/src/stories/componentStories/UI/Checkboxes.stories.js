// @flow
import * as React from 'react';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import muiDecorator from '../../ThemeDecorator';

import InlineCheckbox from '../../../UI/InlineCheckbox';
import paperDecorator from '../../PaperDecorator';
import { Column, LargeSpacer } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import Checkbox from '../../../UI/Checkbox';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/Checkboxes',
  component: InlineCheckbox,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState(false);
  const [inlineValue, setInlineValue] = React.useState(false);

  return (
    <ResponsiveLineStackLayout noColumnMargin noMargin>
      <Column alignItems="flex-start" expand>
        <Text size="block-title">Checkboxes</Text>
        <Checkbox
          checked={value}
          onCheck={(e, value) => setValue(value)}
          label="This is a checkbox"
        />
        <LargeSpacer />
        <Checkbox
          checked={true}
          onCheck={(e, value) => {}}
          label="This is a disabled checkbox"
          disabled
        />
        <LargeSpacer />
        <Text>Without label</Text>
        <Checkbox
          checked={value}
          onCheck={(e, value) => setValue(value)}
          checkedIcon={<Visibility />}
          uncheckedIcon={<VisibilityOff />}
        />
      </Column>
      <Column alignItems="flex-start" expand>
        <Text size="block-title">Inline checkboxes</Text>
        <InlineCheckbox
          checked={inlineValue}
          onCheck={(e, value) => setInlineValue(value)}
          label="This is a checkbox"
        />
        <LargeSpacer />
        <InlineCheckbox
          checked={true}
          onCheck={(e, value) => {}}
          label="This is a disabled checkbox"
          disabled
        />
        <LargeSpacer />
        <Text>Without label</Text>
        <InlineCheckbox
          checked={inlineValue}
          onCheck={(e, value) => setInlineValue(value)}
          checkedIcon={<Visibility />}
          uncheckedIcon={<VisibilityOff />}
        />
        <LargeSpacer />
        <Text>Without label and with tooltip</Text>
        <InlineCheckbox
          checked={inlineValue}
          onCheck={(e, value) => setInlineValue(value)}
          checkedIcon={<Visibility />}
          uncheckedIcon={<VisibilityOff />}
          tooltipOrHelperText="This is a tooltip"
        />
      </Column>
    </ResponsiveLineStackLayout>
  );
};
