// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import SearchBar from '../../../UI/SearchBar';
import { Column, Line, Spacer } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import InlineCheckbox from '../../../UI/InlineCheckbox';
import Background from '../../../UI/Background';
import RaisedButton from '../../../UI/RaisedButton';
import SearchIcon from '../../../UI/CustomSvgIcons/Search';
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
import type { EventPath } from '../../../Types/EventPath';

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
    frezeSearchedState,
    setFrezeSearchedState,
    hasSearched,
    setHasSearched,
  } = useSearchForm();

  const handleChangeCheckBoxesForm = (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const name = target.name;
    // $FlowFixMe[incompatible-type]
    setCheckBoxesState(prevState => ({
      ...prevState,
      // $FlowFixMe[invalid-computed-prop]
      [name]: !prevState[name],
    }));
  };

  const launchSearch = () => {
    const groups = scanProjectForGlobalEventsSearch(project, {
      searchText: search,
      ...checkBoxesState,
    });
    setGroups(groups);
    setHasSearched(true);
    setFrezeSearchedState({ ...checkBoxesState, searchText: search });
  };

  const navigateToMatch = React.useCallback(
    (group: GlobalSearchGroup, focusedEventPath: EventPath) => {
      let params: NavigateToEventFromGlobalSearchParams = {
        locationType: group.targetType,
        name: group.name || '',
        eventPath: focusedEventPath,
        highlightedEventPaths: deduplicateEventPaths(group.matches),
        searchText: frezeSearchedState.searchText,
        matchCase: frezeSearchedState.matchCase,
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
      frezeSearchedState.searchText,
      frezeSearchedState.matchCase,
      onNavigateToEventFromGlobalSearch,
    ]
  );

  const globalSearchContextValue = React.useMemo<GlobalSearchContextType>(
    () => ({
      navigateToMatch,
      searchText: frezeSearchedState.searchText,
      matchCase: frezeSearchedState.matchCase,
    }),
    [
      navigateToMatch,
      frezeSearchedState.matchCase,
      frezeSearchedState.searchText,
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
        <div style={styles.scrollableContent}>
          <div>
            <Line noMargin expand>
              <Column expand noMargin>
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  onRequestSearch={launchSearch}
                  placeholder={t`Search in all event sheets...`}
                />
              </Column>
              <RaisedButton
                // $FlowFixMe[incompatible-type]
                style={styles.searchButton}
                disabled={!hasSearchText}
                primary
                label={<Trans>Search</Trans>}
                onClick={launchSearch}
              />
            </Line>
            <form
              style={styles.optionsRow}
              onChange={handleChangeCheckBoxesForm}
            >
              <InlineCheckbox
                label={<Trans>Case insensitive</Trans>}
                name={'matchCase'}
                checked={!checkBoxesState.matchCase}
              />
              <Spacer />
              <Text
                noMargin
                size="body-small"
                color="secondary"
                // $FlowFixMe[incompatible-type]
                style={styles.searchInLabel}
              >
                <Trans>Search in:</Trans>
              </Text>
              <InlineCheckbox
                label={<Trans>Conditions</Trans>}
                name={'searchInConditions'}
                checked={checkBoxesState.searchInConditions}
              />
              <InlineCheckbox
                label={<Trans>Actions</Trans>}
                name={'searchInActions'}
                checked={checkBoxesState.searchInActions}
              />
              <InlineCheckbox
                label={<Trans>Texts</Trans>}
                name={'searchInEventStrings'}
                checked={checkBoxesState.searchInEventStrings}
              />
              <InlineCheckbox
                label={<Trans>Event sentences</Trans>}
                name={'searchInEventSentences'}
                checked={checkBoxesState.searchInEventSentences}
              />
              <InlineCheckbox
                label={<Trans>Include store extensions</Trans>}
                name={'includeStoreExtensions'}
                checked={checkBoxesState.includeStoreExtensions}
              />
            </form>
          </div>

          <div style={styles.resultsArea}>
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
              <div style={styles.noMatchesContainer}>
                <Text noMargin align="center">
                  <Trans>No matches found.</Trans>
                </Text>
                <Text
                  noMargin
                  size="body-small"
                  color="secondary"
                  align="center"
                >
                  <Trans>
                    Try different search terms or check your search options.
                  </Trans>
                </Text>
              </div>
            ) : (
              <div style={styles.accordionGroupContainer}>
                <div style={styles.searchQueryHeader}>
                  <span style={styles.searchQueryLabel}>
                    <Trans>Search:</Trans>
                  </span>
                  <span style={styles.searchQueryText}>
                    <span>"{frezeSearchedState.searchText}"</span>
                    <Text noMargin size="body-small" color="secondary">
                      {`Found ${totalMatchCount} ${
                        totalMatchCount === 1 ? 'match' : 'matches'
                      } in ${groups.length} ${
                        groups.length === 1 ? 'event sheet' : 'event sheets'
                      }`}
                    </Text>
                  </span>
                </div>
                <GlobalSearchContextProvider.Provider
                  value={globalSearchContextValue}
                >
                  <GroupList groups={groups} />
                </GlobalSearchContextProvider.Provider>
              </div>
            )}
          </div>
        </div>
      </Background>
    </div>
  );
};
