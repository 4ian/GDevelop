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

export interface Promotion {
  id: string;
  /** Deprecated, should use the "by locale" attribute instead. */
  imageUrl?: string;
  imageUrlByLocale?: MessageByLocale;
  /** Deprecated, should use the "by locale" attribute instead. */
  mobileImageUrl?: string;
  mobileImageUrlByLocale?: MessageByLocale;
  display: 'all' | 'non-native-mobile' | 'native-mobile';
  type: 'game-template' | 'asset-pack' | 'game' | 'other';
  linkUrl?: string;
  productId?: string;
  fromDate?: number;
  toDate?: number;
}

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
