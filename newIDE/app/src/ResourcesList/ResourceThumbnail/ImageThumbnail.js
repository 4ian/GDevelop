import React from 'react';
import Checkbox from '../../UI/Checkbox';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import Warning from '@material-ui/icons/Warning';

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
    width: 34, // Used to position the checkbox near the right border with a proper margin
    height: 64,
    bottom: 0,
    right: 0,
  },
  spriteWarning: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    right: 0,
  },
  icon: { width: 28, height: 28 },
};

const ImageThumbnail = ({
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
  let warningSize = false;

  const img = new Image();
  img.src = resourcesLoader.getResourceFullUrl(project, resourceName);

  if (img.width > 2048 || img.height > 2048) {
    warningSize = true;
  }

  return (
    <ThemeConsumer>
      {muiTheme => (
        <div
          title={resourceName}
          style={{
            ...styles.spriteThumbnail,
            borderColor: selected
              ? muiTheme.imageThumbnail.selectedBorderColor
              : undefined,
            ...style,
          }}
          onContextMenu={e => {
            e.stopPropagation();
            if (onContextMenu) onContextMenu(e.clientX, e.clientY);
          }}
        >
          <img
            style={styles.spriteThumbnailImage}
            alt={resourceName}
            src={resourcesLoader.getResourceFullUrl(project, resourceName)}
            crossOrigin="anonymous"
          />
          {selectable && (
            <div style={styles.checkboxContainer}>
              <Checkbox
                checked={selected}
                onCheck={(e, check) => onSelect(check)}
              />
            </div>
          )}
          {warningSize && (
            <div style={styles.spriteWarning}>
              <Warning
                style={{
                  ...styles.icon,
                  color: muiTheme.message.error,
                }}
              />
            </div>
          )}
        </div>
      )}
    </ThemeConsumer>
  );
};

export default ImageThumbnail;
