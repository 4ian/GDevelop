// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import ContextMenu, { type ContextMenuInterface } from './Menu/ContextMenu';
import { useLongTouch } from '../Utils/UseLongTouch';
import { Spacer } from './Grid';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { dataObjectToProps, type HTMLDataset } from '../Utils/HTMLDataset';
import Cross from './CustomSvgIcons/Cross';

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
    maxWidth: 360,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '15px', // Same as in Mosaic.css (for mosaic-window-title)
  },
  tabLabelAndIcon: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  closeButton: {
    marginRight: 5,
    marginLeft: 5,
  },
};

type TabContentContainerProps = {|
  active: boolean,
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
        }}
      >
        {children}
      </div>
    );
  }
}

type ClosableTabsProps = {|
  hideLabels?: boolean,
  children: React.Node,
|};

export const ClosableTabs = ({ hideLabels, children }: ClosableTabsProps) => {
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const tabItemContainerStyle = {
    maxWidth: '100%', // Tabs should take all width
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

  return (
    <div
      ref={containerRef}
      className="almost-invisible-scrollbar"
      style={tabItemContainerStyle}
      onWheel={onScroll}
    >
      {children}
    </div>
  );
};

export type ClosableTabProps = {|
  id?: string,
  data?: HTMLDataset,
  active: boolean,
  label: ?React.Node,
  icon: ?React.Node,
  closable: boolean,
  onClose: () => void,
  onCloseOthers: () => void,
  onCloseAll: () => void,
  onClick: () => void,
  onActivated: () => void,
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
  closable,
  onClick,
  onActivated,
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
  const textColor = !active
    ? gdevelopTheme.closableTabs.textColor
    : gdevelopTheme.closableTabs.selectedTextColor;

  return (
    <React.Fragment>
      <span
        id={id}
        style={{
          flexShrink: 0, // Tabs are never resized to fit in flex container
          position: 'relative',
          display: 'inline-block',
          marginRight: 2,
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
            {icon}
            {icon && label ? <Spacer /> : null}
            {label && <span style={styles.tabLabel}>{label}</span>}
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
