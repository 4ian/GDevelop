import React, { Component } from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import { Line, Column } from '../../../UI/Grid';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
const gd = global.gd;

const SortableSprite = SortableElement(({ sprite }) => (
  <span>{sprite.getImageName()}</span>
));

const SortableSpritesList = SortableContainer(({ direction }) => {
  return (
    <div>
      {mapFor(0, direction.getSpritesCount(), i => {
        const sprite = direction.getSprite(i);
        return <SortableSprite sprite={sprite} key={i} index={i} />;
      })}
    </div>
  );
});

class SpritesListContainer extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    //TODO
    console.log('sort end direction', this.props.direction, {
      oldIndex,
      newIndex,
    });
  };
  render() {
    return (
      <SortableSpritesList
        direction={this.props.direction}
        onSortEnd={this.onSortEnd}
        lockAxis="x"
        axis="x"
      />
    );
  }
}

const SortableAnimation = SortableElement(({ animation, id }) => (
  <GridTile>
    Animation #{id} {animation.getName()}
    {mapFor(0, animation.getDirectionsCount(), i => {
      const direction = animation.getDirection(i);
      return <SpritesListContainer direction={direction} key={i} />;
    })}
  </GridTile>
));

const styles = {
  gridList: {
    overflowY: 'auto',
  },
};

const SortableAnimationsList = SortableContainer(({ spriteObject }) => {
  return (
    <GridList style={styles.gridList} cellHeight={60} cols={1}>
      {mapFor(0, spriteObject.getAnimationsCount(), i => {
        const animation = spriteObject.getAnimation(i);
        console.log(animation);
        console.log(animation.getName);
        return (
          <SortableAnimation key={i} index={i} id={i} animation={animation} />
        );
      })}
    </GridList>
  );
});

class AnimationsListContainer extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    //TODO
    console.log(this.props.spriteObject, { oldIndex, newIndex });
  };
  render() {
    return (
      <SortableAnimationsList
        spriteObject={this.props.spriteObject}
        onSortEnd={this.onSortEnd}
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
          <AnimationsListContainer spriteObject={spriteObject} />
        </Line>
      </Column>
    );
  }
}
