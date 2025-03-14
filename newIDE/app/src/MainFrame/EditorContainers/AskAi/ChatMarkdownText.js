// @flow
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { I18n } from '@lingui/react';
import classNames from 'classnames';
import Window from '../../../Utils/Window';
import memoize from '../../../Utils/Memoize';
import { useRefWithInit } from '../../../Utils/UseRefInitHook';
import { getHelpLink } from '../../../Utils/HelpLink';
import { ExtensionStoreContext } from '../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { IconContainer } from '../../../UI/IconContainer';

const gd: libGDevelop = global.gd;

type ConceptMetadata = {|
  iconSrc: string,
  description: string,
  name: string,
  helpPath: string,
|};

type ConceptLinkProps = {|
  conceptMetadata: ConceptMetadata,
|};

const ConceptLink = ({ conceptMetadata }: ConceptLinkProps) => {
  return (
    <span
      style={{
        fontWeight: 600,
        alignItems: 'baseline',
        cursor: 'pointer',
        display: 'inline-flex',
        gap: 4,
      }}
      href={'#'}
      onClick={event => {
        event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
        Window.openExternalURL(getHelpLink(conceptMetadata.helpPath));
      }}
    >
      <IconContainer
        alt={conceptMetadata.name}
        src={conceptMetadata.iconSrc}
        size={16}
      />
      {conceptMetadata.name}
    </span>
  );
};

const useGetConceptMetadata = () => {
  const { extensionShortHeadersByName } = React.useContext(
    ExtensionStoreContext
  );

  const getActionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const metadata = gd.MetadataProvider.getActionMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
        return {
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getSmallIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      const extensionName = type.split('::')[0] || '';
      const extensionShortHeader = extensionShortHeadersByName[extensionName];
      if (extensionShortHeader) {
        return {
          name: extensionShortHeader.fullName,
          description: extensionShortHeader.shortDescription,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: 'TODO',
          // TODO: add support for finding real object name, description and icon in the short headers.
        };
      }

      return {
        name: type,
        description: '',
        iconSrc: '',
        helpPath: '',
      };
    });
  }).current;
  const getConditionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const metadata = gd.MetadataProvider.getConditionMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
        return {
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getSmallIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      const extensionName = type.split('::')[0] || '';
      const extensionShortHeader = extensionShortHeadersByName[extensionName];
      if (extensionShortHeader) {
        return {
          name: extensionShortHeader.fullName,
          description: extensionShortHeader.shortDescription,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: 'TODO',
          // TODO: add support for finding real object name, description and icon in the short headers.
        };
      }

      return {
        name: type,
        description: '',
        iconSrc: '',
        helpPath: '',
      };
    });
  }).current;
  const getObjectMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const metadata = gd.MetadataProvider.getObjectMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadObjectMetadata(metadata)) {
        return {
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      const extensionName = type.split('::')[0] || '';
      const extensionShortHeader = extensionShortHeadersByName[extensionName];
      if (extensionShortHeader) {
        return {
          name: extensionShortHeader.fullName,
          description: extensionShortHeader.shortDescription,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: 'TODO',
          // TODO: add support for finding real object name, description and icon in the short headers.
        };
      }

      return {
        name: type,
        description: '',
        iconSrc: '',
        helpPath: '',
      };
    });
  }).current;
  const getBehaviorMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      console.log('getting behavior metadata', type);
      const metadata = gd.MetadataProvider.getBehaviorMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadBehaviorMetadata(metadata)) {
        return {
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      const extensionName = type.split('::')[0] || '';
      const extensionShortHeader = extensionShortHeadersByName[extensionName];
      if (extensionShortHeader) {
        return {
          name: extensionShortHeader.fullName,
          description: extensionShortHeader.shortDescription,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: 'TODO',
          // TODO: add support for finding real object name, description and icon in the short headers.
        };
      }

      return {
        name: type,
        description: '',
        iconSrc: '',
        helpPath: '',
      };
    });
  }).current;

  return {
    getConceptMetadataFromHref: React.useCallback(
      (href: string): ConceptMetadata | null => {
        if (href.startsWith('action:')) {
          return getActionMetadata(href.replace('action:', ''));
        }
        if (href.startsWith('condition:')) {
          return getConditionMetadata(href.replace('condition:', ''));
        }
        if (href.startsWith('object_type:')) {
          return getObjectMetadata(href.replace('object_type:', ''));
        }
        if (href.startsWith('behavior_type:')) {
          return getBehaviorMetadata(href.replace('behavior_type:', ''));
        }

        return null;
      },
      [
        getActionMetadata,
        getBehaviorMetadata,
        getConditionMetadata,
        getObjectMetadata,
      ]
    ),
  };
};

type Props = {|
  source?: string,
|};

/**
 * Display a markdown text for a AI chat bubble.
 */
export const ChatMarkdownText = (props: Props) => {
  const { getConceptMetadataFromHref } = useGetConceptMetadata();
  const markdownCustomComponents = React.useMemo(
    () => ({
      a: props => {
        const originalHref =
          (props.node && props.node.properties && props.node.properties.href) ||
          '';

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
      },
      img: ({ node, ...props }) => (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img style={{ display: 'flex' }} {...props} />
      ),
    }),
    [getConceptMetadataFromHref]
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
  });

  return <span className={className}>{markdownElement}</span>;
};
