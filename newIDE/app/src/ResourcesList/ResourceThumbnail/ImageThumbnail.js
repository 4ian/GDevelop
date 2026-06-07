// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Checkbox from '../../UI/Checkbox';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import CheckeredBackground from '../CheckeredBackground';

type SourceRect = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};

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
  sourceRectContainer: {
    overflow: 'hidden',
    position: 'relative',
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
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  style?: any,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: (checked: boolean) => void,
  onContextMenu?: (x: number, y: number) => void,
  size?: number,
  sourceRect?: ?SourceRect,
|};

const ImageThumbnail = (props: Props): React.MixedElement => {
  const { onContextMenu, resourcesLoader, resourceName, project } = props;
  const theme = React.useContext(GDevelopThemeContext);
  const [error, setError] = React.useState(false);
  const [imageSize, setImageSize] = React.useState<?[number, number]>(null);

  // Allow a long press to show the context menu
  const { contextMenuProps: longTouchForContextMenuProps } = useLongTouch(
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
    width: props.size || 100,
    height: props.size || 100,
    border: `1px solid ${borderColor}`,
    borderRadius: 4,
    ...props.style,
  };
  const thumbnailSize = props.size || 100;
  const sourceRect = props.sourceRect;
  const displaySourceRect = sourceRect && imageSize ? sourceRect : null;
  const sourceRectScale =
    sourceRect && imageSize
      ? Math.min(
          thumbnailSize / sourceRect.width,
          thumbnailSize / sourceRect.height
        )
      : 1;
  const sourceRectContainerStyle =
    displaySourceRect
      ? {
          ...styles.sourceRectContainer,
          width: displaySourceRect.width * sourceRectScale,
          height: displaySourceRect.height * sourceRectScale,
        }
      : null;

  return (
    <div
      title={resourceName}
      style={containerStyle}
      onContextMenu={e => {
        e.stopPropagation();
        if (onContextMenu) onContextMenu(e.clientX, e.clientY);
      }}
      {...longTouchForContextMenuProps}
    >
      <CheckeredBackground borderRadius={4} />
      {sourceRectContainerStyle && displaySourceRect ? (
        <div style={sourceRectContainerStyle}>
          <CorsAwareImage
            style={{
              ...styles.spriteThumbnailImage,
              width: imageSize ? imageSize[0] * sourceRectScale : undefined,
              height: imageSize ? imageSize[1] * sourceRectScale : undefined,
              maxWidth: undefined,
              maxHeight: undefined,
              display: error ? 'none' : undefined,
              transform: `translate(${-displaySourceRect.x *
                sourceRectScale}px, ${-displaySourceRect.y *
                sourceRectScale}px)`,
              transformOrigin: 'top left',
            }}
            alt={resourceName}
            src={resourcesLoader.getResourceFullUrl(project, resourceName, {})}
            onError={error => {
              // $FlowFixMe[incompatible-type]
              setError(error);
            }}
            onLoad={event => {
              const imgElement = event.currentTarget;
              setImageSize([
                imgElement.naturalWidth || imgElement.clientWidth,
                imgElement.naturalHeight || imgElement.clientHeight,
              ]);
              setError(false);
            }}
          />
        </div>
      ) : (
        <CorsAwareImage
          style={{
            ...styles.spriteThumbnailImage,
            maxWidth: props.size || 100,
            maxHeight: props.size || 100,
            display: error ? 'none' : undefined,
          }}
          alt={resourceName}
          src={resourcesLoader.getResourceFullUrl(project, resourceName, {})}
          onError={error => {
            // $FlowFixMe[incompatible-type]
            setError(error);
          }}
          onLoad={event => {
            const imgElement = event.currentTarget;
            setImageSize([
              imgElement.naturalWidth || imgElement.clientWidth,
              imgElement.naturalHeight || imgElement.clientHeight,
            ]);
            setError(false);
          }}
        />
      )}
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

export default ImageThumbnail;
