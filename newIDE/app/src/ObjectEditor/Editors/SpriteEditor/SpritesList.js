import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import ResourcesLoader from '../../../ObjectsRendering/ResourcesLoader';
const gd = global.gd;

const SPRITE_SIZE = 100;
const thumbnailContainer = {
  display: 'inline-block',
  width: SPRITE_SIZE,
  height: SPRITE_SIZE,
  justifyContent: 'center',
  alignItems: 'center',
  lineHeight: SPRITE_SIZE + 'px',
  textAlign: 'center',
  border: '#AAAAAA 1px solid',
  marginRight: 10,
};

const styles = {
  spritesList: {
    whiteSpace: 'nowrap',
    overflowY: 'scroll',
  },
  spriteThumbnail: {
    ...thumbnailContainer,
    background: 'url("res/transparentback.png") repeat',
  },
  addSpriteButton: {
    ...thumbnailContainer,
    background: '#FFF',
  },
  spriteThumbnailImage: {
    maxWidth: SPRITE_SIZE,
    maxHeight: SPRITE_SIZE,
    verticalAlign: 'middle',
  },
};

const AddSpriteButton = SortableElement(({ displayHint, onAdd }) => {
  return (
    <div style={styles.addSpriteButton}>
      <IconButton onClick={onAdd} style={styles.spriteThumbnailImage}>
        <Add />
      </IconButton>
    </div>
  );
});

const SortableSpriteThumbnail = SortableElement(({
  sprite,
  project,
  resourcesLoader,
}) => {
  const resourceName = sprite.getImageName();
  return (
    <div style={styles.spriteThumbnail}>
      <img
        style={styles.spriteThumbnailImage}
        alt={resourceName}
        src={resourcesLoader.getResourceFullFilename(project, resourceName)}
      />
    </div>
  );
});

const SortableList = SortableContainer(({
  direction,
  project,
  resourcesLoader,
  onAddSprite,
}) => {
  return (
    <div style={styles.spritesList}>
      {[
        ...mapFor(0, direction.getSpritesCount(), i => {
          const sprite = direction.getSprite(i);
          return (
            <SortableSpriteThumbnail
              sprite={sprite}
              key={i}
              index={i}
              resourcesLoader={resourcesLoader}
              project={project}
            />
          );
        }),
        <AddSpriteButton
          displayHint={!direction.getSpritesCount()}
          key="add-sprite-button"
          disabled
          onAdd={onAddSprite}
        />,
      ]}
    </div>
  );
});

export default class SpritesList extends Component {
  constructor(props) {
    super(props);

    this.resourcesLoader = ResourcesLoader;
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.direction.moveSprite(oldIndex, newIndex);
    this.forceUpdate();
  };

  onAddSprite = () => {
    const { resourceSources, project, direction } = this.props;
    if (!resourceSources || !resourceSources.length) return;

    resourceSources[0].chooseResources(project).then(resources => {
      resources.forEach(resource => {
        project.getResourcesManager().addResource(resource);

        const sprite = new gd.Sprite();
        sprite.setImageName(resource.getName());
        direction.addSprite(sprite);
      });

      this.forceUpdate();
    });
  };

  render() {
    return (
      <SortableList
        resourcesLoader={this.resourcesLoader}
        direction={this.props.direction}
        project={this.props.project}
        onSortEnd={this.onSortEnd}
        onAddSprite={this.onAddSprite}
        helperClass="sortable-helper"
        lockAxis="x"
        axis="x"
      />
    );
  }
}
