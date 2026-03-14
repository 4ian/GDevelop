// @flow
import PromisePool from '@supercharge/promise-pool';
import axios from 'axios';
import { isFetchableUrl, isURL } from '../../ResourcesList/ResourceUtils';
import { type FileMetadata } from '../index';

type Options = {
  project: gdProject,
  fileMetadata: FileMetadata,
  onProgress: (count: number, total: number) => void,
};

/**
 * When loading resources from a project from a URL,
 * try to replace relative resource files by a full URL.
 * The heuristic is: if the project is accessible on a URL, then the resources
 * must be located next to it.
 * This is helpful to work on a project stored publicly (like on GitHub).
 */
const getProjectBaseUrl = (projectFileUrl: string): ?string => {
  if (!projectFileUrl) return null;
  const lastSlashIndex = projectFileUrl.lastIndexOf('/');
  const baseUrl =
    lastSlashIndex >= 0
      ? projectFileUrl.substr(0, lastSlashIndex + 1)
      : projectFileUrl;

  if (isURL(baseUrl)) return baseUrl;

  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.href
  ) {
    try {
      return new URL(baseUrl, window.location.href).href;
    } catch (error) {
      return null;
    }
  }

  return null;
};

export const fetchRelativeResourcesToFullUrls = async ({
  project,
  fileMetadata,
  onProgress,
}: Options):
  | Promise<{ erroredResources: Array<empty> }>
  | Promise<{
      erroredResources: Array<{ error: any, resourceName: string }>,
    }> => {
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const erroredResources = [];

  const projectFileUrl = fileMetadata.fileIdentifier;
  const projectBaseUrl = getProjectBaseUrl(projectFileUrl);
  if (!projectBaseUrl) {
    // Can't fetch anything relative to this project, because
    // this project does not have a resolvable base URL.
    return {
      erroredResources: [],
    };
  }

  let fetchedResourcesCount = 0;
  const shouldValidate = isFetchableUrl(projectBaseUrl);
  const resourcesToFetch = allResourceNames.filter(resourceName => {
    const resource = resourcesManager.getResource(resourceName);
    const isResourceAnUrl = isURL(resource.getFile());

    // We fetch all resources that are not URLs.
    return !isResourceAnUrl;
  });

  await PromisePool.withConcurrency(20)
    .for(resourcesToFetch)
    .process(async resourceName => {
      const resource = resourcesManager.getResource(resourceName);

      const resourceFullUrl = new URL(resource.getFile(), projectBaseUrl).href;
      if (shouldValidate) {
        try {
          // $FlowFixMe[underconstrained-implicit-instantiation]
          await axios.get(resourceFullUrl, {
            timeout: 3000,
          });
        } catch (error) {
          erroredResources.push({ resourceName, error });
        }
      }

      resource.setFile(resourceFullUrl);

      onProgress(fetchedResourcesCount++, resourcesToFetch.length);
    });

  return {
    erroredResources,
  };
};
