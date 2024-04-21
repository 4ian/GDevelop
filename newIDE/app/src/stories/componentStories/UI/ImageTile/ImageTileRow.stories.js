// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';

import ImageTileRow from '../../../../UI/ImageTileRow';
import { type WindowSizeType } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Add from '../../../../UI/CustomSvgIcons/Add';
import {
  itemsWithJustImage,
  itemsWithOverlay,
  itemsWithTitleAndDescription,
} from './data';

export default {
  title: 'UI Building Blocks/ImageTile/ImageTileRow',
  component: ImageTileRow,
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
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const Loading = () => (
  <ImageTileRow
    items={itemsWithJustImage}
    isLoading
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithDescription = () => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    description="This is a description for the templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithTitleAndDescription = () => (
  <ImageTileRow
    items={itemsWithTitleAndDescription}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithOverlay = () => (
  <ImageTileRow
    items={itemsWithOverlay}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithNoCroppingOnMobile = () => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={() => 5}
  />
);
