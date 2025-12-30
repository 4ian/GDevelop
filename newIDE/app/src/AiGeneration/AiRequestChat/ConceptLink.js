// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Window from '../../Utils/Window';
import memoize from '../../Utils/Memoize';
import { useRefWithInit } from '../../Utils/UseRefInitHook';
import { getHelpLink } from '../../Utils/HelpLink';
import { ExtensionStoreContext } from '../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { IconContainer } from '../../UI/IconContainer';
import {
  type ExtensionShortHeader,
  type EventsFunctionInsideExtensionShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { mapFor } from '../../Utils/MapFor';
import classes from './ChatMarkdownText.module.css';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { MarkdownText } from '../../UI/MarkdownText';
import Text from '../../UI/Text';

const gd: libGDevelop = global.gd;

type ConceptKind =
  | 'Action'
  | 'Condition'
  | 'Event'
  | 'Expression'
  | 'Object'
  | 'Behavior'
  | 'Extension';

export type ConceptMetadata = {|
  kind: ConceptKind,
  iconSrc: string,
  description: string,
  name: string,
  helpPath: string,
  alreadyAvailableInProject?: boolean,
  parentExtension?: ConceptMetadata | null,
  parentObject?: ConceptMetadata | null,
  parentBehavior?: ConceptMetadata | null,
|};

type ConceptLinkProps = {|
  forceNoLink?: true,
  conceptMetadata: ConceptMetadata | null | void,
|};

const getConceptKindLabel = (kind: ConceptKind): React.Node | null => {
  switch (kind) {
    case 'Action':
      return <Trans>This is an action.</Trans>;
    case 'Condition':
      return <Trans>This is a condition.</Trans>;
    case 'Event':
      return <Trans>This is an event.</Trans>;
    case 'Expression':
      return <Trans>This is an expression.</Trans>;
    case 'Object':
      return <Trans>This is an object.</Trans>;
    case 'Behavior':
      return <Trans>This is a behavior.</Trans>;
    case 'Extension':
      return <Trans>This is an extension.</Trans>;
    default:
      return null;
  }
};

const ConceptIconAndName = ({
  conceptMetadata,
}: {|
  conceptMetadata: ConceptMetadata | null | void,
|}) => {
  if (!conceptMetadata) return null;

  return (
    <>
      {conceptMetadata.iconSrc && (
        <IconContainer alt="" src={conceptMetadata.iconSrc} size={16} />
      )}
      {conceptMetadata.name}
    </>
  );
};

const getConceptParent = (conceptMetadata: ConceptMetadata) => {
  // Check first for object or behavior parent:
  if (conceptMetadata.parentObject) {
    return (
      <Trans>
        It is part of object{' '}
        <ConceptLink
          forceNoLink
          conceptMetadata={conceptMetadata.parentObject}
        />{' '}
        from extension{' '}
        <ConceptLink
          forceNoLink
          conceptMetadata={conceptMetadata.parentObject.parentExtension}
        />
        .
      </Trans>
    );
  }
  if (conceptMetadata.parentBehavior) {
    return (
      <Trans>
        It is part of behavior{' '}
        <ConceptLink
          forceNoLink
          conceptMetadata={conceptMetadata.parentBehavior}
        />{' '}
        from extension{' '}
        <ConceptLink
          forceNoLink
          conceptMetadata={conceptMetadata.parentBehavior.parentExtension}
        />
        .
      </Trans>
    );
  }
  // Display the parent extension if no object or behavior parent was found:
  if (conceptMetadata.parentExtension) {
    return (
      <Trans>
        It is part of extension{' '}
        <ConceptLink
          forceNoLink
          conceptMetadata={conceptMetadata.parentExtension}
        />{' '}
        {conceptMetadata.parentExtension.alreadyAvailableInProject ? (
          <Trans>(already installed in the project)</Trans>
        ) : (
          <Trans>(install it from the Project Manager)</Trans>
        )}
        .
      </Trans>
    );
  }

  return null;
};

/**
 * A link to a GDevelop concept.
 */
export const ConceptLink = ({
  conceptMetadata,
  forceNoLink,
}: ConceptLinkProps) => {
  if (!conceptMetadata) return null;

  const helpLink = forceNoLink ? '' : getHelpLink(conceptMetadata.helpPath);
  const conceptParent = getConceptParent(conceptMetadata);

  return (
    <Tooltip
      title={[
        <Text color="inherit" key="kind">
          <b>{getConceptKindLabel(conceptMetadata.kind)}</b>
        </Text>,
        conceptMetadata.alreadyAvailableInProject !== undefined ? (
          <Text color="inherit" key="alreadyAvailableInProject">
            {conceptMetadata.alreadyAvailableInProject ? (
              <Trans>It is already installed/available in the project.</Trans>
            ) : (
              <Trans>You can install it from the Project Manager.</Trans>
            )}
          </Text>
        ) : null,
        conceptParent ? (
          <Text color="inherit" key="parent">
            {conceptParent}
          </Text>
        ) : null,
        <MarkdownText source={conceptMetadata.description} key="description" />,
      ]}
      placement="bottom"
      PopperProps={{
        modifiers: {
          offset: {
            enabled: true,
            /**
             * It does not seem possible to get the tooltip closer to the anchor
             * when positioned on top. So it is positioned on bottom with a negative offset.
             */
            offset: '0,-10',
          },
        },
      }}
    >
      <a
        className={classNames({
          [classes.conceptLink]: true,
          [classes.noValidLink]: !helpLink,
        })}
        href={helpLink}
        onClick={event => {
          event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
          Window.openExternalURL(helpLink);
        }}
      >
        <ConceptIconAndName conceptMetadata={conceptMetadata} />
      </a>
    </Tooltip>
  );
};

const findEventsBasedObjectInExtensions = (
  extensionShortHeadersByName: { [name: string]: ExtensionShortHeader },
  type: string
) => {
  const typeParts = type.split('::');
  const extensionName = typeParts[0] || '';
  const objectType = typeParts[1] || '';
  const extensionShortHeader = extensionShortHeadersByName[extensionName];

  if (!extensionShortHeader) {
    return { extensionShortHeader: null, eventsBasedObject: null };
  }
  const eventsBasedObject = (
    extensionShortHeader.eventsBasedObjects || []
  ).find(({ name }) => name === objectType);

  return {
    extensionShortHeader,
    eventsBasedObject,
  };
};

const findEventsBasedBehaviorInExtensions = (
  extensionShortHeadersByName: { [name: string]: ExtensionShortHeader },
  type: string
) => {
  const typeParts = type.split('::');
  const extensionName = typeParts[0] || '';
  const behaviorType = typeParts[1] || '';
  const extensionShortHeader = extensionShortHeadersByName[extensionName];

  if (!extensionShortHeader) {
    return { extensionShortHeader: null, eventsBasedBehavior: null };
  }
  const eventsBasedBehavior = (
    extensionShortHeader.eventsBasedBehaviors || []
  ).find(({ name }) => name === behaviorType);

  return {
    extensionShortHeader,
    eventsBasedBehavior,
  };
};

const findEventsFunctionInExtensions = (
  extensionShortHeadersByName: { [name: string]: ExtensionShortHeader },
  type: string
) => {
  const typeParts = type.split('::');
  const extensionName = typeParts[0] || '';
  const objectOrBehaviorOrFunctionType = typeParts[1] || '';
  const functionType = typeParts[2] || '';
  const extensionShortHeader = extensionShortHeadersByName[extensionName];

  if (!extensionShortHeader) {
    return {
      extensionShortHeader: null,
      eventsBasedBehavior: null,
      eventsBasedObject: null,
      eventsFunction: null,
    };
  }

  const findInEventsFunctionArray = (
    eventsFunctions: EventsFunctionInsideExtensionShortHeader[],
    name: string
  ) => {
    return (
      eventsFunctions.find(eventsFunction => eventsFunction.name === name) ||
      null
    );
  };

  const eventsBasedObject = (
    extensionShortHeader.eventsBasedObjects || []
  ).find(({ name }) => name === objectOrBehaviorOrFunctionType);
  if (eventsBasedObject) {
    return {
      extensionShortHeader,
      eventsBasedObject,
      eventsBasedBehavior: null,
      eventsFunction: findInEventsFunctionArray(
        eventsBasedObject.eventsFunctions,
        functionType
      ),
    };
  }

  const eventsBasedBehavior = (
    extensionShortHeader.eventsBasedBehaviors || []
  ).find(({ name }) => name === objectOrBehaviorOrFunctionType);
  if (eventsBasedBehavior) {
    return {
      extensionShortHeader,
      eventsBasedObject: null,
      eventsBasedBehavior,
      eventsFunction: findInEventsFunctionArray(
        eventsBasedBehavior.eventsFunctions,
        functionType
      ),
    };
  }

  return {
    extensionShortHeader,
    eventsBasedBehavior: null,
    eventsBasedObject: null,
    eventsFunction: findInEventsFunctionArray(
      extensionShortHeader.eventsFunctions || [],
      objectOrBehaviorOrFunctionType
    ),
  };
};

/**
 * Gives a function that parses an url into a link to a GDevelop concept.
 */
export const useGetConceptMetadata = () => {
  const {
    translatedExtensionShortHeadersByName: extensionShortHeadersByName,
  } = React.useContext(ExtensionStoreContext);

  const getExtensionMetadata = useRefWithInit(() => {
    return memoize(
      (type: string): ConceptMetadata | null => {
        const platform = gd.JsPlatform.get();
        const platformExtensions = platform.getAllPlatformExtensions();

        const platformExtension =
          mapFor(0, platformExtensions.size(), i => {
            const extension = platformExtensions.at(i);
            if (extension.getName() === type) {
              return extension;
            }

            return null;
          }).filter(Boolean)[0] || null;

        if (platformExtension) {
          return {
            kind: 'Extension',
            name: platformExtension.getFullName(),
            description: platformExtension.getDescription(),
            iconSrc: platformExtension.getIconUrl(),
            helpPath: platformExtension.getHelpPath(),
            alreadyAvailableInProject: true,
          };
        }

        const extensionName = type;
        const extensionShortHeader = extensionShortHeadersByName[extensionName];
        if (extensionShortHeader) {
          return {
            kind: 'Extension',
            name: extensionShortHeader.fullName,
            description: extensionShortHeader.shortDescription,
            iconSrc: extensionShortHeader.previewIconUrl,
            helpPath: extensionShortHeader.helpPath,
            alreadyAvailableInProject: false,
          };
        }

        return null;
      }
    );
  }).current;
  const getObjectMetadata = useRefWithInit(() => {
    return memoize(
      (type: string): ConceptMetadata | null => {
        const {
          extensionShortHeader,
          eventsBasedObject,
        } = findEventsBasedObjectInExtensions(
          extensionShortHeadersByName,
          type
        );
        if (extensionShortHeader && eventsBasedObject) {
          return {
            kind: 'Object',
            name: eventsBasedObject.fullName,
            description: eventsBasedObject.description,
            iconSrc: extensionShortHeader.previewIconUrl,
            helpPath: extensionShortHeader.helpPath,
            parentExtension: getExtensionMetadata(extensionShortHeader.name),
          };
        }

        const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
          gd.JsPlatform.get(),
          type
        );
        const extension = extensionAndObjectMetadata.getExtension();
        const objectMetadata = extensionAndObjectMetadata.getMetadata();
        if (!gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
          return {
            kind: 'Object',
            name: objectMetadata.getFullName(),
            description: objectMetadata.getDescription(),
            iconSrc: objectMetadata.getIconFilename(),
            helpPath: getHelpLink(objectMetadata.getHelpPath()),
            parentExtension: getExtensionMetadata(extension.getName()),
          };
        }

        return null;
      }
    );
  }).current;
  const getBehaviorMetadata = useRefWithInit(() => {
    return memoize(
      (type: string): ConceptMetadata | null => {
        const {
          extensionShortHeader,
          eventsBasedBehavior,
        } = findEventsBasedBehaviorInExtensions(
          extensionShortHeadersByName,
          type
        );
        if (extensionShortHeader && eventsBasedBehavior) {
          return {
            kind: 'Behavior',
            name: eventsBasedBehavior.fullName,
            description: eventsBasedBehavior.description,
            iconSrc: extensionShortHeader.previewIconUrl,
            helpPath: extensionShortHeader.helpPath,
            parentExtension: getExtensionMetadata(extensionShortHeader.name),
          };
        }

        const extensionAndBehaviorMetadata = gd.MetadataProvider.getExtensionAndBehaviorMetadata(
          gd.JsPlatform.get(),
          type
        );
        const extension = extensionAndBehaviorMetadata.getExtension();
        const behaviorMetadata = extensionAndBehaviorMetadata.getMetadata();
        if (!gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
          return {
            kind: 'Behavior',
            name: behaviorMetadata.getFullName(),
            description: behaviorMetadata.getDescription(),
            iconSrc: behaviorMetadata.getIconFilename(),
            helpPath: getHelpLink(behaviorMetadata.getHelpPath()),
            parentExtension: getExtensionMetadata(extension.getName()),
          };
        }

        return null;
      }
    );
  }).current;
  const getActionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsBasedBehavior,
        eventsBasedObject,
        eventsFunction,
      } = findEventsFunctionInExtensions(extensionShortHeadersByName, type);

      if (extensionShortHeader && eventsFunction) {
        return {
          kind: 'Action',
          name: eventsFunction.fullName,
          description: eventsFunction.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
          parentBehavior: eventsBasedBehavior
            ? getBehaviorMetadata(
                extensionShortHeader.name + '::' + eventsBasedBehavior.name
              )
            : null,
          parentObject: eventsBasedObject
            ? getObjectMetadata(
                extensionShortHeader.name + '::' + eventsBasedObject.name
              )
            : null,
          parentExtension: getExtensionMetadata(extensionShortHeader.name),
        };
      }

      const metadata = gd.MetadataProvider.getActionMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
        return {
          kind: 'Action',
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getSmallIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      return null;
    });
  }).current;
  const getConditionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsBasedBehavior,
        eventsBasedObject,
        eventsFunction,
      } = findEventsFunctionInExtensions(extensionShortHeadersByName, type);
      if (extensionShortHeader && eventsFunction) {
        return {
          kind: 'Condition',
          name: eventsFunction.fullName,
          description: eventsFunction.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
          parentBehavior: eventsBasedBehavior
            ? getBehaviorMetadata(
                extensionShortHeader.name + '::' + eventsBasedBehavior.name
              )
            : null,
          parentObject: eventsBasedObject
            ? getObjectMetadata(
                extensionShortHeader.name + '::' + eventsBasedObject.name
              )
            : null,
          parentExtension: getExtensionMetadata(extensionShortHeader.name),
        };
      }

      const metadata = gd.MetadataProvider.getConditionMetadata(
        gd.JsPlatform.get(),
        type
      );
      if (!gd.MetadataProvider.isBadInstructionMetadata(metadata)) {
        return {
          kind: 'Condition',
          name: metadata.getFullName(),
          description: metadata.getDescription(),
          iconSrc: metadata.getSmallIconFilename(),
          helpPath: getHelpLink(metadata.getHelpPath()),
        };
      }

      return null;
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
        if (href.startsWith('extension:')) {
          return getExtensionMetadata(href.replace('extension:', ''));
        }

        return null;
      },
      [
        getActionMetadata,
        getBehaviorMetadata,
        getConditionMetadata,
        getObjectMetadata,
        getExtensionMetadata,
      ]
    ),
  };
};
