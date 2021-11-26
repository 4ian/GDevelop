// @flow
import * as React from 'react';
import withMock from 'storybook-addon-mock';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import HorizontalScroll, {
  type YoutubeThumbnail,
} from '../../MainFrame/EditorContainers/StartPage/HorizontalScroll';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { GDevelopUserApi } from '../../Utils/GDevelopServices/ApiConfigs';

const items = [];

export default {
  title: 'HorizontalScroll',
  component: HorizontalScroll,
  decorators: [paperDecorator, muiDecorator],
};

export const LoadingWithTitleSkeleton = () => <HorizontalScroll title="Showcase" items={null} />;
export const LoadingWithoutTitleSkeleton = () => <HorizontalScroll title="Showcase" items={null} displayTitleSkeleton={false}/>;

export const Tutorials = () => {
  const items: YoutubeThumbnail[] = [
    {
      link: 'https://www.youtube.com/watch?v=va9GqIbK_SA',
    },
    {
      link: 'https://www.youtube.com/watch?v=KpLAYMSgoDI',
    },
    {
      link: 'https://www.youtube.com/watch?v=bR2BjT7JG0k',
    },
    {
      link: 'https://www.youtube.com/watch?v=1RpH9VQjwNY',
    },
    {
      link: 'https://www.youtube.com/watch?v=Q7e3gAWkLZI',
    },
  ];
  return <HorizontalScroll title="Our Latest Tutorials" items={items} />;
};
