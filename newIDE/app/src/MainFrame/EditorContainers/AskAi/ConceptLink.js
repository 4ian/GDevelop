// @flow
import * as React from 'react';
import Window from '../../../Utils/Window';
import memoize from '../../../Utils/Memoize';
import { useRefWithInit } from '../../../Utils/UseRefInitHook';
import { getHelpLink } from '../../../Utils/HelpLink';
import { ExtensionStoreContext } from '../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { IconContainer } from '../../../UI/IconContainer';
import {
  type ExtensionShortHeader,
  type EventsFunctionInsideExtensionShortHeader,
} from '../../../Utils/GDevelopServices/Extension';
import { mapFor } from '../../../Utils/MapFor';
import classes from './ChatMarkdownText.module.css';

const gd: libGDevelop = global.gd;

export type ConceptMetadata = {|
  iconSrc: string,
  description: string,
  name: string,
  helpPath: string,
|};

type ConceptLinkProps = {|
  conceptMetadata: ConceptMetadata,
|};

/**
 * A link to a GDevelop concept.
 */
export const ConceptLink = ({ conceptMetadata }: ConceptLinkProps) => {
  const helpLink = getHelpLink(conceptMetadata.helpPath);
  return (
    <span
      className={classes.conceptLink}
      href={helpLink}
      onClick={event => {
        event.preventDefault(); // Avoid triggering the href (avoids a warning on mobile in case of unsaved changes).
        Window.openExternalURL(helpLink);
      }}
    >
      {conceptMetadata.iconSrc && (
        <IconContainer alt="" src={conceptMetadata.iconSrc} size={16} />
      )}
      {conceptMetadata.name}
    </span>
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
    return { extensionShortHeader: null, eventsFunction: null };
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
      eventsFunction: findInEventsFunctionArray(
        eventsBasedBehavior.eventsFunctions,
        functionType
      ),
    };
  }

  return {
    extensionShortHeader,
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
  const { extensionShortHeadersByName } = React.useContext(
    ExtensionStoreContext
  );

  const getActionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsFunction,
      } = findEventsFunctionInExtensions(extensionShortHeadersByName, type);
      if (extensionShortHeader && eventsFunction) {
        return {
          name: eventsFunction.fullName,
          description: eventsFunction.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
        };
      }

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

      return null;
    });
  }).current;
  const getConditionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsFunction,
      } = findEventsFunctionInExtensions(extensionShortHeadersByName, type);
      if (extensionShortHeader && eventsFunction) {
        return {
          name: eventsFunction.fullName,
          description: eventsFunction.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
        };
      }

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

      return null;
    });
  }).current;
  const getObjectMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsBasedObject,
      } = findEventsBasedObjectInExtensions(extensionShortHeadersByName, type);
      if (extensionShortHeader && eventsBasedObject) {
        return {
          name: eventsBasedObject.fullName,
          description: eventsBasedObject.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
        };
      }

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

      return null;
    });
  }).current;
  const getBehaviorMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const {
        extensionShortHeader,
        eventsBasedBehavior,
      } = findEventsBasedBehaviorInExtensions(
        extensionShortHeadersByName,
        type
      );
      if (extensionShortHeader && eventsBasedBehavior) {
        return {
          name: eventsBasedBehavior.fullName,
          description: eventsBasedBehavior.description,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
        };
      }

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

      return null;
    });
  }).current;
  const getExtensionMetadata = useRefWithInit(() => {
    return memoize((type: string) => {
      const extensionName = type;
      const extensionShortHeader = extensionShortHeadersByName[extensionName];
      if (extensionShortHeader) {
        return {
          name: extensionShortHeader.fullName,
          description: extensionShortHeader.shortDescription,
          iconSrc: extensionShortHeader.previewIconUrl,
          helpPath: extensionShortHeader.helpPath,
        };
      }

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
          name: platformExtension.getFullName(),
          description: platformExtension.getDescription(),
          iconSrc: platformExtension.getIconUrl(),
          helpPath: platformExtension.getHelpPath(),
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
