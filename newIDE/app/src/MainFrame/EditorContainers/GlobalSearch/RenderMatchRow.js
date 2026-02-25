// @flow
import * as React from 'react';
import type {
  GlobalSearchGroup,
  GlobalSearchMatch,
} from '../../../Utils/EventsGlobalSearchScanner';
import { highlightSearchText } from '../../../Utils/HighlightSearchText';
import { GlobalSearchContextProvider } from './GlobalSearchContext';
import { styles, useEventRowStyles } from './styles';
import { getMatchContext, parseMatchContext } from './utils';

type RenderMatchRowProps = {|
  match: GlobalSearchMatch,
  group: GlobalSearchGroup,
|};

export const RenderMatchRow: React.ComponentType<RenderMatchRowProps> = React.memo<RenderMatchRowProps>(
  ({ match, group }): React.MixedElement => {
    const { searchText, navigateToMatch, matchCase } = React.useContext(
      GlobalSearchContextProvider
    );
    const classes = useEventRowStyles();
    const context = getMatchContext(match);
    const parsed = parseMatchContext(context);

    const handleClick = () => {
      navigateToMatch(group, match.eventPath);
    };

    const handleKeyPress = (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        handleClick();
      }
    };

    return (
      <div
        key={match.id}
        className={classes.eventRow}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={handleKeyPress}
      >
        <div style={styles.eventRowIndicator} />
        <div style={styles.eventRowColumns}>
          <div style={styles.eventRowConditions}>
            <span style={styles.eventRowText}>
              {highlightSearchText(parsed.conditionText, searchText, {
                style: styles.searchMatchText,
                matchCase,
              })}
            </span>
          </div>
          <div style={styles.eventRowActions}>
            <span style={styles.eventRowText}>
              {highlightSearchText(parsed.actionText, searchText, {
                style: styles.searchMatchText,
                matchCase,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
