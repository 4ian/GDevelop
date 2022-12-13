// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type InAppTutorial } from '../../InAppTutorial/InAppTutorialContext';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export type InAppTutorialShortHeader = {|
  id: string,
  contentUrl: string,
  availableLocales: Array<string>,
|};

const readJSONFile = async (filepath: string): Promise<Object> => {
  if (!fsPromises) throw new Error('Filesystem is not supported.');

  try {
    const data = await fsPromises.readFile(filepath, { encoding: 'utf8' });
    const dataObject = JSON.parse(data);
    return dataObject;
  } catch (ex) {
    throw new Error(filepath + ' is a corrupted/malformed file.');
  }
};

const fetchLocalFileIfDesktop = async (filename: string): Promise<?Object> => {
  const shouldFetchTutorials = !!remote && !Window.isDev();
  if (!shouldFetchTutorials) return null;

  const appPath = app ? app.getAppPath() : process.cwd();
  // If on desktop released version, find json in resources.
  // This allows making it available offline, and also to fix a version of the
  // tutorials (so that it's not broken by a new version of GDevelop).
  const filePath = path.join(
    appPath,
    '..', // If on dev env, replace with '../../app/resources' to test.
    `in-app-tutorials/${filename}.json`
  );
  const data = await readJSONFile(filePath);
  return data;
};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  try {
    const inAppTutorialShortHeadersStoredLocally = await fetchLocalFileIfDesktop(
      'in-app-tutorial-short-header'
    );
    if (inAppTutorialShortHeadersStoredLocally)
      return inAppTutorialShortHeadersStoredLocally;
  } catch (error) {
    console.warn(
      'Could not read the short headers stored locally. Trying to fetch the API.'
    );
  }

  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  try {
    const inAppTutorialStoredLocally = await fetchLocalFileIfDesktop(
      shortHeader.id
    );
    if (inAppTutorialStoredLocally) return inAppTutorialStoredLocally;
  } catch (error) {
    console.warn(
      'Could not read the in app tutorial stored locally. Trying to fetch the API.'
    );
  }

  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};
