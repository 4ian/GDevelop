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
      <PriceTag value={800} />
      <PriceTag value={850} />
      <PriceTag value={1200} />
      <PriceTag value={1225} />
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
        <PriceTag value={1200} transparentBackground />
      </div>
    </LineStackLayout>
  </ColumnStackLayout>
);
