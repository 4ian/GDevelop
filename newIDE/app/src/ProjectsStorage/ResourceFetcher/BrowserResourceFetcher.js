// @flow
import { type ResourceFetcher, type FetchResourcesArgs } from '.';
import PromisePool from '@supercharge/promise-pool';
import axios from 'axios';

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

const isFetchableUrl = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://')
  );
};

/**
 * On the web-app, try to replace relative resource files by a full URL.
 * The heuristic is: if the project is accessible on a URL, then the resources
 * must be located next to it.
 * This is helpful to work on the web-app on a project stored publicly (like on GitHub).
 */
const getResourcesToFetch = (project: gdProject): Array<string> => {
  const resourcesManager = project.getResourcesManager();

  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  return allResourceNames.filter(resourceName => {
    const resource = resourcesManager.getResource(resourceName);

    return !isURL(resource.getFile());
  });
};

const fetchResources = async ({
  project,
  resourceNames,
  onProgress,
}: FetchResourcesArgs) => {
  const resourcesManager = project.getResourcesManager();
  const erroredResources = [];

  const projectFileUrl = project.getProjectFile();
  const projectBaseUrl = projectFileUrl.substr(
    0,
    projectFileUrl.lastIndexOf('/') + 1
  );
  if (!isFetchableUrl(projectBaseUrl)) {
    // Can't fetch anything relative to this project, because
    // this project does not have a public URL.
    return {
      erroredResources: [],
    };
  }

  let fetchedResourcesCount = 0;
  const resourcesToFetch = getResourcesToFetch(project);

  await PromisePool.withConcurrency(20)
    .for(resourceNames)
    .process(async resourceName => {
      const resource = resourcesManager.getResource(resourceName);

      try {
        const resourceFullUrl = new URL(resource.getFile(), projectBaseUrl)
          .href;
        await axios.get(resourceFullUrl, {
          timeout: 3000,
        });

        resource.setFile(resourceFullUrl);
      } catch (error) {
        erroredResources.push({ resourceName, error });
      }

      onProgress(fetchedResourcesCount++, resourcesToFetch.length);
    });

  return {
    erroredResources,
  };
};

// TODO: This is the ResourceFetcher of UrlStorageProvider.
export const BrowserResourceFetcher: ResourceFetcher = {
  getResourcesToFetch,
  fetchResources,
};
