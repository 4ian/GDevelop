// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import PromotionsSlideshow from '../../../Promotions/PromotionsSlideshow';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import {
  fakeAnnouncements,
  fakePromotions,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'PromotionsSlideshow',
  component: PromotionsSlideshow,
  decorators: [paperDecorator],
};

export const Default = (): renders any => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: fakeAnnouncements,
        promotions: fakePromotions,
        error: null,
        fetchAnnouncementsAndPromotions: action(
          'fetchAnnouncementsAndPromotions'
        ),
      }}
    >
      <PromotionsSlideshow />
    </AnnouncementsFeedContext.Provider>
  );
};

export const ErrorLoadingPromotions = (): renders any => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: null,
        promotions: null,
        error: new Error('Fake error'),
        fetchAnnouncementsAndPromotions: action(
          'fetchAnnouncementsAndPromotions'
        ),
      }}
    >
      <PromotionsSlideshow />
    </AnnouncementsFeedContext.Provider>
  );
};

export const LoadingPromotions = (): renders any => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: null,
        promotions: null,
        error: null,
        fetchAnnouncementsAndPromotions: action(
          'fetchAnnouncementsAndPromotions'
        ),
      }}
    >
      <PromotionsSlideshow />
    </AnnouncementsFeedContext.Provider>
  );
};

export const OnlyGame = (): renders any => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: fakeAnnouncements,
        promotions: fakePromotions,
        error: null,
        fetchAnnouncementsAndPromotions: action(
          'fetchAnnouncementsAndPromotions'
        ),
      }}
    >
      <PromotionsSlideshow type="game" />
    </AnnouncementsFeedContext.Provider>
  );
};

export const OnlyAssetPack = (): renders any => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: fakeAnnouncements,
        promotions: fakePromotions,
        error: null,
        fetchAnnouncementsAndPromotions: action(
          'fetchAnnouncementsAndPromotions'
        ),
      }}
    >
      <PromotionsSlideshow type="asset-pack" />
    </AnnouncementsFeedContext.Provider>
  );
};
