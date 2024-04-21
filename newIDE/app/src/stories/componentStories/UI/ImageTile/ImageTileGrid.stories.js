// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';

import ImageTileGrid from '../../../../UI/ImageTileGrid';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import {
  itemsWithJustImage,
  itemsWithOverlay,
  itemsWithTitleAndDescription,
} from './data';

export default {
  title: 'UI Building Blocks/ImageTile/ImageTileGrid',
  component: ImageTileGrid,
  decorators: [paperDecorator],
};

const getColumnsFromWindowSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
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
    getColumnsFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithTitleAndDescription = () => (
  <ImageTileGrid
    items={itemsWithTitleAndDescription}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithOverlay = () => (
  <ImageTileGrid
    items={itemsWithOverlay}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
  />
);
