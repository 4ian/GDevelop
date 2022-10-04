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
import ScrollView from '../../../UI/ScrollView';
import Checkbox from '../../../UI/Checkbox';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import { EmptyPlaceholder } from '../../../UI/EmptyPlaceholder';
import SpacedDismissableTutorialMessage from './SpacedDismissableTutorialMessage';

const gd: libGDevelop = global.gd;

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
    } = this.props;

    const animationName = animation.getName();
    return (
      <div>
        <MiniToolbar>
          <DragHandle />
          <MiniToolbarText>Animation #{id} </MiniToolbarText>
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
            />
          );
        })}
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
  }) => {
    // Note that it's important to have <ScrollView> *inside* this
    // component, otherwise the sortable list won't work (because the
    // SortableContainer would not find a root div to use).
    return (
      <ScrollView>
        {mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
          const animation = spriteConfiguration.getAnimation(i);
          return (
            <SortableAnimation
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
  resourceManagementProps: ResourceManagementProps,
  resourcesLoader: typeof ResourcesLoader,
  extraBottomTools: React.Node,
  onSizeUpdated: () => void,
  objectName: string,
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
  };

  removeAnimation = i => {
    const answer = Window.showConfirmDialog(
      'Are you sure you want to remove this animation?'
    );

    if (answer) {
      this.props.spriteConfiguration.removeAnimation(i);
      this.forceUpdate();
      this.props.onSizeUpdated();
    }
  };

  changeAnimationName = (i, newName) => {
    const { spriteConfiguration } = this.props;

    const otherNames = mapFor(
      0,
      spriteConfiguration.getAnimationsCount(),
      index => {
        return index === i
          ? undefined // Don't check the current animation name as we're changing it.
          : spriteConfiguration.getAnimation(index).getName();
      }
    );

    if (newName !== '' && otherNames.filter(name => name === newName).length) {
      showWarningBox(
        'Another animation with this name already exists. Please use another name.',
        { delayToNextTick: true }
      );
      return;
    }

    spriteConfiguration.getAnimation(i).setName(newName);
    this.forceUpdate();
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
            />
            <Column>
              <ResponsiveLineStackLayout
                justifyContent="space-between"
                noColumnMargin
              >
                {this.props.extraBottomTools}
                <RaisedButton
                  label={<Trans>Add an animation</Trans>}
                  primary
                  onClick={this.addAnimation}
                  icon={<Add />}
                />
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

export default function SpriteEditor({
  objectConfiguration,
  project,
  resourceManagementProps,
  onSizeUpdated,
  objectName,
}: EditorProps) {
  const [pointsEditorOpen, setPointsEditorOpen] = React.useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = React.useState(false);
  const [
    collisionMasksEditorOpen,
    setCollisionMasksEditorOpen,
  ] = React.useState(false);
  const forceUpdate = useForceUpdate();
  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);

  return (
    <>
      <AnimationsListContainer
        spriteConfiguration={spriteConfiguration}
        resourcesLoader={ResourcesLoader}
        resourceManagementProps={resourceManagementProps}
        project={project}
        objectName={objectName}
        onSizeUpdated={onSizeUpdated}
        extraBottomTools={
          <ResponsiveLineStackLayout noMargin noColumnMargin>
            <RaisedButton
              label={<Trans>Edit collision masks</Trans>}
              primary={false}
              onClick={() => setCollisionMasksEditorOpen(true)}
              disabled={spriteConfiguration.getAnimationsCount() === 0}
            />
            <RaisedButton
              label={<Trans>Edit points</Trans>}
              primary={false}
              onClick={() => setPointsEditorOpen(true)}
              disabled={spriteConfiguration.getAnimationsCount() === 0}
            />
            <FlatButton
              label={<Trans>Advanced options</Trans>}
              primary={false}
              onClick={() => setAdvancedOptionsOpen(true)}
              disabled={spriteConfiguration.getAnimationsCount() === 0}
            />
          </ResponsiveLineStackLayout>
        }
      />
      {advancedOptionsOpen && (
        <Dialog
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
              }}
            />
          </Column>
        </Dialog>
      )}
      {pointsEditorOpen && (
        <Dialog
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
          noMargin
          maxWidth="lg"
          flexBody
          fullHeight
          open={pointsEditorOpen}
        >
          <PointsEditor
            objectConfiguration={spriteConfiguration}
            resourcesLoader={ResourcesLoader}
            project={project}
          />
        </Dialog>
      )}
      {collisionMasksEditorOpen && (
        <Dialog
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
          noMargin
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
          />
        </Dialog>
      )}
    </>
  );
}
