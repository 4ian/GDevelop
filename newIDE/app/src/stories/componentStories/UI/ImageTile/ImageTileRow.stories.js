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
  itemsWithLocks,
} from './data';

export default {
  title: 'UI Building Blocks/ImageTile/ImageTileRow',
  component: ImageTileRow,
  decorators: [paperDecorator],
};

const getColumnsFromWindowSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
    case 'small':
      return 2;
    case 'medium':
      return 3;
    case 'large':
    default:
      return 5;
  }
};

export const Default = (): React.Node => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const Loading = (): React.Node => (
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

export const WithDescription = (): React.Node => (
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

export const WithTitleAndDescription = (): React.Node => (
  <ImageTileRow
    items={itemsWithTitleAndDescription}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithOverlay = (): React.Node => (
  <ImageTileRow
    items={itemsWithOverlay}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithLocks = (): React.Node => (
  <ImageTileRow
    items={itemsWithLocks}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={getColumnsFromWindowSize}
  />
);

export const WithNoCroppingOnMobile = (): React.Node => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWindowSize={getColumnsFromWindowSize}
    getLimitFromWindowSize={() => 5}
  />
);
