import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import DirectionTools from './DirectionTools';
import MiniToolbar from '../../../UI/MiniToolbar';
import ResourcesLoader from '../../../ObjectsRendering/ResourcesLoader';
import ImageThumbnail, { thumbnailContainerStyle } from '../../ImageThumbnail';
const gd = global.gd;

const SPRITE_SIZE = 100; //TODO: Factor with Thumbnail

const styles = {
  spritesList: {
    whiteSpace: 'nowrap',
    overflowY: 'hidden',
  },
  thumbnailExtraStyle: {
    marginRight: 10,
  },
  addSpriteButton: {
    ...thumbnailContainerStyle,
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
  return (
    <ImageThumbnail
      resourceName={sprite.getImageName()}
      resourcesLoader={resourcesLoader}
      project={project}
      style={styles.thumbnailExtraStyle}
    />
  );
});

const SortableList = SortableContainer(({
  direction,
  project,
  resourcesLoader,
  onAddSprite,
}) => {
  const spritesCount = direction.getSpritesCount();
  return (
    <div style={styles.spritesList}>
      {[
        ...mapFor(0, spritesCount, i => {
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
          index={spritesCount}
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
      <div>
        <MiniToolbar justifyContent="flex-end" smallest>
          <DirectionTools direction={this.props.direction} />
        </MiniToolbar>
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
      </div>
    );
  }
}
