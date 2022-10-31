// @flow
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ThemeContext from './Theme/ThemeContext';
import classNames from 'classnames';

// Sensible defaults for react-markdown
const makeMarkdownCustomRenderers = (
  isStandaloneText: boolean,
  allowParagraphs: boolean
) => ({
  // Ensure link are opened in a new page
  root: props => (isStandaloneText ? <div {...props} /> : <span {...props} />),
  link: props =>
    props.href ? (
      <a href={props.href} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    ) : (
      props.children
    ),
  linkReference: props =>
    props.href ? (
      <a href={props.href} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    ) : (
      props.children
    ),
  // Add paragraphs only if we explictly opt in.
  paragraph: props =>
    isStandaloneText || allowParagraphs ? (
      <p>{props.children}</p>
    ) : (
      props.children
    ),
});

type Props = {|
  source?: string,
  translatableSource?: MessageDescriptor,
  isStandaloneText?: boolean,
  allowParagraphs?: boolean,
|};

/**
 * Display a markdown text
 */
export const MarkdownText = (props: Props) => {
  const gdevelopTheme = React.useContext(ThemeContext);
  const markdownCustomRenderers = React.useMemo(
    () =>
      makeMarkdownCustomRenderers(
        props.isStandaloneText || false,
        props.allowParagraphs || false
      ),
    [props.isStandaloneText, props.allowParagraphs]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ReactMarkdown
          escapeHtml
          children={
            props.translatableSource
              ? i18n._(props.translatableSource)
              : props.source
          }
          className={classNames({
            'gd-markdown': true,
            [gdevelopTheme.markdownRootClassName]: true,
            'standalone-text-container': props.isStandaloneText,
          })}
          renderers={markdownCustomRenderers}
        />
      )}
    </I18n>
  );
};
