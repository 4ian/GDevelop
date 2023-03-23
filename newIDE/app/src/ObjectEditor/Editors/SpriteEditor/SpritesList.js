// @flow
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from '@material-ui/icons/Add';
import DirectionTools from './DirectionTools';
import ImageThumbnail from '../../../ResourcesList/ResourceThumbnail/ImageThumbnail';
import {
  copySpritePoints,
  copySpritePolygons,
  allDirectionSpritesHaveSamePointsAs,
  allDirectionSpritesHaveSameCollisionMasksAs,
} from './Utils/SpriteObjectHelper';
import ResourcesLoader from '../../../ResourcesLoader';
import {
  type ResourceSource,
  type ResourceManagementProps,
} from '../../../ResourcesList/ResourceSource';
import {
  type ResourceExternalEditor,
  type EditWithExternalEditorReturn,
} from '../../../ResourcesList/ResourceExternalEditor';
import { applyResourceDefaults } from '../../../ResourcesList/ResourceUtils';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import { ExternalEditorOpenedDialog } from '../../../UI/ExternalEditorOpenedDialog';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { Column } from '../../../UI/Grid';
const gd: libGDevelop = global.gd;

const SPRITE_SIZE = 100; //TODO: Factor with Thumbnail

const styles = {
  spritesList: {
    whiteSpace: 'nowrap',
    overflowY: 'hidden',
    flex: 1,
  },
  thumbnailExtraStyle: {
    marginLeft: 10,
  },
  spriteThumbnailImage: {
    maxWidth: SPRITE_SIZE,
    maxHeight: SPRITE_SIZE,
    verticalAlign: 'middle',
  },
};

const SortableSpriteThumbnail = SortableElement(
  ({
    sprite,
    project,
    resourcesLoader,
    selected,
    onSelect,
    onContextMenu,
    isFirst,
  }) => (
    <ImageThumbnail
      selectable
      selected={selected}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      resourceName={sprite.getImageName()}
      resourcesLoader={resourcesLoader}
      project={project}
      style={isFirst ? {} : styles.thumbnailExtraStyle}
    />
  )
);

const SortableList = SortableContainer(
  ({
    direction,
    project,
    resourcesLoader,
    resourceManagementProps,
    selectedSprites,
    onSelectSprite,
    onSpriteContextMenu,
  }) => {
    const spritesCount = direction.getSpritesCount();
    const hasMoreThanOneSprite = spritesCount > 1;
    return (
      <div style={styles.spritesList}>
        {[
          ...mapFor(0, spritesCount, i => {
            const sprite = direction.getSprite(i);
            return hasMoreThanOneSprite ? (
              <SortableSpriteThumbnail
                sprite={sprite}
                key={sprite.ptr}
                index={i}
                isFirst={i === 0}
                selected={!!selectedSprites[sprite.ptr]}
                onContextMenu={(x, y) => onSpriteContextMenu(x, y, sprite)}
                onSelect={selected => onSelectSprite(sprite, selected)}
                resourcesLoader={resourcesLoader}
                project={project}
              />
            ) : (
              // If there is only one sprite, don't make it draggable.
              <ImageThumbnail
                selectable
                selected={!!selectedSprites[sprite.ptr]}
                onSelect={selected => onSelectSprite(sprite, selected)}
                onContextMenu={(x, y) => onSpriteContextMenu(x, y, sprite)}
                resourceName={sprite.getImageName()}
                resourcesLoader={resourcesLoader}
                project={project}
              />
            );
          }),
          spritesCount === 0 && (
            <ImageThumbnail
              key="empty"
              project={project}
              resourceName=""
              resourcesLoader={resourcesLoader}
            />
          ),
        ]}
      </div>
    );
  }
);

/**
 * Check if all sprites of the given direction have the same points and collision masks
 */
const checkDirectionPointsAndCollisionsMasks = (direction: gdDirection) => {
  let allDirectionSpritesHaveSamePoints = false;
  let allDirectionSpritesHaveSameCollisionMasks = false;
  if (direction.getSpritesCount() !== 0) {
    allDirectionSpritesHaveSamePoints = allDirectionSpritesHaveSamePointsAs(
      direction.getSprite(0),
      direction
    );
    allDirectionSpritesHaveSameCollisionMasks = allDirectionSpritesHaveSameCollisionMasksAs(
      direction.getSprite(0),
      direction
    );
  }

  return {
    allDirectionSpritesHaveSamePoints,
    allDirectionSpritesHaveSameCollisionMasks,
  };
};

const removeExtensionFromFileName = fileName => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? fileName : fileName.substring(0, dotIndex);
};

type Props = {|
  direction: gdDirection,
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceManagementProps: ResourceManagementProps,
  onSpriteContextMenu: (x: number, y: number, sprite: gdSprite) => void,
  selectedSprites: {
    [number]: boolean,
  },
  onSelectSprite: (sprite: gdSprite, selected: boolean) => void,
  onReplaceByDirection: (newDirection: gdDirection) => void,
  onSpriteUpdated?: () => void,
  onChangeName: (newAnimationName: string) => void, // Used by piskel to set the name, if there is no name
  objectName: string, // This is used for the default name of images created with Piskel.
  animationName: string, // This is used for the default name of images created with Piskel.
|};

const SpritesList = ({
  direction,
  project,
  resourcesLoader,
  resourceManagementProps,
  onSpriteContextMenu,
  selectedSprites,
  onSelectSprite,
  onReplaceByDirection,
  onSpriteUpdated,
  onChangeName,
  objectName,
  animationName,
}: Props) => {
  const [externalEditorOpened, setExternalEditorOpened] = React.useState(false);
  const forceUpdate = useForceUpdate();

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) => {
      if (oldIndex === newIndex) return;
      direction.moveSprite(oldIndex, newIndex);
      forceUpdate();
      onSpriteUpdated && onSpriteUpdated();
    },
    [direction, forceUpdate, onSpriteUpdated]
  );

  const onAddSprite = React.useCallback(
    async (resourceSource: ResourceSource) => {
      const {
        allDirectionSpritesHaveSameCollisionMasks,
        allDirectionSpritesHaveSamePoints,
      } = checkDirectionPointsAndCollisionsMasks(direction);

      const resources = await resourceManagementProps.onChooseResource({
        initialSourceName: resourceSource.name,
        multiSelection: true,
        resourceKind: 'image',
      });

      resources.forEach(resource => {
        applyResourceDefaults(project, resource);
        project.getResourcesManager().addResource(resource);

        const sprite = new gd.Sprite();
        sprite.setImageName(resource.getName());
        if (allDirectionSpritesHaveSamePoints) {
          copySpritePoints(direction.getSprite(0), sprite);
        }
        if (allDirectionSpritesHaveSameCollisionMasks) {
          copySpritePolygons(direction.getSprite(0), sprite);
        }
        direction.addSprite(sprite);
        sprite.delete();
      });

      // Important, we are responsible for deleting the resources that were given to us.
      // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
      resources.forEach(resource => resource.delete());

      forceUpdate();

      await resourceManagementProps.onFetchNewlyAddedResources();

      if (resources.length && onSpriteUpdated) onSpriteUpdated();
    },
    [direction, project, resourceManagementProps, forceUpdate, onSpriteUpdated]
  );

  const editWith = React.useCallback(
    async (i18n: I18nType, externalEditor: ResourceExternalEditor) => {
      const resourceNames = mapFor(0, direction.getSpritesCount(), i => {
        return direction.getSprite(i).getImageName();
      });

      const {
        allDirectionSpritesHaveSameCollisionMasks,
        allDirectionSpritesHaveSamePoints,
      } = checkDirectionPointsAndCollisionsMasks(direction);

      try {
        setExternalEditorOpened(true);
        const editResult: EditWithExternalEditorReturn | null = await externalEditor.edit(
          {
            project,
            i18n,
            getStorageProvider: resourceManagementProps.getStorageProvider,
            resourceManagementProps,
            resourceNames,
            extraOptions: {
              singleFrame: false,
              fps:
                direction.getTimeBetweenFrames() > 0
                  ? 1 / direction.getTimeBetweenFrames()
                  : 1,
              name:
                animationName ||
                removeExtensionFromFileName(resourceNames[0]) ||
                objectName,
              isLooping: direction.isLooping(),
              existingMetadata: direction.getMetadata(),
            },
          }
        );

        setExternalEditorOpened(false);
        if (!editResult) return;

        const { resources, newMetadata, newName } = editResult;

        const newDirection = new gd.Direction();
        newDirection.setTimeBetweenFrames(direction.getTimeBetweenFrames());
        newDirection.setLoop(direction.isLooping());
        resources.forEach(resource => {
          const sprite = new gd.Sprite();
          sprite.setImageName(resource.name);
          // Restore collision masks and points
          if (
            resource.originalIndex !== undefined &&
            resource.originalIndex !== null
          ) {
            const originalSprite = direction.getSprite(resource.originalIndex);
            copySpritePoints(originalSprite, sprite);
            copySpritePolygons(originalSprite, sprite);
          } else {
            if (allDirectionSpritesHaveSamePoints) {
              copySpritePoints(direction.getSprite(0), sprite);
            }
            if (allDirectionSpritesHaveSameCollisionMasks) {
              copySpritePolygons(direction.getSprite(0), sprite);
            }
          }
          newDirection.addSprite(sprite);
          sprite.delete();
        });

        // Set metadata on the direction to allow editing again in the future.
        if (newMetadata) {
          newDirection.setMetadata(JSON.stringify(newMetadata));
        }

        // Burst the ResourcesLoader cache to force images to be reloaded (and not cached by the browser).
        resourcesLoader.burstUrlsCacheForResources(project, resourceNames);
        onReplaceByDirection(newDirection);

        // If a name was specified in the external editor, use it for the animation.
        if (newName) {
          onChangeName(newName);
        }
        newDirection.delete();

        if (onSpriteUpdated) onSpriteUpdated();
      } catch (error) {
        setExternalEditorOpened(false);
        console.error(
          'An exception was thrown when launching or reading resources from the external editor:',
          error
        );
        showErrorBox({
          message: `There was an error while using the external editor. Try with another resource and if this persists, please report this as a bug.`,
          rawError: error,
          errorId: 'external-editor-error',
        });
      }
    },
    [
      animationName,
      direction,
      objectName,
      onReplaceByDirection,
      onSpriteUpdated,
      project,
      resourceManagementProps,
      resourcesLoader,
      onChangeName,
    ]
  );

  const storageProvider = resourceManagementProps.getStorageProvider();
  const resourceSources = resourceManagementProps.resourceSources
    .filter(source => source.kind === 'image')
    .filter(
      ({ onlyForStorageProvider }) =>
        !onlyForStorageProvider ||
        onlyForStorageProvider === storageProvider.internalName
    );

  return (
    <ColumnStackLayout noMargin>
      <DirectionTools
        animationName={animationName}
        direction={direction}
        resourcesLoader={resourcesLoader}
        project={project}
        resourceExternalEditors={
          resourceManagementProps.resourceExternalEditors
        }
        onEditWith={editWith}
        onDirectionUpdated={onSpriteUpdated}
      />
      <ResponsiveLineStackLayout noMargin expand alignItems="center">
        <SortableList
          resourcesLoader={resourcesLoader}
          direction={direction}
          project={project}
          onSortEnd={onSortEnd}
          onAddSprite={onAddSprite}
          resourceManagementProps={resourceManagementProps}
          selectedSprites={selectedSprites}
          onSelectSprite={onSelectSprite}
          onSpriteContextMenu={onSpriteContextMenu}
          helperClass="sortable-helper"
          lockAxis="x"
          axis="x"
        />
        <Column noMargin>
          <RaisedButtonWithSplitMenu
            onClick={() => {
              onAddSprite(resourceSources[0]);
            }}
            label={<Trans>Add a sprite</Trans>}
            icon={<Add />}
            primary
            buildMenuTemplate={(i18n: I18nType) => {
              const storageProvider = resourceManagementProps.getStorageProvider();
              return resourceManagementProps.resourceSources
                .filter(source => source.kind === 'image')
                .filter(
                  ({ onlyForStorageProvider }) =>
                    !onlyForStorageProvider ||
                    onlyForStorageProvider === storageProvider.internalName
                )
                .map(source => ({
                  label: i18n._(source.displayName),
                  click: () => onAddSprite(source),
                }));
            }}
          />
        </Column>
      </ResponsiveLineStackLayout>
      {externalEditorOpened && <ExternalEditorOpenedDialog />}
    </ColumnStackLayout>
  );
};

export default SpritesList;
