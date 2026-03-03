// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import SearchBar from '../../../UI/SearchBar';
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
import type { NavigateToEventFromGlobalSearchParams } from '../BaseEditor';
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
import type { EventPath } from '../../../Types/EventPath';
import Cross from '../../../UI/CustomSvgIcons/Cross';

type GlobalEventsSearchEditorProps = {|
  project: gdProject,
  onNavigateToEventFromGlobalSearch: (
    params: NavigateToEventFromGlobalSearchParams
  ) => void,
|};

export const GlobalEventsSearchEditor = ({
  project,
  onNavigateToEventFromGlobalSearch,
}: GlobalEventsSearchEditorProps): React.Node => {
  const [groups, setGroups] = React.useState<Array<GlobalSearchGroup>>([]);

  const {
    search,
    setSearch,
    checkBoxesState,
    setCheckBoxesState,
    freezedSearchState,
    setFreezedSearchState,
    hasSearched,
    setHasSearched,
  } = useSearchForm();

  const launchSearch = () => {
    const groups = scanProjectForGlobalEventsSearch(project, {
      searchText: search,
      ...checkBoxesState,
    });
    setGroups(groups);
    setHasSearched(true);
    setFreezedSearchState({ ...checkBoxesState, searchText: search });
  };

  const navigateToMatch = React.useCallback(
    (group: GlobalSearchGroup, focusedEventPath: EventPath) => {
      let params: NavigateToEventFromGlobalSearchParams = {
        locationType: group.targetType,
        name: group.name || '',
        eventPath: focusedEventPath,
        highlightedEventPaths: deduplicateEventPaths(group.matches),
        searchText: freezedSearchState.searchText,
        matchCase: freezedSearchState.matchCase,
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
      freezedSearchState.searchText,
      freezedSearchState.matchCase,
      onNavigateToEventFromGlobalSearch,
    ]
  );

  const globalSearchContextValue = React.useMemo<GlobalSearchContextType>(
    () => ({
      navigateToMatch,
      searchText: freezedSearchState.searchText,
      matchCase: freezedSearchState.matchCase,
    }),
    [
      navigateToMatch,
      freezedSearchState.matchCase,
      freezedSearchState.searchText,
    ]
  );

  const hasSearchText = !!search.trim();
  const totalMatchCount = groups.reduce(
    (sum, group) => sum + group.matches.length,
    0
  );

  return (
    <div style={styles.container}>
      <Background maxWidth>
        <ColumnStackLayout expand useFullHeight>
          <LineStackLayout noMargin>
            <Column expand noMargin>
              <SearchBar
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
              onClick={launchSearch}
            />
          </LineStackLayout>
          <LineStackLayout noMargin alignItems="center">
            <IconButton
              size="small"
              tooltip={t`Match case`}
              selected={checkBoxesState.matchCase}
              onClick={() =>
                setCheckBoxesState(prev => ({
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
                      checkBoxesState.searchInConditions ||
                      checkBoxesState.searchInActions ||
                      checkBoxesState.searchInEventStrings
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
                  checked: checkBoxesState.searchInConditions,
                  click: () =>
                    setCheckBoxesState(prev => ({
                      ...prev,
                      searchInConditions: !prev.searchInConditions,
                    })),
                },
                {
                  type: 'checkbox',
                  label: i18n._(t`Actions`),
                  checked: checkBoxesState.searchInActions,
                  click: () =>
                    setCheckBoxesState(prev => ({
                      ...prev,
                      searchInActions: !prev.searchInActions,
                    })),
                },
                {
                  type: 'checkbox',
                  label: i18n._(t`Texts`),
                  checked: checkBoxesState.searchInEventStrings,
                  click: () =>
                    setCheckBoxesState(prev => ({
                      ...prev,
                      searchInEventStrings: !prev.searchInEventStrings,
                    })),
                },
                {
                  type: 'checkbox',
                  label: i18n._(t`Event sentences`),
                  checked: checkBoxesState.searchInEventSentences,
                  click: () =>
                    setCheckBoxesState(prev => ({
                      ...prev,
                      searchInEventSentences: !prev.searchInEventSentences,
                    })),
                },
                { type: 'separator' },
                {
                  type: 'checkbox',
                  label: i18n._(t`Include store extensions`),
                  checked: checkBoxesState.includeStoreExtensions,
                  click: () =>
                    setCheckBoxesState(prev => ({
                      ...prev,
                      includeStoreExtensions: !prev.includeStoreExtensions,
                    })),
                },
              ]}
            />
          </LineStackLayout>
          <ScrollView expand>
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
                        <ResponsiveLineStackLayout noMargin alignItems="center">
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
                              Found {totalMatchCount} matches in {groups.length}{' '}
                              event sheets
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
      </Background>
    </div>
  );
};
