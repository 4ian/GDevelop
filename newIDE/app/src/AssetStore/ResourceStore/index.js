// @flow
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import ScrollView from '../../UI/ScrollView';
import { type Resource } from '../../Utils/GDevelopServices/Asset';
import { FiltersChooser } from '../../UI/Search/FiltersChooser';
import { ResourceStoreContext } from './ResourceStoreContext';
import { BoxSearchResults } from '../../UI/Search/BoxSearchResults';
import { ResourceCard } from './ResourceCard';
import Subheader from '../../UI/Subheader';
import { CategoryChooser } from '../../UI/Search/CategoryChooser';
import { t, Trans } from '@lingui/macro';
import Paper from '../../UI/Paper';

const styles = {
  paper: { width: 250 },
};

type Props = {
  onChoose: Resource => void,
  resourceKind: string,
};

export const ResourceStore = ({ onChoose, resourceKind }: Props) => {
  const {
    filters,
    searchResults,
    error,
    fetchResourcesAndFilters,
    filtersState,
    searchText,
    setSearchText,
  } = React.useContext(ResourceStoreContext);

  React.useEffect(
    () => {
      fetchResourcesAndFilters();
    },
    [fetchResourcesAndFilters]
  );

  const searchResultsForResourceKind = searchResults
    ? searchResults.filter(resource => resource.type === resourceKind)
    : null;

  return (
    <Column expand noMargin useFullHeight>
      <Line>
        <Column expand noMargin>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => {}}
            placeholder={t`Search resources`}
          />
        </Column>
      </Line>
      <Line
        expand
        overflow={
          'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
        }
        noMargin
      >
        <Column noMargin>
          <ScrollView>
            <Paper style={styles.paper} background="medium">
              <Subheader>
                <Trans>Categories</Trans>
              </Subheader>
              <CategoryChooser
                allItemsLabel={<Trans>All assets</Trans>}
                allFilters={filters}
                filtersState={filtersState}
                error={error}
              />
              <Subheader>
                <Trans>Filters</Trans>
              </Subheader>
              <FiltersChooser
                allFilters={filters}
                filtersState={filtersState}
                error={error}
              />
            </Paper>
          </ScrollView>
        </Column>
        <BoxSearchResults
          baseSize={128}
          spacing={8}
          onRetry={fetchResourcesAndFilters}
          error={error}
          searchItems={searchResultsForResourceKind}
          renderSearchItem={(resource, size) => (
            <ResourceCard
              size={size}
              resource={resource}
              onChoose={() => onChoose(resource)}
            />
          )}
        />
      </Line>
    </Column>
  );
};
