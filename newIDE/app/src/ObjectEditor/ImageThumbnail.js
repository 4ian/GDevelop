import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import muiThemeable from 'material-ui/styles/muiThemeable';

const SPRITE_SIZE = 100;
export const thumbnailContainerStyle = {
  position: 'relative',
  display: 'inline-block',
  width: SPRITE_SIZE,
  height: SPRITE_SIZE,
  justifyContent: 'center',
  alignItems: 'center',
  lineHeight: SPRITE_SIZE + 'px',
  textAlign: 'center',
  border: '#AAAAAA 1px solid',
  borderColor: '#AAAAAA',
};

const styles = {
  spriteThumbnail: {
    ...thumbnailContainerStyle,
    background: 'url("res/transparentback.png") repeat',
  },
  spriteThumbnailImage: {
    maxWidth: SPRITE_SIZE,
    maxHeight: SPRITE_SIZE,
    verticalAlign: 'middle',
    pointerEvents: 'none',
  },
  checkboxContainer: {
    textAlign: 'initial',
    position: 'absolute',
    width: 24, // Used to position the checkbox near the right border with a proper margin
    bottom: 0,
    right: 0,
  },
};

const ThemableImageThumbnail = ({
  project,
  resourceName,
  resourcesLoader,
  style,
  selectable,
  selected,
  onSelect,
  onContextMenu,
  muiTheme,
}) => {
  return (
    <div
      style={{
        ...styles.spriteThumbnail,
        borderColor: selected
          ? muiTheme.imageThumbnail.selectedBorderColor
          : undefined,
        ...style,
      }}
      onContextMenu={e => {
        e.stopPropagation();
        onContextMenu(e.clientX, e.clientY);
      }}
    >
      <img
        style={styles.spriteThumbnailImage}
        alt={resourceName}
        src={resourcesLoader.getResourceFullFilename(project, resourceName)}
      />
      {selectable && (
        <div style={styles.checkboxContainer}>
          <Checkbox
            checked={selected}
            onCheck={(e, check) => onSelect(check)}
          />
        </div>
      )}
    </div>
  );
};

const ImageThumbnail = muiThemeable()(ThemableImageThumbnail);
export default ImageThumbnail;
