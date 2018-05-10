import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../../../Utils/MapFor';
import Add from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import Brush from 'material-ui/svg-icons/image/brush';
import DirectionTools from './DirectionTools';
import MiniToolbar from '../../../UI/MiniToolbar';
import ImageThumbnail, {
  thumbnailContainerStyle,
} from '../../../ResourcesList/ResourceThumbnail/ImageThumbnail';

import optionalRequire from '../../../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

const gd = global.gd;

const SPRITE_SIZE = 100; //TODO: Factor with Thumbnail

var editedAnimationProp = null; // need this for piskel edits

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

const AddSpriteButton = SortableElement(({ displayHint, onAdd, onEdit }) => {
  return (
    <div style={styles.addSpriteButton}>
      <IconButton onClick={onAdd} style={styles.spriteThumbnailImage}>
        <Add />
      </IconButton>
      <IconButton onClick={onEdit} style={styles.spriteThumbnailImage}>
        <Brush />
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
    onEditSprites,
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
            onEdit={onEditSprites}
          />,
        ]}
      </div>
    );
  }
);

export default class SpritesList extends Component {

  componentDidMount(){

    ipcRenderer.on('piskelSavedChanges',( event, piskelFramePaths) => {
      const {
        direction,
      } = editedAnimationProp.props;

      direction.removeAllSprites(); /// clear the old sprite list
      var i = 0 ; /// ...We need to recreate it in order to account for any new/removal/reorder frame changes made in piskel
      for (i = 0; i < piskelFramePaths.length; i++) { 
        var imagePath = piskelFramePaths[i];
        const imageResource = new gd.ImageResource();
        imageResource.setName(imagePath);
        imageResource.setFile(imagePath);
        const sprite = new gd.Sprite();
        sprite.setImageName(imageResource.getName());
        direction.addSprite(sprite);
      };
      editedAnimationProp.forceUpdate();

    });
  };

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

  onEditSprites =() => {
    const {
      project,
      direction,
      resourcesLoader,
    } = this.props;
    editedAnimationProp = this ;
    var imageFrames = []; /// first collect the images to edit
    for (var i = 0; i < direction.getSpritesCount(); i++) {
      var spriteImagePath = resourcesLoader.getResourceFullUrl(project, direction.getSprite(i).getImageName());
      var importedImage = new Image();
      importedImage.src = spriteImagePath; 
      spriteImagePath = spriteImagePath.substring(7,spriteImagePath.lastIndexOf('?cache='));
      imageFrames.push(spriteImagePath);
    }
    const piskelData = {
      imageFrames:imageFrames,
      fps:Math.floor(direction.getTimeBetweenFrames()*480),
      name:"New Animation",
      isLooping:direction.isLooping()
    };
    if (direction.hasNoSprites()){
      piskelData['name'] = 'New Animation';
      var projectFolderPath = String(project.getProjectFile());
      projectFolderPath = projectFolderPath.substring(0,projectFolderPath.lastIndexOf("\\")+1);
      projectFolderPath = projectFolderPath.replace(/[\\]/g,"/");
      piskelData['projectFolder'] = projectFolderPath;
      ipcRenderer.send('piskelNewAnimation',piskelData);
    }
    else
    {
      piskelData['name'] = imageFrames[0].split("/").pop().split(".")[0];
      ipcRenderer.send('piskelOpenAnimation',piskelData);    
    }
  }

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
