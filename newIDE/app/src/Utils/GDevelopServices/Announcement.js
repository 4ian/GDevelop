// @flow
import axios from 'axios';
import { GDevelopReleaseApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';

export type Announcement = {
  id: string,
  titleByLocale: MessageByLocale,
  markdownMessageByLocale: MessageByLocale,
  mobileMarkdownMessageByLocale?: MessageByLocale,
  type?: 'info' | 'warning',
  level: 'normal' | 'urgent',
  buttonUrl?: string,
  buttonLabelByLocale?: MessageByLocale,
};

export type Promotion = {
  id: string,
  imageUrl: string,
  mobileImageUrl: string,
  display: 'all' | 'non-native-mobile',
  type: 'game-template' | 'asset-pack' | 'game',
  linkUrl?: string,
  productId?: string,
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

export const listAllPromotions = async (): Promise<Array<Promotion>> => {
  const response = await axios.get(`${GDevelopReleaseApi.baseUrl}/promotion`);
  const promotions = response.data;
  if (!Array.isArray(promotions)) {
    throw new Error('Invalid response from the promotions API');
  }

  return promotions;
};
