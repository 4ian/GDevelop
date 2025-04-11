// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { filterResourcesList } from '../EnumerateResources';
import { ProjectResourceCard } from './ProjectResourceCard';
import { Column, Line } from '../../UI/Grid';
import { BoxSearchResults } from '../../UI/Search/BoxSearchResults';
import { LineStackLayout } from '../../UI/Layout';
import SearchBar from '../../UI/SearchBar';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { type ResourceKind } from '../ResourceSource';
import EmptyMessage from '../../UI/EmptyMessage';

type ProjectResourcesListProps = {|
  project: gdProject,
  onSelectResource: gdResource => void,
  selectedResources: gdResource[],
  searchResults: gdResource[],
|};

const ProjectResourcesList = ({
  project,
  searchResults,
  onSelectResource,
  selectedResources,
}: ProjectResourcesListProps) => {
  return (
    <Line
      expand
      overflow={
        'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
      }
      noMargin
    >
      <BoxSearchResults
        baseSize={128}
        spacing={8}
        error={null}
        onRetry={() => {}}
        searchItems={searchResults}
        renderSearchItem={(resource, size, index) => (
          <ProjectResourceCard
            project={project}
            size={size}
            resource={resource}
            onChoose={() => onSelectResource(resource)}
            isSelected={selectedResources.includes(resource)}
          />
        )}
        noResultPlaceholder={
          <EmptyMessage>
            <Trans>Could not find any resources matching your search.</Trans>
          </EmptyMessage>
        }
      />
    </Line>
  );
};

type Props = {|
  project: gdProject,
  onResourcesSelected?: (gdResource[]) => void,
  resourceKind: ResourceKind,
  multiSelection: boolean,
|};

const ProjectResourcesChooser = ({
  project,
  onResourcesSelected,
  resourceKind,
  multiSelection,
}: Props) => {
  const [searchText, setSearchText] = React.useState<string>('');

  const searchResults = React.useMemo(
    () => {
      const resourcesManager = project.getResourcesManager();
      const allResourcesList = resourcesManager
        .getAllResourceNames()
        .toJSArray()
        .map(resourceName => resourcesManager.getResource(resourceName))
        .filter(resource => resource.getKind() === resourceKind);
      return filterResourcesList(allResourcesList, searchText);
    },
    [project, searchText, resourceKind]
  );

  const [selectedResources, setSelectedResources] = React.useState<
    gdResource[]
  >([]);
  const onSelectResource = React.useCallback(
    (resource: gdResource) => {
      setSelectedResources(prevSelectedResources => {
        // If already selected, remove it from the list.
        if (prevSelectedResources.includes(resource)) {
          return prevSelectedResources.filter(r => r !== resource);
        }

        // Otherwise, add it to the list. (or create a new list if multiSelection is false)
        return multiSelection
          ? [...prevSelectedResources, resource]
          : [resource];
      });
    },
    [multiSelection]
  );

  React.useEffect(
    () => {
      if (onResourcesSelected) {
        onResourcesSelected(selectedResources);
      }
    },
    [selectedResources, onResourcesSelected]
  );

  return (
    <Column expand noMargin useFullHeight>
      <LineStackLayout>
        <Column expand noMargin>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => {}}
            placeholder={t`Search resources`}
          />
        </Column>
      </LineStackLayout>
      {!searchResults ? (
        <PlaceholderLoader />
      ) : (
        <ProjectResourcesList
          project={project}
          searchResults={searchResults}
          selectedResources={selectedResources}
          onSelectResource={onSelectResource}
        />
      )}
    </Column>
  );
};

export default ProjectResourcesChooser;
