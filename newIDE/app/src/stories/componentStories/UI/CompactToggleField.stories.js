// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactToggleField } from '../../../UI/CompactToggleField';
import { ColumnStackLayout } from '../../../UI/Layout';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';

export default {
  title: 'UI Building Blocks/CompactToggleField',
  component: CompactToggleField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<boolean>(false);
  const [value2, setValue2] = React.useState<boolean>(true);
  const [value3, setValue3] = React.useState<boolean>(false);
  return (
    <ElementHighlighterProvider
      elements={[{ label: 'Default', id: 'default' }]}
    >
      <ColumnStackLayout expand>
        <CompactToggleField
          checked={value}
          onCheck={setValue}
          id="default"
          label="Default"
        />
        <CompactToggleField
          disabled
          checked={value2}
          onCheck={setValue2}
          label="Disabled field"
        />
        <CompactToggleField
          checked={value3}
          onCheck={setValue3}
          label="With description"
          markdownDescription="This is a description"
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
