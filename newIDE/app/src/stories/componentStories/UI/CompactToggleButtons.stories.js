// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import CompactToggleButtons from '../../../UI/CompactToggleButtons';
import { ColumnStackLayout } from '../../../UI/Layout';
import Layers from '../../../UI/CustomSvgIcons/Layers';

export default {
  title: 'UI Building Blocks/CompactToggleButtons',
  component: CompactToggleButtons,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState<boolean>(false);
  const [value1, setValue1] = React.useState<boolean>(true);
  const [value2, setValue2] = React.useState<boolean>(false);
  const [value3, setValue3] = React.useState<boolean>(true);
  const [value4, setValue4] = React.useState<boolean>(false);
  const [value5, setValue5] = React.useState<boolean>(false);
  return (
    <ColumnStackLayout expand>
      <CompactToggleButtons
        id="one-item"
        buttons={[
          {
            id: 'button1',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue(!value);
            },
            isActive: value,
          },
        ]}
      />
      <CompactToggleButtons
        id="two-items"
        buttons={[
          {
            id: 'button1',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue1(!value1);
            },
            isActive: value1,
          },
          {
            id: 'button2',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue2(!value2);
            },
            isActive: value2,
          },
        ]}
      />
      <CompactToggleButtons
        id="three-items"
        buttons={[
          {
            id: 'button1',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue3(!value3);
            },
            isActive: value3,
          },
          {
            id: 'button2',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue4(!value4);
            },
            isActive: value4,
          },
          {
            id: 'button3',
            renderIcon: className => <Layers className={className} />,
            tooltip: 'Layer',
            onClick: () => {
              setValue5(!value5);
            },
            isActive: value5,
          },
        ]}
      />
    </ColumnStackLayout>
  );
};
