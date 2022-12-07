// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type InAppTutorial } from '../../InAppTutorial/InAppTutorialContext';
import VersionMetadata from '../../Version/VersionMetadata';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
const electron = optionalRequire('electron');

export type InAppTutorialShortHeader = {|
  id: string,
  contentUrl: string,
  availableLocales: Array<string>,
|};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  const shouldFetchVersionnedTutorials = !!electron && !Window.isDev();

  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`,
    {
      params: {
        gdevelopVersion: shouldFetchVersionnedTutorials
          ? VersionMetadata.version
          : undefined,
      },
    }
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};
