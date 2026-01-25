// @flow
import * as React from 'react';
import {
  type ResourceSearchAndInstallOptions,
  type ResourceSearchAndInstallResult,
} from '../EditorFunctions';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  createResourceSearch,
  type ResourceSearch,
} from '../Utils/GDevelopServices/Generation';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import {
  allResourceKindsAndMetadata,
  createNewResource,
  type ResourceManagementProps,
} from '../ResourcesList/ResourceSource';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';

const supportedResourceKinds = new Set(
  allResourceKindsAndMetadata.map(({ kind }) => kind)
);

const normalizeResourceKind = (resourceKind: string): string => {
  if (resourceKind === 'spritesheet') return 'image';
  return resourceKind;
};

const getResourceKindToCreate = ({
  missingResourceKind,
  resultResourceKind,
}: {|
  missingResourceKind: string,
  resultResourceKind: ?string,
|}): ?string => {
  const normalizedMissingResourceKind = normalizeResourceKind(
    missingResourceKind
  );
  if (supportedResourceKinds.has(normalizedMissingResourceKind)) {
    return normalizedMissingResourceKind;
  }
  if (resultResourceKind) {
    const normalizedResultResourceKind = normalizeResourceKind(
      resultResourceKind
    );
    if (supportedResourceKinds.has(normalizedResultResourceKind)) {
      return normalizedResultResourceKind;
    }
  }
  return null;
};

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
        missingResources,
      }: ResourceSearchAndInstallOptions): Promise<ResourceSearchAndInstallResult> => {
        if (!profile) throw new Error('User should be authenticated.');
        if (!project) {
          return {
            status: 'error',
            message: 'No project opened.',
            newlyAddedResources: [],
          };
        }

        const resourcesManager = project.getResourcesManager();
        const uniqueMissingResources = [];
        const missingResourceKeys = new Set();
        for (const missingResource of missingResources) {
          const resourceName = missingResource.resourceName;
          const resourceKind = missingResource.resourceKind;
          const key = `${resourceName}::${resourceKind}`;
          if (!resourceName || missingResourceKeys.has(key)) continue;
          missingResourceKeys.add(key);
          uniqueMissingResources.push(missingResource);
        }

        const newlyAddedResources: Array<string> = [];
        const notFoundResources: Array<string> = [];
        const errors: Array<string> = [];

        for (const missingResource of uniqueMissingResources) {
          const resourceName = missingResource.resourceName;
          const expectedResourceKind = normalizeResourceKind(
            missingResource.resourceKind
          );
          if (resourcesManager.hasResource(resourceName)) {
            const existingResource = resourcesManager.getResource(resourceName);
            if (
              existingResource.getKind() &&
              existingResource.getKind() !== expectedResourceKind
            ) {
              errors.push(
                `Resource "${resourceName}" already exists with type "${existingResource.getKind()}" (expected "${expectedResourceKind}").`
              );
            }
            continue;
          }

          let resourceSearch: ResourceSearch;
          try {
            resourceSearch = await retryIfFailed(
              { times: 3, backoff: { initialDelay: 300, factor: 2 } },
              () =>
                createResourceSearch(getAuthorizationHeader, {
                  userId: profile.id,
                  resourceName,
                  resourceKind: missingResource.resourceKind,
                })
            );
          } catch (error) {
            errors.push(
              `Unable to search a resource for "${resourceName}": ${error.message}`
            );
            continue;
          }

          if (!resourceSearch.results || resourceSearch.results.length === 0) {
            notFoundResources.push(resourceName);
            continue;
          }

          const chosenResult = resourceSearch.results[0];
          if (!chosenResult || !chosenResult.resource) {
            notFoundResources.push(resourceName);
            continue;
          }

          const resource = chosenResult.resource;
          const resourceUrl =
            resource && typeof resource.url === 'string' ? resource.url : null;
          if (!resourceUrl) {
            errors.push(
              `Resource "${resourceName}" has an invalid or missing URL.`
            );
            continue;
          }

          const resourceKindToCreate = getResourceKindToCreate({
            missingResourceKind: missingResource.resourceKind,
            resultResourceKind:
              resource && typeof resource.type === 'string'
                ? resource.type
                : null,
          });
          if (!resourceKindToCreate) {
            errors.push(
              `Resource kind "${missingResource.resourceKind}" is not supported for "${resourceName}".`
            );
            continue;
          }

          const newResource = createNewResource(resourceKindToCreate);
          if (!newResource) {
            errors.push(
              `Unable to create a resource of kind "${resourceKindToCreate}" for "${resourceName}".`
            );
            continue;
          }
          newResource.setFile(resourceUrl);
          newResource.setName(resourceName);
          newResource.setOrigin('gdevelop-asset-store', resourceUrl);
          applyResourceDefaults(project, newResource);
          const hasCreatedAnyResource = resourcesManager.addResource(newResource);
          newResource.delete();

          if (hasCreatedAnyResource) {
            newlyAddedResources.push(resourceName);
          } else {
            errors.push(
              `Resource "${resourceName}" could not be added to the project.`
            );
          }
        }

        if (newlyAddedResources.length > 0) {
          await resourceManagementProps.onFetchNewlyAddedResources();
          resourceManagementProps.onNewResourcesAdded();
        }

        const messages = [];
        if (notFoundResources.length > 0) {
          messages.push(
            `No resource found for: ${notFoundResources.join(', ')}.`
          );
        }
        if (errors.length > 0) {
          messages.push(...errors);
        }

        if (errors.length > 0) {
          return {
            status: 'error',
            message: messages.join('\n'),
            newlyAddedResources,
          };
        }
        if (newlyAddedResources.length === 0) {
          return {
            status: 'nothing-found',
            message: messages.join('\n') || 'No resources found.',
            newlyAddedResources,
          };
        }
        return {
          status: 'resources-installed',
          message: messages.join('\n') || 'Resources installed successfully.',
          newlyAddedResources,
        };
      },
      [getAuthorizationHeader, profile, project, resourceManagementProps]
    ),
  };
};
