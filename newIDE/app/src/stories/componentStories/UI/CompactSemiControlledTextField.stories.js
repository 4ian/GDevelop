// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSemiControlledTextField from '../../../UI/CompactSemiControlledTextField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import { Column } from '../../../UI/Grid';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';

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

  return (
    <ElementHighlighterProvider
      elements={[
        { label: 'With icon', id: 'with-icon' },
        { label: 'Without icon', id: 'without-icon' },
      ]}
    >
      <ColumnStackLayout expand useLargeSpacer>
        <Column noMargin>
          <CompactSemiControlledTextField
            value={value}
            onChange={setValue}
            id="without-icon"
          />

          <div>State value is {value}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
            value={value1}
            onChange={setValue1}
            errored
            errorText={'This value cannot be used'}
          />

          <div>State value is {value1}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
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
            value={value3}
            onChange={setValue3}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value3}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledTextField
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
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
