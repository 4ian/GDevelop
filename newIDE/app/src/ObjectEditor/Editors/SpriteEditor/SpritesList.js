// @flow
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
import {
  copySpritePoints,
  copySpritePolygons,
  allDirectionSpritesHaveSamePointsAs,
  allDirectionSpritesHaveSameCollisionMasksAs,
} from './Utils/SpriteObjectHelper';
import ResourcesLoader from '../../../ResourcesLoader';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';
const gd = global.gd;
const path = require('path');

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

/**
 * Check if all sprites of the given direction have the same points and collision masks
 */
const checkDirectionPointsAndCollisionsMasks = (direction: gdDirection) => {
  let allDirectionSpritesHaveSamePoints = false;
  let allDirectionSpritesHaveSameCollisionMasks = false;
  if (direction.getSpritesCount() !== 0) {
    allDirectionSpritesHaveSamePoints = allDirectionSpritesHaveSamePointsAs(
      direction.getSprite(0),
      direction
    );
    allDirectionSpritesHaveSameCollisionMasks = allDirectionSpritesHaveSameCollisionMasksAs(
      direction.getSprite(0),
      direction
    );
  }

  return {
    allDirectionSpritesHaveSamePoints,
    allDirectionSpritesHaveSameCollisionMasks,
  };
};

type Props = {|
  direction: gdDirection,
  project: gdProject,
  resourcesLoader: typeof ResourcesLoader,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseResource: ChooseResourceFunction,
  onSpriteContextMenu: (x: number, y: number, sprite: gdSprite) => void,
  selectedSprites: {
    [number]: boolean,
  },
  onSelectSprite: (sprite: gdSprite, selected: boolean) => void,
  onReplaceByDirection: (newDirection: gdDirection) => void,
  onChangeName: (newAnimationName: string) => void, // Used by piskel to set the name, if there is no name
  objectName: string, // This is used for the default name of images created with Piskel.
  animationName: string, // This is used for the default name of images created with Piskel.
|};

export default class SpritesList extends Component<Props, void> {
  onSortEnd = ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number,
    newIndex: number,
  }) => {
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

    const {
      allDirectionSpritesHaveSameCollisionMasks,
      allDirectionSpritesHaveSamePoints,
    } = checkDirectionPointsAndCollisionsMasks(direction);

    onChooseResource(sources[0].name).then(resources => {
      resources.forEach(resource => {
        project.getResourcesManager().addResource(resource);

        const sprite = new gd.Sprite();
        sprite.setImageName(resource.getName());
        if (allDirectionSpritesHaveSamePoints) {
          copySpritePoints(direction.getSprite(0), sprite);
        }
        if (allDirectionSpritesHaveSameCollisionMasks) {
          copySpritePolygons(direction.getSprite(0), sprite);
        }
        direction.addSprite(sprite);
      });

      this.forceUpdate();
    });
  };

  editWith = (externalEditor: ResourceExternalEditor) => {
    const {
      project,
      direction,
      resourcesLoader,
      onReplaceByDirection,
      onChangeName,
      objectName,
      animationName,
    } = this.props;
    const resourceNames = mapFor(0, direction.getSpritesCount(), i => {
      return direction.getSprite(i).getImageName();
    });

    const {
      allDirectionSpritesHaveSameCollisionMasks,
      allDirectionSpritesHaveSamePoints,
    } = checkDirectionPointsAndCollisionsMasks(direction);

    let externalEditorData = {};
    const metadataRaw = direction.getMetadata();
    if (metadataRaw) {
      try {
        externalEditorData = JSON.parse(metadataRaw);
      } catch (e) {
        console.error('Malformed metadata', e);
      }
    }

    externalEditor.edit({
      project,
      resourcesLoader,
      singleFrame: false,
      resourceNames,
      extraOptions: {
        fps:
          direction.getTimeBetweenFrames() > 0
            ? 1 / direction.getTimeBetweenFrames()
            : 1,
        name:
          animationName ||
          (resourceNames.length > 0
            ? path.basename(resourceNames[0], path.extname(resourceNames[0]))
            : objectName),
        isLooping: direction.isLooping(),
        externalEditorData,
      },
      onChangesSaved: (resources, newAnimationName, metadata) => {
        const newDirection = new gd.Direction();
        newDirection.setTimeBetweenFrames(direction.getTimeBetweenFrames());
        newDirection.setLoop(direction.isLooping());
        resources.forEach(resource => {
          const sprite = new gd.Sprite();
          sprite.setImageName(resource.name);
          // Restore collision masks and points
          if (resource.originalIndex !== undefined) {
            const originalSprite = direction.getSprite(resource.originalIndex);
            copySpritePoints(originalSprite, sprite);
            copySpritePolygons(originalSprite, sprite);
          } else {
            if (allDirectionSpritesHaveSamePoints) {
              copySpritePoints(direction.getSprite(0), sprite);
            }
            if (allDirectionSpritesHaveSameCollisionMasks) {
              copySpritePolygons(direction.getSprite(0), sprite);
            }
          }
          newDirection.addSprite(sprite);
          sprite.delete();
        });

        // set metadata if there is such on the direction
        if (metadata) {
          newDirection.setMetadata(JSON.stringify(metadata));
        }

        // Burst the ResourcesLoader cache to force images to be reloaded (and not cached by the browser).
        resourcesLoader.burstUrlsCacheForResources(project, resourceNames);
        onReplaceByDirection(newDirection);
        // Set optional animation name if the user hasn't done so
        if (animationName.length === 0) {
          onChangeName(newAnimationName);
        }
        newDirection.delete();
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
            resourceExternalEditors={this.props.resourceExternalEditors}
            onEditWith={this.editWith}
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
