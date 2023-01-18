// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import ImageTileGrid from '../../../../UI/ImageTileGrid';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  itemsWithJustImage,
  itemsWithOverlay,
  itemsWithTitleAndDescription,
} from './data';

export default {
  title: 'ImageTile/ImageTileGrid',
  component: ImageTileGrid,
  decorators: [paperDecorator, muiDecorator],
};

const getColumnsFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 1;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

export const Default = () => (
  <ImageTileGrid
    items={itemsWithJustImage}
    getColumnsFromWidth={getColumnsFromWidth}
  />
);

export const WithTitleAndDescription = () => (
  <ImageTileGrid
    items={itemsWithTitleAndDescription}
    getColumnsFromWidth={getColumnsFromWidth}
  />
);

export const WithOverlay = () => (
  <ImageTileGrid
    items={itemsWithOverlay}
    getColumnsFromWidth={getColumnsFromWidth}
  />
);
