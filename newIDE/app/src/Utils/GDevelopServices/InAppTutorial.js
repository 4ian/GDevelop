// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type InAppTutorial } from '../../InAppTutorial/InAppTutorialContext';
import optionalRequire from '../OptionalRequire';
import Window from '../Window';
const fs = optionalRequire('fs').promises;
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

export type InAppTutorialShortHeader = {|
  id: string,
  contentUrl: string,
  availableLocales: Array<string>,
|};

const readJSONFile = async (filepath: string): Promise<Object> => {
  if (!fs) throw new Error('Filesystem is not supported.');

  try {
    const data = await fs.readFile(filepath, { encoding: 'utf8' });
    const dataObject = JSON.parse(data);
    return dataObject;
  } catch (ex) {
    throw new Error(filepath + ' is a corrupted/malformed file.');
  }
};

const fetchVersionnedLocalFileIfDesktop = async (
  filename: string
): Promise<?Object> => {
  const shouldFetchVersionnedTutorials = !!remote && Window.isDev();
  if (!shouldFetchVersionnedTutorials) return null;

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
  const localData = await fetchVersionnedLocalFileIfDesktop(
    'in-app-tutorial-short-header'
  );
  if (localData) return localData;

  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  const localData = await fetchVersionnedLocalFileIfDesktop(shortHeader.id);
  if (localData) return localData;

  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};
