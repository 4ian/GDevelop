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
import EmptyMessage from '../../../UI/EmptyMessage';
import MiniToolbar, { MiniToolbarText } from '../../../UI/MiniToolbar';
import DragHandle from '../../../UI/DragHandle';
import ContextMenu from '../../../UI/Menu/ContextMenu';
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
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';
import { Column } from '../../../UI/Grid';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import ScrollView from '../../../UI/ScrollView';

const gd: libGDevelop = global.gd;

type AnimationProps = {|
  animation: gdAnimation,
  id: number,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
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
      resourceSources,
      onRemove,
      onChooseResource,
      resourceExternalEditors,
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
              hintText={t`Optional animation name`}
              onChange={text => onChangeName(text)}
              fullWidth
            />
          </Column>
          <IconButton onClick={onRemove}>
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
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
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
    spriteObject,
    objectName,
    onAddAnimation,
    onRemoveAnimation,
    onChangeAnimationName,
    project,
    resourcesLoader,
    resourceSources,
    onChooseResource,
    resourceExternalEditors,
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
        {mapFor(0, spriteObject.getAnimationsCount(), i => {
          const animation = spriteObject.getAnimation(i);
          return (
            <SortableAnimation
              key={i}
              index={i}
              id={i}
              animation={animation}
              project={project}
              resourcesLoader={resourcesLoader}
              resourceSources={resourceSources}
              onChooseResource={onChooseResource}
              resourceExternalEditors={resourceExternalEditors}
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
  spriteObject: gdSpriteObject,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
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
  spriteContextMenu: ?ContextMenu;

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.spriteObject.moveAnimation(oldIndex, newIndex);
    this.forceUpdate();
  };

  addAnimation = () => {
    const emptyAnimation = new gd.Animation();
    emptyAnimation.setDirectionsCount(1);
    this.props.spriteObject.addAnimation(emptyAnimation);
    this.forceUpdate();
    this.props.onSizeUpdated();
  };

  removeAnimation = i => {
    const answer = Window.showConfirmDialog(
      'Are you sure you want to remove this animation?'
    );

    if (answer) {
      this.props.spriteObject.removeAnimation(i);
      this.forceUpdate();
      this.props.onSizeUpdated();
    }
  };

  changeAnimationName = (i, newName) => {
    const { spriteObject } = this.props;

    const otherNames = mapFor(0, spriteObject.getAnimationsCount(), index => {
      return index === i
        ? undefined // Don't check the current animation name as we're changing it.
        : spriteObject.getAnimation(index).getName();
    });

    if (newName !== '' && otherNames.filter(name => name === newName).length) {
      showWarningBox(
        'Another animation with this name already exists. Please use another name.',
        { delayToNextTick: true }
      );
      return;
    }

    spriteObject.getAnimation(i).setName(newName);
    this.forceUpdate();
  };

  deleteSelection = () => {
    const { spriteObject } = this.props;

    mapFor(0, spriteObject.getAnimationsCount(), index => {
      const animation = spriteObject.getAnimation(index);
      deleteSpritesFromAnimation(animation, this.state.selectedSprites);
    });

    this.setState({
      selectedSprites: {},
    });
  };

  duplicateSelection = () => {
    const { spriteObject } = this.props;

    mapFor(0, spriteObject.getAnimationsCount(), index => {
      const animation = spriteObject.getAnimation(index);
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
    this.props.spriteObject
      .getAnimation(animationId)
      .setDirection(newDirection, directionId);
    this.forceUpdate();
  };

  render() {
    return (
      <Column noMargin expand useFullHeight>
        {this.props.spriteObject.getAnimationsCount() === 0 ? (
          <EmptyMessage>
            <Trans>
              This object has no animations containing images. Start by adding
              an animation.
            </Trans>
          </EmptyMessage>
        ) : (
          <SortableAnimationsList
            spriteObject={this.props.spriteObject}
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
            resourceSources={this.props.resourceSources}
            resourceExternalEditors={this.props.resourceExternalEditors}
            onChooseResource={this.props.onChooseResource}
            useDragHandle
            lockAxis="y"
            axis="y"
          />
        )}
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
      </Column>
    );
  }
}

type State = {|
  pointsEditorOpen: boolean,
  collisionMasksEditorOpen: boolean,
|};

export default class SpriteEditor extends React.Component<EditorProps, State> {
  state = {
    pointsEditorOpen: false,
    collisionMasksEditorOpen: false,
  };

  resourcesLoader: typeof ResourcesLoader;

  constructor(props: EditorProps) {
    super(props);

    this.resourcesLoader = ResourcesLoader;
  }

  openPointsEditor = (open: boolean = true) => {
    this.setState({
      pointsEditorOpen: open,
    });
  };

  openCollisionMasksEditor = (open: boolean = true) => {
    this.setState({
      collisionMasksEditorOpen: open,
    });
  };

  render() {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      onSizeUpdated,
      objectName,
    } = this.props;
    const spriteObject = gd.asSpriteObject(object);

    return (
      <>
        <AnimationsListContainer
          spriteObject={spriteObject}
          resourcesLoader={this.resourcesLoader}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceExternalEditors={resourceExternalEditors}
          project={project}
          objectName={objectName}
          onSizeUpdated={onSizeUpdated}
          extraBottomTools={
            <ResponsiveLineStackLayout noMargin noColumnMargin>
              <RaisedButton
                label={<Trans>Edit collision masks</Trans>}
                primary={false}
                onClick={() => this.openCollisionMasksEditor(true)}
                disabled={spriteObject.getAnimationsCount() === 0}
              />
              <RaisedButton
                label={<Trans>Edit points</Trans>}
                primary={false}
                onClick={() => this.openPointsEditor(true)}
                disabled={spriteObject.getAnimationsCount() === 0}
              />
            </ResponsiveLineStackLayout>
          }
        />
        {this.state.pointsEditorOpen && (
          <Dialog
            actions={
              <FlatButton
                label={<Trans>Close</Trans>}
                primary
                onClick={() => this.openPointsEditor(false)}
              />
            }
            secondaryActions={[
              <HelpButton
                helpPagePath="/objects/sprite/edit-points"
                key="help"
              />,
            ]}
            cannotBeDismissed={true}
            noMargin
            maxWidth="lg"
            flexBody
            fullHeight
            onRequestClose={() => this.openPointsEditor(false)}
            open={this.state.pointsEditorOpen}
          >
            <PointsEditor
              object={spriteObject}
              resourcesLoader={this.resourcesLoader}
              project={project}
            />
          </Dialog>
        )}
        {this.state.collisionMasksEditorOpen && (
          <Dialog
            actions={
              <FlatButton
                label={<Trans>Close</Trans>}
                primary
                onClick={() => this.openCollisionMasksEditor(false)}
              />
            }
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
            cannotBeDismissed={true}
            onRequestClose={() => this.openCollisionMasksEditor(false)}
            open={this.state.collisionMasksEditorOpen}
          >
            <CollisionMasksEditor
              object={spriteObject}
              resourcesLoader={this.resourcesLoader}
              project={project}
            />
          </Dialog>
        )}
      </>
    );
  }
}
