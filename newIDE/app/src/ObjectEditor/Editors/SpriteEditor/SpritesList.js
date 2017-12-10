import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import DirectionTools from './DirectionTools';
import MiniToolbar from '../../../UI/MiniToolbar';
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

const SortableSpriteThumbnail = SortableElement(
  ({ sprite, project, resourcesLoader, selected, onSelect, onContextMenu }) => {
    return (
      <ImageThumbnail
        selectable
        selected={selected}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        resourceName={sprite.getImageName()}
        resourcesLoader={resourcesLoader}
        project={project}
        style={styles.thumbnailExtraStyle}
      />
    );
  }
);

const SortableList = SortableContainer(
  ({
    direction,
    project,
    resourcesLoader,
    onAddSprite,
    selectedSprites,
    onSelectSprite,
    onSpriteContextMenu,
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
                key={sprite.ptr}
                index={i}
                selected={!!selectedSprites[sprite.ptr]}
                onContextMenu={(x, y) => onSpriteContextMenu(x, y, sprite)}
                onSelect={selected => onSelectSprite(sprite, selected)}
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
  }
);

export default class SpritesList extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.direction.moveSprite(oldIndex, newIndex);
    this.forceUpdate();
  };

  onAddSprite = () => {
    const {
      resourceSources,
      onChooseResource,
      project,
      direction,
    } = this.props;
    if (!resourceSources || !resourceSources.length) return;

    onChooseResource(resourceSources[0].name).then(resources => {
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
          <DirectionTools
            direction={this.props.direction}
            resourcesLoader={this.props.resourcesLoader}
            project={this.props.project}
          />
        </MiniToolbar>
        <SortableList
          resourcesLoader={this.props.resourcesLoader}
          direction={this.props.direction}
          project={this.props.project}
          onSortEnd={this.onSortEnd}
          onAddSprite={this.onAddSprite}
          selectedSprites={this.props.selectedSprites}
          onSelectSprite={this.props.onSelectSprite}
          onSpriteContextMenu={this.props.onSpriteContextMenu}
          helperClass="sortable-helper"
          lockAxis="x"
          axis="x"
        />
      </div>
    );
  }
}
