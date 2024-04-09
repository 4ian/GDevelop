// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactTextField from '../../../UI/CompactTextField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import Text from '../../../UI/Text';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Restore from '../../../UI/CustomSvgIcons/Restore';

export default {
  title: 'UI Building Blocks/CompactTextField',
  component: CompactTextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  const [value8, setValue8] = React.useState<string>('');
  const [value6, setValue6] = React.useState<number>(0);
  const [value7, setValue7] = React.useState<number>(0);
  return (
    <ElementHighlighterProvider
      elements={[
        { label: 'Text with icon', id: 'with-icon' },
        { label: 'text without icon', id: 'without-icon' },
        { label: 'Number with icon', id: 'number-with-icon' },
        { label: 'Text with end adornment', id: 'text-with-end-adornment' },
      ]}
    >
      <ColumnStackLayout expand>
        <CompactTextField value={value} onChange={setValue} id="without-icon" />
        <CompactTextField value={value1} onChange={setValue1} errored />
        <CompactTextField
          value={value2}
          onChange={setValue2}
          placeholder="With placeholder"
        />
        <CompactTextField
          disabled
          value={'disabled field'}
          onChange={() => {}}
        />
        <CompactTextField
          value={value3}
          onChange={setValue3}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
          id="with-icon"
        />
        <CompactTextField
          value={value4}
          onChange={setValue4}
          errored
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
        />
        <CompactTextField
          value={value5}
          onChange={setValue5}
          placeholder="With placeholder"
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
        />
        <CompactTextField
          disabled
          value={'disabled field'}
          onChange={() => {}}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
        />
        <Text>Numbers</Text>
        <CompactTextField
          type="number"
          value={value6}
          onChange={valueAsString => {
            if (!valueAsString) setValue6(valueAsString);
            else setValue6(parseFloat(valueAsString) || 0);
          }}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
          useLeftIconAsNumberControl
          id="number-with-icon"
        />
        <CompactTextField
          type="number"
          value={value7}
          onChange={valueAsString => {
            if (!valueAsString) setValue7(valueAsString);
            else setValue7(parseFloat(valueAsString) || 0);
          }}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
          placeholder="80"
          useLeftIconAsNumberControl
        />
        <CompactTextField
          type="number"
          disabled
          value={45}
          onChange={valueAsString => {}}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle disabled'}
          useLeftIconAsNumberControl
        />
        <Text>With end adornment</Text>
        <CompactTextField
          value={value8}
          onChange={setValue8}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle'}
          useLeftIconAsNumberControl
          id="text-with-end-adornment"
          renderEndAdornmentOnHover={className => (
            <Restore className={className} />
          )}
          onClickEndAdornment={action('onClickEndAdornment')}
        />
        <CompactTextField
          disabled
          value={'Disabled field'}
          onChange={valueAsString => {}}
          renderLeftIcon={className => <Angle className={className} />}
          leftIconTooltip={'Angle disabled'}
          useLeftIconAsNumberControl
          renderEndAdornmentOnHover={className => (
            <Restore className={className} />
          )}
          onClickEndAdornment={action('onClickEndAdornment')}
        />
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
