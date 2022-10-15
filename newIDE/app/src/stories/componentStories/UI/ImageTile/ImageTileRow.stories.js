// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import ImageTileRow from '../../../../UI/ImageTileRow';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Add from '../../../../UI/CustomSvgIcons/Add';
import {
  itemsWithJustImage,
  itemsWithOverlay,
  itemsWithTitleAndDescription,
} from './data';

export default {
  title: 'ImageTile/ImageTileRow',
  component: ImageTileRow,
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
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWidth={getColumnsFromWidth}
    getLimitFromWidth={getColumnsFromWidth}
  />
);

export const WithDescription = () => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    description="This is a description for the templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWidth={getColumnsFromWidth}
    getLimitFromWidth={getColumnsFromWidth}
  />
);

export const WithTitleAndDescription = () => (
  <ImageTileRow
    items={itemsWithTitleAndDescription}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWidth={getColumnsFromWidth}
    getLimitFromWidth={getColumnsFromWidth}
  />
);

export const WithOverlay = () => (
  <ImageTileRow
    items={itemsWithOverlay}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWidth={getColumnsFromWidth}
    getLimitFromWidth={getColumnsFromWidth}
  />
);

export const WithNoCroppingOnMobile = () => (
  <ImageTileRow
    items={itemsWithJustImage}
    title="Recommended templates"
    onShowAll={() => {}}
    showAllIcon={<Add fontSize="small" />}
    getColumnsFromWidth={getColumnsFromWidth}
    getLimitFromWidth={() => 5}
  />
);
