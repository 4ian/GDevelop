import React, { Component } from 'react';
import { Tabs as MaterialUITabs, Tab as MaterialUITab } from 'material-ui/Tabs';
import Close from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import muiThemeable from 'material-ui/styles/muiThemeable';

export class Tabs extends Component {
  render() {
    const { hideLabels, ...tabsProps } = this.props;
    const tabItemContainerStyle = {
      maxWidth: '100%',
      overflowX: 'auto',
      display: hideLabels ? 'none' : 'block',
    };

    return (
      <MaterialUITabs
        style={{
          maxWidth: '100%',
          flex: 1,
        }}
        tabTemplateStyle={{
          height: '100%',
        }}
        contentContainerStyle={{
          overflowY: 'hidden',
          height: '100%',
        }}
        tabItemContainerStyle={tabItemContainerStyle}
        inkBarStyle={{ display: 'none' }}
        {...tabsProps}
      />
    );
  }
}

class ThemableTab extends Component {
  static muiName = 'Tab';

  render() {
    const {muiTheme, selected, onClose, ...tabProps} = this.props;

    return (
      <span
        style={{
          position: 'relative',
          width: this.props.muiTheme.tabs.width,
          display: 'inline-block',
        }}
      >
        <MaterialUITab
          {...tabProps}
          selected={selected}
          buttonStyle={{
            height: muiTheme.tabs.height,
            backgroundColor: selected
              ? muiTheme.tabs.selectedBackgroundColor
              : undefined,
          }}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
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
            width: '24px',
            minWidth: '24px',
          }}
          icon={
            <Close
              color="white"
              style={{
                width: muiTheme.tabs.height / 2,
                height: muiTheme.tabs.height / 2,
              }}
            />
          }
        />
      </span>
    );
  }
}

export const Tab = muiThemeable()(ThemableTab);
Tab.muiName = 'Tab';
