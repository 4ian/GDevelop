import React from 'react';
import Checkbox from '../../UI/Checkbox';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import {
  checkImageSize,
  confirmationImportImage,
  ResourcesManagerContext,
} from '../../Utils/ImageSizeChecker';
import Tooltip from '@material-ui/core/Tooltip';
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
  deleteSprite,
  onContextMenu,
  muiTheme,
}) => {
  const [hasSizeWarning, setHasWarningSize] = React.useState(false);
  const [hasThumbnailMissing, setThumbnailMissing] = React.useState(false);

  const _callbackImageThumbnailLoaded = (imageElement: HTMLImageElement) => {
    const existAlready = resourcesLoader.getStatusCode(project, resourceName);
    if (existAlready === 'IMAGE_EXCEEDED_2048_PIXELS') {
      setHasWarningSize(true);
    } else {
      if (checkImageSize(imageElement)) {
        onSelect(selected);
        setHasWarningSize(true);
        if (!confirmationImportImage()) {
          deleteSprite(true);
          // TODO Supprimer la resource
          //deleteResource(PATH);
        }
      } else {
        setHasWarningSize(false);
      }
    }
    setThumbnailMissing(false);
  };
  return (
    <ThemeConsumer>
      {muiTheme => (
        <div
          title={resourceName}
          style={{
            ...styles.spriteThumbnail,
            borderColor: selected
              ? muiTheme.imageThumbnail.selectedBorderColor
              : hasThumbnailMissing
              ? muiTheme.message.error
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
            alt={hasThumbnailMissing ? '' : resourceName}
            src={resourcesLoader.getResourceFullUrl(project, resourceName)}
            crossOrigin="anonymous"
            onLoad={_callbackImageThumbnailLoaded}
            onError={() => {
              setThumbnailMissing(true);
            }}
          />
          {selectable && (
            <div style={styles.checkboxContainer}>
              <Checkbox
                checked={selected}
                onCheck={(e, check) => onSelect(check)}
              />
            </div>
          )}
          {hasSizeWarning && (
            <div style={styles.spriteWarning}>
              <Tooltip
                title={`Sprite is taller than 2048px wide, this have consequence on performance.`}
                placement="top"
              >
                <Warning
                  style={{
                    ...styles.icon,
                    color: muiTheme.message.warning,
                  }}
                />
              </Tooltip>
            </div>
          )}
          {hasThumbnailMissing && (
            <div style={styles.spriteWarning}>
              <Tooltip
                title={`Image ${resourceName} is missing in resource panel.`}
                placement="top"
              >
                <Warning
                  style={{
                    ...styles.icon,
                    color: muiTheme.message.error,
                  }}
                />
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </ThemeConsumer>
  );
};

export default ImageThumbnail;
