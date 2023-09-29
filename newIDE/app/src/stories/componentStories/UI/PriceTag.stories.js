// @flow

import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import PriceTag from '../../../UI/PriceTag';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/PriceTag',
  component: PriceTag,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <LineStackLayout>
      <PriceTag label={'$8'} />
      <PriceTag label={'$8.50'} />
      <PriceTag label={'$1.20'} />
      <PriceTag label={'$1.23'} />
      <PriceTag label={'✅ Owned'} />
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
        <PriceTag label={'$1.20'} withOverlay />
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
        <PriceTag label={'✅ Owned'} withOverlay />
      </div>
    </LineStackLayout>
  </ColumnStackLayout>
);
