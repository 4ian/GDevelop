// @flow
import axios from 'axios';
import { GDevelopReleaseApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';

export type Announcement = {
  id: string,
  titleByLocale: MessageByLocale,
  messageByLocale: MessageByLocale,
  type: 'info' | 'warning',
  level: 'normal' | 'urgent',
  buttonUrl: string,
  buttonLabelByLocale: MessageByLocale,
};

export const listAllAnnouncements = async (): Promise<Array<Announcement>> => {
  const response = await axios.get(
    `${GDevelopReleaseApi.baseUrl}/announcement`
  );
  return response.data;
};
