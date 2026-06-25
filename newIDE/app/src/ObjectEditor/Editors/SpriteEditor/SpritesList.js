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
import { applyResourceDefaults } from '../../../ResourcesList/ResourceUtils';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
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
import { groupResourcesByAnimations } from './AnimationImportHelper';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor';
import RawSpriteSheetImportDialog, {
  type RawSpriteSheetImportOptions,
} from './RawSpriteSheetImportDialog';
import { importRawGifToProjectResources } from './GifImportHelper';
import {
  createSpriteSheetSourceRects,
  getSourceRectFromSprite,
  loadImageSize,
  setSpriteSourceRect,
  type SpriteSourceRect,
} from '../../../Utils/SpriteSourceRect';
import { openFilePicker } from '../../../Utils/FileSystem';
import {
  addImageFileToProjectResources,
  getImageFilePathsFromDataTransfer,
} from '../../../SceneEditor/CreateSpriteFromImage';

const gd: libGDevelop = global.gd;

const SPRITE_SIZE = 100;

const styles = {
  spritesList: {
    display: 'flex',
    overflowY: 'hidden',
    flex: 1,
  },
  thumbnailExtraStyle: {
    marginLeft: 5,
  },
};

const hasNativeFiles = (event: any): boolean => {
  const { dataTransfer } = event;
  if (!dataTransfer || !dataTransfer.types) return false;

  if (typeof dataTransfer.types.includes === 'function') {
    return dataTransfer.types.includes('Files');
  }

  if (typeof dataTransfer.types.contains === 'function') {
    return dataTransfer.types.contains('Files');
  }

  for (let index = 0; index < dataTransfer.types.length; index++) {
    if (dataTransfer.types[index] === 'Files') return true;
  }

  return false;
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
    sourceRect,
    imageFrameIndex,
  }) => (
    <ImageThumbnail
      selectable
      selected={selected}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      resourceName={sprite.getImageName()}
      sourceRect={sourceRect}
      imageFrameIndex={imageFrameIndex}
      resourcesLoader={resourcesLoader}
      project={project}
      style={isFirst ? {} : styles.thumbnailExtraStyle}
      size={SPRITE_SIZE}
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
    onNativeDragOver,
    onNativeDrop,
  }) => {
    const spritesCount = direction.getSpritesCount();
    const hasMoreThanOneSprite = spritesCount > 1;
    let previousWholeImageName: ?string = null;
    let consecutiveWholeImageFrameIndex = 0;
    const getImageFrameIndex = (
      sprite: gdSprite,
      sourceRect: ?SpriteSourceRect
    ) => {
      const imageName = sprite.getImageName();
      if (!sourceRect && imageName) {
        if (imageName === previousWholeImageName) {
          consecutiveWholeImageFrameIndex++;
        } else {
          previousWholeImageName = imageName;
          consecutiveWholeImageFrameIndex = 0;
        }
        return consecutiveWholeImageFrameIndex;
      }

      previousWholeImageName = null;
      consecutiveWholeImageFrameIndex = 0;
      return 0;
    };

    return (
      <div
        style={styles.spritesList}
        onDragOver={onNativeDragOver}
        onDrop={onNativeDrop}
      >
        {[
          ...mapFor(0, spritesCount, i => {
            const sprite = direction.getSprite(i);
            const sourceRect = getSourceRectFromSprite(sprite);
            const imageFrameIndex = getImageFrameIndex(sprite, sourceRect);
            return hasMoreThanOneSprite ? (
              <SortableSpriteThumbnail
                sprite={sprite}
                key={sprite.ptr}
                index={i}
                isFirst={i === 0}
                selected={!!selectedSprites[sprite.ptr]}
                onContextMenu={(x, y) => onOpenSpriteContextMenu(x, y, sprite)}
                onSelect={selected => onSelectSprite(sprite, selected)}
                sourceRect={sourceRect}
                imageFrameIndex={imageFrameIndex}
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
                sourceRect={sourceRect}
                imageFrameIndex={imageFrameIndex}
                resourcesLoader={resourcesLoader}
                project={project}
                size={SPRITE_SIZE}
              />
            );
          }),
          spritesCount === 0 && (
            <ImageThumbnail
              key="empty"
              project={project}
              resourceName=""
              resourcesLoader={resourcesLoader}
              size={SPRITE_SIZE}
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
  animations: gdSpriteAnimationList
) => {
  let allObjectSpritesHaveSamePoints = false;
  let allObjectSpritesHaveSameCollisionMasks = false;
  const firstObjectSprite = getCurrentElements(animations, 0, 0, 0).sprite;

  if (firstObjectSprite) {
    allObjectSpritesHaveSamePoints = allObjectSpritesHaveSamePointsAs(
      firstObjectSprite,
      animations
    );
    allObjectSpritesHaveSameCollisionMasks = allObjectSpritesHaveSameCollisionMaskAs(
      firstObjectSprite,
      animations
    );
  }

  return {
    allObjectSpritesHaveSamePoints,
    allObjectSpritesHaveSameCollisionMasks,
  };
};

export const applyPointsAndMasksToSpriteIfNecessary = (
  animations: gdSpriteAnimationList,
  direction: gdDirection,
  sprite: gdSprite
) => {
  const {
    allDirectionSpritesHaveSameCollisionMasks,
    allDirectionSpritesHaveSamePoints,
  } = checkDirectionPointsAndCollisionsMasks(direction);
  const {
    allObjectSpritesHaveSameCollisionMasks,
    allObjectSpritesHaveSamePoints,
  } = checkObjectPointsAndCollisionsMasks(animations);
  const shouldUseFullImageCollisionMask = isFirstSpriteUsingFullImageCollisionMask(
    animations
  );
  const firstObjectSprite = getCurrentElements(animations, 0, 0, 0).sprite;
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
};

export const addAnimationFrameWithResourceName = (
  animations: gdSpriteAnimationList,
  direction: gdDirection,
  resourceName: string,
  onSpriteAdded: (sprite: gdSprite) => void,
  sourceRect?: ?SpriteSourceRect
) => {
  const sprite = new gd.Sprite();
  sprite.setImageName(resourceName);
  setSpriteSourceRect(sprite, sourceRect);

  applyPointsAndMasksToSpriteIfNecessary(animations, direction, sprite);

  onSpriteAdded(sprite); // Call the callback before `addSprite`, as `addSprite` will store a copy of it.
  direction.addSprite(sprite);
  sprite.delete();
};

export const addAnimationFrame = (
  animations: gdSpriteAnimationList,
  direction: gdDirection,
  resource: gdResource,
  onSpriteAdded: (sprite: gdSprite) => void,
  sourceRect?: ?SpriteSourceRect
) => {
  addAnimationFrameWithResourceName(
    animations,
    direction,
    resource.getName(),
    onSpriteAdded,
    sourceRect
  );
};

export const addMissingResourcesToProject = (
  project: gdProject,
  resources: Array<gdResource>
): {|
  hasCreatedAnyResource: boolean,
  resourcesToDeleteAfterUse: Array<gdResource>,
|} => {
  let hasCreatedAnyResource = false;
  const resourcesToDeleteAfterUse: Array<gdResource> = [];
  const resourcesManager = project.getResourcesManager();

  resources.forEach(resource => {
    if (resourcesManager.hasResource(resource.getName())) return;

    applyResourceDefaults(project, resource);
    const hasCreatedResource = resourcesManager.addResource(resource);
    hasCreatedAnyResource = hasCreatedAnyResource || hasCreatedResource;
    resourcesToDeleteAfterUse.push(resource);
  });

  return { hasCreatedAnyResource, resourcesToDeleteAfterUse };
};

type RawSpriteSheetImportState = {|
  resourceName: string,
  sheetWidth: number,
  sheetHeight: number,
|};

type Props = {|
  animations: gdSpriteAnimationList,
  direction: gdDirection,
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceManagementProps: ResourceManagementProps,
  editDirectionWith: (
    i18n: I18nType,
    ResourceExternalEditor,
    direction: gdDirection
  ) => Promise<void>,
  onReplaceByDirection: (newDirection: gdDirection) => void,
  onSpriteAdded: (sprite: gdSprite) => void,
  onSpriteUpdated?: () => void,
  onFirstSpriteUpdated?: () => void,
  addAnimations: (resourcesByAnimation: Map<string, Array<gdResource>>) => void,
  onChangeName: (newAnimationName: string) => void, // Used by piskel to set the name, if there is no name
  objectName: string, // This is used for the default name of images created with Piskel.
  animationName: string, // This is used for the default name of images created with Piskel.
|};

const SpritesList = ({
  animations,
  direction,
  project,
  resourcesLoader,
  resourceManagementProps,
  editDirectionWith,
  onReplaceByDirection,
  onSpriteAdded,
  onSpriteUpdated,
  onFirstSpriteUpdated,
  addAnimations,
  onChangeName,
  objectName,
  animationName,
}: Props): React.Node => {
  // It's important to save the selected sprites in a ref, so that
  // we can update the selection when a context menu is opened without relying on the state.
  // Otherwise, the selection would be updated after the context menu is opened.
  // Then, we need to ensure we trigger a force-update every time the selection changes.
  const selectedSprites = React.useRef<{
    [number]: boolean,
  }>({});
  const spriteContextMenu = React.useRef<?ContextMenuInterface>(null);
  const [
    rawSpriteSheetImport,
    setRawSpriteSheetImport,
  ] = React.useState<?RawSpriteSheetImportState>(null);
  const forceUpdate = useForceUpdate();
  const { showAlert, showConfirmation } = useAlertDialog();

  const storageProvider = resourceManagementProps.getStorageProvider();
  const canImportGif = storageProvider.internalName === 'LocalFile';
  const resourceSources = resourceManagementProps.resourceSources
    .filter(source => source.kind === 'image')
    .filter(
      ({ onlyForStorageProvider }) =>
        !onlyForStorageProvider ||
        onlyForStorageProvider === storageProvider.internalName
    );

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
    ({ oldIndex, newIndex }: {| oldIndex: number, newIndex: number |}) => {
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

  const onAddSprite = React.useCallback(
    async (initialResourceSource: ResourceSource) => {
      const directionSpritesCountBeforeAdding = direction.getSpritesCount();
      const {
        selectedResources,
        selectedSourceName,
      } = await resourceManagementProps.onChooseResource({
        initialSourceName: initialResourceSource.name,
        multiSelection: true,
        resourceKind: 'image',
        importedResourcesFolder: 'assets',
        includeProjectAssetsFolder: true,
      });

      if (!selectedResources.length) return;
      const selectedResourceSource = resourceSources.find(
        source => source.name === selectedSourceName
      );
      if (!selectedResourceSource) return;

      let hasCreatedAnyResource = false;
      let resourcesToDeleteAfterUse: Array<gdResource> = [];
      if (selectedResourceSource.shouldCreateResource) {
        selectedResources.forEach(resource => {
          applyResourceDefaults(project, resource);
          const hasCreatedResource = project
            .getResourcesManager()
            .addResource(resource);
          hasCreatedAnyResource = hasCreatedAnyResource || hasCreatedResource;
        });
        resourcesToDeleteAfterUse = selectedResources;
      } else {
        const addMissingResourcesResult = addMissingResourcesToProject(
          project,
          selectedResources
        );
        hasCreatedAnyResource =
          hasCreatedAnyResource ||
          addMissingResourcesResult.hasCreatedAnyResource;
        resourcesToDeleteAfterUse =
          addMissingResourcesResult.resourcesToDeleteAfterUse;
      }

      if (
        directionSpritesCountBeforeAdding === 0 &&
        selectedResources.length > 1 &&
        selectedResourceSource.shouldGuessAnimationsFromName
      ) {
        const resourcesByAnimation = groupResourcesByAnimations(
          selectedResources
        );
        if (resourcesByAnimation.size > 1) {
          addAnimations(resourcesByAnimation);
        } else {
          // Use `resourcesByAnimation` because frames are sorted.
          for (const resources of resourcesByAnimation.values()) {
            for (const resource of resources) {
              addAnimationFrame(animations, direction, resource, onSpriteAdded);
            }
          }
        }
      } else {
        for (const resource of selectedResources) {
          addAnimationFrame(animations, direction, resource, onSpriteAdded);
        }
      }

      if (resourcesToDeleteAfterUse.length) {
        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        resourcesToDeleteAfterUse.forEach(resource => resource.delete());
      }

      forceUpdate();

      if (hasCreatedAnyResource) {
        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
      }

      if (selectedResources.length && onSpriteUpdated) onSpriteUpdated();
      if (directionSpritesCountBeforeAdding === 0 && onFirstSpriteUpdated) {
        // If there was no sprites before, we can assume the first sprite was added.
        onFirstSpriteUpdated();
      }
    },
    [
      direction,
      resourceManagementProps,
      forceUpdate,
      onSpriteUpdated,
      onFirstSpriteUpdated,
      project,
      addAnimations,
      animations,
      onSpriteAdded,
      resourceSources,
    ]
  );

  const onAddImageFilesFromLocalFileSystem = React.useCallback(
    async (imageFilePaths: Array<string>) => {
      if (
        storageProvider.internalName !== 'LocalFile' ||
        !project.getProjectFile()
      ) {
        await showAlert({
          title: t`Unable to add images`,
          message: t`Images can only be dropped into saved local projects.`,
          dismissButtonLabel: t`Close`,
        });
        return;
      }

      const directionSpritesCountBeforeAdding = direction.getSpritesCount();
      let addedFramesCount = 0;
      try {
        for (const imageFilePath of imageFilePaths) {
          const resourceName = await addImageFileToProjectResources({
            project,
            imageFilePath,
          });
          addAnimationFrameWithResourceName(
            animations,
            direction,
            resourceName,
            onSpriteAdded
          );
          addedFramesCount++;
        }
      } catch (error) {
        console.error('Unable to add dropped image files to sprite:', error);
        await showAlert({
          title: t`Unable to add images`,
          message: t`The dropped images could not be imported.`,
          dismissButtonLabel: t`Close`,
        });
      }

      if (!addedFramesCount) return;

      forceUpdate();
      await resourceManagementProps.onFetchNewlyAddedResources();
      resourceManagementProps.onNewResourcesAdded();

      if (onSpriteUpdated) onSpriteUpdated();
      if (directionSpritesCountBeforeAdding === 0 && onFirstSpriteUpdated) {
        onFirstSpriteUpdated();
      }
    },
    [
      animations,
      direction,
      forceUpdate,
      onFirstSpriteUpdated,
      onSpriteAdded,
      onSpriteUpdated,
      project,
      resourceManagementProps,
      showAlert,
      storageProvider.internalName,
    ]
  );

  const onNativeDragOver = React.useCallback((event: any) => {
    if (!hasNativeFiles(event)) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const onNativeDrop = React.useCallback(
    async (event: any) => {
      if (!hasNativeFiles(event)) return;

      event.preventDefault();
      event.stopPropagation();

      const imageFilePaths = getImageFilePathsFromDataTransfer(
        event.dataTransfer
      );
      if (!imageFilePaths.length) return;

      await onAddImageFilesFromLocalFileSystem(imageFilePaths);
    },
    [onAddImageFilesFromLocalFileSystem]
  );

  const onReplaceSprites = React.useCallback(
    async (initialResourceSource: ResourceSource) => {
      const {
        selectedResources,
        selectedSourceName,
      } = await resourceManagementProps.onChooseResource({
        initialSourceName: initialResourceSource.name,
        multiSelection: false,
        resourceKind: 'image',
        importedResourcesFolder: 'assets',
        includeProjectAssetsFolder: true,
      });

      if (!selectedResources.length) return;
      const selectedResource = selectedResources[0];
      const selectedResourceSource = resourceSources.find(
        source => source.name === selectedSourceName
      );
      if (!selectedResourceSource) return;

      let hasCreatedResource = false;
      let resourcesToDeleteAfterUse: Array<gdResource> = [];
      if (selectedResourceSource.shouldCreateResource) {
        applyResourceDefaults(project, selectedResource);
        hasCreatedResource = project
          .getResourcesManager()
          .addResource(selectedResource);
        resourcesToDeleteAfterUse = selectedResources;
      } else {
        const addMissingResourcesResult = addMissingResourcesToProject(
          project,
          selectedResources
        );
        hasCreatedResource = addMissingResourcesResult.hasCreatedAnyResource;
        resourcesToDeleteAfterUse =
          addMissingResourcesResult.resourcesToDeleteAfterUse;
      }

      const resourceName = selectedResource.getName();
      if (resourcesToDeleteAfterUse.length) {
        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        resourcesToDeleteAfterUse.forEach(resource => resource.delete());
      }

      const sprites = selectedSprites.current;
      const firstObjectSprite = getCurrentElements(animations, 0, 0, 0).sprite;
      const isObjectFirstSpriteReplaced =
        !!firstObjectSprite && !!sprites[firstObjectSprite.ptr];

      mapFor(0, animations.getAnimationsCount(), animationIndex => {
        const animation = animations.getAnimation(animationIndex);
        mapFor(0, animation.getDirectionsCount(), directionIndex => {
          const direction = animation.getDirection(directionIndex);
          mapFor(0, direction.getSpritesCount(), spriteIndex => {
            const sprite = direction.getSprite(spriteIndex);
            if (!sprites[sprite.ptr]) return;

            sprite.setImageName(resourceName);
            setSpriteSourceRect(sprite, null);
          });
        });
      });

      forceUpdate();

      if (hasCreatedResource) {
        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
      }

      if (onSpriteUpdated) onSpriteUpdated();
      if (isObjectFirstSpriteReplaced && onFirstSpriteUpdated)
        onFirstSpriteUpdated();
    },
    [
      animations,
      forceUpdate,
      onFirstSpriteUpdated,
      onSpriteUpdated,
      project,
      resourceManagementProps,
      resourceSources,
    ]
  );

  const onImportRawSpriteSheet = React.useCallback(
    async (initialResourceSource: ResourceSource) => {
      const {
        selectedResources,
        selectedSourceName,
      } = await resourceManagementProps.onChooseResource({
        initialSourceName: initialResourceSource.name,
        multiSelection: false,
        resourceKind: 'image',
        importedResourcesFolder: 'assets',
        includeProjectAssetsFolder: true,
      });

      if (!selectedResources.length) return;
      const selectedResource = selectedResources[0];
      const selectedResourceSource = resourceSources.find(
        source => source.name === selectedSourceName
      );
      if (!selectedResourceSource) {
        return;
      }

      let hasCreatedResource = false;
      let resourcesToDeleteAfterUse: Array<gdResource> = [];
      if (selectedResourceSource.shouldCreateResource) {
        applyResourceDefaults(project, selectedResource);
        hasCreatedResource = project
          .getResourcesManager()
          .addResource(selectedResource);
        resourcesToDeleteAfterUse = selectedResources;
      } else {
        const addMissingResourcesResult = addMissingResourcesToProject(
          project,
          selectedResources
        );
        hasCreatedResource = addMissingResourcesResult.hasCreatedAnyResource;
        resourcesToDeleteAfterUse =
          addMissingResourcesResult.resourcesToDeleteAfterUse;
      }

      const resourceName = selectedResource.getName();
      if (resourcesToDeleteAfterUse.length) {
        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        resourcesToDeleteAfterUse.forEach(resource => resource.delete());
      }

      if (hasCreatedResource) {
        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();
      }

      try {
        const [sheetWidth, sheetHeight] = await loadImageSize(
          resourcesLoader.getResourceFullUrl(project, resourceName, {})
        );
        setRawSpriteSheetImport({
          resourceName,
          sheetWidth,
          sheetHeight,
        });
      } catch (error) {
        console.error('Unable to load raw sprite sheet image size:', error);
        await showAlert({
          title: t`Unable to import the sprite sheet`,
          message: t`The image size could not be read.`,
          dismissButtonLabel: t`Close`,
        });
      }
    },
    [
      project,
      resourceManagementProps,
      resourceSources,
      resourcesLoader,
      showAlert,
    ]
  );

  const addRawSpriteSheetFrames = React.useCallback(
    (options: RawSpriteSheetImportOptions) => {
      if (!rawSpriteSheetImport) return;

      const directionSpritesCountBeforeAdding = direction.getSpritesCount();
      const sourceRects = createSpriteSheetSourceRects({
        columns: options.columns,
        rows: options.rows,
        frameCount: options.frameCount,
        sheetWidth: rawSpriteSheetImport.sheetWidth,
        sheetHeight: rawSpriteSheetImport.sheetHeight,
      });

      for (const sourceRect of sourceRects) {
        addAnimationFrameWithResourceName(
          animations,
          direction,
          rawSpriteSheetImport.resourceName,
          onSpriteAdded,
          sourceRect
        );
      }

      setRawSpriteSheetImport(null);
      forceUpdate();

      if (sourceRects.length && onSpriteUpdated) onSpriteUpdated();
      if (
        directionSpritesCountBeforeAdding === 0 &&
        sourceRects.length &&
        onFirstSpriteUpdated
      ) {
        onFirstSpriteUpdated();
      }
    },
    [
      animations,
      direction,
      forceUpdate,
      onFirstSpriteUpdated,
      onSpriteAdded,
      onSpriteUpdated,
      rawSpriteSheetImport,
    ]
  );

  const onImportGif = React.useCallback(
    async (i18n: I18nType) => {
      if (!canImportGif || !project.getProjectFile()) {
        await showAlert({
          title: t`Unable to import the GIF`,
          message: t`GIF import is only available for saved local projects.`,
          dismissButtonLabel: t`Close`,
        });
        return;
      }

      try {
        const gifFilePath = await openFilePicker({
          title: i18n._(t`Choose a GIF file`),
          properties: ['openFile'],
          message: i18n._(
            t`Choose the GIF file to import as a raw animated sprite.`
          ),
          filters: [{ name: i18n._(t`GIF files`), extensions: ['gif'] }],
        });
        if (!gifFilePath || typeof gifFilePath !== 'string') return;

        const directionSpritesCountBeforeAdding = direction.getSpritesCount();
        const {
          resourceName,
          frameCount,
          timeBetweenFrames,
        } = await importRawGifToProjectResources({
          project,
          gifFilePath,
        });

        for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          addAnimationFrameWithResourceName(
            animations,
            direction,
            resourceName,
            onSpriteAdded
          );
        }

        if (frameCount > 1) {
          direction.setTimeBetweenFrames(timeBetweenFrames);
          if (directionSpritesCountBeforeAdding === 0) {
            direction.setLoop(true);
          }
        }

        forceUpdate();
        await resourceManagementProps.onFetchNewlyAddedResources();
        resourceManagementProps.onNewResourcesAdded();

        if (frameCount && onSpriteUpdated) onSpriteUpdated();
        if (
          directionSpritesCountBeforeAdding === 0 &&
          frameCount &&
          onFirstSpriteUpdated
        ) {
          onFirstSpriteUpdated();
        }
      } catch (error) {
        console.error('Unable to import GIF:', error);
        await showAlert({
          title: t`Unable to import the GIF`,
          message: t`The GIF could not be imported.`,
          dismissButtonLabel: t`Close`,
        });
      }
    },
    [
      animations,
      canImportGif,
      direction,
      forceUpdate,
      onFirstSpriteUpdated,
      onSpriteAdded,
      onSpriteUpdated,
      project,
      resourceManagementProps,
      showAlert,
    ]
  );

  const deleteSprites = React.useCallback(
    async () => {
      const sprites = selectedSprites.current;
      const firstSpritePtr = animations
        .getAnimation(0)
        .getDirection(0)
        .getSprite(0).ptr;
      const isObjectFirstSpriteDeleted = !!sprites[firstSpritePtr];

      const totalSpritesCount = getTotalSpritesCount(animations);
      const isDeletingLastSprites =
        Object.keys(sprites).length === totalSpritesCount;
      const oneOfSpritesInCurrentDirection =
        direction.getSpritesCount() > 0 ? direction.getSprite(0) : null;

      const isUsingCustomCollisionMask =
        !animations.adaptCollisionMaskAutomatically() &&
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

      mapFor(0, animations.getAnimationsCount(), index => {
        const animation = animations.getAnimation(index);
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
        animations.setAdaptCollisionMaskAutomatically(true);
      }
    },
    [
      onSpriteUpdated,
      onFirstSpriteUpdated,
      animations,
      forceUpdate,
      showConfirmation,
      direction,
    ]
  );

  const duplicateSprites = React.useCallback(
    () => {
      const sprites = selectedSprites.current;
      mapFor(0, animations.getAnimationsCount(), index => {
        const animation = animations.getAnimation(index);
        duplicateSpritesInAnimation(animation, sprites);
      });

      // Clear selection after duplication.
      selectedSprites.current = {};
      forceUpdate();
      if (onSpriteUpdated) onSpriteUpdated();
    },
    [onSpriteUpdated, animations, forceUpdate]
  );

  const addSpriteToSelection = React.useCallback(
    // $FlowFixMe[missing-local-annot]
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
    // $FlowFixMe[missing-local-annot]
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
        onEditWith={(i18n, ResourceExternalEditor) =>
          editDirectionWith(i18n, ResourceExternalEditor, direction)
        }
        onDirectionUpdated={onSpriteUpdated}
      />
      <ResponsiveLineStackLayout noMargin expand alignItems="center">
        <SortableList
          resourcesLoader={resourcesLoader}
          direction={direction}
          project={project}
          resourceManagementProps={resourceManagementProps}
          selectedSprites={selectedSprites.current}
          onSelectSprite={addSpriteToSelection}
          onOpenSpriteContextMenu={openSpriteContextMenu}
          onNativeDragOver={onNativeDragOver}
          onNativeDrop={onNativeDrop}
          onSortEnd={onSortEnd}
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
            {
              label: i18n._(t`Replace image`),
              click: () => {
                const initialResourceSource = resourceSources[0];
                if (initialResourceSource) {
                  onReplaceSprites(initialResourceSource);
                }
              },
              enabled: resourceSources.length > 0,
            },
          ]}
        />
        <Column noMargin>
          <RaisedButtonWithSplitMenu
            onClick={() => {
              onAddSprite(resourceSources[0]);
            }}
            // The event-based object editor gives an empty list.
            disabled={resourceSources.length === 0}
            label={<Trans>Add a sprite</Trans>}
            icon={<Add />}
            primary
            buildMenuTemplate={(i18n: I18nType) => {
              const menuTemplate: Array<any> = resourceSources.map(source => ({
                label: i18n._(source.displayName),
                click: () => onAddSprite(source),
              }));
              if (resourceSources.length) {
                menuTemplate.push(
                  { type: 'separator' },
                  ...(canImportGif
                    ? [
                        {
                          label: i18n._(t`Import GIF...`),
                          click: () => onImportGif(i18n),
                        },
                      ]
                    : []),
                  {
                    label: i18n._(t`Import raw sprite sheet...`),
                    click: () => onImportRawSpriteSheet(resourceSources[0]),
                  }
                );
              }
              return menuTemplate;
            }}
          />
        </Column>
      </ResponsiveLineStackLayout>
      {rawSpriteSheetImport && (
        <RawSpriteSheetImportDialog
          resourceName={rawSpriteSheetImport.resourceName}
          sheetWidth={rawSpriteSheetImport.sheetWidth}
          sheetHeight={rawSpriteSheetImport.sheetHeight}
          onApply={addRawSpriteSheetFrames}
          onRequestClose={() => setRawSpriteSheetImport(null)}
        />
      )}
    </ColumnStackLayout>
  );
};

export default SpritesList;
