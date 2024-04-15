// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSemiControlledTextField from '../../../UI/CompactSemiControlledTextField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import { Column } from '../../../UI/Grid';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';
import Restore from '../../../UI/CustomSvgIcons/Restore';

export default {
  title: 'UI Building Blocks/CompactSemiControlledTextField',
  component: CompactSemiControlledTextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<string>('');
  const [value1, setValue1] = React.useState<string>('');
  const [value2, setValue2] = React.useState<string>('');
  const [value3, setValue3] = React.useState<string>('');
  const [value4, setValue4] = React.useState<string>('');
  const [value5, setValue5] = React.useState<string>('');
  const [value6, setValue6] = React.useState<string>('');

  return (
    <ElementHighlighterProvider
      elements={[
        { label: 'With icon', id: 'with-icon' },
        { label: 'Without icon', id: 'without-icon' },
        { label: 'With end adornment', id: 'with-end-adornment' },
      ]}
    >
      <ColumnStackLayout expand useLargeSpacer>
        <Column noMargin>
          <CompactSemiControlledTextField
            commitOnBlur
            value={value}
            onChange={setValue}
            id="without-icon"
          />

          <div>State value is {value}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            commitOnBlur
            value={value1}
            onChange={setValue1}
            errored
            errorText={'This value cannot be used'}
          />

          <div>State value is {value1}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            commitOnBlur
            value={value2}
            onChange={setValue2}
            placeholder="With placeholder"
          />

          <div>State value is {value2}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            disabled
            value={'disabled field'}
            onChange={() => {}}
          />
          <div>Disabled field</div>
        </Column>

        <Column noMargin>
          <CompactSemiControlledTextField
            id="with-icon"
            commitOnBlur
            value={value3}
            onChange={setValue3}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value3}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            commitOnBlur
            value={value4}
            onChange={setValue4}
            errored
            errorText={'An error occurred.'}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value4}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            commitOnBlur
            value={value5}
            onChange={setValue5}
            placeholder="With placeholder"
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value5}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            disabled
            value={'disabled field'}
            onChange={() => {}}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
          />
          <div>Disabled field</div>
        </Column>
        <Text>With end adornment</Text>
        <Column noMargin>
          <CompactSemiControlledTextField
            value={value6}
            onChange={setValue6}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
            id="with-end-adornment"
            renderEndAdornmentOnHover={className => (
              <Restore className={className} />
            )}
            onClickEndAdornment={action('onClickEndAdornment')}
          />
          <div>State value is {value6}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            disabled
            value={'Disabled field'}
            onChange={valueAsString => {}}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle disabled'}
            renderEndAdornmentOnHover={className => (
              <Restore className={className} />
            )}
            onClickEndAdornment={action('onClickEndAdornment')}
          />
        </Column>
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
