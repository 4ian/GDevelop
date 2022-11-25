// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type InAppTutorial } from '../../InAppTutorial/InAppTutorialContext';

export type InAppTutorialShortHeader = {| id: string, contentUrl: string |};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};
