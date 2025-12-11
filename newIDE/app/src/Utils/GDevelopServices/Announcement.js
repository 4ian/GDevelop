// @flow
import axios from 'axios';
import { GDevelopReleaseApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { ensureIsArray } from '../DataValidator';

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

  return ensureIsArray({
    data: response.data,
    endpointName: 'announcement (Release API)',
  });
};

export const listAllPromotions = async (): Promise<Array<Promotion>> => {
  const response = await axios.get(`${GDevelopReleaseApi.baseUrl}/promotion`);

  return ensureIsArray({
    data: response.data,
    endpointName: 'promotion (Release API)',
  });
};
