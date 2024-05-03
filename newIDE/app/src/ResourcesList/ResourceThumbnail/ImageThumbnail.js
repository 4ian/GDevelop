// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Checkbox from '../../UI/Checkbox';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import CheckeredBackground from '../CheckeredBackground';

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
};

const styles = {
  spriteThumbnail: {
    ...thumbnailContainerStyle,
  },
  spriteThumbnailImage: {
    position: 'relative',
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
|};

const ImageThumbnail = (props: Props) => {
  const { onContextMenu, resourcesLoader, resourceName, project } = props;
  const theme = React.useContext(GDevelopThemeContext);

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
    : normalBorderColor;

  const containerStyle = {
    ...styles.spriteThumbnail,
    border: `2px solid ${borderColor}`,
    borderRadius: 4,
    ...props.style,
  };

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
      <CheckeredBackground />
      <CorsAwareImage
        style={styles.spriteThumbnailImage}
        alt={resourceName}
        src={resourcesLoader.getResourceFullUrl(project, resourceName, {})}
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
