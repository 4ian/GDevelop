// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Checkbox from '../../UI/Checkbox';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import CheckeredBackground from '../CheckeredBackground';
import PixiResourcesLoader, {
  type SpritesheetOrLoadingError,
} from '../../ObjectsRendering/PixiResourcesLoader';

const styles = {
  spriteThumbnail: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  spriteThumbnailImage: {
    position: 'relative',
    pointerEvents: 'none',
  },
  checkboxContainer: {
    textAlign: 'initial',
    position: 'absolute',
    width: 34, // Used to position the checkbox near the right border with a proper margin
    height: 25,
    bottom: 0,
    right: 0,
  },
};

type Props = {|
  project: gdProject,
  sprite: gdSprite,
  resourcesLoader: typeof ResourcesLoader,
  style?: any,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: (checked: boolean) => void,
  onContextMenu?: (x: number, y: number) => void,
  size?: number,
|};

/**
 * A component that displays a sprite thumbnail, handling both regular images
 * and spritesheet frames.
 */
const SpriteThumbnail = (props: Props) => {
  const { onContextMenu, resourcesLoader, sprite, project, size = 100 } = props;
  const theme = React.useContext(GDevelopThemeContext);
  const [error, setError] = React.useState(false);

  // State for spritesheet frame support
  const [
    spritesheetData,
    setSpritesheetData,
  ] = React.useState<SpritesheetOrLoadingError | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const usesSpritesheetFrame = sprite.usesSpritesheetFrame();
  const spritesheetResourceName = usesSpritesheetFrame
    ? sprite.getSpritesheetResourceName()
    : '';
  const frameName = usesSpritesheetFrame ? sprite.getSpritesheetFrameName() : '';
  const resourceName = usesSpritesheetFrame ? '' : sprite.getImageName();

  // Load spritesheet data if this is a spritesheet frame
  React.useEffect(
    () => {
      if (!usesSpritesheetFrame) {
        setSpritesheetData(null);
        return;
      }

      let cancelled = false;
      setIsLoading(true);

      (async () => {
        const result = await PixiResourcesLoader.getSpritesheet(
          project,
          spritesheetResourceName
        );
        if (cancelled) return;
        setSpritesheetData(result);
        setIsLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    },
    [project, usesSpritesheetFrame, spritesheetResourceName]
  );

  // Allow a long press to show the context menu
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        if (onContextMenu) onContextMenu(event.clientX, event.clientY);
      },
      [onContextMenu]
    )
  );

  const normalBorderColor = theme.imagePreview.borderColor;
  const borderColor = props.selected
    ? theme.palette.secondary
    : !!error
    ? theme.message.error
    : normalBorderColor;

  const containerStyle = {
    ...styles.spriteThumbnail,
    width: size,
    height: size,
    border: `1px solid ${borderColor}`,
    borderRadius: 4,
    ...props.style,
  };

  const displayName = usesSpritesheetFrame
    ? `${spritesheetResourceName}:${frameName}`
    : resourceName;

  // Render regular image thumbnail
  const renderRegularImage = () => {
    return (
      <CorsAwareImage
        style={{
          ...styles.spriteThumbnailImage,
          maxWidth: size,
          maxHeight: size,
          display: error ? 'none' : undefined,
        }}
        alt={resourceName}
        src={resourcesLoader.getResourceFullUrl(project, resourceName, {})}
        onError={() => {
          setError(true);
        }}
        onLoad={() => {
          setError(false);
        }}
      />
    );
  };

  // Render spritesheet frame thumbnail
  const renderSpritesheetFrame = () => {
    if (isLoading || !spritesheetData || !spritesheetData.spritesheet) {
      return null;
    }

    const spritesheet = spritesheetData.spritesheet;
    const texture = spritesheet.textures[frameName];
    if (!texture || !texture.frame || !texture.orig) {
      return null;
    }

    // Get the image source from the base texture
    let imageSrc = '';
    if (
      texture.baseTexture &&
      texture.baseTexture.resource &&
      texture.baseTexture.resource.source instanceof HTMLImageElement
    ) {
      imageSrc = texture.baseTexture.resource.source.src;
    }

    if (!imageSrc) {
      return null;
    }

    const frame = texture.frame;
    const orig = texture.orig;

    // Calculate the scale to fit the frame within the thumbnail size
    const scale = Math.min(size / orig.width, size / orig.height, 1);

    const frameStyle = {
      ...styles.spriteThumbnailImage,
      objectFit: 'none',
      objectPosition: `-${frame.x}px -${frame.y}px`,
      width: orig.width,
      height: orig.height,
      maxWidth: 'none',
      maxHeight: 'none',
      transform: `scale(${scale})`,
      display: error ? 'none' : undefined,
    };

    return (
      <CorsAwareImage
        style={frameStyle}
        alt={displayName}
        src={imageSrc}
        onError={() => {
          setError(true);
        }}
        onLoad={() => {
          setError(false);
        }}
      />
    );
  };

  return (
    <div
      title={displayName}
      style={containerStyle}
      onContextMenu={e => {
        e.stopPropagation();
        if (onContextMenu) onContextMenu(e.clientX, e.clientY);
      }}
      {...longTouchForContextMenuProps}
    >
      <CheckeredBackground borderRadius={4} />
      {usesSpritesheetFrame ? renderSpritesheetFrame() : renderRegularImage()}
      {props.selectable && (
        <div style={styles.checkboxContainer}>
          <Checkbox
            checked={!!props.selected}
            onCheck={(e, check) => props.onSelect && props.onSelect(check)}
          />
        </div>
      )}
    </div>
  );
};

export default SpriteThumbnail;
