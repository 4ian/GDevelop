// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactToggleField } from '../../../UI/CompactToggleField';
import { ColumnStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactToggleField',
  component: CompactToggleField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<boolean>(false);
  const [value2, setValue2] = React.useState<boolean>(true);
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <Text size="sub-title">Default</Text>
        <CompactToggleField
          checked={value}
          onCheck={setValue}
          id="default"
          label="Default"
        />
        <Text size="sub-title">Disabled</Text>
        <CompactToggleField
          disabled
          checked={value2}
          onCheck={setValue2}
          label="Disabled"
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
