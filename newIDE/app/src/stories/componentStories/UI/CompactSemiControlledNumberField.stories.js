// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactSemiControlledNumberField from '../../../UI/CompactSemiControlledNumberField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Angle from '../../../UI/CustomSvgIcons/Angle';
import { Column } from '../../../UI/Grid';
import ElementHighlighterProvider from '../../ElementHighlighterProvider';
import Text from '../../../UI/Text';
import Restore from '../../../UI/CustomSvgIcons/Restore';

export default {
  title: 'UI Building Blocks/CompactSemiControlledNumberField',
  component: CompactSemiControlledNumberField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<number>(45);
  const [value1, setValue1] = React.useState<number>(1);
  const [value2, setValue2] = React.useState<number>(25);
  const [value3, setValue3] = React.useState<number>(-12);
  const [value4, setValue4] = React.useState<number>(566560);
  const [value5, setValue5] = React.useState<number>(334);
  const [value6, setValue6] = React.useState<number>(334);

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
          <CompactSemiControlledNumberField
            commitOnBlur
            value={value}
            onChange={setValue}
            id="without-icon"
          />

          <div>Commits on blur: state value is {value}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            commitOnBlur
            value={value1}
            onChange={setValue1}
            errored
            errorText={'This value cannot be used'}
          />

          <div>Commits on blur: state value is {value1}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            commitOnBlur
            value={value2}
            onChange={setValue2}
            placeholder="With placeholder"
          />

          <div>Commits on blur: state value is {value2}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            disabled
            value={666}
            onChange={() => {}}
          />
          <div>Disabled field</div>
        </Column>

        <Column noMargin>
          <CompactSemiControlledNumberField
            id="with-icon"
            value={value3}
            onChange={setValue3}
            renderLeftIcon={className => <Angle className={className} />}
            useLeftIconAsNumberControl
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value3}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            value={value4}
            onChange={setValue4}
            errored
            errorText={'An error occurred.'}
            renderLeftIcon={className => <Angle className={className} />}
            useLeftIconAsNumberControl
            leftIconTooltip={'Angle'}
          />
          <div>State value is {value4}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            commitOnBlur
            value={value5}
            onChange={setValue5}
            placeholder="With placeholder"
            renderLeftIcon={className => <Angle className={className} />}
            useLeftIconAsNumberControl
            leftIconTooltip={'Angle'}
          />
          <div>Commits on blur: state value is {value5}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            disabled
            value={777}
            onChange={() => {}}
            renderLeftIcon={className => <Angle className={className} />}
            useLeftIconAsNumberControl
            leftIconTooltip={'Angle'}
          />
          <div>Disabled field</div>
        </Column>
        <Text>With end adornment</Text>
        <Column noMargin>
          <CompactSemiControlledNumberField
            value={value6}
            onChange={setValue6}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle'}
            useLeftIconAsNumberControl
            id="with-end-adornment"
            renderEndAdornmentOnHover={className => (
              <Restore className={className} />
            )}
            onClickEndAdornment={action('onClickEndAdornment')}
          />
          <div>State value is {value6}</div>
        </Column>
        <Column noMargin>
          <CompactSemiControlledNumberField
            disabled
            value={45.1}
            onChange={() => {}}
            renderLeftIcon={className => <Angle className={className} />}
            leftIconTooltip={'Angle disabled'}
            useLeftIconAsNumberControl
            renderEndAdornmentOnHover={className => (
              <Restore className={className} />
            )}
            onClickEndAdornment={action('onClickEndAdornment')}
          />
          <div>Disabled field</div>
        </Column>
      </ColumnStackLayout>
    </ElementHighlighterProvider>
  );
};
