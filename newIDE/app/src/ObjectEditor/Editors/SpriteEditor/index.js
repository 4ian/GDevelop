import React, { Component } from 'react';
import { GridList, GridTile } from 'material-ui/GridList';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SpritesList from './SpritesList';
import Add from 'material-ui/svg-icons/content/add';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { mapFor } from '../../../Utils/MapFor';
import Dialog from '../../../UI/Dialog';
import EmptyMessage from '../../../UI/EmptyMessage';
import MiniToolbar from '../../../UI/MiniToolbar';
import DragHandle from '../../../UI/DragHandle';
import ContextMenu from '../../../UI/Menu/ContextMenu';
import { showWarningBox } from '../../../UI/Messages/MessageBox';
import ResourcesLoader from '../../../ObjectsRendering/ResourcesLoader';
import PointsEditor from './PointsEditor';
import { deleteSpritesFromAnimation } from './Utils/SpriteObjectHelper';

const gd = global.gd;

const styles = {
  gridList: {
    overflowY: 'auto',
  },
  animationTitle: {
    flex: 1,
  },
  animationTools: {
    flexShrink: 0,
  },
  lastLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addAnimation: {
    display: 'flex',
  },
  addAnimationText: {
    justifyContent: 'flex-end',
  },
};

const AddAnimationLine = ({ onAdd, extraTools }) => (
  <div style={styles.lastLine}>
    {extraTools}
    <div style={styles.addAnimation}>
      <EmptyMessage style={styles.addAnimationText}>
        Click to add an animation:
      </EmptyMessage>
      <IconButton onClick={onAdd}>
        <Add />
      </IconButton>
    </div>
  </div>
);

class Animation extends Component {
  render() {
    const {
      animation,
      id,
      project,
      resourceSources,
      onRemove,
      onChooseResource,
      resourcesLoader,
      onSpriteContextMenu,
      selectedSprites,
      onSelectSprite,
    } = this.props;

    return (
      <GridTile>
        <MiniToolbar smallest>
          <DragHandle />
          <span style={styles.animationTitle}>
            Animation #
            {id}{' '}
            <TextField
              value={animation.getName()}
              hintText="Optional animation name"
              onChange={(e, text) => this.props.onChangeName(text)}
            />
          </span>
          <span style={styles.animationTools}>
            <IconButton onClick={onRemove}>
              <Delete />
            </IconButton>
          </span>
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
              onSpriteContextMenu={onSpriteContextMenu}
              selectedSprites={selectedSprites}
              onSelectSprite={onSelectSprite}
            />
          );
        })}
      </GridTile>
    );
  }
}

const SortableAnimation = SortableElement(Animation);

const SortableAnimationsList = SortableContainer(
  ({
    spriteObject,
    onAddAnimation,
    onRemoveAnimation,
    onChangeAnimationName,
    project,
    resourcesLoader,
    resourceSources,
    onChooseResource,
    extraBottomTools,
    onSpriteContextMenu,
    selectedSprites,
    onSelectSprite,
  }) => {
    return (
      <GridList style={styles.gridList} cellHeight="auto" cols={1}>
        {[
          ...mapFor(0, spriteObject.getAnimationsCount(), i => {
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
                onRemove={() => onRemoveAnimation(i)}
                onChangeName={newName => onChangeAnimationName(i, newName)}
                onSpriteContextMenu={onSpriteContextMenu}
                selectedSprites={selectedSprites}
                onSelectSprite={onSelectSprite}
              />
            );
          }),
          <AddAnimationLine
            onAdd={onAddAnimation}
            key="add-animation-line"
            disabled
            index={spriteObject.getAnimationsCount()}
            extraTools={extraBottomTools}
          />,
        ]}
      </GridList>
    );
  }
);

class AnimationsListContainer extends Component {
  state = {
    selectedSprites: {},
  };

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
    //eslint-disable-next-line
    const answer = confirm('Are you sure you want to remove this animation?');

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
        'Another animation with this name already exists. Please use another name.'
      );
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

  openSpriteContextMenu = (x, y, sprite, index) => {
    this.selectSprite(sprite, true);
    this.spriteContextMenu.open(x, y);
  };

  selectSprite = (sprite, selected) => {
    this.setState({
      selectedSprites: {
        ...this.state.selectedSprites,
        [sprite.ptr]: selected,
      },
    });
  };

  render() {
    return (
      <div>
        <SortableAnimationsList
          spriteObject={this.props.spriteObject}
          helperClass="sortable-helper"
          project={this.props.project}
          onSortEnd={this.onSortEnd}
          onAddAnimation={this.addAnimation}
          onChangeAnimationName={this.changeAnimationName}
          onRemoveAnimation={this.removeAnimation}
          onSpriteContextMenu={this.openSpriteContextMenu}
          selectedSprites={this.state.selectedSprites}
          onSelectSprite={this.selectSprite}
          resourcesLoader={this.props.resourcesLoader}
          resourceSources={this.props.resourceSources}
          onChooseResource={this.props.onChooseResource}
          extraBottomTools={this.props.extraBottomTools}
          useDragHandle
          lockAxis="y"
          axis="y"
        />
        <ContextMenu
          ref={spriteContextMenu =>
            (this.spriteContextMenu = spriteContextMenu)}
          buildMenuTemplate={() => [
            {
              label: 'Delete',
              click: () => this.deleteSelection(),
            },
          ]}
        />
      </div>
    );
  }
}

export default class SpriteEditor extends Component {
  state = {
    pointsEditorOpen: false,
  };

  constructor(props) {
    super(props);

    this.resourcesLoader = ResourcesLoader;
  }

  openPointsEditor = (open = true) => {
    this.setState({
      pointsEditorOpen: open,
    });
  };

  openHitboxesEditor = (open = true) => {
    alert(
      "Hitboxes editor is not ready yet! We're working on it and it will be available soon."
    );
  };

  render() {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      onSizeUpdated,
    } = this.props;
    const spriteObject = gd.asSpriteObject(object);

    return (
      <div>
        <AnimationsListContainer
          spriteObject={spriteObject}
          resourcesLoader={this.resourcesLoader}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          project={project}
          onSizeUpdated={onSizeUpdated}
          extraBottomTools={
            <div>
              <RaisedButton
                label="Edit hitboxes"
                primary={false}
                onClick={() => this.openHitboxesEditor(true)}
                disabled={spriteObject.getAnimationsCount() === 0}
              />
              <RaisedButton
                label="Edit points"
                primary={false}
                onClick={() => this.openPointsEditor(true)}
                disabled={spriteObject.getAnimationsCount() === 0}
              />
            </div>
          }
        />
        {this.state.pointsEditorOpen && (
          <Dialog
            actions={
              <FlatButton
                label="Close"
                primary
                onClick={() => this.openPointsEditor(false)}
              />
            }
            autoScrollBodyContent
            noMargin
            modal
            onRequestClose={() => this.openPointsEditor(false)}
            open={this.state.pointsEditorOpen}
          >
            <PointsEditor
              object={spriteObject}
              resourcesLoader={this.resourcesLoader}
              project={project}
              onPointsUpdated={() =>
                this.forceUpdate() /*Force update to ensure dialog is properly positionned*/}
            />
          </Dialog>
        )}
      </div>
    );
  }
}
