// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import {
  fakeAnnouncements,
  fakePromotions,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AnnouncementsFeed',
  component: AnnouncementsFeed,
  decorators: [paperDecorator],
};

export const Default = () => {
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
      <AnnouncementsFeed />
    </AnnouncementsFeedContext.Provider>
  );
};

export const WithClosableItems = () => {
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
      <AnnouncementsFeed canClose />
    </AnnouncementsFeedContext.Provider>
  );
};

export const ErrorLoadingAnnouncements = () => {
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
      <AnnouncementsFeed />
    </AnnouncementsFeedContext.Provider>
  );
};

export const LoadingAnnouncements = () => {
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
      <AnnouncementsFeed />
    </AnnouncementsFeedContext.Provider>
  );
};

export const DefaultWithMargins = () => {
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
      <AnnouncementsFeed addMargins />
    </AnnouncementsFeedContext.Provider>
  );
};

export const OnlyUrgent = () => {
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
      <AnnouncementsFeed level="urgent" />
    </AnnouncementsFeedContext.Provider>
  );
};
