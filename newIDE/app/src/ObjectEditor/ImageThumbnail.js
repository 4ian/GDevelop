import React from 'react';

const SPRITE_SIZE = 100;
export const thumbnailContainerStyle = {
  display: 'inline-block',
  width: SPRITE_SIZE,
  height: SPRITE_SIZE,
  justifyContent: 'center',
  alignItems: 'center',
  lineHeight: SPRITE_SIZE + 'px',
  textAlign: 'center',
  border: '#AAAAAA 1px solid',
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
  },
};

export default ({ project, resourceName, resourcesLoader, style }) => {
  return (
    <div style={{ ...styles.spriteThumbnail, ...style }}>
      <img
        style={styles.spriteThumbnailImage}
        alt={resourceName}
        src={resourcesLoader.getResourceFullFilename(project, resourceName)}
      />
    </div>
  );
};
