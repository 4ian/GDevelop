// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SpritesList from './SpritesList';
import IconButton from '../../../UI/IconButton';
import FlatButton from '../../../UI/FlatButton';
import RaisedButton from '../../../UI/RaisedButton';
import { mapFor } from '../../../Utils/MapFor';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import Text from '../../../UI/Text';
import Dialog from '../../../UI/Dialog';
import HelpButton from '../../../UI/HelpButton';
import MiniToolbar, { MiniToolbarText } from '../../../UI/MiniToolbar';
import DragHandle from '../../../UI/DragHandle';
import { showWarningBox } from '../../../UI/Messages/MessageBox';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from './PointsEditor';
import CollisionMasksEditor from './CollisionMasksEditor';
import Window from '../../../Utils/Window';
import { type EditorProps } from '../EditorProps.flow';
import { type ResourceManagementProps } from '../../../ResourcesList/ResourceSource';
import { Column } from '../../../UI/Grid';
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

const gd: libGDevelop = global.gd;

const styles = {
  animationLine: {
    // Use a non standard spacing because:
    // - The SortableAnimationsList won't work with <Spacer /> or <LargeSpacer /> between elements.
    // - We need to visually show a difference between animations.
    marginBottom: 16,
  },
};

type AnimationProps = {|
  spriteConfiguration: gdSpriteObject,
  animation: gdAnimation,
  id: number,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onRemove: () => void,
  resourcesLoader: typeof ResourcesLoader,
  onReplaceDirection: (
    directionIndex: number,
    newDirection: gdDirection
  ) => void,
  objectName: string,
  onChangeName: string => void,
  isAnimationListLocked: boolean,
  onSpriteUpdated: () => void,
|};

const Animation = ({
  spriteConfiguration,
  animation,
  id,
  project,
  onRemove,
  resourceManagementProps,
  resourcesLoader,
  onReplaceDirection,
  objectName,
  onChangeName,
  isAnimationListLocked,
  onSpriteUpdated,
}: AnimationProps) => {
  const animationName = animation.getName();
  return (
    <div style={styles.animationLine}>
      <Column expand noMargin>
        {isAnimationListLocked && (
          <Column expand noMargin>
            <Text size="block-title">{animation.getName()}</Text>
          </Column>
        )}
        {!isAnimationListLocked && (
          <MiniToolbar noPadding>
            <DragHandle />
            <MiniToolbarText>
              <Trans>Animation #{id}</Trans>
            </MiniToolbarText>
            <Column expand>
              <SemiControlledTextField
                commitOnBlur
                margin="none"
                value={animation.getName()}
                translatableHintText={t`Optional animation name`}
                onChange={text => onChangeName(text)}
                fullWidth
              />
            </Column>
            <IconButton size="small" onClick={onRemove}>
              <Trash />
            </IconButton>
          </MiniToolbar>
        )}
        {mapFor(0, animation.getDirectionsCount(), i => {
          const direction = animation.getDirection(i);
          return (
            <SpritesList
              spriteConfiguration={spriteConfiguration}
              direction={direction}
              key={i}
              project={project}
              resourcesLoader={resourcesLoader}
              resourceManagementProps={resourceManagementProps}
              onReplaceByDirection={newDirection =>
                onReplaceDirection(i, newDirection)
              }
              objectName={objectName}
              animationName={animationName}
              onChangeName={onChangeName}
              onSpriteUpdated={onSpriteUpdated}
            />
          );
        })}
      </Column>
    </div>
  );
};

const SortableAnimation = SortableElement(Animation);

const SortableAnimationsList = SortableContainer(
  ({
    spriteConfiguration,
    objectName,
    onAddAnimation,
    onRemoveAnimation,
    onChangeAnimationName,
    project,
    resourcesLoader,
    resourceManagementProps,
    extraBottomTools,
    onReplaceDirection,
    isAnimationListLocked,
    onSpriteUpdated,
    scrollViewRef,
  }) => {
    // Note that it's important to have <ScrollView> *inside* this
    // component, otherwise the sortable list won't work (because the
    // SortableContainer would not find a root div to use).
    return (
      <ScrollView ref={scrollViewRef}>
        {mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
          const animation = spriteConfiguration.getAnimation(i);
          return (
            <SortableAnimation
              spriteConfiguration={spriteConfiguration}
              isAnimationListLocked={isAnimationListLocked}
              key={i}
              index={i}
              id={i}
              animation={animation}
              project={project}
              resourcesLoader={resourcesLoader}
              resourceManagementProps={resourceManagementProps}
              onRemove={() => onRemoveAnimation(i)}
              onChangeName={newName => onChangeAnimationName(i, newName)}
              onReplaceDirection={(directionId, newDirection) =>
                onReplaceDirection(i, directionId, newDirection)
              }
              objectName={objectName}
              onSpriteUpdated={onSpriteUpdated}
            />
          );
        })}
      </ScrollView>
    );
  }
);

type AnimationsListContainerProps = {|
  spriteConfiguration: gdSpriteObject,
  project: gdProject,
  layout?: gdLayout,
  object?: gdObject,
  resourceManagementProps: ResourceManagementProps,
  resourcesLoader: typeof ResourcesLoader,
  extraBottomTools: React.Node,
  onSizeUpdated: () => void,
  objectName: string,
  onObjectUpdated?: () => void,
  isAnimationListLocked: boolean,
|};

const AnimationsListContainer = ({
  spriteConfiguration,
  project,
  layout,
  object,
  resourceManagementProps,
  resourcesLoader,
  extraBottomTools,
  onSizeUpdated,
  objectName,
  onObjectUpdated,
  isAnimationListLocked,
}: AnimationsListContainerProps) => {
  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const forceUpdate = useForceUpdate();

  const onSortEnd = React.useCallback(
    ({ oldIndex, newIndex }) => {
      spriteConfiguration.moveAnimation(oldIndex, newIndex);
      forceUpdate();
    },
    [forceUpdate, spriteConfiguration]
  );

  const addAnimation = React.useCallback(
    () => {
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
    (index: number, i18n: I18nType) => {
      const answer = Window.showConfirmDialog(
        i18n._(t`Are you sure you want to remove this animation?`)
      );

      if (answer) {
        spriteConfiguration.removeAnimation(index);
        forceUpdate();
        onSizeUpdated();
        if (onObjectUpdated) onObjectUpdated();
      }
    },
    [forceUpdate, onObjectUpdated, onSizeUpdated, spriteConfiguration]
  );

  const changeAnimationName = React.useCallback(
    (changedAnimationIndex: number, newName: string, i18n: I18nType) => {
      const currentName = spriteConfiguration
        .getAnimation(changedAnimationIndex)
        .getName();
      if (currentName === newName) return;

      const otherNames = mapFor(
        0,
        spriteConfiguration.getAnimationsCount(),
        index => {
          return index === changedAnimationIndex
            ? undefined // Don't check the current animation name as we're changing it.
            : currentName;
        }
      );

      if (
        newName !== '' &&
        otherNames.filter(name => name === newName).length
      ) {
        showWarningBox(
          i18n._(
            t`Another animation with this name already exists. Please use another name.`
          ),
          { delayToNextTick: true }
        );
        return;
      }

      const animation = spriteConfiguration.getAnimation(changedAnimationIndex);
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
    [forceUpdate, layout, object, onObjectUpdated, project, spriteConfiguration]
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
              <SortableAnimationsList
                isAnimationListLocked={isAnimationListLocked}
                spriteConfiguration={spriteConfiguration}
                objectName={objectName}
                helperClass="sortable-helper"
                project={project}
                onSortEnd={onSortEnd}
                onChangeAnimationName={(index, newName) =>
                  changeAnimationName(index, newName, i18n)
                }
                onRemoveAnimation={index => removeAnimation(index, i18n)}
                onReplaceDirection={replaceDirection}
                resourcesLoader={resourcesLoader}
                resourceManagementProps={resourceManagementProps}
                useDragHandle
                lockAxis="y"
                axis="y"
                onSpriteUpdated={onObjectUpdated}
                scrollViewRef={scrollView}
              />
              <Column noMargin>
                <ResponsiveLineStackLayout
                  justifyContent="space-between"
                  noColumnMargin
                >
                  {extraBottomTools}
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
            </React.Fragment>
          )}
        </Column>
      )}
    </I18n>
  );
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

  return (
    <>
      <AnimationsListContainer
        isAnimationListLocked={isAnimationListLocked}
        spriteConfiguration={spriteConfiguration}
        resourcesLoader={ResourcesLoader}
        resourceManagementProps={resourceManagementProps}
        project={project}
        layout={layout}
        object={object}
        objectName={objectName}
        onSizeUpdated={onSizeUpdated}
        onObjectUpdated={onObjectUpdated}
        extraBottomTools={
          windowWidth !== 'small' ? (
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
          )
        }
      />
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
  );
}
