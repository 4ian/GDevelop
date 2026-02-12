// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import PriceTag from '../../../UI/PriceTag';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/PriceTag',
  component: PriceTag,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <LineStackLayout>
      <PriceTag label={<Text>$8</Text>} />
      <PriceTag label={<Text>$8.50</Text>} />
      <PriceTag label={<Text>$1.20</Text>} />
      <PriceTag label={<Text>$1.23</Text>} />
      <PriceTag label={<Text>✅ Owned</Text>} />
    </LineStackLayout>
    <LineStackLayout>
      <div
        style={{
          backgroundSize: 'contain',
          backgroundImage:
            "url('https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png?gdUsage=img')",
          aspectRatio: '16 / 9',
          height: 200,
          padding: 10,
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <PriceTag label={<Text>$1.20</Text>} withOverlay />
      </div>
    </LineStackLayout>
    <LineStackLayout>
      <div
        style={{
          backgroundSize: 'contain',
          backgroundImage:
            "url('https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png?gdUsage=img')",
          aspectRatio: '16 / 9',
          height: 200,
          padding: 10,
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <PriceTag label={<Text>✅ Owned</Text>} withOverlay />
      </div>
    </LineStackLayout>
  </ColumnStackLayout>
);
