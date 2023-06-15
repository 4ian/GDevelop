// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import SpritesList from './SpritesList';
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
import Window from '../../../Utils/Window';
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
  const hasNoAnimations = spriteConfiguration.getAnimationsCount() === 0;

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

  const moveAnimation = React.useCallback(
    (targetIndex: number) => {
      const draggedIndex = draggedAnimationIndex.current;
      if (draggedIndex === null) return;

      setNameErrors({});

      spriteConfiguration.moveAnimation(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      forceUpdate();
    },
    [spriteConfiguration, forceUpdate]
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
      const deleteAnswer = await showConfirmation({
        title: t`Remove the animation`,
        message: t`Are you sure you want to remove this animation?`,
        confirmButtonLabel: t`Remove`,
        dismissButtonLabel: t`Cancel`,
      });
      if (!deleteAnswer) return;

      setNameErrors({});

      spriteConfiguration.removeAnimation(index);
      forceUpdate();
      onSizeUpdated();
      if (onObjectUpdated) onObjectUpdated();
    },
    [
      forceUpdate,
      onObjectUpdated,
      onSizeUpdated,
      showConfirmation,
      spriteConfiguration,
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
      );

      if (newName !== '' && otherNames.some(name => name === newName)) {
        setNameErrors({
          ...nameErrors,
          [animation.ptr]: (
            <Trans>The animation name {newName} is already taken</Trans>
          ),
        });
        return;
      }

      const oldName = animation.getName();
      animation.setName(newName);
      // TODO EBO Refactor event-based object events when an animation is renamed.
      if (layout && object) {
        gd.WholeProjectRefactorer.renameObjectAnimation(
          project,
          layout,
          object,
          oldName,
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
          <ScrollView ref={scrollView}>
            <Column noMargin expand useFullHeight>
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
                          key={animation.ptr}
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
                                key={animation.ptr}
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
                                        <Trans>
                                          Animation #{animationIndex}
                                        </Trans>
                                      </Text>
                                      <Spacer />
                                      <SemiControlledTextField
                                        margin="none"
                                        commitOnBlur
                                        errorText={nameErrors[animation.ptr]}
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
              )}
            </Column>
          </ScrollView>
          <Column noMargin>
            <ResponsiveLineStackLayout
              justifyContent="space-between"
              noColumnMargin
            >
              {windowWidth !== 'small' ? (
                <ResponsiveLineStackLayout noMargin noColumnMargin>
                  <FlatButton
                    label={<Trans>Edit collision masks</Trans>}
                    onClick={() => setCollisionMasksEditorOpen(true)}
                    disabled={hasNoAnimations}
                  />
                  {!isAnimationListLocked && (
                    <FlatButton
                      label={<Trans>Edit points</Trans>}
                      onClick={() => setPointsEditorOpen(true)}
                      disabled={hasNoAnimations}
                    />
                  )}
                  {!isAnimationListLocked && (
                    <FlatButton
                      label={<Trans>Advanced options</Trans>}
                      onClick={() => setAdvancedOptionsOpen(true)}
                      disabled={hasNoAnimations}
                    />
                  )}
                </ResponsiveLineStackLayout>
              ) : (
                <FlatButtonWithSplitMenu
                  label={<Trans>Edit collision masks</Trans>}
                  onClick={() => setCollisionMasksEditorOpen(true)}
                  disabled={hasNoAnimations}
                  buildMenuTemplate={i18n => [
                    {
                      label: i18n._(t`Edit points`),
                      disabled: hasNoAnimations,
                      click: () => setPointsEditorOpen(true),
                    },
                    {
                      label: i18n._(t`Advanced options`),
                      disabled: hasNoAnimations,
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
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
}
