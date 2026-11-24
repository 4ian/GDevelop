// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { CompactBitmaskField } from '../../../UI/CompactBitmaskField';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/CompactBitmaskField',
  component: CompactBitmaskField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = (): React.Node => {
  const [layers, setLayers] = React.useState<number>(0b101);
  const [masks, setMasks] = React.useState<number>(0xffff);
  const [movingLayers, setMovingLayers] = React.useState<number>(0b00110000);
  return (
    <ColumnStackLayout expand>
      <Text size="sub-title">16 bits (Physics2 layers)</Text>
      <CompactBitmaskField
        label="Layers"
        markdownDescription="Layers the object belongs to, as a bitmask."
        value={layers}
        bitCount={16}
        onChange={setLayers}
        id="layers"
      />
      <Text size="sub-title">16 bits, all enabled</Text>
      <CompactBitmaskField
        label="Masks"
        value={masks}
        bitCount={16}
        onChange={setMasks}
      />
      <Text size="sub-title">
        4 bits starting at the 5th one (Physics3D layers of a moving object)
      </Text>
      <CompactBitmaskField
        label="Layers"
        value={movingLayers}
        firstBit={4}
        bitCount={4}
        onChange={setMovingLayers}
      />
      <Text size="sub-title">Disabled</Text>
      <CompactBitmaskField
        label="Layers"
        value={0b1010}
        bitCount={8}
        onChange={() => {}}
        disabled
      />
      <Text size="sub-title">Without label</Text>
      <CompactBitmaskField value={layers} bitCount={8} onChange={setLayers} />
    </ColumnStackLayout>
  );
};
