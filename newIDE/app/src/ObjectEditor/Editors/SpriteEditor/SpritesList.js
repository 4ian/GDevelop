// @flow
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import DirectionTools from './DirectionTools';
import ImageThumbnail from '../../../ResourcesList/ResourceThumbnail/ImageThumbnail';
import {
  copySpritePoints,
  copySpritePolygons,
  allDirectionSpritesHaveSamePointsAs,
  allDirectionSpritesHaveSameCollisionMasksAs,
  deleteSpritesFromAnimation,
  duplicateSpritesInAnimation,
  isFirstSpriteUsingFullImageCollisionMask,
  allObjectSpritesHaveSameCollisionMaskAs,
  allObjectSpritesHaveSamePointsAs,
  getCurrentElements,
  getTotalSpritesCount,
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
import Add from '../../../UI/CustomSvgIcons/Add';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../UI/Menu/ContextMenu';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
const gd: libGDevelop = global.gd;

const SPRITE_SIZE = 100; //TODO: Factor with Thumbnail

const styles = {
  spritesList: {
    whiteSpace: 'nowrap',
    overflowY: 'hidden',
    flex: 1,
  },
  thumbnailExtraStyle: {
    marginLeft: 5,
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
    onOpenSpriteContextMenu,
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
                onContextMenu={(x, y) => onOpenSpriteContextMenu(x, y, sprite)}
                onSelect={selected => onSelectSprite(sprite, selected)}
                resourcesLoader={resourcesLoader}
                project={project}
              />
            ) : (
              // If there is only one sprite, don't make it draggable.
              <ImageThumbnail
                key={sprite.ptr}
                selectable
                selected={!!selectedSprites[sprite.ptr]}
                onSelect={selected => onSelectSprite(sprite, selected)}
                onContextMenu={(x, y) => onOpenSpriteContextMenu(x, y, sprite)}
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
  const firstDirectionSprite =
    direction.getSpritesCount() > 0 ? direction.getSprite(0) : null;
  if (firstDirectionSprite) {
    allDirectionSpritesHaveSamePoints = allDirectionSpritesHaveSamePointsAs(
      firstDirectionSprite,
      direction
    );
    allDirectionSpritesHaveSameCollisionMasks = allDirectionSpritesHaveSameCollisionMasksAs(
      firstDirectionSprite,
      direction
    );
  }

  return {
    allDirectionSpritesHaveSamePoints,
    allDirectionSpritesHaveSameCollisionMasks,
  };
};

/**
 * Check if all sprites of the object have the same points and collision masks
 */
const checkObjectPointsAndCollisionsMasks = (
  spriteConfiguration: gdSpriteObject
) => {
  let allObjectSpritesHaveSamePoints = false;
  let allObjectSpritesHaveSameCollisionMasks = false;
  const firstObjectSprite = getCurrentElements(spriteConfiguration, 0, 0, 0)
    .sprite;

  if (firstObjectSprite) {
    allObjectSpritesHaveSamePoints = allObjectSpritesHaveSamePointsAs(
      firstObjectSprite,
      spriteConfiguration
    );
    allObjectSpritesHaveSameCollisionMasks = allObjectSpritesHaveSameCollisionMaskAs(
      firstObjectSprite,
      spriteConfiguration
    );
  }

  return {
    allObjectSpritesHaveSamePoints,
    allObjectSpritesHaveSameCollisionMasks,
  };
};

const removeExtensionFromFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? fileName : fileName.substring(0, dotIndex);
};

type Props = {|
  spriteConfiguration: gdSpriteObject,
  direction: gdDirection,
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceManagementProps: ResourceManagementProps,
  onReplaceByDirection: (newDirection: gdDirection) => void,
  onSpriteAdded: (sprite: gdSprite) => void,
  onSpriteUpdated?: () => void,
  onFirstSpriteUpdated?: () => void,
  onChangeName: (newAnimationName: string) => void, // Used by piskel to set the name, if there is no name
  objectName: string, // This is used for the default name of images created with Piskel.
  animationName: string, // This is used for the default name of images created with Piskel.
|};

const SpritesList = ({
  spriteConfiguration,
  direction,
  project,
  resourcesLoader,
  resourceManagementProps,
  onReplaceByDirection,
  onSpriteAdded,
  onSpriteUpdated,
  onFirstSpriteUpdated,
  onChangeName,
  objectName,
  animationName,
}: Props) => {
  const [externalEditorOpened, setExternalEditorOpened] = React.useState(false);
  // It's important to save the selected sprites in a ref, so that
  // we can update the selection when a context menu is opened without relying on the state.
  // Otherwise, the selection would be updated after the context menu is opened.
  // Then, we need to ensure we trigger a force-update every time the selection changes.
  const selectedSprites = React.useRef<{
    [number]: boolean,
  }>({});
  const spriteContextMenu = React.useRef<?ContextMenuInterface>(null);
  const forceUpdate = useForceUpdate();
  const { showConfirmation } = useAlertDialog();

  const updateSelectionIndexesAfterMoveUp = React.useCallback(
    (oldIndex: number, newIndex: number, wasMovedItemSelected: boolean) => {
      for (let i = oldIndex; i <= newIndex; ++i) {
        const spriteAtIndex = direction.getSprite(i);
        if (i === newIndex) {
          // If this is the new index of the moved sprite, we keep its selection status.
          selectedSprites.current[spriteAtIndex.ptr] = wasMovedItemSelected;
        } else {
          // If moving up, the other sprites are going down, so their previous index was i+1.
          const previousSpriteIndex = i + 1;
          const previousSelectionStatus = !!selectedSprites.current[
            direction.getSprite(previousSpriteIndex).ptr
          ];
          selectedSprites.current[spriteAtIndex.ptr] = previousSelectionStatus;
        }
      }
    },
    [direction]
  );

  const updateSelectionIndexesAfterMoveDown = React.useCallback(
    (oldIndex: number, newIndex: number, wasMovedItemSelected: boolean) => {
      for (let i = oldIndex; i >= newIndex; --i) {
        const spriteAtIndex = direction.getSprite(i);
        if (i === newIndex) {
          // If this is the new index of the moved sprite, we keep its selection status.
          selectedSprites.current[spriteAtIndex.ptr] = wasMovedItemSelected;
        } else {
          // If moving down, the other sprites are going up, so their previous index was i-1.
          const previousSpriteIndex = i - 1;
          const previousSelectionStatus = !!selectedSprites.current[
            direction.getSprite(previousSpriteIndex).ptr
          ];
          selectedSprites.current[spriteAtIndex.ptr] = previousSelectionStatus;
        }
      }
    },
    [direction]
  );

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) => {
      if (oldIndex === newIndex) return;
      // We store the selection value of the moved sprite, as its pointer will
      // be changed by the move.
      const wasMovedItemSelected = !!selectedSprites.current[
        direction.getSprite(oldIndex).ptr
      ];
      direction.moveSprite(oldIndex, newIndex);

      // When moving a sprite, the pointers are all shifted, so we need to
      // update the selectedSprites map for the user not to lose their selection.
      if (oldIndex < newIndex) {
        updateSelectionIndexesAfterMoveUp(
          oldIndex,
          newIndex,
          wasMovedItemSelected
        );
      } else {
        updateSelectionIndexesAfterMoveDown(
          oldIndex,
          newIndex,
          wasMovedItemSelected
        );
      }

      forceUpdate();
      onSpriteUpdated && onSpriteUpdated();
      if (oldIndex === 0 || newIndex === 0) {
        // If a sprite was moved from or to the first position,
        // then the first sprite has changed.
        onFirstSpriteUpdated && onFirstSpriteUpdated();
      }
    },
    [
      direction,
      forceUpdate,
      onSpriteUpdated,
      onFirstSpriteUpdated,
      updateSelectionIndexesAfterMoveDown,
      updateSelectionIndexesAfterMoveUp,
    ]
  );

  const applyPointsAndMasksToSpriteIfNecessary = React.useCallback(
    (sprite: gdSprite) => {
      const {
        allDirectionSpritesHaveSameCollisionMasks,
        allDirectionSpritesHaveSamePoints,
      } = checkDirectionPointsAndCollisionsMasks(direction);
      const {
        allObjectSpritesHaveSameCollisionMasks,
        allObjectSpritesHaveSamePoints,
      } = checkObjectPointsAndCollisionsMasks(spriteConfiguration);
      const shouldUseFullImageCollisionMask = isFirstSpriteUsingFullImageCollisionMask(
        spriteConfiguration
      );
      const firstObjectSprite = getCurrentElements(spriteConfiguration, 0, 0, 0)
        .sprite;
      const firstDirectionSprite =
        direction.getSpritesCount() > 0 ? direction.getSprite(0) : null;

      // Copy points if toggles were set before adding the sprite.
      if (allObjectSpritesHaveSamePoints && firstObjectSprite) {
        // Copy points from the first sprite of the object, if existing.
        copySpritePoints(firstObjectSprite, sprite);
      } else if (allDirectionSpritesHaveSamePoints && firstDirectionSprite) {
        // Copy points from the first sprite of the direction, if this is not the first one we add.
        copySpritePoints(firstDirectionSprite, sprite);
      }

      // Copy collision masks if toggles were set before adding the sprite.
      if (allObjectSpritesHaveSameCollisionMasks && firstObjectSprite) {
        // Copy collision masks from the first sprite of the object, if existing.
        copySpritePolygons(firstObjectSprite, sprite);
      } else if (
        allDirectionSpritesHaveSameCollisionMasks &&
        firstDirectionSprite
      ) {
        // Copy collision masks from the first sprite of the direction, if this is not the first one we add.
        copySpritePolygons(firstDirectionSprite, sprite);
      }

      if (shouldUseFullImageCollisionMask) {
        sprite.setFullImageCollisionMask(true);
      }
    },
    [direction, spriteConfiguration]
  );

  const onAddSprite = React.useCallback(
    async (resourceSource: ResourceSource) => {
      const directionSpritesCountBeforeAdding = direction.getSpritesCount();

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

        applyPointsAndMasksToSpriteIfNecessary(sprite);

        onSpriteAdded(sprite); // Call the callback before `addSprite`, as `addSprite` will store a copy of it.
        direction.addSprite(sprite);
        sprite.delete();
      });

      // Important, we are responsible for deleting the resources that were given to us.
      // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
      resources.forEach(resource => resource.delete());

      forceUpdate();

      await resourceManagementProps.onFetchNewlyAddedResources();

      if (resources.length && onSpriteUpdated) onSpriteUpdated();
      if (directionSpritesCountBeforeAdding === 0 && onFirstSpriteUpdated) {
        // If there was no sprites before, we can assume the first sprite was added.
        onFirstSpriteUpdated();
      }
    },
    [
      direction,
      project,
      resourceManagementProps,
      forceUpdate,
      onSpriteUpdated,
      onSpriteAdded,
      onFirstSpriteUpdated,
      applyPointsAndMasksToSpriteIfNecessary,
    ]
  );

  const editWith = React.useCallback(
    async (i18n: I18nType, externalEditor: ResourceExternalEditor) => {
      const resourceNames = mapFor(0, direction.getSpritesCount(), i => {
        return direction.getSprite(i).getImageName();
      });

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
                (resourceNames[0] &&
                  removeExtensionFromFileName(resourceNames[0])) ||
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
            // The sprite existed before, so we can copy its points and collision masks.
            const originalSprite = direction.getSprite(resource.originalIndex);
            copySpritePoints(originalSprite, sprite);
            copySpritePolygons(originalSprite, sprite);
          } else {
            // The sprite is new, apply points & collision masks if necessary.
            applyPointsAndMasksToSpriteIfNecessary(sprite);
          }
          onSpriteAdded(sprite); // Call the callback before `addSprite`, as `addSprite` will store a copy of it.
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
        // If an external editor is used to edit the sprites, we assume the first sprite was edited.
        if (onFirstSpriteUpdated) onFirstSpriteUpdated();
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
      onSpriteAdded,
      onFirstSpriteUpdated,
      project,
      resourceManagementProps,
      resourcesLoader,
      onChangeName,
      applyPointsAndMasksToSpriteIfNecessary,
    ]
  );

  const deleteSprites = React.useCallback(
    async () => {
      const sprites = selectedSprites.current;
      const firstSpritePtr = spriteConfiguration
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0).ptr;
      const isObjectFirstSpriteDeleted = !!sprites[firstSpritePtr];

      const totalSpritesCount = getTotalSpritesCount(spriteConfiguration);
      const isDeletingLastSprites =
        Object.keys(sprites).length === totalSpritesCount;
      const oneOfSpritesInCurrentDirection =
        direction.getSpritesCount() > 0 ? direction.getSprite(0) : null;

      const isUsingCustomCollisionMask =
        !spriteConfiguration.adaptCollisionMaskAutomatically() &&
        oneOfSpritesInCurrentDirection &&
        !oneOfSpritesInCurrentDirection.isFullImageCollisionMask();
      const shouldWarnBecauseLosingCustomCollisionMask =
        isDeletingLastSprites && isUsingCustomCollisionMask;

      if (shouldWarnBecauseLosingCustomCollisionMask) {
        const deleteAnswer = await showConfirmation({
          title: t`Remove the sprite`,
          message: t`You are about to remove the last sprite of this object, which has a custom collision mask. The custom collision mask will be lost. Are you sure you want to continue?`,
          confirmButtonLabel: t`Remove`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!deleteAnswer) return;
      }

      mapFor(0, spriteConfiguration.getAnimationsCount(), index => {
        const animation = spriteConfiguration.getAnimation(index);
        deleteSpritesFromAnimation(animation, sprites);
      });

      // Clear selection after deletion.
      selectedSprites.current = {};
      forceUpdate();
      if (onSpriteUpdated) onSpriteUpdated();
      if (isObjectFirstSpriteDeleted && onFirstSpriteUpdated)
        onFirstSpriteUpdated();
      if (shouldWarnBecauseLosingCustomCollisionMask) {
        // The user has deleted the last custom collision mask, so revert to automatic
        // collision mask adaptation.
        spriteConfiguration.setAdaptCollisionMaskAutomatically(true);
      }
    },
    [
      onSpriteUpdated,
      onFirstSpriteUpdated,
      spriteConfiguration,
      forceUpdate,
      showConfirmation,
      direction,
    ]
  );

  const duplicateSprites = React.useCallback(
    () => {
      const sprites = selectedSprites.current;
      mapFor(0, spriteConfiguration.getAnimationsCount(), index => {
        const animation = spriteConfiguration.getAnimation(index);
        duplicateSpritesInAnimation(animation, sprites);
      });

      // Clear selection after duplication.
      selectedSprites.current = {};
      forceUpdate();
      if (onSpriteUpdated) onSpriteUpdated();
    },
    [onSpriteUpdated, spriteConfiguration, forceUpdate]
  );

  const addSpriteToSelection = React.useCallback(
    (sprite, selected) => {
      selectedSprites.current = {
        ...selectedSprites.current,
        [sprite.ptr]: selected,
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const selectUniqueSprite = React.useCallback(
    (sprite: gdSprite) => {
      selectedSprites.current = {
        [sprite.ptr]: true,
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const openSpriteContextMenu = React.useCallback(
    (x, y, sprite) => {
      // If the sprite is not selected, select only it.
      if (!selectedSprites.current[sprite.ptr]) {
        selectUniqueSprite(sprite);
      }
      // Otherwise, keep the selection as is.
      if (spriteContextMenu.current) {
        spriteContextMenu.current.open(x, y);
      }
    },
    [selectUniqueSprite]
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
          selectedSprites={selectedSprites.current}
          onSelectSprite={addSpriteToSelection}
          onOpenSpriteContextMenu={openSpriteContextMenu}
          helperClass="sortable-helper"
          lockAxis="x"
          axis="x"
        />
        <ContextMenu
          ref={spriteContextMenu}
          buildMenuTemplate={(i18n: I18nType) => [
            {
              label: i18n._(t`Delete selection`),
              click: deleteSprites,
            },
            {
              label: i18n._(t`Duplicate selection`),
              click: duplicateSprites,
            },
          ]}
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
