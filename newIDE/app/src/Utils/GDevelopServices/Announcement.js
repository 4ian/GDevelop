// @flow
import axios from 'axios';
import { GDevelopReleaseApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';

export type Announcement = {
  id: string,
  titleByLocale: MessageByLocale,
  markdownMessageByLocale: MessageByLocale,
  type?: 'info' | 'warning',
  level: 'normal' | 'urgent',
  buttonUrl?: string,
  buttonLabelByLocale?: MessageByLocale,
};

export const listAllAnnouncements = async (): Promise<Array<Announcement>> => {
  const response = await axios.get(
    `${GDevelopReleaseApi.baseUrl}/announcement`
  );
  const announcements = response.data;
  if (!Array.isArray(announcements)) {
    throw new Error('Invalid response from the announcements API');
  }

  return announcements;
};
