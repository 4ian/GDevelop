// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  createResourceSearch,
  type ResourceSearch,
} from '../Utils/GDevelopServices/Generation';
import {
  type ResourceSearchAndInstallOptions,
  type ResourceSearchAndInstallResult,
  type SingleResourceSearchAndInstallResult,
} from '../EditorFunctions';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { createNewResource } from '../ResourcesList/ResourceSource';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';

import PromisePool from '@supercharge/promise-pool';

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
    searchAndInstallResources: React.useCallback(
      async ({
        resources,
      }: ResourceSearchAndInstallOptions): Promise<ResourceSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');
        if (!project) throw new Error('Project should be opened.');

        const { results } = await PromisePool.withConcurrency(5)
          .for(resources)
          .process<SingleResourceSearchAndInstallResult>(
            async resourceToSearch => {
              const resourceSearch: ResourceSearch = await retryIfFailed(
                { times: 3, backoff: { initialDelay: 300, factor: 2 } },
                () =>
                  createResourceSearch(getAuthorizationHeader, {
                    userId: profile.id,
                    searchTerms: resourceToSearch.resourceName,
                    resourceKind: resourceToSearch.resourceKind,
                  })
              );

              if (
                !resourceSearch.results ||
                resourceSearch.results.length === 0
              ) {
                return {
                  resourceName: resourceToSearch.resourceName,
                  resourceKind: resourceToSearch.resourceKind,
                  status: 'nothing-found',
                };
              }

              const chosenResult = resourceSearch.results[0];
              if (!chosenResult) {
                return {
                  resourceName: resourceToSearch.resourceName,
                  resourceKind: resourceToSearch.resourceKind,
                  status: 'nothing-found',
                };
              }
              const { url: resourceUrl } = chosenResult.resource;

              try {
                const resourcesManager = project.getResourcesManager();

                // Check if the resource already exists
                if (
                  resourcesManager.hasResource(resourceToSearch.resourceName)
                ) {
                  return {
                    resourceName: resourceToSearch.resourceName,
                    resourceKind: resourceToSearch.resourceKind,
                    status: 'resource-already-exists',
                  };
                }

                // Create a new resource of the appropriate type
                const newResource = createNewResource(
                  resourceToSearch.resourceKind
                );
                if (!newResource) {
                  return {
                    resourceName: resourceToSearch.resourceName,
                    resourceKind: resourceToSearch.resourceKind,
                    status: 'error',
                    error: 'Failed to create new resource',
                  };
                }

                newResource.setName(resourceToSearch.resourceName);
                newResource.setFile(resourceUrl);
                applyResourceDefaults(project, newResource);

                // Add the resource to the project
                resourcesManager.addResource(newResource);
                newResource.delete();

                return {
                  resourceName: resourceToSearch.resourceName,
                  resourceKind: resourceToSearch.resourceKind,
                  status: 'resource-installed',
                };
              } catch (error) {
                return {
                  resourceName: resourceToSearch.resourceName,
                  resourceKind: resourceToSearch.resourceKind,
                  status: 'error',
                  error: error.message,
                };
              }
            }
          );

        const hasAnyNewlyAddedResources = results.some(
          result => result.status === 'resource-installed'
        );
        if (hasAnyNewlyAddedResources) {
          // Notify that new resources were added so they can be fetched if necessary
          resourceManagementProps.onNewResourcesAdded();
          await resourceManagementProps.onFetchNewlyAddedResources();
        }

        return { results };
      },
      [profile, getAuthorizationHeader, project, resourceManagementProps]
    ),
  };
};
