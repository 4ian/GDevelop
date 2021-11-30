// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import withMock from 'storybook-addon-mock';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import Carousel, {
  type YoutubeThumbnail,
  type ShowcaseThumbnail,
} from '../../MainFrame/EditorContainers/StartPage/Carousel';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { GDevelopUserApi } from '../../Utils/GDevelopServices/ApiConfigs';

const items = [];

export default {
  title: 'Carousel',
  component: Carousel,
  decorators: [paperDecorator, muiDecorator],
};

export const LoadingWithoutTitleSkeleton = () => (
  <Carousel
    title={<Trans>Our Latest Tutorials</Trans>}
    items={null}
    displayTitleSkeleton={false}
  />
);
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
  return <Carousel title={<Trans>Our Latest Tutorials</Trans>} items={items} />;
};

export const LoadingWithTitleSkeleton = () => (
  <Carousel title={<Trans>Showcase</Trans>} items={null} />
);
export const Showcases = () => {
  const items: ShowcaseThumbnail[] = [
    {
      title: "Lil BUB's HELLO EARTH",
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/bub-animated-logo.gif',
    },
    {
      title: 'Vai Juliette!',
      imageSource:
        'https://cdn6.aptoide.com/imgs/0/d/3/0d3926b58fd241dc9ecccc1661f187ec_fgraphic.png',
    },
    {
      title: 'Alanna The Princess Of Puzzles',
      imageSource: 'https://i.ytimg.com/vi/PguDpz7TC7g/hqdefault.jpg',
    },
    {
      title: 'Miko Adventures Puffball',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/miko-adventures-puffball/Miko_adventures_puffball_header_logo.png',
    },
    {
      title: 'Swamp',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/swamp/swamp-banner.jpg',
    },
    {
      title: 'The Mighty Rune (in development)',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/mighty-rune/mighty-rune-banner.jpg',
    },
    {
      title: 'Hyperspace Dogfights',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/hyperspace-dogfights/hdog_screenshot_dodge.png',
    },
    {
      title: 'Uphill Climb Racing Neon',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/uphill-climb-racing-neon/uphill-climb-racing-neon-banner.jpg',
    },
    {
      title: 'Karambola',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/karambola-banner.png',
    },
    {
      title: 'The Research Age',
      imageSource:
        'https://forums.androidcentral.com/attachments/android-games/333598d1618909711t-game-research-age-senzanome2.jpg',
    },
    {
      title: 'A Pixel Adventure Legion',
      imageSource:
        'https://resources.gdevelop-app.com/games-showcase/images/apx-legion/apx-legion-banner-min.jpg',
    },
  ];
  return <Carousel title={<Trans>Showcase</Trans>} items={items} />;
};
