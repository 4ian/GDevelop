import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import DirectionTools from './DirectionTools';
import MiniToolbar from '../../../UI/MiniToolbar';
import ImageThumbnail, {
  thumbnailContainerStyle,
} from '../../../ResourcesList/ResourceThumbnail/ImageThumbnail';
import { openPiskel } from '../../../Utils/PiskelBridge';
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
    if (!resourceSources) return;
    const sources = resourceSources.filter(source => source.kind === 'image');
    if (!sources.length) return;

    onChooseResource(sources[0].name).then(resources => {
      resources.forEach(resource => {
        project.getResourcesManager().addResource(resource);

        const sprite = new gd.Sprite();
        sprite.setImageName(resource.getName());
        direction.addSprite(sprite);
      });

      this.forceUpdate();
    });
  };

  editWithPiskel = () => {
    const { project, direction, resourcesLoader } = this.props;
    const resourceNames = mapFor(0, direction.getSpritesCount(), i => {
      return direction.getSprite(i).getImageName();
    });
    const preResourceNames = resourceNames;

    openPiskel({
      project,
      resourcesLoader,
      resourceNames,
      piskelOptions: {
        fps:
          direction.getTimeBetweenFrames() > 0
            ? 1 / direction.getTimeBetweenFrames()
            : 1,
        name: 'Animation', //TODO
        isLooping: direction.isLooping(),
      },
      onChangesSaved: resourceNames => {
        var numberOfNewSpites = resourceNames.length - preResourceNames.length;
        for (let i = 0; i < numberOfNewSpites; i++) { // new slots were made in piskel, we need to add them here
          const sprite = new gd.Sprite();
          sprite.setImageName(null);
          direction.addSprite(sprite);
          sprite.delete();
        }
        let idx = 0;
        resourceNames.forEach(resource => {
          if (!preResourceNames.includes(resource.name)) { // set any sprites that were newly created in piskel
            direction.getSprite(idx).setImageName(resource.name);
          }
          idx += 1
        });

        let resourceIndex = 0;
        let moved = [];
        resourceNames.forEach(resource => { // Deal with any sprites that were imported to piskel - this is BUGGY atm
          if (preResourceNames.includes(resource.name)) {
            let oldIndex = preResourceNames.indexOf(resource.name);
            if (oldIndex !== resourceIndex) // Sprite was moved from its previous slot
            {
              if (!moved.includes(resourceIndex) && !moved.includes(oldIndex)) {
                direction.moveSprite(oldIndex, resourceIndex); ///<-- bug cause?
                moved.push(oldIndex); // to this to avoid swapping it back to its previous place
                moved.push(resourceIndex);
                console.log("move: "+oldIndex +"--->"+ resourceIndex); 
              }
            }
          }
          resourceIndex += 1
        });
        
        if (numberOfNewSpites < 0) { // sprites were removed in piskel. We need to get rid of some slots
          for (let i = 0; i < Math.abs(numberOfNewSpites); i++) {
            direction.removeSprite(resourceNames.length - i);
          }
        };
        // Burst the ResourcesLoader cache to force images to be reloaded (and not cached by the browser).
        // TODO: A more fine-grained cache bursting for specific resources could be done.
        resourcesLoader.burstUrlsCache();
        this.forceUpdate();
      },
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
            editWithPiskel={this.editWithPiskel}
          />
        </MiniToolbar>
        <SortableList
          resourcesLoader={this.props.resourcesLoader}
          direction={this.props.direction}
          project={this.props.project}
          onSortEnd={this.onSortEnd}
          onAddSprite={this.onAddSprite}
          onEditSprites={this.onEditSprites}
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
