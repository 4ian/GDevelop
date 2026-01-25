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
          const { url: resourceUrl } = chosenResult.resource;

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
