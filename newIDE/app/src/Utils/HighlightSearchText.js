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

export type TextStyle = {
  startIndex: number,
  endIndex: number,
  props: {
    className?: string,
    style?: { +[key: string]: string | number },
  },
  key: string,
  children?: Array<TextStyle>,
};

export const getHighlightSearchTextParts = (
  text: string,
  searchText: ?string,
  spanProps?: HighlightSpanProps
): Array<TextStyle> => {
  const query = searchText ? searchText.trim() : '';
  if (!query) return [];

  const matchCase = spanProps?.matchCase ?? false;
  const flags = matchCase ? 'g' : 'gi';
  const regex = new RegExp(`(${escapeRegExpForSearch(query)})`, flags);

  const { matchCase: _matchCase, ...spanPropsForDom } = spanProps || {};
  const props: {
    className?: string,
    style?: { +[key: string]: string | number },
  } =
    spanProps && (spanProps.className != null || spanProps.style != null)
      ? spanPropsForDom
      : { className: GLOBAL_SEARCH_MATCH_CLASS_NAME };

  let nextCharacterIndex = 0;
  const parts: Array<TextStyle> = [];
  for (const match of text.matchAll(regex)) {
    if (nextCharacterIndex < match.index) {
      parts.push({
        startIndex: nextCharacterIndex,
        endIndex: match.index,
        props: {},
        key: `${query}-${parts.length}`,
      });
    }
    const endIndex = match.index + match[0].length;
    parts.push({
      startIndex: match.index,
      endIndex,
      props,
      key: `${query}-${parts.length}`,
    });
    nextCharacterIndex = endIndex;
  }
  if (nextCharacterIndex < text.length) {
    parts.push({
      startIndex: nextCharacterIndex,
      endIndex: text.length,
      props: {},
      key: `${query}-${parts.length}`,
    });
  }
  return parts;
};

export const renderStylizedText = (
  text: string,
  parts: Array<TextStyle>
): React.Node => {
  if (parts.length === 0) {
    return text;
  }
  return parts.map(({ startIndex, endIndex, props, key, children }, index) => (
    <span key={key} {...props}>
      {children
        ? renderStylizedText(text, children)
        : text.substring(startIndex, endIndex)}
    </span>
  ));
};

export const mergeStylizedText = (
  parts: Array<TextStyle>,
  subParts: Array<TextStyle>
): Array<TextStyle> => {
  if (parts.length === 0) {
    return subParts;
  }
  if (subParts.length === 0) {
    return parts;
  }
  const mergedParts: Array<TextStyle> = [];
  let subPartsIndex = 0;
  for (const part of parts) {
    if (part.children) {
      throw new Error('Unimplemented');
    }
    const children = [];
    do {
      const subPart = subParts[subPartsIndex];
      children.push({
        ...subPart,
        startIndex: Math.max(subPart.startIndex, part.startIndex),
        endIndex: Math.min(subPart.endIndex, part.endIndex),
      });
      subPartsIndex++;
    } while (
      subPartsIndex < subParts.length &&
      subParts[subPartsIndex].startIndex < part.endIndex
    );
    if (
      subPartsIndex === subParts.length ||
      subParts[subPartsIndex].startIndex > part.endIndex
    ) {
      subPartsIndex--;
    }
    mergedParts.push({ ...part, children });
  }
  return mergedParts;
};

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
  const parts = getHighlightSearchTextParts(text, searchText, spanProps);
  if (parts.length === 0) {
    return text;
  }
  return renderStylizedText(
    text,
    getHighlightSearchTextParts(text, searchText, spanProps)
  );
};
