// @flow
import { type ResourceFetcher, type FetchResourcesArgs } from '.';

const getResourcesToFetch = (project: gdProject): Array<string> => {
  // Currently, the web-app only supports resources with URLs.
  // TODO: Detect non URLs resources and explain that it can be opened
  // only on the desktop app.
  return [];
};

const fetchResources = async ({
  project,
  resourceNames,
  onProgress,
}: FetchResourcesArgs) => {
  return {
    fetchedResources: [],
    erroredResources: [],
  };
};

export const BrowserResourceFetcher: ResourceFetcher = {
  getResourcesToFetch,
  fetchResources,
};
