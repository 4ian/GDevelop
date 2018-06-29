import React, { Component } from 'react';
import { Tabs as MaterialUITabs, Tab as MaterialUITab } from 'material-ui/Tabs';
import Close from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  tabsContainerStyle: {
    maxWidth: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabTemplateStyle: {
    height: '100%',
  },
};

export class ThemableTabs extends Component {
  render() {
    const { muiTheme, hideLabels, ...tabsProps } = this.props;
    const tabItemContainerStyle = {
      maxWidth: '100%', // Tabs should take all width
      flexShrink: 0, // Tabs height should never be reduced
      overflowX: 'auto',
      display: hideLabels ? 'none' : 'block',
      backgroundColor: muiTheme.closableTabs.backgroundColor,
    };

    const contentContainerStyle = {
      overflowY: 'hidden',
      height: hideLabels
        ? '100%'
        : `calc(100% - ${muiTheme.closableTabs.height}px)`,
    };

    return (
      <MaterialUITabs
        style={styles.tabsContainerStyle}
        tabTemplateStyle={styles.tabTemplateStyle}
        contentContainerStyle={contentContainerStyle}
        tabItemContainerStyle={tabItemContainerStyle}
        inkBarStyle={{ display: 'none' }}
        {...tabsProps}
      />
    );
  }
}

export const Tabs = muiThemeable()(ThemableTabs);
Tabs.muiName = 'Tabs';

class ThemableTab extends Component {
  static muiName = 'Tab';

  render() {
    const {
      muiTheme,
      selected,
      onClose,
      label,
      closable,
      ...tabProps
    } = this.props;

    const truncatedLabel = (
      <span
        style={{
          width:
            muiTheme.closableTabs.width -
            muiTheme.closableTabs.closeButtonWidth * 1.5,
          marginRight: muiTheme.closableTabs.closeButtonWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    );

    return (
      <span
        style={{
          position: 'relative',
          width: muiTheme.closableTabs.width,
          display: 'inline-block',
        }}
      >
        <MaterialUITab
          {...tabProps}
          label={truncatedLabel}
          selected={selected}
          buttonStyle={{
            height: muiTheme.closableTabs.height,
            backgroundColor: selected
              ? muiTheme.closableTabs.selectedBackgroundColor
              : muiTheme.closableTabs.backgroundColor,
            color: selected
              ? muiTheme.closableTabs.selectedTextColor
              : muiTheme.closableTabs.textColor,
          }}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
        {closable && (
          <FlatButton
            backgroundColor="transparent"
            hoverColor={muiTheme.selectedBackgroundColor}
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 0,
              width: muiTheme.closableTabs.closeButtonWidth,
              minWidth: muiTheme.closableTabs.closeButtonWidth,
            }}
            icon={
              <Close
                color={
                  selected
                    ? muiTheme.closableTabs.selectedTextColor
                    : muiTheme.closableTabs.textColor
                }
                style={{
                  width: muiTheme.closableTabs.height / 2,
                  height: muiTheme.closableTabs.height / 2,
                }}
              />
            }
          />
        )}
      </span>
    );
  }
}

export const Tab = muiThemeable()(ThemableTab);
Tab.muiName = 'Tab';
