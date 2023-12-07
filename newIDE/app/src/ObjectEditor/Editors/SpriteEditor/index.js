// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import SpritesList, { addAnimationFrame } from './SpritesList';
import IconButton from '../../../UI/IconButton';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import { mapFor } from '../../../Utils/MapFor';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Text from '../../../UI/Text';
import Dialog from '../../../UI/Dialog';
import HelpButton from '../../../UI/HelpButton';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from './PointsEditor';
import CollisionMasksEditor from './CollisionMasksEditor';
import { type EditorProps } from '../EditorProps.flow';
import { Column, Line, Spacer } from '../../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import Checkbox from '../../../UI/Checkbox';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import { EmptyPlaceholder } from '../../../UI/EmptyPlaceholder';
import SpacedDismissableTutorialMessage from './SpacedDismissableTutorialMessage';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import FlatButtonWithSplitMenu from '../../../UI/FlatButtonWithSplitMenu';
import Add from '../../../UI/CustomSvgIcons/Add';
import Trash from '../../../UI/CustomSvgIcons/Trash';
import { makeDragSourceAndDropTarget } from '../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { DragHandleIcon } from '../../../UI/DragHandle';
import DropIndicator from '../../../UI/SortableVirtualizedItemList/DropIndicator';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import { getMatchingCollisionMask } from './CollisionMasksEditor/CollisionMaskHelper';
import {
  getCurrentElements,
  getTotalSpritesCount,
} from './Utils/SpriteObjectHelper';

const gd: libGDevelop = global.gd;

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

export function LockedSpriteEditor({
  objectConfiguration,
  project,
  layout,
  object,
  objectName,
  resourceManagementProps,
  onSizeUpdated,
  onObjectUpdated,
}: EditorProps) {
  return (
    <SpriteEditor
      isAnimationListLocked
      objectConfiguration={objectConfiguration}
      project={project}
      layout={layout}
      object={object}
      objectName={objectName}
      resourceManagementProps={resourceManagementProps}
      onSizeUpdated={onSizeUpdated}
      onObjectUpdated={onObjectUpdated}
    />
  );
}

type SpriteEditorProps = {|
  ...EditorProps,
  isAnimationListLocked?: boolean,
|};

export default function SpriteEditor({
  objectConfiguration,
  project,
  layout,
  object,
  objectName,
  resourceManagementProps,
  onSizeUpdated,
  onObjectUpdated,
  isAnimationListLocked = false,
}: SpriteEditorProps) {
  const [pointsEditorOpen, setPointsEditorOpen] = React.useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = React.useState(false);
  const [
    collisionMasksEditorOpen,
    setCollisionMasksEditorOpen,
  ] = React.useState(false);
  const forceUpdate = useForceUpdate();
  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const hasNoSprites = () => {
    for (
      let animationIndex = 0;
      animationIndex < spriteConfiguration.getAnimationsCount();
      animationIndex++
    ) {
      const animation = spriteConfiguration.getAnimation(animationIndex);
      for (
        let directionIndex = 0;
        directionIndex < animation.getDirectionsCount();
        directionIndex++
      ) {
        const direction = animation.getDirection(directionIndex);
        if (direction.getSpritesCount() > 0) return false;
      }
    }
    return true;
  };

  const scrollView = React.useRef<?ScrollViewInterface>(null);

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
    [justAddedAnimationName]
  );
  const { showConfirmation } = useAlertDialog();

  const draggedAnimationIndex = React.useRef<number | null>(null);

  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  // The matching collision mask only takes the first sprite of the first
  // animation of the object. We consider this is enough to start with, and
  // the user can then edit the collision mask for further needs.
  const onCreateMatchingSpriteCollisionMask = React.useCallback(
    async () => {
      if (spriteConfiguration.getAnimationsCount() === 0) return;
      const firstAnimation = spriteConfiguration.getAnimation(0);
      if (firstAnimation.getDirectionsCount() === 0) return;
      const firstDirection = firstAnimation.getDirection(0);
      if (firstDirection.getSpritesCount() === 0) return;
      const firstSprite = firstDirection.getSprite(0);
      const firstSpriteResourceName = firstSprite.getImageName();
      const firstAnimationResourceSource = ResourcesLoader.getResourceFullUrl(
        project,
        firstSpriteResourceName,
        {}
      );
      let matchingCollisionMask = null;
      try {
        matchingCollisionMask = await getMatchingCollisionMask(
          firstAnimationResourceSource
        );
      } catch (e) {
        console.error(
          'Unable to create a matching collision mask for the sprite, fallback to full image collision mask.',
          e
        );
      }

      for (
        let animationIndex = 0;
        animationIndex < spriteConfiguration.getAnimationsCount();
        animationIndex++
      ) {
        const animation = spriteConfiguration.getAnimation(animationIndex);
        for (
          let directionIndex = 0;
          directionIndex < animation.getDirectionsCount();
          directionIndex++
        ) {
          const direction = animation.getDirection(directionIndex);
          for (
            let spriteIndex = 0;
            spriteIndex < direction.getSpritesCount();
            spriteIndex++
          ) {
            const sprite = direction.getSprite(spriteIndex);
            sprite.setFullImageCollisionMask(!matchingCollisionMask);
            if (matchingCollisionMask)
              sprite.setCustomCollisionMask(matchingCollisionMask);
          }
        }
      }
      forceUpdate();
    },
    [spriteConfiguration, project, forceUpdate]
  );

  const onApplyFirstSpriteCollisionMaskToSprite = React.useCallback(
    (sprite: gdSprite) => {
      if (spriteConfiguration.getAnimationsCount() === 0) return;
      const firstAnimation = spriteConfiguration.getAnimation(0);
      if (firstAnimation.getDirectionsCount() === 0) return;
      const firstDirection = firstAnimation.getDirection(0);
      if (firstDirection.getSpritesCount() === 0) return;
      const firstSprite = firstDirection.getSprite(0);
      sprite.setFullImageCollisionMask(firstSprite.isFullImageCollisionMask());
      sprite.setCustomCollisionMask(firstSprite.getCustomCollisionMask());

      forceUpdate();
    },
    [spriteConfiguration, forceUpdate]
  );

  const moveAnimation = React.useCallback(
    (targetIndex: number) => {
      const draggedIndex = draggedAnimationIndex.current;
      if (draggedIndex === null) return;

      setNameErrors({});

      spriteConfiguration.moveAnimation(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      if (
        (draggedIndex === 0 || targetIndex === 0) &&
        spriteConfiguration.adaptCollisionMaskAutomatically()
      ) {
        // If the first animation is changed and the collision mask is adapted automatically,
        // then we need to recompute it.
        onCreateMatchingSpriteCollisionMask();
      }
      forceUpdate();
    },
    [spriteConfiguration, forceUpdate, onCreateMatchingSpriteCollisionMask]
  );

  const onSpriteAdded = React.useCallback(
    (sprite: gdSprite) => {
      // If a sprite is added, we want to ensure it gets the automatic
      // collision mask of the object, if the option is enabled.
      if (spriteConfiguration.adaptCollisionMaskAutomatically()) {
        onApplyFirstSpriteCollisionMaskToSprite(sprite);
      }
    },
    [onApplyFirstSpriteCollisionMaskToSprite, spriteConfiguration]
  );

  const addAnimations = React.useCallback(
    (resourcesByAnimation: Map<string, Array<gdResource>>) => {
      setNameErrors({});

      const allAnimationNames = mapFor(
        0,
        spriteConfiguration.getAnimationsCount(),
        index => spriteConfiguration.getAnimation(index).getName()
      );

      for (const [name, resources] of resourcesByAnimation) {
        const animation = new gd.Animation();
        let newName = name;
        for (let index = 0; index < 10; index++) {
          if (!allAnimationNames.includes(newName)) {
            animation.setName(name);
            break;
          }
          newName = name + ' ' + index;
        }
        animation.setDirectionsCount(1);
        const direction = animation.getDirection(0);
        for (const resource of resources) {
          addAnimationFrame(
            spriteConfiguration,
            direction,
            resource,
            onSpriteAdded
          );
        }
        spriteConfiguration.addAnimation(animation);
        animation.delete();
      }
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();
    },
    [
      forceUpdate,
      onObjectUpdated,
      onSizeUpdated,
      onSpriteAdded,
      spriteConfiguration,
    ]
  );

  const addAnimation = React.useCallback(
    () => {
      setNameErrors({});

      const emptyAnimation = new gd.Animation();
      emptyAnimation.setDirectionsCount(1);
      spriteConfiguration.addAnimation(emptyAnimation);
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
    [forceUpdate, onObjectUpdated, onSizeUpdated, spriteConfiguration]
  );

  const removeAnimation = React.useCallback(
    async (index: number, i18n: I18nType) => {
      const totalSpritesCount = getTotalSpritesCount(spriteConfiguration);
      const isDeletingLastSprites =
        spriteConfiguration
          .getAnimation(index)
          .getDirection(0)
          .getSpritesCount() === totalSpritesCount;
      const firstSpriteInAnimationDeleted = getCurrentElements(
        spriteConfiguration,
        index,
        0,
        0
      ).sprite;
      const isUsingCustomCollisionMask =
        !spriteConfiguration.adaptCollisionMaskAutomatically() &&
        firstSpriteInAnimationDeleted &&
        !firstSpriteInAnimationDeleted.isFullImageCollisionMask();
      const shouldWarnBecauseLosingCustomCollisionMask =
        isDeletingLastSprites && isUsingCustomCollisionMask;

      const message = shouldWarnBecauseLosingCustomCollisionMask
        ? t`Are you sure you want to remove this animation? You will lose the custom collision mask you have set for this object.`
        : t`Are you sure you want to remove this animation?`;
      const deleteAnswer = await showConfirmation({
        title: t`Remove the animation`,
        message,
        confirmButtonLabel: t`Remove`,
        dismissButtonLabel: t`Cancel`,
      });
      if (!deleteAnswer) return;

      setNameErrors({});

      spriteConfiguration.removeAnimation(index);
      forceUpdate();
      onSizeUpdated();
      if (
        index === 0 &&
        spriteConfiguration.adaptCollisionMaskAutomatically()
      ) {
        // If the first animation is removed and the collision mask is
        // automatically adapted, then recompute it.
        onCreateMatchingSpriteCollisionMask();
      }
      if (shouldWarnBecauseLosingCustomCollisionMask) {
        // The user has deleted the last custom collision mask, so revert to automatic
        // collision mask adaptation.
        spriteConfiguration.setAdaptCollisionMaskAutomatically(true);
      }
      if (onObjectUpdated) onObjectUpdated();
    },
    [
      forceUpdate,
      onObjectUpdated,
      onSizeUpdated,
      showConfirmation,
      spriteConfiguration,
      onCreateMatchingSpriteCollisionMask,
    ]
  );

  const changeAnimationName = React.useCallback(
    (changedAnimationIndex: number, newName: string) => {
      const animation = spriteConfiguration.getAnimation(changedAnimationIndex);
      const currentName = animation.getName();
      if (currentName === newName) return;

      setNameErrors({});

      const otherNames = mapFor(
        0,
        spriteConfiguration.getAnimationsCount(),
        index => {
          return index === changedAnimationIndex
            ? undefined // Don't check the current animation name as we're changing it.
            : spriteConfiguration.getAnimation(index).getName();
        }
      ).filter(Boolean);

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
      spriteConfiguration,
    ]
  );

  const replaceDirection = React.useCallback(
    (animationId, directionId, newDirection) => {
      spriteConfiguration
        .getAnimation(animationId)
        .setDirection(newDirection, directionId);
      forceUpdate();
      if (onObjectUpdated) onObjectUpdated();
    },
    [forceUpdate, onObjectUpdated, spriteConfiguration]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          {spriteConfiguration.getAnimationsCount() === 0 ? (
            <Column noMargin expand justifyContent="center">
              <EmptyPlaceholder
                title={<Trans>Add your first animation</Trans>}
                description={
                  <Trans>Animations are a sequence of images.</Trans>
                }
                actionLabel={<Trans>Add an animation</Trans>}
                helpPagePath="/objects/sprite"
                tutorialId="intermediate-changing-animations"
                onAction={addAnimation}
              />
            </Column>
          ) : (
            <ScrollView ref={scrollView}>
              <React.Fragment>
                <SpacedDismissableTutorialMessage />
                {mapFor(
                  0,
                  spriteConfiguration.getAnimationsCount(),
                  animationIndex => {
                    const animation = spriteConfiguration.getAnimation(
                      animationIndex
                    );
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
                            <div
                              key={animationIndex}
                              style={styles.rowContainer}
                            >
                              {isAnimationListLocked && (
                                <Column expand noMargin>
                                  <Text size="block-title">
                                    {animationName}
                                  </Text>
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
                                          spriteConfiguration={
                                            spriteConfiguration
                                          }
                                          direction={direction}
                                          key={directionIndex}
                                          project={project}
                                          resourcesLoader={ResourcesLoader}
                                          resourceManagementProps={
                                            resourceManagementProps
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
                                            animationIndex === 0
                                              ? () => {
                                                  // If the first sprite of the first animation is updated,
                                                  // we update the automatic collision mask of the object,
                                                  // if the option is enabled.
                                                  if (
                                                    spriteConfiguration.adaptCollisionMaskAutomatically()
                                                  ) {
                                                    onCreateMatchingSpriteCollisionMask();
                                                  }
                                                }
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
                  }
                )}
              </React.Fragment>
            </ScrollView>
          )}
          <Column noMargin>
            <ResponsiveLineStackLayout
              justifyContent="space-between"
              noColumnMargin
            >
              {!isMobileScreen ? ( // On mobile, use only 1 button to gain space.
                <ResponsiveLineStackLayout noMargin noColumnMargin>
                  <FlatButton
                    label={<Trans>Edit collision masks</Trans>}
                    onClick={() => setCollisionMasksEditorOpen(true)}
                    disabled={hasNoSprites()}
                  />
                  {!isAnimationListLocked && (
                    <FlatButton
                      label={<Trans>Edit points</Trans>}
                      onClick={() => setPointsEditorOpen(true)}
                      disabled={hasNoSprites()}
                    />
                  )}
                  {!isAnimationListLocked && (
                    <FlatButton
                      label={<Trans>Advanced options</Trans>}
                      onClick={() => setAdvancedOptionsOpen(true)}
                      disabled={hasNoSprites()}
                    />
                  )}
                </ResponsiveLineStackLayout>
              ) : (
                <FlatButtonWithSplitMenu
                  label={<Trans>Edit collision masks</Trans>}
                  onClick={() => setCollisionMasksEditorOpen(true)}
                  disabled={hasNoSprites()}
                  buildMenuTemplate={i18n => [
                    {
                      label: i18n._(t`Edit points`),
                      disabled: hasNoSprites(),
                      click: () => setPointsEditorOpen(true),
                    },
                    {
                      label: i18n._(t`Advanced options`),
                      disabled: hasNoSprites(),
                      click: () => setAdvancedOptionsOpen(true),
                    },
                  ]}
                />
              )}
              {!isAnimationListLocked && (
                <RaisedButton
                  label={<Trans>Add an animation</Trans>}
                  primary
                  onClick={addAnimation}
                  icon={<Add />}
                />
              )}
            </ResponsiveLineStackLayout>
          </Column>
          {advancedOptionsOpen && (
            <Dialog
              title={<Trans>Advanced options</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setAdvancedOptionsOpen(false)}
                />,
              ]}
              maxWidth="sm"
              flexBody
              onRequestClose={() => setAdvancedOptionsOpen(false)}
              open
            >
              <Column noMargin>
                <Checkbox
                  label={
                    <Trans>
                      Don't play the animation when the object is far from the
                      camera or hidden (recommended for performance)
                    </Trans>
                  }
                  checked={!spriteConfiguration.getUpdateIfNotVisible()}
                  onCheck={(_, value) => {
                    spriteConfiguration.setUpdateIfNotVisible(!value);

                    forceUpdate();
                    if (onObjectUpdated) onObjectUpdated();
                  }}
                />
              </Column>
            </Dialog>
          )}
          {pointsEditorOpen && (
            <Dialog
              title={<Trans>Edit points</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setPointsEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/edit-points"
                  key="help"
                />,
              ]}
              onRequestClose={() => setPointsEditorOpen(false)}
              maxWidth="lg"
              flexBody
              fullHeight
              open={pointsEditorOpen}
            >
              <PointsEditor
                objectConfiguration={spriteConfiguration}
                resourcesLoader={ResourcesLoader}
                project={project}
                onPointsUpdated={onObjectUpdated}
                onRenamedPoint={(oldName, newName) =>
                  // TODO EBO Refactor event-based object events when a point is renamed.
                  layout &&
                  object &&
                  gd.WholeProjectRefactorer.renameObjectPoint(
                    project,
                    layout,
                    object,
                    oldName,
                    newName
                  )
                }
              />
            </Dialog>
          )}
          {collisionMasksEditorOpen && (
            <Dialog
              title={<Trans>Edit collision masks</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setCollisionMasksEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/collision-mask"
                  key="help"
                />,
              ]}
              maxWidth="lg"
              flexBody
              fullHeight
              onRequestClose={() => setCollisionMasksEditorOpen(false)}
              open={collisionMasksEditorOpen}
            >
              <CollisionMasksEditor
                objectConfiguration={spriteConfiguration}
                resourcesLoader={ResourcesLoader}
                project={project}
                onMasksUpdated={onObjectUpdated}
                onCreateMatchingSpriteCollisionMask={
                  onCreateMatchingSpriteCollisionMask
                }
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
}
