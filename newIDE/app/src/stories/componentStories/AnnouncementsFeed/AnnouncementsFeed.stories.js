// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { AnnouncementsFeed } from '../../../AnnouncementsFeed';
import { AnnouncementsFeedContext } from '../../../AnnouncementsFeed/AnnouncementsFeedContext';
import { fakeAnnouncements } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AnnouncementsFeed',
  component: AnnouncementsFeed,
  decorators: [paperDecorator, muiDecorator],
};

export const ErrorLoadingAnnouncements = () => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: null,
        error: new Error('Fake error'),
        fetchAnnouncements: action('fetchAnnouncements'),
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
        error: null,
        fetchAnnouncements: action('fetchAnnouncements'),
      }}
    >
      <AnnouncementsFeed />
    </AnnouncementsFeedContext.Provider>
  );
};

export const Default = () => {
  return (
    <AnnouncementsFeedContext.Provider
      value={{
        announcements: fakeAnnouncements,
        error: null,
        fetchAnnouncements: action('fetchAnnouncements'),
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
        error: null,
        fetchAnnouncements: action('fetchAnnouncements'),
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
        error: null,
        fetchAnnouncements: action('fetchAnnouncements'),
      }}
    >
      <AnnouncementsFeed level="urgent" />
    </AnnouncementsFeedContext.Provider>
  );
};
