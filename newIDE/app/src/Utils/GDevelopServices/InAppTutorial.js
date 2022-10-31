// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';

export type InAppTutorialShortHeader = {| id: string, contentUrl: string |};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};
