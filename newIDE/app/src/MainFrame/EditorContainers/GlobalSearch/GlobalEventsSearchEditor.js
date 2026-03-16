// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import SearchBar, { type SearchBarInterface } from '../../../UI/SearchBar';
import { Column, Line } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import Background from '../../../UI/Background';
import RaisedButton from '../../../UI/RaisedButton';
import IconButton from '../../../UI/IconButton';
import SearchIcon from '../../../UI/CustomSvgIcons/Search';
import MatchCase from '../../../UI/CustomSvgIcons/MatchCase';
import Filter from '../../../UI/CustomSvgIcons/Filter';
import ElementWithMenu from '../../../UI/Menu/ElementWithMenu';
import DotBadge from '../../../UI/DotBadge';
import {
  scanProjectForGlobalEventsSearch,
  type GlobalSearchGroup,
} from '../../../Utils/EventsGlobalSearchScanner';
import type { NavigateToEventFromGlobalSearchParams } from '../../../Utils/Search';
import {
  GlobalSearchContextProvider,
  type GlobalSearchContextType,
} from './GlobalSearchContext';
import { useSearchForm } from './useSearchForm';
import { deduplicateEventPaths } from './utils';
import { styles } from './styles';
import { GroupList } from './GroupList';
import {
  ResponsiveLineStackLayout,
  LineStackLayout,
  ColumnStackLayout,
} from '../../../UI/Layout';
import Paper from '../../../UI/Paper';
import ScrollView from '../../../UI/ScrollView';
import { EmptyPlaceholder } from '../../../UI/EmptyPlaceholder';
import type { EventPath } from '../../../Utils/EventPath';
import Cross from '../../../UI/CustomSvgIcons/Cross';

type GlobalEventsSearchEditorProps = {|
  project: gdProject,
  onNavigateToEventFromGlobalSearch: (
    params: NavigateToEventFromGlobalSearchParams
  ) => void,
|};

export type GlobalEventsSearchEditorInterface = {|
  focusInitialField: () => void,
|};

export const GlobalEventsSearchEditor: React.ComponentType<{
  ...GlobalEventsSearchEditorProps,
  +ref?: React.RefSetter<GlobalEventsSearchEditorInterface>,
}> = React.forwardRef<
  GlobalEventsSearchEditorProps,
  GlobalEventsSearchEditorInterface
>(
  ({ project, onNavigateToEventFromGlobalSearch }, ref): React.Node => {
    const searchBarRef = React.useRef<?SearchBarInterface>(null);

    React.useImperativeHandle(ref, () => ({
      focusInitialField: () => {
        if (searchBarRef.current) {
          searchBarRef.current.focus();
        }
      },
    }));

    const [groups, setGroups] = React.useState<Array<GlobalSearchGroup>>([]);

    const {
      search,
      setSearch,
      searchFiltersState,
      setSearchFiltersState,
      freezedSearchState,
      setFreezedSearchState,
      hasSearched,
      setHasSearched,
    } = useSearchForm();

    const launchSearch = (searchText: string) => {
      setSearch(searchText);
      const groups = scanProjectForGlobalEventsSearch(project, {
        searchText,
        searchFilterParams: searchFiltersState,
      });
      setGroups(groups);
      setHasSearched(true);
      setFreezedSearchState({
        searchFilterParams: searchFiltersState,
        searchText,
      });
    };

    const navigateToMatch = React.useCallback(
      (group: GlobalSearchGroup, focusedEventPath: EventPath) => {
        let params: NavigateToEventFromGlobalSearchParams = {
          locationType: group.targetType,
          name: group.name || '',
          eventPath: focusedEventPath,
          highlightedEventPaths: deduplicateEventPaths(group.matches),
          searchText: freezedSearchState.searchText,
          searchFilterParams: {
            matchCase: freezedSearchState.searchFilterParams.matchCase,
            searchInConditions:
              freezedSearchState.searchFilterParams.searchInConditions,
            searchInActions:
              freezedSearchState.searchFilterParams.searchInActions,
            searchInEventStrings:
              freezedSearchState.searchFilterParams.searchInEventStrings,
            searchInInstructionNames:
              freezedSearchState.searchFilterParams.searchInInstructionNames,
          },
        };

        if (group.targetType === 'extension') {
          params = {
            ...params,
            locationType: 'extension',
            name: group.extensionName,
            extensionName: group.extensionName,
            functionName: group.functionName,
            behaviorName: group.behaviorName || undefined,
            objectName: group.objectName || undefined,
          };
        }

        onNavigateToEventFromGlobalSearch(params);
      },
      [
        freezedSearchState.searchFilterParams.matchCase,
        freezedSearchState.searchFilterParams.searchInActions,
        freezedSearchState.searchFilterParams.searchInConditions,
        freezedSearchState.searchFilterParams.searchInEventStrings,
        freezedSearchState.searchFilterParams.searchInInstructionNames,
        freezedSearchState.searchText,
        onNavigateToEventFromGlobalSearch,
      ]
    );

    const globalSearchContextValue = React.useMemo<GlobalSearchContextType>(
      () => ({
        navigateToMatch,
        searchText: freezedSearchState.searchText,
        matchCase: freezedSearchState.searchFilterParams.matchCase,
      }),
      [
        navigateToMatch,
        freezedSearchState.searchFilterParams.matchCase,
        freezedSearchState.searchText,
      ]
    );

    const hasSearchText = !!search.trim();
    const totalMatchCount = groups.reduce(
      (sum, group) => sum + group.matches.length,
      0
    );

    return (
      <Background maxWidth>
        <LineStackLayout expand useFullHeight>
          <ColumnStackLayout expand useFullHeight noOverflowParent>
            <LineStackLayout noMargin>
              <Column expand noMargin>
                <SearchBar
                  ref={searchBarRef}
                  value={search}
                  onChange={setSearch}
                  onRequestSearch={launchSearch}
                  placeholder={t`Search in all event sheets...`}
                  autoFocus="desktop"
                />
              </Column>
              <RaisedButton
                disabled={!hasSearchText}
                primary
                label={<Trans>Search</Trans>}
                onClick={() => launchSearch(search)}
              />
              <LineStackLayout noMargin alignItems="center">
                <IconButton
                  size="small"
                  tooltip={t`Match case`}
                  selected={searchFiltersState.matchCase}
                  onClick={() =>
                    setSearchFiltersState(prev => ({
                      ...prev,
                      matchCase: !prev.matchCase,
                    }))
                  }
                >
                  <MatchCase />
                </IconButton>
                <ElementWithMenu
                  element={
                    <IconButton size="small" tooltip={t`Search filters`}>
                      <DotBadge
                        overlap="circle"
                        color="error"
                        invisible={
                          searchFiltersState.searchInConditions ||
                          searchFiltersState.searchInActions ||
                          searchFiltersState.searchInEventStrings
                        }
                      >
                        <Filter />
                      </DotBadge>
                    </IconButton>
                  }
                  buildMenuTemplate={(i18n: I18nType) => [
                    {
                      type: 'checkbox',
                      label: i18n._(t`Conditions`),
                      checked: searchFiltersState.searchInConditions,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          searchInConditions: !prev.searchInConditions,
                        })),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Actions`),
                      checked: searchFiltersState.searchInActions,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          searchInActions: !prev.searchInActions,
                        })),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Texts`),
                      checked: searchFiltersState.searchInEventStrings,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          searchInEventStrings: !prev.searchInEventStrings,
                        })),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Event sentences`),
                      checked: searchFiltersState.searchInEventSentences,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          searchInEventSentences: !prev.searchInEventSentences,
                        })),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Internal instruction names`),
                      checked: searchFiltersState.searchInInstructionNames,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          searchInInstructionNames: !prev.searchInInstructionNames,
                        })),
                    },
                    { type: 'separator' },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Include store extensions`),
                      checked: searchFiltersState.includeStoreExtensions,
                      click: () =>
                        setSearchFiltersState(prev => ({
                          ...prev,
                          includeStoreExtensions: !prev.includeStoreExtensions,
                        })),
                    },
                  ]}
                />
              </LineStackLayout>
            </LineStackLayout>
            <ScrollView>
              {!hasSearched ? (
                <div style={styles.emptyStateContainer}>
                  <SearchIcon style={styles.emptyStateIcon} />
                  <Text noMargin align="center" color="secondary">
                    <Trans>
                      Enter a query and press Search to find matches across all
                      event sheets in your project.
                    </Trans>
                  </Text>
                </div>
              ) : groups.length === 0 ? (
                <EmptyPlaceholder
                  title={
                    <Trans>
                      No matches found for "{freezedSearchState.searchText}".
                    </Trans>
                  }
                  description={
                    <Trans>
                      Try different search terms or check your search options.
                    </Trans>
                  }
                  actionLabel={<Trans>Clear search</Trans>}
                  actionIcon={<Cross />}
                  onAction={() => setSearch('')}
                />
              ) : (
                <ColumnStackLayout expand noMargin>
                  <Paper variant="outlined" background="light">
                    <Line expand>
                      <Column expand>
                        <ResponsiveLineStackLayout
                          justifyContent="space-between"
                          alignItems="center"
                          noMargin
                        >
                          <ResponsiveLineStackLayout
                            noMargin
                            alignItems="center"
                          >
                            <Text noMargin size="body" color="secondary">
                              <Trans>Results for:</Trans>
                            </Text>
                            <Text noMargin size="body" color="primary">
                              "{freezedSearchState.searchText}"
                            </Text>
                          </ResponsiveLineStackLayout>
                          <Text noMargin size="body-small" color="secondary">
                            {totalMatchCount === 1 && groups.length === 1 ? (
                              <Trans>Found 1 match in 1 event sheet</Trans>
                            ) : totalMatchCount === 1 ? (
                              <Trans>
                                Found 1 match in {groups.length} event sheets
                              </Trans>
                            ) : groups.length === 1 ? (
                              <Trans>
                                Found {totalMatchCount} matches in 1 event sheet
                              </Trans>
                            ) : (
                              <Trans>
                                Found {totalMatchCount} matches in{' '}
                                {groups.length} event sheets
                              </Trans>
                            )}
                          </Text>
                        </ResponsiveLineStackLayout>
                      </Column>
                    </Line>
                  </Paper>
                  <GlobalSearchContextProvider.Provider
                    value={globalSearchContextValue}
                  >
                    <GroupList groups={groups} />
                  </GlobalSearchContextProvider.Provider>
                </ColumnStackLayout>
              )}
            </ScrollView>
          </ColumnStackLayout>
        </LineStackLayout>
      </Background>
    );
  }
);
