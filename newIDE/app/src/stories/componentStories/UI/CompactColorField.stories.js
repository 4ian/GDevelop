// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactColorField } from '../../../UI/CompactColorField';
import { ColumnStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactColorField',
  component: CompactColorField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('00;00;255');
  const [value2, setValue2] = React.useState<string>('00;255;00');
  const [value3, setValue3] = React.useState<string>('255;00;00');
  const [value4, setValue4] = React.useState<string>('255;255;00');
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <Text size="sub-title">Default</Text>
        <CompactColorField
          color={value}
          onChange={setValue}
          id="default"
          disableAlpha={true}
        />
        <Text size="sub-title">Disabled</Text>
        <CompactColorField
          color={value2}
          onChange={setValue2}
          disableAlpha={true}
          disabled
          id="disabled"
        />
        <Text size="sub-title">With placeholder</Text>
        <CompactColorField
          color={value3}
          onChange={setValue3}
          disableAlpha={true}
          placeholder="With placeholder"
          id="placeholder"
        />
        <Text size="sub-title">errored</Text>
        <CompactColorField
          color={value4}
          onChange={setValue4}
          disableAlpha={true}
          errored={true}
          id="errored"
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
