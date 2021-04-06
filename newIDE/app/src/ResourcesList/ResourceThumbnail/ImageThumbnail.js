// @flow
import * as React from 'react';
import ResourcesLoader from '../../ResourcesLoader';
import Checkbox from '../../UI/Checkbox';
import { CorsAwareImage } from '../../UI/CorsAwareImage';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import { useLongTouch } from '../../Utils/UseLongTouch';

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
};

type Props = {|
  project: gdProject,
  resourceName: string,
  resourcesLoader: typeof ResourcesLoader,
  style: any,
  selectable?: boolean,
  selected?: boolean,
  onSelect?: (checked: boolean) => void,
  onContextMenu?: (x: number, y: number) => void,
|};

const ImageThumbnail = (props: Props) => {
  const { onContextMenu, resourcesLoader, resourceName, project } = props;

  // Allow a long press to show the context menu
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        if (onContextMenu) onContextMenu(event.clientX, event.clientY);
      },
      [onContextMenu]
    )
  );

  return (
    <ThemeConsumer>
      {muiTheme => (
        <div
          title={resourceName}
          style={{
            ...styles.spriteThumbnail,
            borderColor: props.selected
              ? muiTheme.imageThumbnail.selectedBorderColor
              : undefined,
            ...props.style,
          }}
          className="gd-checkered-bg"
          onContextMenu={e => {
            e.stopPropagation();
            if (onContextMenu) onContextMenu(e.clientX, e.clientY);
          }}
          {...longTouchForContextMenuProps}
        >
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
      )}
    </ThemeConsumer>
  );
};

export default ImageThumbnail;
