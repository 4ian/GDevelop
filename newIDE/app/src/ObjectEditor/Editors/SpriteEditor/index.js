// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SpritesList from './SpritesList';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
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
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../UI/Menu/ContextMenu';
import { showWarningBox } from '../../../UI/Messages/MessageBox';
import ResourcesLoader from '../../../ResourcesLoader';
import PointsEditor from './PointsEditor';
import CollisionMasksEditor from './CollisionMasksEditor';
import Window from '../../../Utils/Window';
import {
  deleteSpritesFromAnimation,
  duplicateSpritesInAnimation,
} from './Utils/SpriteObjectHelper';
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
  animation: gdAnimation,
  id: number,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onRemove: () => void,
  resourcesLoader: typeof ResourcesLoader,
  onSpriteContextMenu: (x: number, y: number, sprite: gdSprite) => void,
  selectedSprites: {
    [number]: boolean,
  },
  onSelectSprite: (sprite: gdSprite, selected: boolean) => void,
  onReplaceDirection: (
    directionIndex: number,
    newDirection: gdDirection
  ) => void,
  objectName: string,
  onChangeName: string => void,
  isAnimationListLocked: boolean,
  onSpriteUpdated: () => void,
|};

class Animation extends React.Component<AnimationProps, void> {
  render() {
    const {
      animation,
      id,
      project,
      onRemove,
      resourceManagementProps,
      resourcesLoader,
      onSpriteContextMenu,
      selectedSprites,
      onSelectSprite,
      onReplaceDirection,
      objectName,
      onChangeName,
      isAnimationListLocked,
      onSpriteUpdated,
    } = this.props;

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
                {<Trans>Animation #{id}</Trans>}
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
                <Delete />
              </IconButton>
            </MiniToolbar>
          )}
          {mapFor(0, animation.getDirectionsCount(), i => {
            const direction = animation.getDirection(i);
            return (
              <SpritesList
                direction={direction}
                key={i}
                project={project}
                resourcesLoader={resourcesLoader}
                resourceManagementProps={resourceManagementProps}
                onSpriteContextMenu={onSpriteContextMenu}
                selectedSprites={selectedSprites}
                onSelectSprite={onSelectSprite}
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
  }
}

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
    onSpriteContextMenu,
    selectedSprites,
    onSelectSprite,
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
              onSpriteContextMenu={onSpriteContextMenu}
              selectedSprites={selectedSprites}
              onSelectSprite={onSelectSprite}
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

type AnimationsListContainerState = {|
  selectedSprites: {
    [number]: boolean,
  },
|};

class AnimationsListContainer extends React.Component<
  AnimationsListContainerProps,
  AnimationsListContainerState
> {
  state = {
    selectedSprites: {},
  };
  spriteContextMenu: ?ContextMenuInterface;
  _scrollView = React.createRef<ScrollViewInterface>();

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.spriteConfiguration.moveAnimation(oldIndex, newIndex);
    this.forceUpdate();
  };

  addAnimation = () => {
    const emptyAnimation = new gd.Animation();
    emptyAnimation.setDirectionsCount(1);
    this.props.spriteConfiguration.addAnimation(emptyAnimation);
    emptyAnimation.delete();
    this.forceUpdate();
    this.props.onSizeUpdated();
    if (this.props.onObjectUpdated) this.props.onObjectUpdated();

    // Scroll to the bottom of the list.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      if (this._scrollView.current) {
        this._scrollView.current.scrollToBottom();
      }
    }, 100); // A few ms is enough for a new render to be done.
  };

  removeAnimation = i => {
    const answer = Window.showConfirmDialog(
      'Are you sure you want to remove this animation?'
    );

    if (answer) {
      this.props.spriteConfiguration.removeAnimation(i);
      this.forceUpdate();
      this.props.onSizeUpdated();
      if (this.props.onObjectUpdated) this.props.onObjectUpdated();
    }
  };

  changeAnimationName = (i, newName) => {
    const { spriteConfiguration, project, layout, object } = this.props;

    const currentName = spriteConfiguration.getAnimation(i).getName();
    if (currentName === newName) return;

    const otherNames = mapFor(
      0,
      spriteConfiguration.getAnimationsCount(),
      index => {
        return index === i
          ? undefined // Don't check the current animation name as we're changing it.
          : currentName;
      }
    );

    if (newName !== '' && otherNames.filter(name => name === newName).length) {
      showWarningBox(
        'Another animation with this name already exists. Please use another name.',
        { delayToNextTick: true }
      );
      return;
    }

    const animation = spriteConfiguration.getAnimation(i);
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
    this.forceUpdate();
    if (this.props.onObjectUpdated) this.props.onObjectUpdated();
  };

  deleteSelection = () => {
    const { spriteConfiguration } = this.props;

    mapFor(0, spriteConfiguration.getAnimationsCount(), index => {
      const animation = spriteConfiguration.getAnimation(index);
      deleteSpritesFromAnimation(animation, this.state.selectedSprites);
    });

    this.setState({
      selectedSprites: {},
    });
    if (this.props.onObjectUpdated) this.props.onObjectUpdated();
  };

  duplicateSelection = () => {
    const { spriteConfiguration } = this.props;

    mapFor(0, spriteConfiguration.getAnimationsCount(), index => {
      const animation = spriteConfiguration.getAnimation(index);
      duplicateSpritesInAnimation(animation, this.state.selectedSprites);
    });

    this.setState({
      selectedSprites: {},
    });
    if (this.props.onObjectUpdated) this.props.onObjectUpdated();
  };

  openSpriteContextMenu = (x, y, sprite, index) => {
    this.selectSprite(sprite, true);
    if (this.spriteContextMenu) this.spriteContextMenu.open(x, y);
  };

  selectSprite = (sprite, selected) => {
    this.setState({
      selectedSprites: {
        ...this.state.selectedSprites,
        [sprite.ptr]: selected,
      },
    });
  };

  replaceDirection = (animationId, directionId, newDirection) => {
    this.props.spriteConfiguration
      .getAnimation(animationId)
      .setDirection(newDirection, directionId);
    this.forceUpdate();
    if (this.props.onObjectUpdated) this.props.onObjectUpdated();
  };

  render() {
    return (
      <Column noMargin expand useFullHeight>
        {this.props.spriteConfiguration.getAnimationsCount() === 0 ? (
          <Column noMargin expand justifyContent="center">
            <EmptyPlaceholder
              title={<Trans>Add your first animation</Trans>}
              description={<Trans>Animations are a sequence of images.</Trans>}
              actionLabel={<Trans>Add an animation</Trans>}
              helpPagePath="/objects/sprite"
              tutorialId="intermediate-changing-animations"
              onAction={this.addAnimation}
            />
          </Column>
        ) : (
          <React.Fragment>
            <SpacedDismissableTutorialMessage />
            <SortableAnimationsList
              isAnimationListLocked={this.props.isAnimationListLocked}
              spriteConfiguration={this.props.spriteConfiguration}
              objectName={this.props.objectName}
              helperClass="sortable-helper"
              project={this.props.project}
              onSortEnd={this.onSortEnd}
              onChangeAnimationName={this.changeAnimationName}
              onRemoveAnimation={this.removeAnimation}
              onReplaceDirection={this.replaceDirection}
              onSpriteContextMenu={this.openSpriteContextMenu}
              selectedSprites={this.state.selectedSprites}
              onSelectSprite={this.selectSprite}
              resourcesLoader={this.props.resourcesLoader}
              resourceManagementProps={this.props.resourceManagementProps}
              useDragHandle
              lockAxis="y"
              axis="y"
              onSpriteUpdated={this.props.onObjectUpdated}
              scrollViewRef={this._scrollView}
            />
            <Column noMargin>
              <ResponsiveLineStackLayout
                justifyContent="space-between"
                noColumnMargin
              >
                {this.props.extraBottomTools}
                {!this.props.isAnimationListLocked && (
                  <RaisedButton
                    label={<Trans>Add an animation</Trans>}
                    primary
                    onClick={this.addAnimation}
                    icon={<Add />}
                  />
                )}
              </ResponsiveLineStackLayout>
            </Column>
            <ContextMenu
              ref={spriteContextMenu =>
                (this.spriteContextMenu = spriteContextMenu)
              }
              buildMenuTemplate={(i18n: I18nType) => [
                {
                  label: i18n._(t`Delete selection`),
                  click: () => this.deleteSelection(),
                },
                {
                  label: i18n._(t`Duplicate selection`),
                  click: () => this.duplicateSelection(),
                },
              ]}
            />
          </React.Fragment>
        )}
      </Column>
    );
  }
}

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
