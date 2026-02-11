// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSelectField from '../../../UI/CompactSelectField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Layers from '../../../UI/CustomSvgIcons/Layers';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactSelectField',
  component: CompactSelectField,
  decorators: [paperDecorator, muiDecorator],
};

const options = [
  <option>First option</option>,
  <option>Segundo</option>,
  <option>Troisième option</option>,
];

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  return (
    <ElementHighlighterProvider
      elements={[
        { label: 'With icon', id: 'with-icon' },
        { label: 'Without icon', id: 'without-icon' },
      ]}
    >
      <ColumnStackLayout expand>
        <Text size="block-title">Without icon</Text>
        <CompactSelectField value={value} onChange={setValue} id="without-icon">
          {options}
        </CompactSelectField>
        <Text size="sub-title">Errored</Text>
        <CompactSelectField value={value1} onChange={setValue1} errored>
          {options}
        </CompactSelectField>
        <Text size="sub-title">With empty option</Text>
        <CompactSelectField value={value2} onChange={setValue2}>
          {[
            <option style={{ display: 'none' }}>Select an option</option>,
            ...options,
          ]}
        </CompactSelectField>
        <Text size="sub-title">Disabled</Text>
        <CompactSelectField
          disabled
          value={'disabled field'}
          onChange={() => {}}
        >
          {options}
        </CompactSelectField>
        <Text size="block-title">With icon</Text>
        <CompactSelectField
          value={value3}
          onChange={setValue3}
          renderLeftIcon={className => <Layers className={className} />}
          leftIconTooltip={'Layer'}
          id="with-icon"
        >
          {options}
        </CompactSelectField>
        <Text size="sub-title">errored</Text>
        <CompactSelectField
          value={value4}
          onChange={setValue4}
          errored
          renderLeftIcon={className => <Layers className={className} />}
          leftIconTooltip={'Layer'}
        >
          {options}
        </CompactSelectField>
        <Text size="sub-title">With empty option</Text>
        <CompactSelectField
          value={value5}
          onChange={setValue5}
          renderLeftIcon={className => <Layers className={className} />}
          leftIconTooltip={'Layer'}
        >
          {[
            <option style={{ display: 'none' }}>Select an option</option>,
            ...options,
          ]}
        </CompactSelectField>
        <Text size="sub-title">Disabled</Text>
        <CompactSelectField
          disabled
          value={'disabled field'}
          onChange={() => {}}
          renderLeftIcon={className => <Layers className={className} />}
          leftIconTooltip={'Layer'}
        >
          {options}
        </CompactSelectField>
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
