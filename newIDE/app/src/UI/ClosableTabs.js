// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import ContextMenu, { type ContextMenuInterface } from './Menu/ContextMenu';
import { useLongTouch } from '../Utils/UseLongTouch';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { dataObjectToProps, type HTMLDataset } from '../Utils/HTMLDataset';
import Cross from './CustomSvgIcons/Cross';
import useForceUpdate from '../Utils/UseForceUpdate';

const WINDOW_NON_DRAGGABLE_PART_CLASS_NAME = 'title-bar-non-draggable-part';

const styles = {
  tabContentContainer: {
    width: '100%',
    position: 'relative',
    textAlign: 'initial',
    minHeight: 0,
    display: 'flex',
    flex: 1,
  },
  tabLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '15px', // Same as in Mosaic.css (for mosaic-window-title)
  },
  tabIcon: {
    marginLeft: 4,
    marginRight: 4,
    display: 'flex',
  },
  tabLabelAndIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 5,
    marginLeft: 5,
  },
};

type TabContentContainerProps = {|
  active: boolean,
  removePointerEvents?: boolean,
  children: React.Node,
|};

/**
 * Contains the content of a tab. Two important things:
 *
 * 1) Instead of setting the "height" of hidden tabs to "0", we set "display" to "none" to avoid
 * messing with components (in particular components where you can scroll: when collapsed because of height=0,
 * they will lose they scrolling position).
 *
 * 2) shouldComponentUpdate is used to avoid updating the content of a tab that is not selected.
 */
export class TabContentContainer extends React.Component<TabContentContainerProps> {
  shouldComponentUpdate(nextProps: TabContentContainerProps) {
    return this.props.active || nextProps.active;
  }

  render() {
    const { children, active } = this.props;
    return (
      <div
        style={{
          ...styles.tabContentContainer,
          ...(active ? undefined : { display: 'none' }),
          pointerEvents: this.props.removePointerEvents ? 'none' : undefined,
        }}
      >
        {children}
      </div>
    );
  }
}

type ClosableTabsProps = {|
  hideLabels?: boolean,
  renderTabs: ({| containerWidth: number |}) => React.Node,
|};

export const ClosableTabs = ({ hideLabels, renderTabs }: ClosableTabsProps) => {
  const forceUpdate = useForceUpdate();
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const tabItemContainerStyle = {
    maxWidth: '100%', // Tabs should take all width
    flex: 1,
    display: hideLabels ? 'none' : 'flex',
    flexWrap: 'nowrap', // Single line of tab...
    overflowX: 'overlay', // ...scroll horizontally if needed
    overflowY: 'hidden', // ...never scroll vertically (useful on Safari)
    marginTop: 6,
  };

  const onScroll = React.useCallback((event: WheelEvent) => {
    const divElement = containerRef.current;
    if (divElement) {
      divElement.scrollLeft += event.deltaY;
    }
  }, []);

  const containerWidth = containerRef.current
    ? containerRef.current.clientWidth
    : null;

  React.useLayoutEffect(
    () => {
      // Force a re-render the first time after we know the container width.
      forceUpdate();
    },
    [forceUpdate]
  );

  return (
    <div
      ref={containerRef}
      className="almost-invisible-scrollbar"
      style={tabItemContainerStyle}
      onWheel={onScroll}
    >
      {containerWidth !== null ? renderTabs({ containerWidth }) : null}
    </div>
  );
};

export type ClosableTabProps = {|
  id?: string,
  data?: HTMLDataset,
  active: boolean,
  label: ?React.Node,
  icon: ?React.Node,
  renderCustomIcon?: ?(brightness: number) => React.Node,
  closable: boolean,
  onClose: () => void,
  onCloseOthers: () => void,
  onCloseAll: () => void,
  onClick: () => void,
  onActivated: () => void,
  onHover: boolean => void,
  maxWidth: number,
|};

export function ClosableTab({
  id,
  data,
  active,
  onClose,
  onCloseOthers,
  onCloseAll,
  label,
  icon,
  renderCustomIcon,
  closable,
  onClick,
  onActivated,
  onHover,
  maxWidth,
}: ClosableTabProps) {
  React.useEffect(
    () => {
      if (active) {
        onActivated();
      }
    },
    [active, onActivated]
  );
  const contextMenu = React.useRef<?ContextMenuInterface>(null);

  const openContextMenu = event => {
    event.stopPropagation();
    if (contextMenu.current) {
      contextMenu.current.open(event.clientX, event.clientY);
    }
  };

  const closeOnMiddleClick = React.useCallback(
    event => {
      if (event.nativeEvent && event.nativeEvent.button === 1) {
        onClose();
      }
    },
    [onClose]
  );

  // Allow a long press to show the context menu
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        if (contextMenu.current) {
          contextMenu.current.open(event.clientX, event.clientY);
        }
      },
      [contextMenu]
    )
  );

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const textColor = active
    ? gdevelopTheme.closableTabs.selectedTextColor
    : gdevelopTheme.closableTabs.textColor;

  const brightness =
    gdevelopTheme.palette.type === 'dark'
      ? active
        ? 0.978
        : 0.776
      : active
      ? 0.022
      : 0.224;

  const labelMaxWidth = Math.max(
    0.1, // No negative max-width, which would actually not enforce any max width.
    (maxWidth || 320) -
    20 /* Close button */ -
    32 /* Icon */ -
      9 /* Extra margins */
  );

  return (
    <React.Fragment>
      <span
        id={id}
        style={{
          flexShrink: 0, // Tabs are never resized to fit in flex container
          position: 'relative',
          display: 'inline-block',
          marginRight: 2,
          // Leave some space when scrolled into view to let the user understand
          // that there are more tabs.
          scrollMarginRight: 20,
          scrollMarginLeft: 20,
          // Style:
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          borderTop: '1px solid black',
          borderRight: '1px solid black',
          borderLeft: '1px solid black',
          borderBottom: 'none',
          borderColor: active
            ? gdevelopTheme.closableTabs.selectedBorderColor
            : gdevelopTheme.closableTabs.backgroundColor,
          backgroundColor: !active
            ? gdevelopTheme.closableTabs.backgroundColor
            : gdevelopTheme.closableTabs.selectedBackgroundColor,
        }}
        // A tab lives in the top bar, which has the ability to drag the app window.
        // Ensure the tab does not have this ability, as it can be dragged itself.
        className={WINDOW_NON_DRAGGABLE_PART_CLASS_NAME}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <ButtonBase
          onClick={onClick}
          onAuxClick={closable ? closeOnMiddleClick : undefined}
          onContextMenu={openContextMenu}
          data-active={active ? 'true' : undefined}
          id={id ? `${id}-button` : undefined}
          {...dataObjectToProps(data)}
          {...longTouchForContextMenuProps}
          focusRipple
          // If the touch ripple is not disabled, the dragged preview will
          // use the size of the ripple and it will be too big.
          disableTouchRipple
        >
          <span
            style={{
              ...styles.tabLabelAndIcon,
              height: gdevelopTheme.closableTabs.height,
              color: textColor,
              fontFamily: gdevelopTheme.closableTabs.fontFamily,
            }}
          >
            {icon || renderCustomIcon ? (
              <span style={styles.tabIcon}>
                {renderCustomIcon ? renderCustomIcon(brightness) : icon}
              </span>
            ) : null}
            {label && (
              <span
                style={{
                  ...styles.tabLabel,
                  maxWidth: labelMaxWidth,
                }}
              >
                {label}
              </span>
            )}
          </span>
        </ButtonBase>
        {closable && (
          <ButtonBase
            onClick={onClose}
            onAuxClick={closeOnMiddleClick}
            onContextMenu={openContextMenu}
            {...longTouchForContextMenuProps}
            focusRipple
          >
            <Cross
              style={{
                ...styles.closeButton,
                width: gdevelopTheme.closableTabs.height / 2,
                height: gdevelopTheme.closableTabs.height,
              }}
              htmlColor={textColor}
            />
          </ButtonBase>
        )}
      </span>
      <ContextMenu
        ref={contextMenu}
        buildMenuTemplate={(i18n: I18nType) => [
          {
            label: i18n._(t`Close`),
            click: onClose,
            enabled: closable,
          },
          {
            label: i18n._(t`Close others`),
            click: onCloseOthers,
          },
          {
            label: i18n._(t`Close all`),
            click: onCloseAll,
          },
        ]}
      />
    </React.Fragment>
  );
}
