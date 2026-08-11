// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import prettier from 'prettier/standalone';
import babylonParser from 'prettier/parser-babylon';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import CompactSearchBar from '../UI/CompactSearchBar';
import CopyIcon from '../UI/CustomSvgIcons/Copy';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';

// Pretty-print the generated JavaScript (it comes out essentially minified).
// Falls back to the original code if it cannot be parsed (e.g. partial code).
const formatJavaScript = (code: string): string => {
  try {
    return prettier.format(code, {
      parser: 'babylon',
      plugins: [babylonParser],
    });
  } catch (e) {
    return code;
  }
};

const styles = {
  searchActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    width: 520,
    maxWidth: '45vw',
  },
  searchBarContainer: {
    flex: 1,
    minWidth: 160,
  },
  searchResultsText: {
    minWidth: 72,
    textAlign: 'center',
  },
  // Scrollable, monospace, read-only view of the generated JavaScript.
  code: {
    margin: 0,
    padding: 8,
    overflow: 'auto',
    whiteSpace: 'pre',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 13,
    lineHeight: 1.4,
    // Fill the flex-column dialog body so it gets its own scrollbar.
    flex: 1,
    minHeight: 0,
    userSelect: 'text',
  },
  searchMatch: {
    backgroundColor: 'rgba(252, 100, 33, 0.25)',
    borderRadius: 2,
    color: 'inherit',
    padding: '0 1px',
  },
  activeSearchMatch: {
    backgroundColor: 'rgba(252, 100, 33, 0.55)',
    outline: '1px solid rgba(252, 100, 33, 0.9)',
  },
};

type SearchMatch = {|
  start: number,
  end: number,
|};

const getSearchMatches = (text: string, query: string): Array<SearchMatch> => {
  if (!query.trim()) return [];

  const lowercaseText = text.toLowerCase();
  const lowercaseQuery = query.toLowerCase();
  const matches = [];
  let startIndex = 0;
  let matchIndex = lowercaseText.indexOf(lowercaseQuery, startIndex);
  while (matchIndex !== -1) {
    matches.push({
      start: matchIndex,
      end: matchIndex + query.length,
    });
    startIndex = matchIndex + query.length;
    matchIndex = lowercaseText.indexOf(lowercaseQuery, startIndex);
  }

  return matches;
};

const renderCodeWithSearchHighlights = ({
  code,
  searchMatches,
  activeSearchMatchIndex,
  activeSearchMatchRef,
}: {|
  code: string,
  searchMatches: Array<SearchMatch>,
  activeSearchMatchIndex: number,
  activeSearchMatchRef: React.RefObject<?HTMLElement>,
|}): React.Node => {
  if (!searchMatches.length) return code;

  const parts: Array<React.Node> = [];
  let currentIndex = 0;
  searchMatches.forEach((match, index) => {
    if (currentIndex < match.start) {
      parts.push(code.substring(currentIndex, match.start));
    }

    const isActive = index === activeSearchMatchIndex;
    parts.push(
      <mark
        key={`search-match-${index}`}
        ref={isActive ? activeSearchMatchRef : null}
        style={{
          ...styles.searchMatch,
          ...(isActive ? styles.activeSearchMatch : {}),
        }}
      >
        {code.substring(match.start, match.end)}
      </mark>
    );
    currentIndex = match.end;
  });

  if (currentIndex < code.length) {
    parts.push(code.substring(currentIndex));
  }

  return parts;
};

type Props = {|
  /** The displayed scene/events name, for the dialog title. */
  name: string,
  /** The generated JavaScript code, or null while/if generation failed. */
  code: ?string,
  /** An error message if code generation failed. */
  error?: ?string,
  /**
   * True when the code is the whole behavior/object (all its functions), because
   * GDevelop cannot generate a single behavior/object method in isolation.
   */
  isWholeEntity?: boolean,
  onClose: () => void,
|};

/**
 * A read-only dialog showing the JavaScript code GDevelop generates for a
 * scene's events (the same code path used for previews/exports), with a button
 * to copy it to the clipboard.
 */
const GeneratedCodeDialog = ({
  name,
  code,
  error,
  isWholeEntity,
  onClose,
}: Props): React.Node => {
  const [justCopied, setJustCopied] = React.useState(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const [
    activeSearchMatchIndex,
    setActiveSearchMatchIndex,
  ] = React.useState<number>(0);
  const activeSearchMatchRef = React.useRef<?HTMLElement>(null);

  // Format once per code change.
  const formattedCode = React.useMemo(
    () => (code ? formatJavaScript(code) : null),
    [code]
  );
  const searchMatches = React.useMemo(
    () => (formattedCode ? getSearchMatches(formattedCode, searchText) : []),
    [formattedCode, searchText]
  );

  React.useEffect(
    () => {
      if (activeSearchMatchIndex >= searchMatches.length) {
        setActiveSearchMatchIndex(0);
      }
    },
    [activeSearchMatchIndex, searchMatches.length]
  );

  React.useEffect(
    () => {
      const activeSearchMatch = activeSearchMatchRef.current;
      if (activeSearchMatch) {
        activeSearchMatch.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    },
    [activeSearchMatchIndex, searchMatches.length]
  );

  const goToSearchMatch = React.useCallback(
    (step: number) => {
      if (!searchMatches.length) return;

      setActiveSearchMatchIndex(
        currentIndex =>
          (currentIndex + step + searchMatches.length) % searchMatches.length
      );
    },
    [searchMatches.length]
  );

  const onSearchTextChange = React.useCallback((newSearchText: string) => {
    setSearchText(newSearchText);
    setActiveSearchMatchIndex(0);
  }, []);

  const onSearchKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<>) => {
      event.stopPropagation();

      if (event.key === 'Escape') {
        if (searchText) {
          setSearchText('');
          setActiveSearchMatchIndex(0);
        } else {
          onClose();
        }
        event.preventDefault();
      }
    },
    [onClose, searchText]
  );

  const onCopy = React.useCallback(
    () => {
      if (!formattedCode) return;
      try {
        navigator.clipboard.writeText(formattedCode);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      } catch (e) {
        // Clipboard not available — ignore (the text is still selectable).
      }
    },
    [formattedCode]
  );

  const titleActions =
    formattedCode && !error ? (
      <div style={styles.searchActions} onKeyDown={onSearchKeyDown}>
        <div style={styles.searchBarContainer}>
          <CompactSearchBar
            value={searchText}
            onChange={onSearchTextChange}
            onRequestSearch={() => goToSearchMatch(1)}
            placeholder={t`Search code`}
          />
        </div>
        {searchText ? (
          <div style={styles.searchResultsText}>
            <Text noMargin size="body-small">
              {searchMatches.length ? (
                `${activeSearchMatchIndex + 1}/${searchMatches.length}`
              ) : (
                <Trans>No results</Trans>
              )}
            </Text>
          </div>
        ) : null}
        <IconButton
          size="small"
          tooltip={t`Previous result`}
          disabled={!searchMatches.length}
          onClick={() => goToSearchMatch(-1)}
        >
          <ChevronArrowLeft />
        </IconButton>
        <IconButton
          size="small"
          tooltip={t`Next result`}
          disabled={!searchMatches.length}
          onClick={() => goToSearchMatch(1)}
        >
          <ChevronArrowRight />
        </IconButton>
      </div>
    ) : null;

  return (
    <Dialog
      // The scene name is composed outside the translated string: it is a
      // dynamic value (and a new message may not be in the compiled catalog yet,
      // which would otherwise show a literal "{name}").
      title={
        <>
          <Trans>Generated JavaScript for</Trans> {name}
        </>
      }
      maxWidth="lg"
      fullHeight
      flexColumnBody
      open
      onRequestClose={onClose}
      titleActions={titleActions}
      actions={[
        <FlatButton
          key="copy"
          leftIcon={<CopyIcon />}
          label={justCopied ? <Trans>Copied!</Trans> : <Trans>Copy code</Trans>}
          onClick={onCopy}
          disabled={!formattedCode}
        />,
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
    >
      {error ? (
        <Text>
          <Trans>Could not generate the code.</Trans>
          {'\n'}
          {error}
        </Text>
      ) : (
        <>
          {isWholeEntity && (
            <Text noMargin color="secondary">
              <Trans>
                This is the complete generated code for the behavior or object
                (all of its functions), as GDevelop generates them together.
              </Trans>
            </Text>
          )}
          <pre style={styles.code}>
            {formattedCode
              ? renderCodeWithSearchHighlights({
                  code: formattedCode,
                  searchMatches,
                  activeSearchMatchIndex,
                  activeSearchMatchRef,
                })
              : formattedCode}
          </pre>
        </>
      )}
    </Dialog>
  );
};

export default GeneratedCodeDialog;
