// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Checkbox from '../../UI/Checkbox';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import CheckeredBackground from '../CheckeredBackground';
import {
  getSpritesheetFrameImageStyle,
  useSpritesheetFrameData,
} from '../../ObjectsRendering/Thumbnail';

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
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  spritesheetResourceName?: string,
  spritesheetFrameName?: string,
  style?: any,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: (checked: boolean) => void,
  onContextMenu?: (x: number, y: number) => void,
  size?: number,
|};

const ImageThumbnail = (props: Props) => {
  const {
    onContextMenu,
    resourcesLoader,
    resourceName,
    project,
    spritesheetResourceName,
    spritesheetFrameName,
  } = props;
  const theme = React.useContext(GDevelopThemeContext);
  const [error, setError] = React.useState(false);
  const spritesheetFrameData = useSpritesheetFrameData(
    project,
    spritesheetResourceName,
    spritesheetFrameName
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
    width: props.size || 100,
    height: props.size || 100,
    border: `1px solid ${borderColor}`,
    borderRadius: 4,
    overflow: 'hidden',
    ...props.style,
  };

  const displayName = spritesheetFrameName || resourceName;
  const thumbnailSource = spritesheetFrameData
    ? spritesheetFrameData.imageSrc
    : resourcesLoader.getResourceFullUrl(project, resourceName, {});
  const frameStyle = spritesheetFrameData
    ? getSpritesheetFrameImageStyle(
        spritesheetFrameData,
        props.size || 100,
        props.size || 100
      )
    : null;

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
      <CorsAwareImage
        style={{
          ...styles.spriteThumbnailImage,
          ...(frameStyle || {
            maxWidth: props.size || 100,
            maxHeight: props.size || 100,
          }),
          display: error ? 'none' : undefined,
        }}
        alt={displayName}
        src={thumbnailSource}
        onError={error => {
          setError(error);
        }}
        onLoad={() => {
          setError(false);
        }}
      />
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
