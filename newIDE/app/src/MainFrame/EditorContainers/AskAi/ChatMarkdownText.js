// @flow
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { I18n } from '@lingui/react';
import classNames from 'classnames';
import Window from '../../../Utils/Window';
import { getHelpLink } from '../../../Utils/HelpLink';
import classes from './ChatMarkdownText.module.css';
import {
  type ConceptMetadata,
  ConceptLink,
  useGetConceptMetadata,
} from './ConceptLink';

type ChatLinkProps = {
  node?: { properties?: { href?: string } },
  href?: string,
  children: React.Node,
};

const makeRenderChatLink = ({
  getConceptMetadataFromHref,
}: {|
  getConceptMetadataFromHref: string => ConceptMetadata | null,
|}) => (props: ChatLinkProps) => {
  const originalHref =
    (props.node && props.node.properties && props.node.properties.href) || '';

  // Try to first recognize a link to a GDevelop concept or item.
  const conceptMetadata = getConceptMetadataFromHref(originalHref);
  if (conceptMetadata) {
    return <ConceptLink conceptMetadata={conceptMetadata} />;
  }

  // Otherwise, try to recognize a link to a GDevelop wiki page.
  const href =
    props.href && props.href.startsWith('/gdevelop5/')
      ? getHelpLink(props.href.replace('/gdevelop5/', '/'))
      : props.href;

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={event => {
        event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
        Window.openExternalURL(href);
      }}
    >
      {props.children}
    </a>
  ) : (
    props.children
  );
};

/**
 * Finds `[label](url)` patterns and splits them into plain text + <a> elements.
 * This does NOT interpret any other markdown syntax.
 */
function parseMarkdownLinks({
  text,
  renderLink,
}: {|
  text: string,
  renderLink: ChatLinkProps => React.Node,
|}) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const elements = [];

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text))) {
    // Push whatever text is before the link:
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const label = match[1];
    const url = match[2];
    elements.push(
      renderLink({ children: label, node: { properties: { href: url } } })
    );

    lastIndex = pattern.lastIndex;
  }

  // Push the remaining text (if any) after the last match:
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

type ChatCodeBlockWithChatLinksProps = {|
  inline?: boolean,
  children: React.Node,
|};

const makeRenderChatCodeBlockWithChatLinks = ({
  renderChatLink,
}: {|
  renderChatLink: ChatLinkProps => React.Node,
|}) => ({ inline, children, ...props }: ChatCodeBlockWithChatLinksProps) => {
  // If inline code (single backticks) – just render normally:
  if (inline) {
    return <code {...props}>{children}</code>;
  }

  // For fenced code blocks (triple backticks):
  const text = String(children);

  // Convert `[label](url)` substrings into an array of text + <a> elements:
  const parts = parseMarkdownLinks({ text, renderLink: renderChatLink });

  return <code {...props}>{parts}</code>;
};

type Props = {|
  source?: string,
|};

/**
 * Display a markdown text for a AI chat bubble.
 */
export const ChatMarkdownText = (props: Props) => {
  const { getConceptMetadataFromHref } = useGetConceptMetadata();
  const renderChatLink = React.useMemo(
    () => makeRenderChatLink({ getConceptMetadataFromHref }),
    [getConceptMetadataFromHref]
  );
  const renderChatCodeBlockWithChatLinks = React.useMemo(
    () => makeRenderChatCodeBlockWithChatLinks({ renderChatLink }),
    [renderChatLink]
  );

  const markdownCustomComponents = React.useMemo(
    () => ({
      a: renderChatLink,
      code: renderChatCodeBlockWithChatLinks,
      img: ({ node, ...props }) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img style={{ display: 'flex' }} {...props} />
      ),
    }),
    [renderChatLink, renderChatCodeBlockWithChatLinks]
  );

  const markdownElement = (
    <I18n>
      {({ i18n }) => (
        <ReactMarkdown
          components={markdownCustomComponents}
          remarkPlugins={[remarkGfm]}
        >
          {props.source}
        </ReactMarkdown>
      )}
    </I18n>
  );

  const className = classNames({
    'gd-markdown': true,
    [classes.chatMarkdown]: true,
  });

  return <span className={className}>{markdownElement}</span>;
};
