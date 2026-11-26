// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { List, ListItem } from '../../UI/List';
import ListIcon from '../../UI/ListIcon';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import {
  findResourceObjectUsages,
  type ResourceObjectUsage,
} from './ResourceUsagesFinder';

type OpenLayoutOptions = {|
  openEventsEditor: boolean,
  openSceneEditor: boolean,
  focusWhenOpened: 'scene-or-events-otherwise' | 'scene' | 'events' | 'none',
|};

type Props = {|
  project: gdProject,
  resources: Array<gdResource>,
  onOpenLayout?: (sceneName: string, options?: OpenLayoutOptions) => void,
  onOpenCustomObjectEditor?: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variantName: string
  ) => void,
|};

const getUsageKey = (usage: ResourceObjectUsage): string => {
  if (usage.kind === 'global') {
    return `global:${usage.objectName}`;
  }
  if (usage.kind === 'scene') {
    return `scene:${usage.sceneName}:${usage.objectName}`;
  }
  return `custom-object:${usage.extensionName}:${usage.eventsBasedObjectName}:${
    usage.variantName
  }:${usage.objectName}`;
};

const renderUsageSecondaryText = (usage: ResourceObjectUsage): React.Node => {
  if (usage.kind === 'global') {
    return <Trans>Global object</Trans>;
  }
  if (usage.kind === 'scene') {
    const { sceneName } = usage;
    return <Trans>Scene: {sceneName}</Trans>;
  }
  const { extensionFullName, eventsBasedObjectFullName, variantName } = usage;
  const customObjectPath = `${extensionFullName} / ${eventsBasedObjectFullName}`;
  if (variantName) {
    return (
      <Trans>
        Custom object: {customObjectPath} ({variantName})
      </Trans>
    );
  }
  return <Trans>Custom object: {customObjectPath}</Trans>;
};

export const ResourceUsagesList = ({
  project,
  resources,
  onOpenLayout,
  onOpenCustomObjectEditor,
}: Props): null | React.Node => {
  if (resources.length !== 1) return null;

  const resourceName = resources[0].getName();
  const usages = findResourceObjectUsages(project, resourceName);

  const getOpenUsageHandler = (usage: ResourceObjectUsage): ?() => void => {
    if (usage.kind === 'scene' && onOpenLayout) {
      const { sceneName } = usage;
      return () => {
        onOpenLayout(sceneName, {
          openEventsEditor: false,
          openSceneEditor: true,
          focusWhenOpened: 'scene',
        });
      };
    }
    if (usage.kind === 'custom-object' && onOpenCustomObjectEditor) {
      const { extensionName, eventsBasedObjectName, variantName } = usage;
      return () => {
        if (!project.hasEventsFunctionsExtensionNamed(extensionName)) return;
        const extension = project.getEventsFunctionsExtension(extensionName);
        const eventsBasedObjects = extension.getEventsBasedObjects();
        if (!eventsBasedObjects.has(eventsBasedObjectName)) return;
        const eventsBasedObject = eventsBasedObjects.get(eventsBasedObjectName);
        onOpenCustomObjectEditor(extension, eventsBasedObject, variantName);
      };
    }
    return null;
  };

  return (
    <ColumnStackLayout noMargin>
      <Text size="sub-title" noMargin>
        <Trans>Objects using this resource</Trans>
      </Text>
      {usages.length === 0 ? (
        <Text size="body-small" color="secondary" noMargin>
          <Trans>Not used by any object.</Trans>
        </Text>
      ) : (
        <List style={{ padding: 0 }}>
          {usages.map(usage => {
            const icon = (
              <ListIcon
                iconSize={24}
                src={ObjectsRenderingService.getThumbnail(
                  project,
                  usage.object.getConfiguration()
                )}
              />
            );
            const onOpenUsage = getOpenUsageHandler(usage);
            const key = getUsageKey(usage);
            const secondaryText = renderUsageSecondaryText(usage);

            return onOpenUsage ? (
              <ListItem
                key={key}
                primaryText={usage.objectName}
                secondaryText={secondaryText}
                secondaryTextSize="body-small"
                disableAutoTranslate
                leftIcon={icon}
                noPadding
                onClick={onOpenUsage}
                displayLinkButton
                onOpenLink={onOpenUsage}
              />
            ) : (
              <ListItem
                key={key}
                primaryText={usage.objectName}
                secondaryText={secondaryText}
                secondaryTextSize="body-small"
                disableAutoTranslate
                leftIcon={icon}
                noPadding
              />
            );
          })}
        </List>
      )}
    </ColumnStackLayout>
  );
};
