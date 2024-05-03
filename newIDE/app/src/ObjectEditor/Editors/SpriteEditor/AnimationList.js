// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import SpritesList, {
  addAnimationFrame,
  applyPointsAndMasksToSpriteIfNecessary,
} from './SpritesList';
import IconButton from '../../../UI/IconButton';
import { mapFor } from '../../../Utils/MapFor';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Text from '../../../UI/Text';
import ResourcesLoader from '../../../ResourcesLoader';
import { Column, Line, Spacer } from '../../../UI/Grid';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import { EmptyPlaceholder } from '../../../UI/EmptyPlaceholder';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import Trash from '../../../UI/CustomSvgIcons/Trash';
import { makeDragSourceAndDropTarget } from '../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { DragHandleIcon } from '../../../UI/DragHandle';
import DropIndicator from '../../../UI/SortableVirtualizedItemList/DropIndicator';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import {
  copySpritePoints,
  copySpritePolygons,
  getCurrentElements,
  getTotalSpritesCount,
  getFirstAnimationFrame,
} from './Utils/SpriteObjectHelper';
import Edit from '../../../UI/CustomSvgIcons/Edit';
import { groupResourcesByAnimations } from './AnimationImportHelper';
import { applyResourceDefaults } from '../../../ResourcesList/ResourceUtils';
import { ExternalEditorOpenedDialog } from '../../../UI/ExternalEditorOpenedDialog';
import {
  type ResourceExternalEditor,
  type EditWithExternalEditorReturn,
} from '../../../ResourcesList/ResourceExternalEditor';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { type UnsavedChanges } from '../../../MainFrame/UnsavedChangesContext';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { type ScrollViewInterface } from '../../../UI/ScrollView';

const gd: libGDevelop = global.gd;

const removeExtensionFromFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? fileName : fileName.substring(0, dotIndex);
};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget(
  'sprite-animations-list'
);

const styles = {
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
  },
  rowContent: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  animationLine: {
    // Use a non standard spacing because:
    // - The SortableAnimationsList won't work with <Spacer /> or <LargeSpacer /> between elements.
    // - We need to visually show a difference between animations.
    marginBottom: 16,
  },
};

export type AnimationListInterface = {|
  forceUpdate: () => void,
  addAnimation: () => void,
|};

type AnimationListProps = {|
  project: gdProject,
  // TODO EBO : Layout and EventBasedObject should have a common interface to
  // browse their events. It would allow to refactor the events when an
  // animation is renamed for instance.
  /**
   * The layout is used to adapt events when an identifier is renamed
   * (for instance, an object animation or a layer name).
   */
  layout?: gdLayout,
  /**
   * The edited object. It can be undefined for sub-ObjectConfiguration of
   * custom object. There is no event to refactor in this case.
   */
  object?: gdObject,
  /**
   * The object name used to build default file name for Piskel.
   * For custom objects, the children names are appended.
   */
  objectName: string,
  resourceManagementProps: ResourceManagementProps,
  onSizeUpdated: () => void,
  onObjectUpdated?: () => void,
  unsavedChanges?: UnsavedChanges,
  animations: gdSpriteAnimationList,
  isAnimationListLocked?: boolean,
  scrollView: { current: ?ScrollViewInterface },
  onCreateMatchingSpriteCollisionMask: () => Promise<void>,
|};

const AnimationList = React.forwardRef<
  AnimationListProps,
  AnimationListInterface
>(
  (
    {
      animations,
      project,
      layout,
      object,
      objectName,
      resourceManagementProps,
      onSizeUpdated,
      onObjectUpdated,
      isAnimationListLocked = false,
      scrollView,
      onCreateMatchingSpriteCollisionMask,
    },
    ref
  ) => {
    const [externalEditorOpened, setExternalEditorOpened] = React.useState(
      false
    );
    const abortControllerRef = React.useRef<?AbortController>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const { showConfirmation } = useAlertDialog();

    const [
      justAddedAnimationName,
      setJustAddedAnimationName,
    ] = React.useState<?string>(null);
    const justAddedAnimationElement = React.useRef<?any>(null);

    React.useEffect(
      () => {
        if (
          scrollView.current &&
          justAddedAnimationElement.current &&
          justAddedAnimationName
        ) {
          scrollView.current.scrollTo(justAddedAnimationElement.current);
          setJustAddedAnimationName(null);
          justAddedAnimationElement.current = null;
        }
      },
      [justAddedAnimationName, scrollView]
    );
    const { showDeleteConfirmation } = useAlertDialog();

    const draggedAnimationIndex = React.useRef<number | null>(null);

    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    const [nameErrors, setNameErrors] = React.useState<{
      [number]: React.Node,
    }>({});

    const onApplyFirstSpriteCollisionMaskToSprite = React.useCallback(
      (sprite: gdSprite) => {
        const firstSprite = getFirstAnimationFrame(animations);
        if (!firstSprite) {
          return;
        }
        sprite.setFullImageCollisionMask(
          firstSprite.isFullImageCollisionMask()
        );
        sprite.setCustomCollisionMask(firstSprite.getCustomCollisionMask());

        forceUpdate();
      },
      [animations, forceUpdate]
    );

    const moveAnimation = React.useCallback(
      (targetIndex: number) => {
        const draggedIndex = draggedAnimationIndex.current;
        if (draggedIndex === null) return;

        setNameErrors({});

        animations.moveAnimation(
          draggedIndex,
          targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
        );
        if (
          (draggedIndex === 0 || targetIndex === 0) &&
          animations.adaptCollisionMaskAutomatically()
        ) {
          // If the first animation is changed and the collision mask is adapted automatically,
          // then we need to recompute it.
          onCreateMatchingSpriteCollisionMask();
        }
        forceUpdate();
      },
      [animations, forceUpdate, onCreateMatchingSpriteCollisionMask]
    );

    const onSpriteAdded = React.useCallback(
      (sprite: gdSprite) => {
        // If a sprite is added, we want to ensure it gets the automatic
        // collision mask of the object, if the option is enabled.
        if (animations.adaptCollisionMaskAutomatically()) {
          onApplyFirstSpriteCollisionMaskToSprite(sprite);
        }
      },
      [onApplyFirstSpriteCollisionMaskToSprite, animations]
    );

    const addAnimations = React.useCallback(
      (resourcesByAnimation: Map<string, Array<gdResource>>) => {
        setNameErrors({});

        for (const [name, resources] of resourcesByAnimation) {
          const animation = new gd.Animation();
          animation.setName(name);
          animation.setDirectionsCount(1);
          const direction = animation.getDirection(0);
          for (const resource of resources) {
            addAnimationFrame(animations, direction, resource, onSpriteAdded);
          }
          animations.addAnimation(animation);
          animation.delete();
        }
        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();
      },
      [forceUpdate, onObjectUpdated, onSizeUpdated, onSpriteAdded, animations]
    );

    const addAnimation = React.useCallback(
      () => {
        setNameErrors({});

        const emptyAnimation = new gd.Animation();
        emptyAnimation.setDirectionsCount(1);
        animations.addAnimation(emptyAnimation);
        emptyAnimation.delete();
        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();

        // Scroll to the bottom of the list.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          if (scrollView.current) {
            scrollView.current.scrollToBottom();
          }
        }, 100); // A few ms is enough for a new render to be done.
      },
      [animations, forceUpdate, onSizeUpdated, onObjectUpdated, scrollView]
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
      addAnimation,
    }));

    const removeAnimation = React.useCallback(
      async (index: number, i18n: I18nType) => {
        const totalSpritesCount = getTotalSpritesCount(animations);
        const isDeletingLastSprites =
          animations
            .getAnimation(index)
            .getDirection(0)
            .getSpritesCount() === totalSpritesCount;
        const firstSpriteInAnimationDeleted = getCurrentElements(
          animations,
          index,
          0,
          0
        ).sprite;
        const isUsingCustomCollisionMask =
          !animations.adaptCollisionMaskAutomatically() &&
          firstSpriteInAnimationDeleted &&
          !firstSpriteInAnimationDeleted.isFullImageCollisionMask();
        const shouldWarnBecauseLosingCustomCollisionMask =
          isDeletingLastSprites && isUsingCustomCollisionMask;

        const message = shouldWarnBecauseLosingCustomCollisionMask
          ? t`Are you sure you want to remove this animation? You will lose the custom collision mask you have set for this object.`
          : t`Are you sure you want to remove this animation?`;
        const deleteAnswer = await showDeleteConfirmation({
          title: t`Remove the animation`,
          message,
          confirmButtonLabel: t`Remove`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!deleteAnswer) return;

        setNameErrors({});

        animations.removeAnimation(index);
        forceUpdate();
        onSizeUpdated();
        if (index === 0 && animations.adaptCollisionMaskAutomatically()) {
          // If the first animation is removed and the collision mask is
          // automatically adapted, then recompute it.
          onCreateMatchingSpriteCollisionMask();
        }
        if (shouldWarnBecauseLosingCustomCollisionMask) {
          // The user has deleted the last custom collision mask, so revert to automatic
          // collision mask adaptation.
          animations.setAdaptCollisionMaskAutomatically(true);
        }
        if (onObjectUpdated) onObjectUpdated();
      },
      [
        forceUpdate,
        onObjectUpdated,
        onSizeUpdated,
        showDeleteConfirmation,
        animations,
        onCreateMatchingSpriteCollisionMask,
      ]
    );

    const changeAnimationName = React.useCallback(
      (changedAnimationIndex: number, newName: string) => {
        const animation = animations.getAnimation(changedAnimationIndex);
        const currentName = animation.getName();
        if (currentName === newName) return;

        setNameErrors({});

        const otherNames = mapFor(0, animations.getAnimationsCount(), index => {
          return index === changedAnimationIndex
            ? undefined // Don't check the current animation name as we're changing it.
            : animations.getAnimation(index).getName();
        }).filter(Boolean);

        if (newName !== '' && otherNames.some(name => name === newName)) {
          // The indexes can be used as a key because errors are cleared when
          // animations are moved.
          setNameErrors({
            ...nameErrors,
            [changedAnimationIndex]: (
              <Trans>The animation name {newName} is already taken</Trans>
            ),
          });
          return;
        }

        animation.setName(newName);
        // TODO EBO Refactor event-based object events when an animation is renamed.
        if (layout && object) {
          gd.WholeProjectRefactorer.renameObjectAnimation(
            project,
            layout,
            object,
            currentName,
            newName
          );
        }
        forceUpdate();
        if (onObjectUpdated) onObjectUpdated();
      },
      [
        forceUpdate,
        layout,
        nameErrors,
        object,
        onObjectUpdated,
        project,
        animations,
      ]
    );

    const replaceDirection = React.useCallback(
      (animationId, directionId, newDirection) => {
        animations
          .getAnimation(animationId)
          .setDirection(newDirection, directionId);
        forceUpdate();
        if (onObjectUpdated) onObjectUpdated();
      },
      [forceUpdate, onObjectUpdated, animations]
    );

    const storageProvider = resourceManagementProps.getStorageProvider();
    const resourceSources = resourceManagementProps.resourceSources
      .filter(source => source.kind === 'image')
      .filter(
        ({ onlyForStorageProvider }) =>
          !onlyForStorageProvider ||
          onlyForStorageProvider === storageProvider.internalName
      );

    const adaptCollisionMaskIfNeeded = React.useCallback(
      () => {
        if (animations.adaptCollisionMaskAutomatically()) {
          onCreateMatchingSpriteCollisionMask();
        }
      },
      [onCreateMatchingSpriteCollisionMask, animations]
    );

    const importImages = React.useCallback(
      async () => {
        const resources = await resourceManagementProps.onChooseResource({
          initialSourceName: resourceSources[0].name,
          multiSelection: true,
          resourceKind: 'image',
        });
        if (resources.length === 0) {
          return;
        }
        resources.forEach(resource => {
          applyResourceDefaults(project, resource);
          project.getResourcesManager().addResource(resource);
        });

        addAnimations(groupResourcesByAnimations(resources));

        // Important, we are responsible for deleting the resources that were given to us.
        // Otherwise we have a memory leak, as calling addResource is making a copy of the resource.
        resources.forEach(resource => resource.delete());

        forceUpdate();

        await resourceManagementProps.onFetchNewlyAddedResources();

        adaptCollisionMaskIfNeeded();
        if (onObjectUpdated) onObjectUpdated();
      },
      [
        resourceManagementProps,
        resourceSources,
        addAnimations,
        forceUpdate,
        adaptCollisionMaskIfNeeded,
        onObjectUpdated,
        project,
      ]
    );

    const editDirectionWith = React.useCallback(
      async (
        i18n: I18nType,
        externalEditor: ResourceExternalEditor,
        direction: gdDirection,
        animationIndex: number,
        directionIndex: number
      ) => {
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        const resourceNames = mapFor(0, direction.getSpritesCount(), i => {
          return direction.getSprite(i).getImageName();
        });
        const animation = animations.getAnimation(animationIndex);
        const animationName = animation.getName();

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
              signal,
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
              const originalSprite = direction.getSprite(
                resource.originalIndex
              );
              copySpritePoints(originalSprite, sprite);
              copySpritePolygons(originalSprite, sprite);
            } else {
              // The sprite is new, apply points & collision masks if necessary.
              applyPointsAndMasksToSpriteIfNecessary(
                animations,
                direction,
                sprite
              );
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
          ResourcesLoader.burstUrlsCacheForResources(project, resourceNames);
          replaceDirection(animationIndex, directionIndex, newDirection);

          // If a name was specified in the external editor, use it for the animation.
          if (newName) {
            changeAnimationName(animationIndex, newName);
          }
          newDirection.delete();

          if (onObjectUpdated) onObjectUpdated();
          // If an external editor is used to edit the sprites, we assume the first sprite was edited.
          if (animationIndex === 0) {
            adaptCollisionMaskIfNeeded();
          }
        } catch (error) {
          if (error.name !== 'UserCancellationError') {
            console.error(
              'An exception was thrown when launching or reading resources from the external editor:',
              error
            );
            showErrorBox({
              message:
                'There was an error while using the external editor. Try with another resource and if this persists, please report this as a bug.',
              rawError: error,
              errorId: 'external-editor-error',
            });
          }
          setExternalEditorOpened(false);
        } finally {
          abortControllerRef.current = null;
        }
      },
      [
        animations,
        project,
        resourceManagementProps,
        objectName,
        replaceDirection,
        onObjectUpdated,
        onSpriteAdded,
        changeAnimationName,
        adaptCollisionMaskIfNeeded,
      ]
    );

    const cancelEditingWithExternalEditor = React.useCallback(
      async () => {
        const shouldContinue = await showConfirmation({
          title: t`Cancel editing`,
          message: t`You will lose any progress made with the external editor. Do you wish to cancel?`,
          confirmButtonLabel: t`Cancel edition`,
          dismissButtonLabel: t`Continue editing`,
        });
        if (!shouldContinue) return;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        } else {
          console.error(
            'Cannot cancel editing with external editor, abort controller is missing.'
          );
        }
      },
      [showConfirmation]
    );

    const createAnimationWith = React.useCallback(
      async (i18n: I18nType, externalEditor: ResourceExternalEditor) => {
        addAnimation();
        const direction = animations.getAnimation(0).getDirection(0);
        await editDirectionWith(i18n, externalEditor, direction, 0, 0);
      },
      [addAnimation, editDirectionWith, animations]
    );

    const imageResourceExternalEditors = resourceManagementProps.resourceExternalEditors.filter(
      ({ kind }) => kind === 'image'
    );

    return (
      <I18n>
        {({ i18n }) => (
          <>
            {animations.getAnimationsCount() === 0 &&
            // The event-based object editor gives an empty list.
            imageResourceExternalEditors.length > 0 ? (
              <Column noMargin expand justifyContent="center">
                <EmptyPlaceholder
                  title={<Trans>Add your first animation</Trans>}
                  description={
                    <Trans>Animations are a sequence of images.</Trans>
                  }
                  actionLabel={<Trans>Import images</Trans>}
                  secondaryActionLabel={i18n._(
                    isMobile
                      ? t`Draw`
                      : imageResourceExternalEditors[0].createDisplayName
                  )}
                  secondaryActionIcon={<Edit />}
                  helpPagePath="/objects/sprite"
                  tutorialId="intermediate-changing-animations"
                  onAction={() => {
                    importImages();
                  }}
                  onSecondaryAction={() => {
                    createAnimationWith(i18n, imageResourceExternalEditors[0]);
                  }}
                />
              </Column>
            ) : (
              <>
                {mapFor(0, animations.getAnimationsCount(), animationIndex => {
                  const animation = animations.getAnimation(animationIndex);
                  const animationName = animation.getName();

                  const animationRef =
                    justAddedAnimationName === animationName
                      ? justAddedAnimationElement
                      : null;

                  return (
                    <DragSourceAndDropTarget
                      key={animationIndex}
                      beginDrag={() => {
                        draggedAnimationIndex.current = animationIndex;
                        return {};
                      }}
                      canDrag={() => true}
                      canDrop={() => true}
                      drop={() => {
                        moveAnimation(animationIndex);
                      }}
                    >
                      {({
                        connectDragSource,
                        connectDropTarget,
                        isOver,
                        canDrop,
                      }) =>
                        connectDropTarget(
                          <div key={animationIndex} style={styles.rowContainer}>
                            {isAnimationListLocked && (
                              <Column expand noMargin>
                                <Text size="block-title">{animationName}</Text>
                              </Column>
                            )}
                            {!isAnimationListLocked && isOver && (
                              <DropIndicator canDrop={canDrop} />
                            )}
                            {!isAnimationListLocked && (
                              <div
                                ref={animationRef}
                                style={{
                                  ...styles.rowContent,
                                  backgroundColor:
                                    gdevelopTheme.list.itemsBackgroundColor,
                                }}
                              >
                                <Line noMargin expand alignItems="center">
                                  {connectDragSource(
                                    <span>
                                      <Column>
                                        <DragHandleIcon />
                                      </Column>
                                    </span>
                                  )}
                                  <Text noMargin noShrink>
                                    <Trans>Animation #{animationIndex}</Trans>
                                  </Text>
                                  <Spacer />
                                  <SemiControlledTextField
                                    margin="none"
                                    commitOnBlur
                                    errorText={nameErrors[animationIndex]}
                                    translatableHintText={t`Optional animation name`}
                                    value={animation.getName()}
                                    onChange={newName =>
                                      changeAnimationName(
                                        animationIndex,
                                        newName
                                      )
                                    }
                                    fullWidth
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      removeAnimation(animationIndex, i18n)
                                    }
                                  >
                                    <Trash />
                                  </IconButton>
                                </Line>
                                <Spacer />
                              </div>
                            )}
                            <div style={styles.animationLine}>
                              <Column expand noMargin>
                                {mapFor(
                                  0,
                                  animation.getDirectionsCount(),
                                  directionIndex => {
                                    const direction = animation.getDirection(
                                      directionIndex
                                    );
                                    return (
                                      <SpritesList
                                        animations={animations}
                                        direction={direction}
                                        key={directionIndex}
                                        project={project}
                                        resourcesLoader={ResourcesLoader}
                                        resourceManagementProps={
                                          resourceManagementProps
                                        }
                                        editDirectionWith={(
                                          i18n,
                                          ResourceExternalEditor,
                                          direction
                                        ) =>
                                          editDirectionWith(
                                            i18n,
                                            ResourceExternalEditor,
                                            direction,
                                            animationIndex,
                                            directionIndex
                                          )
                                        }
                                        onReplaceByDirection={newDirection =>
                                          replaceDirection(
                                            animationIndex,
                                            directionIndex,
                                            newDirection
                                          )
                                        }
                                        objectName={objectName}
                                        animationName={animationName}
                                        onChangeName={newName =>
                                          changeAnimationName(
                                            animationIndex,
                                            newName
                                          )
                                        }
                                        onSpriteUpdated={onObjectUpdated}
                                        onFirstSpriteUpdated={
                                          // If the first sprite of the first animation is updated,
                                          // we update the automatic collision mask of the object,
                                          // if the option is enabled.
                                          animationIndex === 0
                                            ? adaptCollisionMaskIfNeeded
                                            : undefined
                                        }
                                        onSpriteAdded={onSpriteAdded}
                                        addAnimations={addAnimations}
                                      />
                                    );
                                  }
                                )}
                              </Column>
                            </div>
                          </div>
                        )
                      }
                    </DragSourceAndDropTarget>
                  );
                })}
              </>
            )}
            {externalEditorOpened && (
              <ExternalEditorOpenedDialog
                onClose={cancelEditingWithExternalEditor}
              />
            )}
          </>
        )}
      </I18n>
    );
  }
);

export default AnimationList;
