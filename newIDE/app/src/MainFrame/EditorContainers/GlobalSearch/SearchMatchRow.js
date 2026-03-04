// @flow
import * as React from 'react';
import type {
  GlobalSearchGroup,
  GlobalSearchMatch,
} from '../../../Utils/EventsGlobalSearchScanner';
import { highlightSearchText } from '../../../Utils/HighlightSearchText';
import { GlobalSearchContextProvider } from './GlobalSearchContext';
import { styles, useEventRowStyles } from './styles';

type SearchMatchRowProps = {|
  match: GlobalSearchMatch,
  group: GlobalSearchGroup,
|};

const truncate = (text: string, maxLength: number = 140): string =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;

export const SearchMatchRow: React.ComponentType<SearchMatchRowProps> = React.memo<SearchMatchRowProps>(
  ({ match, group }): React.MixedElement => {
    const { searchText, navigateToMatch, matchCase } = React.useContext(
      GlobalSearchContextProvider
    );
    const classes = useEventRowStyles();
    const { conditionText, actionText, otherText } = match.context;

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
          {otherText ? (
            <div style={styles.eventRowOther}>
              <span style={styles.eventRowText}>
                {highlightSearchText(truncate(otherText), searchText, {
                  style: styles.searchMatchText,
                  matchCase,
                })}
              </span>
            </div>
          ) : (
            <>
              <div style={styles.eventRowConditions}>
                <span style={styles.eventRowText}>
                  {highlightSearchText(truncate(conditionText), searchText, {
                    style: styles.searchMatchText,
                    matchCase,
                  })}
                </span>
              </div>
              <div style={styles.eventRowActions}>
                <span style={styles.eventRowText}>
                  {highlightSearchText(truncate(actionText), searchText, {
                    style: styles.searchMatchText,
                    matchCase,
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
