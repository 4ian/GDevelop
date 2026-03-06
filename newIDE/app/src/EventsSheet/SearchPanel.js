// @flow
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Background from '../UI/Background';
import TextField, { type TextFieldInterface } from '../UI/TextField';
import { Column, Line } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import {
  type SearchInEventsInputs,
  type ReplaceInEventsInputs,
} from './EventsSearcher';
import RaisedButton from '../UI/RaisedButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import {
  shouldBrowsePrevious,
  shouldCloseOrCancel,
  shouldValidate,
} from '../UI/KeyboardShortcuts/InteractionKeys';
import { Tabs } from '../UI/Tabs';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import Cross from '../UI/CustomSvgIcons/Cross';
import Filter from '../UI/CustomSvgIcons/Filter';
import MatchCase from '../UI/CustomSvgIcons/MatchCase';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import DotBadge from '../UI/DotBadge';
import { useShouldAutofocusInput } from '../UI/Responsive/ScreenTypeMeasurer';

type SearchTypeTab = 'search-and-replace' | 'search-in-event-sentences';

type Props = {|
  onSearchInEvents: SearchInEventsInputs => void,
  onReplaceInEvents: ReplaceInEventsInputs => void,
  onCloseSearchPanel: () => void,
  resultsCount: ?number,
  hasEventSelected: boolean,
  onGoToPreviousSearchResult: () => ?gdBaseEvent,
  onGoToNextSearchResult: () => ?gdBaseEvent,
  searchFocusOffset: ?number,
  initialSearchText?: string,
  initialMatchCase?: boolean,
  initialTab?: SearchTypeTab,
  initialSearchInConditions?: boolean,
  initialSearchInActions?: boolean,
  initialSearchInEventStrings?: boolean,
  initialSearchInInstructionNames?: boolean,
|};

export type SearchPanelInterface = {|
  focus: () => void,
  markSearchResultsDirty: () => void,
  isSearchOngoing: () => boolean,
|};

const SearchPanel = (
  {
    onSearchInEvents,
    onReplaceInEvents,
    onCloseSearchPanel,
    resultsCount,
    hasEventSelected,
    onGoToPreviousSearchResult,
    onGoToNextSearchResult,
    searchFocusOffset,
    initialSearchText,
    initialMatchCase,
    initialTab,
    initialSearchInConditions,
    initialSearchInActions,
    initialSearchInEventStrings,
    initialSearchInInstructionNames,
  }: Props,
  // $FlowFixMe[missing-local-annot]
  ref
) => {
  const { isMobile } = useResponsiveWindowSize();
  const searchTextField = React.useRef<?TextFieldInterface>(null);
  const replaceTextField = React.useRef<?TextFieldInterface>(null);

  const [searchText, setSearchText] = React.useState<string>('');
  const [replaceText, setReplaceText] = React.useState<string>('');
  const [matchCase, setMatchCase] = React.useState<boolean>(false);
  const [searchInActions, setSearchInActions] = React.useState<boolean>(true);
  const [searchInConditions, setSearchInConditions] = React.useState<boolean>(
    true
  );
  const [
    searchInEventStrings,
    setSearchInEventStrings,
  ] = React.useState<boolean>(true);
  const [
    searchInInstructionNames,
    setSearchInInstructionNames,
  ] = React.useState<boolean>(false);
  // eslint-disable-next-line no-unused-vars
  const [searchInSelection, setSearchInSelection] = React.useState<boolean>(
    false
  );
  const [searchResultsDirty, setSearchResultsDirty] = React.useState<boolean>(
    false
  );
  const [currentTab, setCurrentTab] = React.useState<SearchTypeTab>(
    'search-and-replace'
  );

  const isSearchOngoing = React.useCallback(
    (): boolean => {
      return !!searchText && !searchResultsDirty;
    },
    [searchText, searchResultsDirty]
  );

  const shouldAutofocusInput = useShouldAutofocusInput();

  const focusSearchField = React.useCallback((): void => {
    if (searchTextField.current) searchTextField.current.focus();
  }, []);
  const focusReplaceField = React.useCallback((): void => {
    if (replaceTextField.current) replaceTextField.current.focus();
  }, []);

  const markSearchResultsDirty = React.useCallback((): void => {
    setSearchResultsDirty(true);
  }, []);

  React.useImperativeHandle(ref, () => ({
    isSearchOngoing,
    focus: focusSearchField,
    markSearchResultsDirty,
  }));

  React.useEffect(
    () => {
      setSearchResultsDirty(true);
    },
    [
      searchText,
      searchInActions,
      searchInConditions,
      searchInEventStrings,
      searchInInstructionNames,
      matchCase,
    ]
  );

  React.useEffect(
    () => {
      if (shouldAutofocusInput) focusSearchField();
    },
    [currentTab, focusSearchField, shouldAutofocusInput]
  );
  React.useEffect(markSearchResultsDirty, [currentTab, markSearchResultsDirty]);

  // Sync external search state (e.g. from global search) into the panel
  React.useEffect(
    () => {
      if (initialSearchText !== undefined) {
        setSearchText(initialSearchText);
        setSearchResultsDirty(false); // Results already shown, Next/Prev work immediately
      }
      if (initialMatchCase !== undefined) {
        setMatchCase(initialMatchCase);
      }
      if (initialTab !== undefined) {
        setCurrentTab(initialTab);
      }
      if (initialSearchInConditions !== undefined) {
        setSearchInConditions(initialSearchInConditions);
      }
      if (initialSearchInActions !== undefined) {
        setSearchInActions(initialSearchInActions);
      }
      if (initialSearchInEventStrings !== undefined) {
        setSearchInEventStrings(initialSearchInEventStrings);
      }
      if (initialSearchInInstructionNames !== undefined) {
        setSearchInInstructionNames(initialSearchInInstructionNames);
      }
    },
    [
      initialSearchText,
      initialMatchCase,
      initialTab,
      initialSearchInConditions,
      initialSearchInActions,
      initialSearchInEventStrings,
      initialSearchInInstructionNames,
    ]
  );

  const launchSearch = () => {
    onSearchInEvents({
      searchInSelection,
      searchText,
      searchFilterParams: {
        matchCase,
        searchInActions,
        searchInConditions,
        searchInEventStrings,
        searchInInstructionNames,
        searchInEventSentences: !isSearchAndReplaceTab(),
      },
    });
  };

  const launchReplace = () => {
    onReplaceInEvents({
      searchInSelection,
      searchText,
      replaceText,
      matchCase,
      searchInActions,
      searchInConditions,
      searchInEventStrings,
    });
  };

  const launchSearchIfResultsDirty = () => {
    if (searchResultsDirty) {
      launchSearch();
      setSearchResultsDirty(false);
    }
  };

  const isSearchAndReplaceTab = React.useCallback(
    (): boolean => currentTab === 'search-and-replace',
    [currentTab]
  );

  const shouldDisableSearch = !searchText;
  const shouldDisableReplace =
    !searchText || (!hasEventSelected && searchInSelection);

  return (
    <Background noFullHeight noExpand>
      <Column noMargin>
        <Line>
          <Column expand noOverflowParent>
            <Tabs
              value={currentTab}
              onChange={setCurrentTab}
              options={[
                {
                  value: 'search-and-replace',
                  label: <Trans>Search and replace in parameters</Trans>,
                },
                {
                  value: 'search-in-event-sentences',
                  label: <Trans>Search in event sentences</Trans>,
                },
              ]}
              // Enforce scroll on very small screens, because the tabs have long names.
              variant={isMobile ? 'scrollable' : undefined}
            />
          </Column>
        </Line>
        <Line noMargin>
          <ColumnStackLayout expand>
            <LineStackLayout alignItems="baseline" noMargin>
              <TextField
                ref={searchTextField}
                margin="dense"
                endAdornment={
                  searchText ? (
                    <IconButton
                      onClick={() => {
                        setSearchText('');
                        if (shouldAutofocusInput) focusSearchField();
                      }}
                      edge="end"
                    >
                      <Cross fontSize="small" />
                    </IconButton>
                  ) : null
                }
                translatableHintText={
                  isSearchAndReplaceTab()
                    ? t`Text to search in parameters`
                    : t`Text to search in event sentences`
                }
                onChange={(e, searchText) => {
                  setSearchText(searchText);
                }}
                onKeyPress={event => {
                  if (shouldBrowsePrevious(event)) {
                    onGoToPreviousSearchResult();
                  } else if (shouldValidate(event)) {
                    if (!searchResultsDirty) {
                      onGoToNextSearchResult();
                    } else {
                      if (!shouldDisableSearch) launchSearchIfResultsDirty();
                    }
                  }
                }}
                onKeyUp={event => {
                  if (shouldCloseOrCancel(event)) {
                    onCloseSearchPanel();
                  }
                }}
                value={searchText}
                fullWidth
              />
              <RaisedButton
                disabled={shouldDisableSearch}
                primary
                label={<Trans>Search</Trans>}
                onClick={() => {
                  if (!searchResultsDirty) {
                    onGoToNextSearchResult();
                  } else {
                    launchSearchIfResultsDirty();
                  }
                }}
              />
            </LineStackLayout>
            {isSearchAndReplaceTab() && (
              <LineStackLayout alignItems="baseline" noMargin>
                <TextField
                  margin="dense"
                  ref={replaceTextField}
                  endAdornment={
                    replaceText ? (
                      <IconButton
                        onClick={() => {
                          setReplaceText('');
                          if (shouldAutofocusInput) focusReplaceField();
                        }}
                        edge="end"
                      >
                        <Cross fontSize="small" />
                      </IconButton>
                    ) : null
                  }
                  translatableHintText={t`Text to replace in parameters`}
                  onChange={(e, replaceText) => {
                    setReplaceText(replaceText);
                  }}
                  onKeyPress={event => {
                    if (shouldValidate(event)) {
                      if (!shouldDisableReplace) launchReplace();
                    }
                  }}
                  onKeyUp={event => {
                    if (shouldCloseOrCancel(event)) {
                      onCloseSearchPanel();
                    }
                  }}
                  value={replaceText}
                  fullWidth
                />
                <RaisedButton
                  disabled={shouldDisableReplace}
                  label={<Trans>Replace</Trans>}
                  onClick={launchReplace}
                />
              </LineStackLayout>
            )}
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                <IconButton
                  size="small"
                  tooltip={t`Match case`}
                  selected={matchCase}
                  onClick={() => setMatchCase(!matchCase)}
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
                          searchInConditions ||
                          searchInActions ||
                          searchInEventStrings
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
                      checked: searchInConditions,
                      click: () => setSearchInConditions(!searchInConditions),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Actions`),
                      checked: searchInActions,
                      click: () => setSearchInActions(!searchInActions),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Texts`),
                      checked: searchInEventStrings,
                      click: () =>
                        setSearchInEventStrings(!searchInEventStrings),
                    },
                    {
                      type: 'checkbox',
                      label: i18n._(t`Internal instruction names`),
                      checked: searchInInstructionNames,
                      click: () =>
                        setSearchInInstructionNames(!searchInInstructionNames),
                    },
                  ]}
                />
              </LineStackLayout>
              <Line noMargin alignItems="center" justifyContent="flex-end">
                <Text>
                  {resultsCount === null || resultsCount === undefined ? (
                    ''
                  ) : resultsCount === 0 ? (
                    <Trans>No results</Trans>
                  ) : searchFocusOffset === null ||
                    searchFocusOffset === undefined ? (
                    <Trans>{resultsCount} results</Trans>
                  ) : (
                    <Trans>
                      Showing {searchFocusOffset + 1} of {resultsCount}
                    </Trans>
                  )}
                </Text>
                <IconButton
                  disabled={!resultsCount}
                  onClick={() => {
                    onGoToPreviousSearchResult();
                  }}
                >
                  <ChevronArrowLeft />
                </IconButton>
                <IconButton
                  disabled={!resultsCount}
                  onClick={() => {
                    onGoToNextSearchResult();
                  }}
                >
                  <ChevronArrowRight />
                </IconButton>
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary={false}
                  onClick={() => {
                    onCloseSearchPanel();
                  }}
                />
              </Line>
            </LineStackLayout>
          </ColumnStackLayout>
        </Line>
      </Column>
    </Background>
  );
};

export default (React.forwardRef<Props, SearchPanelInterface>(
  SearchPanel
): React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<SearchPanelInterface>,
}>);
