// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import Slideshow from '../../../UI/Slideshow/Slideshow';

export default {
  title: 'UI Building Blocks/Slideshow',
  component: Slideshow,
  decorators: [paperDecorator],
};

const items = [
  {
    id: '1',
    imageUrl:
      'https://resources.gdevelop.io/announcements/GDevelops_Mega_Pack_Updated.png',
    mobileImageUrl:
      'https://resources.gdevelop.io/announcements/GDevelops_Mega_Pack_Mobile.jpg',
    onClick: action('onClick'),
  },
  {
    id: '2',
    imageUrl:
      'https://resources.gdevelop.io/announcements/Premium_Featuring__Bubble_Dogs.png',
    mobileImageUrl:
      'https://resources.gdevelop.io/announcements/Premium_Featuring__Bubble_Dogs_Mobile.jpg',
    onClick: action('onClick'),
  },
  {
    id: '3',
    imageUrl:
      'https://resources.gdevelop.io/announcements/GDevelop_Produce_Farm_Bundle.png',
    mobileImageUrl:
      'https://resources.gdevelop.io/announcements/Produce_Farm_Bundle_Mobile.jpg',
    onClick: action('onClick'),
  },
];

export const Loading = () => {
  return (
    <Slideshow
      items={null}
      itemDesktopRatio={5038 / 459}
      itemMobileRatio={18 / 7}
    />
  );
};

export const Loaded = () => {
  return (
    <Slideshow
      items={items}
      itemDesktopRatio={5038 / 459}
      itemMobileRatio={18 / 7}
    />
  );
};

export const WithOnly1Item = () => {
  return (
    <Slideshow
      items={[items[0]]}
      itemDesktopRatio={5038 / 459}
      itemMobileRatio={18 / 7}
    />
  );
};
