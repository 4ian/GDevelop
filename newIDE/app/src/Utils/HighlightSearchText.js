// @flow
import * as React from 'react';

const GLOBAL_SEARCH_MATCH_CLASS_NAME = 'global-search-text-match';

/**
 * Escapes special regex characters in a string so it can be used
 * safely in a RegExp constructor.
 */
export const escapeRegExpForSearch = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type HighlightSpanProps = {|
  className?: string,
  style?: { +[key: string]: string | number },
  matchCase?: boolean,
|};

/**
 * Splits text by the search query and wraps each match in a span for highlighting.
 * Uses the same case-sensitivity as C++ EventsRefactorer::SearchInEvents:
 * - matchCase true: exact substring match (case-sensitive)
 * - matchCase false: Unicode case-insensitive match (RegExp 'i' flag, equivalent
 *   to C++ FindCaseInsensitive / utf8proc UTF8PROC_CASEFOLD)
 * Uses className "global-search-text-match" by default (styled in EventsSheet).
 * Pass spanProps to use custom styling (e.g. inline styles in contexts where the
 * CSS class is not available).
 */
export const highlightSearchText = (
  text: string,
  searchText: ?string,
  spanProps?: HighlightSpanProps
): React.Node => {
  const query = searchText ? searchText.trim() : '';
  if (!query) return text;

  const matchCase = spanProps?.matchCase ?? false;
  const flags = matchCase ? 'g' : 'gi';
  const regex = new RegExp(`(${escapeRegExpForSearch(query)})`, flags);
  const parts = text.split(regex);
  const { matchCase: _matchCase, ...spanPropsForDom } = spanProps || {};
  const props =
    spanProps && (spanProps.className != null || spanProps.style != null)
      ? spanPropsForDom
      : { className: GLOBAL_SEARCH_MATCH_CLASS_NAME };

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={`${part}-${index}`} {...props}>
        {part}
      </span>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
};
