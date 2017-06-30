import React, { Component } from 'react';
import { GridList, GridTile } from 'material-ui/GridList';
import { Line, Column } from '../../../UI/Grid';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SpritesList from './SpritesList';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import { mapFor } from '../../../Utils/MapFor';
import EmptyMessage from '../../../UI/EmptyMessage';
const gd = global.gd;

const styles = {
  gridList: {
    overflowY: 'auto',
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

const SortableAnimation = SortableElement(({
  animation,
  id,
  project,
  resourceSources,
}) => (
  <GridTile>
    Animation #{id} {animation.getName()}
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
));

const SortableAnimationsList = SortableContainer(({
  spriteObject,
  onAddAnimation,
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

  render() {
    return (
      <SortableAnimationsList
        spriteObject={this.props.spriteObject}
        helperClass="sortable-helper"
        project={this.props.project}
        onSortEnd={this.onSortEnd}
        onAddAnimation={this.addAnimation}
        resourceSources={this.props.resourceSources}
      />
    );
  }
}

export default class PanelSpriteEditor extends Component {
  render() {
    const { object, project, resourceSources } = this.props;
    const spriteObject = gd.asSpriteObject(object);

    return (
      <Column>
        <Line>
          <AnimationsListContainer
            spriteObject={spriteObject}
            resourceSources={resourceSources}
            project={project}
          />
        </Line>
      </Column>
    );
  }
}
