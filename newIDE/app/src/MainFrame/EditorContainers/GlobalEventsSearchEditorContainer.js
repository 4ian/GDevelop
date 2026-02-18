// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { makeStyles } from '@material-ui/styles';
import SearchBar from '../../UI/SearchBar';
import { Column, Line, Spacer } from '../../UI/Grid';
import Text from '../../UI/Text';
import InlineCheckbox from '../../UI/InlineCheckbox';
import Background from '../../UI/Background';
import { Accordion, AccordionBody, AccordionHeader } from '../../UI/Accordion';
import RaisedButton from '../../UI/RaisedButton';
import Chip from '../../UI/Chip';
import SceneIcon from '../../UI/CustomSvgIcons/Scene';
import ExternalEventsIcon from '../../UI/CustomSvgIcons/ExternalEvents';
import ExtensionIcon from '../../UI/CustomSvgIcons/Extension';
import SearchIcon from '../../UI/CustomSvgIcons/Search';
import {
  scanProjectForGlobalEventsSearch,
  type GlobalSearchGroup,
  type GlobalSearchMatch,
} from '../../Utils/EventsGlobalSearchScanner';
import { highlightSearchText } from '../../Utils/HighlightSearchText';
import type {
  RenderEditorContainerProps,
  RenderEditorContainerPropsWithRef,
  SceneEventsOutsideEditorChanges,
  InstancesOutsideEditorChanges,
  ObjectsOutsideEditorChanges,
  ObjectGroupsOutsideEditorChanges,
} from './BaseEditor';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type HotReloadSteps } from '../../EmbeddedGame/EmbeddedGameFrame';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  scrollableContent: {
    flex: 1,
    overflow: 'auto',
    padding: '12px 16px 0 16px',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  searchInLabel: {
    opacity: 0.7,
  },
  searchButton: {
    marginLeft: 8,
  },
  resultsArea: {
    marginTop: '8px',
  },
  searchQueryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    marginBottom: 8,
    borderRadius: 4,
    border: '1px solid var(--event-sheet-conditions-border-color, #e2e2e2)',
    background: 'var(--event-sheet-conditions-background-color, #f1f2f209)',
  },
  searchQueryLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    opacity: 0.6,
    letterSpacing: '0.05em',
    fontFamily: 'var(--gdevelop-classic-font-family)',
  },
  searchQueryText: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--gdevelop-classic-font-family)',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
  },
  // Accordion header
  groupHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  groupHeaderIcon: {
    opacity: 0.7,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    fontSize: 28,
    fontFamily: 'var(--gdevelop-classic-font-family)',
  },
  matchCountChip: {
    height: 20,
    fontSize: 12,
    flexShrink: 0,
  },
  // Event-sheet-like row styles (non-pseudo parts)
  accordionGroupContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    gap: '8px',
  },
  eventRowIndicator: {
    width: 4,
    flexShrink: 0,
    background: 'var(--event-sheet-rst-move-handle-background-color, #a3b1c0)',
  },
  eventRowColumns: {
    display: 'flex',
    flex: 1,
    minHeight: 32,
    minWidth: 0,
  },
  eventRowConditions: {
    flex: '0 0 40%',
    background: 'var(--event-sheet-conditions-background-color, #f1f2f2)',
    color: 'var(--event-sheet-conditions-color, black)',
    borderRight:
      '1px solid var(--event-sheet-conditions-border-right-color, #e2e2e2)',
    padding: '6px 10px',
    fontSize: 13,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowActions: {
    flex: 1,
    background: 'var(--event-sheet-actions-background-color, #FFFFFF)',
    color: 'var(--event-sheet-actions-color, black)',
    padding: '6px 10px',
    fontSize: 13,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowConditionsFull: {
    flex: 1,
    background: 'var(--event-sheet-conditions-background-color, #f1f2f2)',
    color: 'var(--event-sheet-conditions-color, black)',
    padding: '6px 10px',
    fontSize: 13,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowActionsFull: {
    flex: 1,
    background: 'var(--event-sheet-actions-background-color, #FFFFFF)',
    color: 'var(--event-sheet-actions-color, black)',
    padding: '6px 10px',
    fontSize: 13,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowOther: {
    flex: 1,
    background: 'var(--event-sheet-actions-background-color, #FFFFFF)',
    color: 'var(--event-sheet-actions-color, black)',
    padding: '6px 10px',
    fontSize: 13,
    overflow: 'hidden',
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
  },
  eventRowText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '20px',
    flex: 1,
    minWidth: 0,
    fontFamily: 'var(--gdevelop-classic-font-family) !important',
    fontSize: '16px',
  },
  searchMatchText: {
    backgroundColor: 'rgba(252, 100, 33, 0.25)',
    borderRadius: 2,
    padding: '0 2px',
  },
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: 12,
    opacity: 0.5,
  },
  emptyStateIcon: {
    fontSize: 48,
    opacity: 0.4,
  },
  noMatchesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    gap: 8,
    opacity: 0.6,
  },
};

const useEventRowStyles = makeStyles({
  eventRow: {
    cursor: 'pointer',
    display: 'flex',
    borderBottom:
      '1px solid var(--event-sheet-conditions-border-color, #e2e2e2)',
    marginBottom: 3,
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

type MatchesListProps = {|
  children: (eventRowClassName: string) => React.Node,
|};

const MatchesList = ({ children }: MatchesListProps) => {
  const classes = useEventRowStyles();
  return <>{children(classes.eventRow)}</>;
};

type State = {|
  inputs: {|
    searchText: string,
    matchCase: boolean,
    searchInConditions: boolean,
    searchInActions: boolean,
    searchInEventStrings: boolean,
    searchInEventSentences: boolean,
    includeStoreExtensions: boolean,
  |},
  groups: Array<GlobalSearchGroup>,
  expandedGroups: { [id: string]: boolean },
  hasSearched: boolean,
  lastSearchText: string,
|};

const getEventPathLabel = (path: Array<number>) =>
  path.length ? path.map(index => index + 1).join(' > ') : '-';

const deduplicateEventPaths = (
  matches: Array<GlobalSearchMatch>
): Array<Array<number>> => {
  const uniquePathByKey = new Map<string, Array<number>>();
  matches.forEach(match => {
    const key = match.eventPath.join('.');
    if (!uniquePathByKey.has(key)) {
      uniquePathByKey.set(key, match.eventPath);
    }
  });
  return [...uniquePathByKey.values()];
};

const getMatchContext = (match: any): string =>
  match.context || `Match at event path ${getEventPathLabel(match.eventPath)}`;

type ParsedContext = {|
  type: 'standard' | 'condition-only' | 'action-only' | 'other',
  conditionText: string,
  actionText: string,
|};

const parseMatchContext = (text: string): ParsedContext => {
  const ifThenPrefix = /^if\s+/i;
  const thenSeparator = /\s+then\s+/i;
  if (ifThenPrefix.test(text) && thenSeparator.test(text)) {
    const withoutIf = text.replace(ifThenPrefix, '');
    const split = withoutIf.split(thenSeparator);
    if (split.length >= 2) {
      return {
        type: 'standard',
        conditionText: split[0],
        actionText: split.slice(1).join(' then '),
      };
    }
  }

  if (/^Condition:\s/i.test(text)) {
    return {
      type: 'condition-only',
      conditionText: text.replace(/^Condition:\s/i, ''),
      actionText: '',
    };
  }
  if (/^Action:\s/i.test(text)) {
    return {
      type: 'action-only',
      conditionText: '',
      actionText: text.replace(/^Action:\s/i, ''),
    };
  }

  return { type: 'other', conditionText: text, actionText: '' };
};

const getGroupIcon = (group: GlobalSearchGroup): React.Node => {
  switch (group.targetType) {
    case 'layout':
      return <SceneIcon />;
    case 'external-events':
      return <ExternalEventsIcon />;
    case 'extension':
      return <ExtensionIcon />;
    default:
      return null;
  }
};

export class GlobalEventsSearchEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  state: State = {
    inputs: {
      searchText: '',
      matchCase: false,
      searchInConditions: true,
      searchInActions: true,
      searchInEventStrings: true,
      searchInEventSentences: true,
      includeStoreExtensions: false,
    },
    groups: [],
    expandedGroups: {},
    hasSearched: false,
    lastSearchText: '',
  };

  componentDidMount() {
    if (this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive && this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  updateToolbar() {
    if (this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  onEventsBasedObjectChildrenEdited() {
    // Nothing to do.
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    // Nothing to do.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // Nothing to do.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // Nothing to do.
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    // Nothing to do.
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {
    // Nothing to do.
  }

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // Nothing to do.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // Nothing to do.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // Nothing to do.
  }

  _launchSearch = () => {
    const { project } = this.props;
    if (!project) return;

    const groups = scanProjectForGlobalEventsSearch(project, this.state.inputs);
    const expandedGroups: { [string]: boolean } = {};
    groups.forEach(group => {
      expandedGroups[group.id] = true;
    });
    this.setState({
      groups,
      expandedGroups,
      hasSearched: true,
      lastSearchText: this.state.inputs.searchText,
    });
  };

  _navigateToMatch = (
    group: GlobalSearchGroup,
    focusedEventPath: Array<number>
  ) => {
    if (group.targetType === 'extension') {
      this.props.onNavigateToEventFromGlobalSearch({
        locationType: 'extension',
        name: group.extensionName,
        eventPath: focusedEventPath,
        highlightedEventPaths: deduplicateEventPaths(group.matches),
        searchText: this.state.lastSearchText,
        extensionName: group.extensionName,
        functionName: group.functionName,
        behaviorName: group.behaviorName || undefined,
        objectName: group.objectName || undefined,
      });
    } else {
      this.props.onNavigateToEventFromGlobalSearch({
        locationType: group.targetType,
        name: group.name,
        eventPath: focusedEventPath,
        highlightedEventPaths: deduplicateEventPaths(group.matches),
        searchText: this.state.lastSearchText,
      });
    }
  };

  _renderMatchRow = (
    match: GlobalSearchMatch,
    group: GlobalSearchGroup,
    index: number,
    eventRowClassName: string
  ): React.MixedElement => {
    const context = getMatchContext(match);
    const parsed = parseMatchContext(context);
    const searchText = this.state.lastSearchText;

    return (
      <div
        key={match.id}
        className={eventRowClassName}
        onClick={() => this._navigateToMatch(group, match.eventPath)}
        role="button"
        tabIndex={0}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            this._navigateToMatch(group, match.eventPath);
          }
        }}
      >
        <div style={styles.eventRowIndicator} />
        <div style={styles.eventRowColumns}>
          <div style={styles.eventRowConditions}>
            <span style={styles.eventRowText}>
              {highlightSearchText(parsed.conditionText, searchText, {
                style: styles.searchMatchText,
              })}
            </span>
          </div>
          <div style={styles.eventRowActions}>
            <span style={styles.eventRowText}>
              {highlightSearchText(parsed.actionText, searchText, {
                style: styles.searchMatchText,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  _renderGroup = (group: GlobalSearchGroup): React.Node => {
    const totalMatches = group.matches.length;

    return (
      <Accordion
        key={group.id}
        expanded={!!this.state.expandedGroups[group.id]}
        onChange={(event, open) => {
          this.setState(state => ({
            expandedGroups: {
              ...state.expandedGroups,
              [group.id]: open,
            },
          }));
        }}
        noMargin
      >
        <AccordionHeader
          actions={[
            <Chip
              key="count"
              size="small"
              variant="outlined"
              color="secondary"
              label={
                totalMatches === 1 ? (
                  <Trans>1 match</Trans>
                ) : (
                  <Trans>{totalMatches} matches</Trans>
                )
              }
              style={styles.matchCountChip}
            />,
          ]}
        >
          <div style={styles.groupHeaderContent}>
            <div style={styles.groupHeaderIcon}>{getGroupIcon(group)}</div>
            <Text
              noMargin
              allowSelection
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              size="block-title"
            >
              {group.label}
            </Text>
          </div>
        </AccordionHeader>
        <AccordionBody disableGutters>
          <MatchesList>
            {eventRowClassName => (
              <Column noMargin expand>
                {group.matches.map((match, index) =>
                  this._renderMatchRow(match, group, index, eventRowClassName)
                )}
              </Column>
            )}
          </MatchesList>
        </AccordionBody>
      </Accordion>
    );
  };

  render(): null | React.MixedElement {
    const { project } = this.props;

    if (!project) {
      return null;
    }

    const { inputs, groups, hasSearched } = this.state;
    const hasSearchText = !!inputs.searchText.trim();
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
                    value={inputs.searchText}
                    onChange={searchText =>
                      this.setState(state => ({
                        inputs: { ...state.inputs, searchText },
                      }))
                    }
                    onRequestSearch={() => this._launchSearch()}
                    placeholder={t`Search in all event sheets...`}
                  />
                </Column>
                <RaisedButton
                  // $FlowFixMe[incompatible-type]
                  style={styles.searchButton}
                  disabled={!hasSearchText}
                  primary
                  label={<Trans>Search</Trans>}
                  onClick={this._launchSearch}
                />
              </Line>

              <div style={styles.optionsRow}>
                <InlineCheckbox
                  label={<Trans>Case insensitive</Trans>}
                  checked={!inputs.matchCase}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: { ...state.inputs, matchCase: !checked },
                    }))
                  }
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
                  checked={inputs.searchInConditions}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: { ...state.inputs, searchInConditions: checked },
                    }))
                  }
                />
                <InlineCheckbox
                  label={<Trans>Actions</Trans>}
                  checked={inputs.searchInActions}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: { ...state.inputs, searchInActions: checked },
                    }))
                  }
                />
                <InlineCheckbox
                  label={<Trans>Texts</Trans>}
                  checked={inputs.searchInEventStrings}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: {
                        ...state.inputs,
                        searchInEventStrings: checked,
                      },
                    }))
                  }
                />
                <InlineCheckbox
                  label={<Trans>Event sentences</Trans>}
                  checked={inputs.searchInEventSentences}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: {
                        ...state.inputs,
                        searchInEventSentences: checked,
                      },
                    }))
                  }
                />
                <InlineCheckbox
                  label={<Trans>Include store extensions</Trans>}
                  checked={inputs.includeStoreExtensions}
                  onCheck={(e, checked) =>
                    this.setState(state => ({
                      inputs: {
                        ...state.inputs,
                        includeStoreExtensions: checked,
                      },
                    }))
                  }
                />
              </div>
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
                      <span>"{this.state.lastSearchText}"</span>
                      <Text noMargin size="body-small" color="secondary">
                        <Trans>
                          Found {totalMatchCount}{' '}
                          {totalMatchCount === 1 ? 'match' : 'matches'} in{' '}
                          {groups.length}{' '}
                          {groups.length === 1 ? 'event sheet' : 'event sheets'}
                        </Trans>
                      </Text>
                    </span>
                  </div>
                  {groups.map(group => this._renderGroup(group))}
                </div>
              )}
            </div>
          </div>
        </Background>
      </div>
    );
  }
}

export const renderGlobalEventsSearchEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GlobalEventsSearchEditorContainer {...props} />;
