import React, { Component } from 'react';
import { GridList, GridTile } from 'material-ui/GridList';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SpritesList from './SpritesList';
import Add from 'material-ui/svg-icons/content/add';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import { mapFor } from '../../../Utils/MapFor';
import EmptyMessage from '../../../UI/EmptyMessage';
import MiniToolbar from '../../../UI/MiniToolbar';
import DragHandle from '../../../UI/DragHandle';
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
  addAnimationLine: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  addAnimationText: {
    justifyContent: 'flex-end',
  },
};

const AddAnimationLine = SortableElement(({ onAdd }) => (
  <div style={styles.addAnimationLine}>
    <EmptyMessage style={styles.addAnimationText}>
      Click to add an animation:
    </EmptyMessage>
    <IconButton onClick={onAdd}>
      <Add />
    </IconButton>
  </div>
));

class Animation extends Component {
  render() {
    const {
      animation,
      id,
      project,
      resourceSources,
      onRemove,
    } = this.props;

    return (
      <GridTile>
        <MiniToolbar smallest>
          <DragHandle />
          <span style={styles.animationTitle}>
            Animation #
            {id}
            {' '}
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
              resourceSources={resourceSources}
            />
          );
        })}
      </GridTile>
    );
  }
}

const SortableAnimation = SortableElement(Animation);

const SortableAnimationsList = SortableContainer(({
  spriteObject,
  onAddAnimation,
  onRemoveAnimation,
  onChangeAnimationName,
  project,
  resourceSources,
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
              resourceSources={resourceSources}
              onRemove={() => onRemoveAnimation(i)}
              onChangeName={newName => onChangeAnimationName(i, newName)}
            />
          );
        }),
        <AddAnimationLine
          onAdd={onAddAnimation}
          key="add-animation-line"
          disabled
          index={spriteObject.getAnimationsCount()}
        />,
      ]}
    </GridList>
  );
});

class AnimationsListContainer extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.spriteObject.moveAnimation(oldIndex, newIndex);
    this.forceUpdate();
  };

  addAnimation = () => {
    const emptyAnimation = new gd.Animation();
    emptyAnimation.setDirectionsCount(1);
    this.props.spriteObject.addAnimation(emptyAnimation);
    this.forceUpdate();
  };

  removeAnimation = i => {
    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this animation? This can't be undone."
    );

    if (answer) {
      this.props.spriteObject.removeAnimation(i);
      this.forceUpdate();
    }
  };

  changeAnimationName = (i, newName) => {
    const { spriteObject } = this.props;

    const otherNames = mapFor(0, spriteObject.getAnimationsCount(), index => {
      return index === i
        ? undefined // Don't check the current animation name as we're changing it.
        : spriteObject.getAnimation(index).getName();
    });

    if (otherNames.filter(name => name === newName).length) {
      alert(
        'Another animation with this name already exists. Please use another name.'
      );
    }

    spriteObject.getAnimation(i).setName(newName);
    this.forceUpdate();
  };

  render() {
    return (
      <SortableAnimationsList
        spriteObject={this.props.spriteObject}
        helperClass="sortable-helper"
        project={this.props.project}
        onSortEnd={this.onSortEnd}
        onAddAnimation={this.addAnimation}
        onChangeAnimationName={this.changeAnimationName}
        onRemoveAnimation={this.removeAnimation}
        resourceSources={this.props.resourceSources}
        useDragHandle
        lockAxis="y"
        axis="y"
      />
    );
  }
}

export default class PanelSpriteEditor extends Component {
  render() {
    const { object, project, resourceSources } = this.props;
    const spriteObject = gd.asSpriteObject(object);

    return (
      <AnimationsListContainer
        spriteObject={spriteObject}
        resourceSources={resourceSources}
        project={project}
      />
    );
  }
}
