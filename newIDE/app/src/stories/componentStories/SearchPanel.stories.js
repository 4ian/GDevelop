// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import SearchPanel from '../../EventsSheet/SearchPanel';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'SearchPanel',
};

export const DefaultNoSearchDone = (): React.Node => (
  <SearchPanel
    onSearchInEvents={() => {}}
    onReplaceInEvents={() => {}}
    resultsCount={null}
    hasEventSelected={false}
    onGoToNextSearchResult={action('next')}
    onGoToPreviousSearchResult={action('previous')}
    onCloseSearchPanel={() => {}}
    searchFocusOffset={null}
    initialSearchFilterParams={{}}
  />
);
DefaultNoSearchDone.storyName = 'default (no search done)';

export const DefaultNoResults = (): React.Node => (
  <SearchPanel
    onSearchInEvents={() => {}}
    onReplaceInEvents={() => {}}
    resultsCount={0}
    hasEventSelected={false}
    onGoToNextSearchResult={action('next')}
    onGoToPreviousSearchResult={action('previous')}
    onCloseSearchPanel={() => {}}
    searchFocusOffset={null}
    initialSearchFilterParams={{}}
  />
);
DefaultNoResults.storyName = 'default (no results)';

export const _3Results = (): React.Node => (
  <SearchPanel
    onSearchInEvents={() => {}}
    onReplaceInEvents={() => {}}
    resultsCount={3}
    hasEventSelected={false}
    onGoToNextSearchResult={action('next')}
    onGoToPreviousSearchResult={action('previous')}
    onCloseSearchPanel={() => {}}
    searchFocusOffset={null}
    initialSearchFilterParams={{}}
  />
);
_3Results.storyName = '3 results';

export const _3ResultsWithFocusOnTheSecond = (): React.Node => (
  <SearchPanel
    onSearchInEvents={() => {}}
    onReplaceInEvents={() => {}}
    resultsCount={3}
    hasEventSelected={false}
    onGoToNextSearchResult={action('next')}
    onGoToPreviousSearchResult={action('previous')}
    onCloseSearchPanel={() => {}}
    searchFocusOffset={1}
    initialSearchFilterParams={{}}
  />
);
_3ResultsWithFocusOnTheSecond.storyName = '3 results with focus on the second';
