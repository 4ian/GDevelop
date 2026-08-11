// @flow
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
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
import {
  getDroppedResourceFilePathsFromDataTransfer,
  hasDroppedResourceFileData,
  importDroppedResourceFileAsProjectResource,
} from '../../../ResourcesList/ResourceSelectorWithThumbnail';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { makeDragSourceAndDropTarget } from '../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { makeDropTarget } from '../../../UI/DragAndDrop/DropTarget';
import { useAutoScrollDuringDrag } from '../../../UI/DragAndDrop/UseAutoScrollDuringDrag';
import { ColumnDropIndicator } from '../../../MainFrame/EditorTabs/DropIndicator';
import { useDragDropManager } from 'react-dnd';

const gd: libGDevelop = global.gd;

const SPRITE_SIZE = 100;

const styles = {
  spritesList: {
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    flex: 1,
  },
  spriteAndIndicator: {
    display: 'flex',
    flexShrink: 0,
  },
  spriteDragSource: {
    display: 'flex',
  },
  // A drop zone to allow moving a sprite at the end of the list. It also
  // grows to fill the empty space after the last sprite, if any.
  endOfListDropZone: {
    display: 'flex',
    flex: 1,
    minWidth: 30,
  },
  thumbnailExtraStyle: {
    marginLeft: 5,
  },
  spriteDropTarget: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
};

// `name` and `thumbnail` are displayed by the `CustomDragLayer` as a preview
// under the cursor or finger during the drag.
type DraggedSpriteItem = {|
  directionPtr: number,
  name: string,
  thumbnail: string,
|};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<DraggedSpriteItem>(
  'sprite-editor-sprites-list',
  { vibrate: 100 }
);
const EndOfListDropTarget = makeDropTarget<DraggedSpriteItem>(
  'sprite-editor-sprites-list'
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

export const addAnimationFrame = (
  animations: gdSpriteAnimationList,
  direction: gdDirection,
  resource: gdResource,
  onSpriteAdded: (sprite: gdSprite) => void
) => {
  const sprite = new gd.Sprite();
  sprite.setImageName(resource.getName());

  applyPointsAndMasksToSpriteIfNecessary(animations, direction, sprite);

  onSpriteAdded(sprite); // Call the callback before `addSprite`, as `addSprite` will store a copy of it.
  direction.addSprite(sprite);
  sprite.delete();
};

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
  const forceUpdate = useForceUpdate();
  const { showConfirmation } = useAlertDialog();
  const [isDraggedOver, setDraggedOver] = React.useState<boolean>(false);
  const dragDropManager = useDragDropManager();

  const storageProvider = resourceManagementProps.getStorageProvider();
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

  const moveSpriteToIndex = React.useCallback(
    (oldIndex: number, newIndex: number) => {
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

  const draggedSpriteIndex = React.useRef<number | null>(null);
  const spritesListRef = React.useRef<HTMLDivElement | null>(null);
  const getSpritesListElement = React.useCallback(
    () => spritesListRef.current,
    []
  );
  const { startAutoScroll, stopAutoScroll } = useAutoScrollDuringDrag(
    getSpritesListElement
  );

  const dropBeforeSprite = React.useCallback(
    (targetIndex: number) => {
      const oldIndex = draggedSpriteIndex.current;
      if (oldIndex === null) return;
      draggedSpriteIndex.current = null;
      // The sprite is inserted before the hovered sprite, so when moving
      // forward, the target index is decreased by one to account for the
      // removal of the sprite from its previous position.
      moveSpriteToIndex(
        oldIndex,
        targetIndex > oldIndex ? targetIndex - 1 : targetIndex
      );
    },
    [moveSpriteToIndex]
  );

  const dropAtEndOfList = React.useCallback(
    () => {
      const oldIndex = draggedSpriteIndex.current;
      if (oldIndex === null) return;
      draggedSpriteIndex.current = null;
      moveSpriteToIndex(oldIndex, direction.getSpritesCount() - 1);
    },
    [moveSpriteToIndex, direction]
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
      });

      if (!selectedResources.length) return;
      const selectedResourceSource = resourceSources.find(
        source => source.name === selectedSourceName
      );
      if (!selectedResourceSource) return;

      let hasCreatedAnyResource = false;
      if (selectedResourceSource.shouldCreateResource) {
        selectedResources.forEach(resource => {
          applyResourceDefaults(project, resource);
          const hasCreatedResource = project
            .getResourcesManager()
            .addResource(resource);
          hasCreatedAnyResource = hasCreatedAnyResource || hasCreatedResource;
        });
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

      if (selectedResourceSource.shouldCreateResource) {
        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        selectedResources.forEach(resource => resource.delete());
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

  const canDropImageFiles =
    storageProvider.internalName === 'LocalFile' && !!project.getProjectFile();

  const hasSupportedDropData = React.useCallback(
    (event: any): boolean =>
      canDropImageFiles &&
      hasDroppedResourceFileData(event.dataTransfer, 'image'),
    [canDropImageFiles]
  );

  const keepDropActive = React.useCallback(
    (event: any) => {
      if (!hasSupportedDropData(event)) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      setDraggedOver(true);
    },
    [hasSupportedDropData]
  );

  const onDropImageFiles = React.useCallback(
    async (event: any) => {
      if (!hasSupportedDropData(event)) return;

      event.preventDefault();
      event.stopPropagation();
      setDraggedOver(false);

      const imageFilePaths = getDroppedResourceFilePathsFromDataTransfer(
        event.dataTransfer,
        'image'
      );
      if (!imageFilePaths.length) return;

      const directionSpritesCountBeforeAdding = direction.getSpritesCount();
      let hasCreatedAnyResource = false;
      let hasAddedAnySprite = false;
      let importError: any = null;

      for (const imageFilePath of imageFilePaths) {
        try {
          const {
            resourceName,
            hasCreatedResource,
          } = await importDroppedResourceFileAsProjectResource({
            project,
            resourceKind: 'image',
            filePath: imageFilePath,
          });
          hasCreatedAnyResource = hasCreatedAnyResource || hasCreatedResource;

          const resource = project
            .getResourcesManager()
            .getResource(resourceName);
          addAnimationFrame(animations, direction, resource, onSpriteAdded);
          hasAddedAnySprite = true;
        } catch (error) {
          importError = error;
          console.error('Unable to import dropped sprite image:', error);
        }
      }

      if (hasAddedAnySprite) {
        forceUpdate();

        if (hasCreatedAnyResource) {
          await resourceManagementProps.onFetchNewlyAddedResources();
          resourceManagementProps.onNewResourcesAdded();
        }
        if (onSpriteUpdated) onSpriteUpdated();
        if (directionSpritesCountBeforeAdding === 0 && onFirstSpriteUpdated) {
          onFirstSpriteUpdated();
        }
      }

      if (importError) {
        showErrorBox({
          message:
            'One or more images could not be imported. Check that the files can be read.',
          rawError: importError,
          errorId: 'sprite-image-drop-import-error',
        });
      }
    },
    [
      animations,
      direction,
      forceUpdate,
      hasSupportedDropData,
      onFirstSpriteUpdated,
      onSpriteAdded,
      onSpriteUpdated,
      project,
      resourceManagementProps,
    ]
  );

  const deleteSprites = React.useCallback(
    async () => {
      const sprites = selectedSprites.current;
      // The first direction of the first animation can be empty (for example,
      // when editing another animation of the object).
      const firstObjectSprite = getCurrentElements(animations, 0, 0, 0).sprite;
      const isObjectFirstSpriteDeleted =
        !!firstObjectSprite && !!sprites[firstObjectSprite.ptr];

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
    (spritePtr: number, selected: boolean) => {
      selectedSprites.current = {
        ...selectedSprites.current,
        [spritePtr]: selected,
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const selectUniqueSprite = React.useCallback(
    (spritePtr: number) => {
      selectedSprites.current = {
        [spritePtr]: true,
      };
      forceUpdate();
    },
    [forceUpdate]
  );

  const getSelectedSpriteIndexes = React.useCallback(
    () => {
      const selectedIndexes = [];
      mapFor(0, direction.getSpritesCount(), i => {
        if (selectedSprites.current[direction.getSprite(i).ptr]) {
          selectedIndexes.push(i);
        }
      });
      return selectedIndexes;
    },
    [direction]
  );

  const moveSelectedSpritesToPosition = React.useCallback(
    (targetStartIndex: number) => {
      const spritesCount = direction.getSpritesCount();
      const selectedIndexes = getSelectedSpriteIndexes();
      if (selectedIndexes.length === 0) return;
      const startIndex = Math.min(
        targetStartIndex,
        spritesCount - selectedIndexes.length
      );

      // First gather the selected sprites at the end of the list, in order:
      // moving a sprite to the last position never disturbs the sprites
      // already gathered there. `currentPositions` keeps track of how each
      // move shifts the other sprites.
      const selectedCount = selectedIndexes.length;
      const currentPositions = mapFor(0, spritesCount, i => i);
      selectedIndexes.forEach(selectedIndex => {
        const fromIndex = currentPositions.indexOf(selectedIndex);
        if (fromIndex !== spritesCount - 1) {
          direction.moveSprite(fromIndex, spritesCount - 1);
        }
        currentPositions.push(currentPositions.splice(fromIndex, 1)[0]);
      });
      // Then move this block of sprites to its final position, in order:
      // each move leaves the rest of the block in place.
      mapFor(0, selectedCount, j => {
        const fromIndex = spritesCount - selectedCount + j;
        const toIndex = startIndex + j;
        if (fromIndex !== toIndex) direction.moveSprite(fromIndex, toIndex);
      });

      // As sprites were moved, the pointers of the selected sprites are now
      // the ones at the final positions of the selection.
      const newSelectedSprites: { [number]: boolean } = {};
      mapFor(0, selectedCount, j => {
        newSelectedSprites[direction.getSprite(startIndex + j).ptr] = true;
      });
      selectedSprites.current = newSelectedSprites;

      forceUpdate();
      if (onSpriteUpdated) onSpriteUpdated();
      if (startIndex === 0 || selectedIndexes[0] === 0) {
        // A sprite was moved from or to the first position,
        // so the first sprite has changed.
        if (onFirstSpriteUpdated) onFirstSpriteUpdated();
      }
    },
    [
      direction,
      getSelectedSpriteIndexes,
      forceUpdate,
      onSpriteUpdated,
      onFirstSpriteUpdated,
    ]
  );

  const openSpriteContextMenu = React.useCallback(
    (x: number, y: number, spritePtr: number) => {
      // When the context menu opens (long press on mobile), it intercepts
      // subsequent touch events, so the drag backend would never receive
      // touchend and a drag started by the press would stay active
      // indefinitely. End it explicitly before opening the menu.
      if (dragDropManager.getMonitor().isDragging()) {
        dragDropManager.getActions().endDrag();
      }
      // If the sprite is not selected, select only it.
      if (!selectedSprites.current[spritePtr]) {
        selectUniqueSprite(spritePtr);
      }
      // Otherwise, keep the selection as is.
      if (spriteContextMenu.current) {
        spriteContextMenu.current.open(x, y);
      }
    },
    [selectUniqueSprite, dragDropManager]
  );

  const spritesCount = direction.getSpritesCount();
  const hasMoreThanOneSprite = spritesCount > 1;

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
        <div
          style={{
            ...styles.spriteDropTarget,
            outline: isDraggedOver ? '1px dashed #8f72ff' : undefined,
            outlineOffset: 2,
          }}
          onDragEnter={keepDropActive}
          onDragOver={keepDropActive}
          onDragLeave={() => setDraggedOver(false)}
          onDrop={onDropImageFiles}
        >
          <div style={styles.spritesList} ref={spritesListRef}>
            {mapFor(0, spritesCount, i => {
              const sprite = direction.getSprite(i);
              // Extract the sprite pointer and image name right away: the
              // closures below can be called by react-dnd after the underlying
              // C++ sprite was moved or deleted (following a drag'n'drop or a
              // deletion), but before this component is re-rendered. `sprite`
              // would then be a dangling wrapper: calling any of its methods
              // would crash the editor - so closures must only capture these
              // primitives.
              const spritePtr = sprite.ptr;
              const imageName = sprite.getImageName();
              return (
                <DragSourceAndDropTarget
                  key={spritePtr}
                  beginDrag={() => {
                    draggedSpriteIndex.current = i;
                    startAutoScroll();
                    return {
                      directionPtr: direction.ptr,
                      name: imageName,
                      thumbnail: resourcesLoader.getResourceFullUrl(
                        project,
                        imageName,
                        {}
                      ),
                    };
                  }}
                  endDrag={stopAutoScroll}
                  // If there is only one sprite, don't make it draggable.
                  canDrag={() => hasMoreThanOneSprite}
                  // Only allow moving sprites within the same direction.
                  canDrop={item => item.directionPtr === direction.ptr}
                  drop={() => dropBeforeSprite(i)}
                >
                  {({
                    connectDragSource,
                    connectDropTarget,
                    isOver,
                    canDrop,
                  }) =>
                    connectDropTarget(
                      <div style={styles.spriteAndIndicator}>
                        {isOver && canDrop && <ColumnDropIndicator />}
                        {connectDragSource(
                          <div style={styles.spriteDragSource}>
                            <ImageThumbnail
                              selectable
                              selected={!!selectedSprites.current[spritePtr]}
                              onSelect={selected =>
                                addSpriteToSelection(spritePtr, selected)
                              }
                              onContextMenu={(x, y) =>
                                openSpriteContextMenu(x, y, spritePtr)
                              }
                              resourceName={imageName}
                              resourcesLoader={resourcesLoader}
                              project={project}
                              style={i === 0 ? {} : styles.thumbnailExtraStyle}
                              size={SPRITE_SIZE}
                            />
                          </div>
                        )}
                      </div>
                    )
                  }
                </DragSourceAndDropTarget>
              );
            })}
            {spritesCount === 0 ? (
              <ImageThumbnail
                key="empty"
                project={project}
                resourceName=""
                resourcesLoader={resourcesLoader}
                size={SPRITE_SIZE}
              />
            ) : (
              <EndOfListDropTarget
                canDrop={item => item.directionPtr === direction.ptr}
                drop={dropAtEndOfList}
              >
                {({ connectDropTarget, isOver, canDrop }) =>
                  connectDropTarget(
                    <div style={styles.endOfListDropZone}>
                      {isOver && canDrop && <ColumnDropIndicator />}
                    </div>
                  )
                }
              </EndOfListDropTarget>
            )}
          </div>
        </div>
        <ContextMenu
          ref={spriteContextMenu}
          buildMenuTemplate={(i18n: I18nType) => {
            // Read the sprites and the selection when the menu is opened,
            // so that the menu is always up to date.
            const menuSpritesCount = direction.getSpritesCount();
            const selectedIndexes = getSelectedSpriteIndexes();
            // The position at which the selection starts when moved to the end.
            const lastStartIndex = menuSpritesCount - selectedIndexes.length;
            const isSelectionAtPosition = (startIndex: number) =>
              selectedIndexes.every(
                (selectedIndex, j) => selectedIndex === startIndex + j
              );
            return [
              {
                label: i18n._(t`Delete selection`),
                click: deleteSprites,
              },
              {
                label: i18n._(t`Duplicate selection`),
                click: duplicateSprites,
              },
              ...(menuSpritesCount > 1 && selectedIndexes.length > 0
                ? [
                    { type: 'separator' },
                    {
                      label: i18n._(t`Move to beginning`),
                      click: () => moveSelectedSpritesToPosition(0),
                      enabled: !isSelectionAtPosition(0),
                    },
                    ...(lastStartIndex >= 2
                      ? [
                          {
                            label: i18n._(t`Move to position`),
                            submenu: mapFor(1, lastStartIndex, index => ({
                              label: i18n._(t`Position ${index}`),
                              click: () => moveSelectedSpritesToPosition(index),
                              enabled: !isSelectionAtPosition(index),
                            })),
                          },
                        ]
                      : []),
                    {
                      label: i18n._(t`Move to end`),
                      click: () =>
                        moveSelectedSpritesToPosition(lastStartIndex),
                      enabled: !isSelectionAtPosition(lastStartIndex),
                    },
                  ]
                : []),
            ];
          }}
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
    </ColumnStackLayout>
  );
};

export default SpritesList;
