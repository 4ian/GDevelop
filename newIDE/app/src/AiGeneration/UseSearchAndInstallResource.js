// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  createResourceSearch,
  type ResourceSearch,
  type AiGeneratedEventMissingResource,
} from '../Utils/GDevelopServices/Generation';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { createNewResource } from '../ResourcesList/ResourceSource';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';

const gd: libGDevelop = global.gd;

export type ResourceSearchAndInstallResult = {|
  status: 'resource-installed' | 'nothing-found' | 'error',
  message: string,
  resourceName: string | null,
|};

export type ResourceSearchAndInstallOptions = {|
  searchTerms: string,
  resourceKind: string,
|};

export const useSearchAndInstallResource = ({
  project,
  resourceManagementProps,
}: {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
|}) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  return {
    searchAndInstallResource: React.useCallback(
      async ({
        searchTerms,
        resourceKind,
      }: ResourceSearchAndInstallOptions): Promise<ResourceSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');
        if (!project) throw new Error('Project should be opened.');

        const resourceSearch: ResourceSearch = await retryIfFailed(
          { times: 3, backoff: { initialDelay: 300, factor: 2 } },
          () =>
            createResourceSearch(getAuthorizationHeader, {
              userId: profile.id,
              searchTerms,
              resourceKind,
            })
        );
        if (!resourceSearch.results || resourceSearch.results.length === 0) {
          return {
            status: 'nothing-found',
            message: 'No resources found.',
            resourceName: null,
          };
        }

        // In the future, we could ask the user to select the resource they want to use.
        // For now, we just return the first resource.
        const chosenResult = resourceSearch.results[0];
        if (!chosenResult) throw new Error('No resource found.');
        const { name: resourceName, url: resourceUrl } = chosenResult.resource;

        try {
          const resourcesManager = project.getResourcesManager();

          // Check if the resource already exists
          if (resourcesManager.hasResource(resourceName)) {
            return {
              status: 'resource-installed',
              message: 'Resource already exists in the project.',
              resourceName,
            };
          }

          // Create a new resource of the appropriate type
          const newResource = createNewResource(resourceKind);
          if (!newResource) {
            return {
              status: 'error',
              message: `Unknown resource kind: ${resourceKind}`,
              resourceName: null,
            };
          }

          newResource.setName(resourceName);
          newResource.setFile(resourceUrl);
          applyResourceDefaults(project, newResource);

          // Add the resource to the project
          resourcesManager.addResource(newResource);
          newResource.delete();

          // Notify that new resources were added so they can be fetched if necessary
          resourceManagementProps.onNewResourcesAdded();
          await resourceManagementProps.onFetchNewlyAddedResources();

          return {
            status: 'resource-installed',
            message: 'Resource installed successfully.',
            resourceName,
          };
        } catch (error) {
          console.error('Error installing resource:', error);
          return {
            status: 'error',
            message: `Failed to install resource: ${error.message}`,
            resourceName: null,
          };
        }
      },
      [profile, getAuthorizationHeader, project, resourceManagementProps]
    ),
    searchAndInstallMissingResources: React.useCallback(
      async (
        missingResources: AiGeneratedEventMissingResource[]
      ): Promise<string[]> => {
        if (!profile) throw new Error('User should be authenticated.');
        if (!project) throw new Error('Project should be opened.');

        const newlyAddedResources: string[] = [];

        for (const missingResource of missingResources) {
          const resourceSearch: ResourceSearch = await retryIfFailed(
            { times: 3, backoff: { initialDelay: 300, factor: 2 } },
            () =>
              createResourceSearch(getAuthorizationHeader, {
                userId: profile.id,
                searchTerms: missingResource.resourceName,
                resourceKind: missingResource.resourceKind,
              })
          );

          if (!resourceSearch.results || resourceSearch.results.length === 0) {
            continue;
          }

          const chosenResult = resourceSearch.results[0];
          if (!chosenResult) continue;
          const { name: resourceName, url: resourceUrl } = chosenResult.resource;

          try {
            const resourcesManager = project.getResourcesManager();

            // Check if the resource already exists
            if (resourcesManager.hasResource(missingResource.resourceName)) {
              continue;
            }

            // Create a new resource of the appropriate type
            const newResource = createNewResource(missingResource.resourceKind);
            if (!newResource) {
              continue;
            }

            newResource.setName(missingResource.resourceName);
            newResource.setFile(resourceUrl);
            applyResourceDefaults(project, newResource);

            // Add the resource to the project
            resourcesManager.addResource(newResource);
            newResource.delete();

            newlyAddedResources.push(missingResource.resourceName);
          } catch (error) {
            console.error(
              `Error installing resource ${missingResource.resourceName}:`,
              error
            );
          }
        }

        if (newlyAddedResources.length > 0) {
          // Notify that new resources were added so they can be fetched if necessary
          resourceManagementProps.onNewResourcesAdded();
          await resourceManagementProps.onFetchNewlyAddedResources();
        }

        return newlyAddedResources;
      },
      [profile, getAuthorizationHeader, project, resourceManagementProps]
    ),
  };
};
