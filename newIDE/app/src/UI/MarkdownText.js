// @flow
import * as React from 'react';
import ReactMarkdown from 'react-markdown';

// Sensible defaults for react-markdown
const makeMarkdownCustomRenderers = (useParagraphs: boolean) => ({
  // Ensure link are opened in a new page
  link: props => (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  ),
  // Add paragraphs only if we explictly opt in.
  paragraph: props =>
    useParagraphs ? <p>{props.children}</p> : props.children,
});

type Props = {|
  source: string,
  className?: ?string,
  useParagraphs?: boolean,
|};

/**
 * Display a markdown text
 */
export const MarkdownText = (props: Props) => {
  const markdownCustomRenderers = React.useMemo(
    () => makeMarkdownCustomRenderers(props.useParagraphs || false),
    [props.useParagraphs]
  );

  return (
    <ReactMarkdown
      escapeHtml
      source={props.source}
      className={props.className}
      renderers={markdownCustomRenderers}
    />
  );
};
