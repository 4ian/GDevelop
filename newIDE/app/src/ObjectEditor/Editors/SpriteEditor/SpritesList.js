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
  deleteSpritesByIndexes,
  duplicateSpritesByIndexes,
  getSpriteIndexAfterMove,
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
  // The direction is designated by its indexes rather than passed as a
  // `gdDirection`, so that it can be resolved again on every render.
  // See `direction` in the component.
  animationIndex: number,
  directionIndex: number,
  // Changed when the animations are modified from outside this component
  // (an animation added, moved, removed...). See `selectedSpriteIndexes`.
  animationsChangeTrigger: {},
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceManagementProps: ResourceManagementProps,
  editDirectionWith: (
    i18n: I18nType,
    externalEditor: ResourceExternalEditor
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
  animationIndex,
  directionIndex,
  animationsChangeTrigger,
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
  // The selected sprites, as their indexes in the direction. It's kept in a
  // ref, so that it can be read and updated synchronously when a context menu
  // is opened - a state would only be updated after the menu opened. In
  // exchange, a force update is needed every time the selection changes.
  const selectedSpriteIndexes = React.useRef<Set<number>>(new Set());
  const spriteContextMenu = React.useRef<?ContextMenuInterface>(null);
  const forceUpdate = useForceUpdate();
  const { showConfirmation } = useAlertDialog();
  const dragDropManager = useDragDropManager();

  const setSelectedSpriteIndexes = React.useCallback(
    (spriteIndexes: Set<number>) => {
      selectedSpriteIndexes.current = spriteIndexes;
      forceUpdate();
    },
    [forceUpdate]
  );

  // The selection designates sprites by their index: reset it when the
  // animations are changed from outside this component, as the same indexes
  // would then designate other sprites.
  React.useEffect(
    () => {
      if (selectedSpriteIndexes.current.size === 0) return;
      setSelectedSpriteIndexes(new Set());
    },
    [animationsChangeTrigger, setSelectedSpriteIndexes]
  );

  // The C++ vectors holding the animations and their sprites are reallocated
  // as soon as an animation or a sprite is added or removed. Any `gdDirection`
  // or `gdSprite` wrapper obtained before such a change is then dangling:
  // using it reads freed memory and crashes the whole editor with a
  // "memory access out of bounds" error.
  //
  // `animations` is stable (it's owned by the object), so instead of ever
  // storing a `gdDirection`, it's resolved from its indexes at every render
  // and at the beginning of every callback - at the moment it's used, never
  // before. Returns null if the animation or direction doesn't exist (anymore).
  const getDirection = React.useCallback(
    (): ?gdDirection =>
      getCurrentElements(animations, animationIndex, directionIndex, 0)
        .direction,
    [animations, animationIndex, directionIndex]
  );

  const getSelectedSpriteIndexes = React.useCallback(
    (): Array<number> => {
      const direction = getDirection();
      if (!direction) return [];
      const spritesCount = direction.getSpritesCount();
      return [...selectedSpriteIndexes.current]
        .filter(spriteIndex => spriteIndex < spritesCount)
        .sort((a, b) => a - b);
    },
    [getDirection]
  );

  const storageProvider = resourceManagementProps.getStorageProvider();
  const resourceSources = resourceManagementProps.resourceSources
    .filter(source => source.kind === 'image')
    .filter(
      ({ onlyForStorageProvider }) =>
        !onlyForStorageProvider ||
        onlyForStorageProvider === storageProvider.internalName
    );

  const moveSpriteToIndex = React.useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return;
      const direction = getDirection();
      if (!direction) return;
      direction.moveSprite(oldIndex, newIndex);

      // Move the selection along with the moved sprite.
      setSelectedSpriteIndexes(
        new Set(
          [...selectedSpriteIndexes.current].map(spriteIndex =>
            getSpriteIndexAfterMove(spriteIndex, oldIndex, newIndex)
          )
        )
      );
      onSpriteUpdated && onSpriteUpdated();
      if (oldIndex === 0 || newIndex === 0) {
        // If a sprite was moved from or to the first position,
        // then the first sprite has changed.
        onFirstSpriteUpdated && onFirstSpriteUpdated();
      }
    },
    [
      getDirection,
      setSelectedSpriteIndexes,
      onSpriteUpdated,
      onFirstSpriteUpdated,
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
      const direction = getDirection();
      if (!direction) return;
      moveSpriteToIndex(oldIndex, direction.getSpritesCount() - 1);
    },
    [getDirection, moveSpriteToIndex]
  );

  const onAddSprite = React.useCallback(
    async (initialResourceSource: ResourceSource) => {
      const directionBeforeAdding = getDirection();
      if (!directionBeforeAdding) return;
      const directionSpritesCountBeforeAdding = directionBeforeAdding.getSpritesCount();
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

      // Resolve the direction again: the animations could have been changed
      // while the resources were being chosen.
      const direction = getDirection();
      if (!direction) return;

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
      getDirection,
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

  const deleteSprites = React.useCallback(
    async () => {
      const direction = getDirection();
      if (!direction) return;
      const spriteIndexesToDelete = getSelectedSpriteIndexes();
      if (spriteIndexesToDelete.length === 0) return;

      const isDeletingLastSprites =
        spriteIndexesToDelete.length === getTotalSpritesCount(animations);
      const isUsingCustomCollisionMask =
        !animations.adaptCollisionMaskAutomatically() &&
        !direction.getSprite(0).isFullImageCollisionMask();
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

      // Resolve the direction again: the animations could have been changed
      // while the confirmation was shown.
      const directionAfterConfirmation = getDirection();
      if (!directionAfterConfirmation) return;
      const isObjectFirstSpriteDeleted =
        animationIndex === 0 &&
        directionIndex === 0 &&
        spriteIndexesToDelete[0] === 0;
      deleteSpritesByIndexes(directionAfterConfirmation, spriteIndexesToDelete);

      setSelectedSpriteIndexes(new Set());
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
      getDirection,
      getSelectedSpriteIndexes,
      setSelectedSpriteIndexes,
      animationIndex,
      directionIndex,
      onSpriteUpdated,
      onFirstSpriteUpdated,
      animations,
      showConfirmation,
    ]
  );

  const duplicateSprites = React.useCallback(
    () => {
      const direction = getDirection();
      if (!direction) return;
      duplicateSpritesByIndexes(direction, getSelectedSpriteIndexes());

      // Clear selection after duplication.
      setSelectedSpriteIndexes(new Set());
      if (onSpriteUpdated) onSpriteUpdated();
    },
    [
      getDirection,
      getSelectedSpriteIndexes,
      setSelectedSpriteIndexes,
      onSpriteUpdated,
    ]
  );

  const addSpriteToSelection = React.useCallback(
    (spriteIndex: number, selected: boolean) => {
      const spriteIndexes = new Set(selectedSpriteIndexes.current);
      if (selected) spriteIndexes.add(spriteIndex);
      else spriteIndexes.delete(spriteIndex);
      setSelectedSpriteIndexes(spriteIndexes);
    },
    [setSelectedSpriteIndexes]
  );

  const selectUniqueSprite = React.useCallback(
    (spriteIndex: number) => {
      setSelectedSpriteIndexes(new Set([spriteIndex]));
    },
    [setSelectedSpriteIndexes]
  );

  const moveSelectedSpritesToPosition = React.useCallback(
    (targetStartIndex: number) => {
      const direction = getDirection();
      if (!direction) return;
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

      // The selection is now the block of sprites at its final position.
      setSelectedSpriteIndexes(
        new Set(mapFor(0, selectedCount, j => startIndex + j))
      );
      if (onSpriteUpdated) onSpriteUpdated();
      if (startIndex === 0 || selectedIndexes[0] === 0) {
        // A sprite was moved from or to the first position,
        // so the first sprite has changed.
        if (onFirstSpriteUpdated) onFirstSpriteUpdated();
      }
    },
    [
      getDirection,
      getSelectedSpriteIndexes,
      setSelectedSpriteIndexes,
      onSpriteUpdated,
      onFirstSpriteUpdated,
    ]
  );

  const openSpriteContextMenu = React.useCallback(
    (x: number, y: number, spriteIndex: number) => {
      // When the context menu opens (long press on mobile), it intercepts
      // subsequent touch events, so the drag backend would never receive
      // touchend and a drag started by the press would stay active
      // indefinitely. End it explicitly before opening the menu.
      if (dragDropManager.getMonitor().isDragging()) {
        dragDropManager.getActions().endDrag();
      }
      // If the sprite is not selected, select only it.
      if (!selectedSpriteIndexes.current.has(spriteIndex)) {
        selectUniqueSprite(spriteIndex);
      }
      // Otherwise, keep the selection as is.
      if (spriteContextMenu.current) {
        spriteContextMenu.current.open(x, y);
      }
    },
    [selectUniqueSprite, dragDropManager]
  );

  const direction = getDirection();
  // The direction no longer exists (the animation or the direction was
  // removed): there is nothing to render, and the parent will re-render
  // without this component soon.
  if (!direction) return null;

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
        onEditWith={editDirectionWith}
        onDirectionUpdated={onSpriteUpdated}
      />
      <ResponsiveLineStackLayout noMargin expand alignItems="center">
        <div style={styles.spritesList} ref={spritesListRef}>
          {mapFor(0, spritesCount, i => {
            // Extract the image name right away: the closures below can be
            // called by react-dnd after the underlying C++ sprite was moved
            // or deleted (following a drag'n'drop or a deletion), but before
            // this component is re-rendered. The `gdSprite` would then be a
            // dangling wrapper: calling any of its methods would crash the
            // editor - so closures must only capture primitives.
            const imageName = direction.getSprite(i).getImageName();
            return (
              <DragSourceAndDropTarget
                key={i}
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
                {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
                  connectDropTarget(
                    <div style={styles.spriteAndIndicator}>
                      {isOver && canDrop && <ColumnDropIndicator />}
                      {connectDragSource(
                        <div style={styles.spriteDragSource}>
                          <ImageThumbnail
                            selectable
                            selected={selectedSpriteIndexes.current.has(i)}
                            onSelect={selected =>
                              addSpriteToSelection(i, selected)
                            }
                            onContextMenu={(x, y) =>
                              openSpriteContextMenu(x, y, i)
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
        <ContextMenu
          ref={spriteContextMenu}
          buildMenuTemplate={(i18n: I18nType) => {
            // Read the direction, the sprites and the selection when the menu
            // is opened, so that the menu is always up to date.
            const direction = getDirection();
            if (!direction) return [];
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
