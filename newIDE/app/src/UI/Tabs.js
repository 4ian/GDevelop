import React, { Component } from 'react';
import { Tabs as MaterialUITabs, Tab as MaterialUITab } from 'material-ui/Tabs';

export class Tabs extends Component {
  render() {
    return (
      <MaterialUITabs
        style={{
          flex: 1,
        }}
        tabTemplateStyle={{
          height: '100%',
        }}
        contentContainerStyle={{
          overflowY: 'hidden',
          height: '100%',
        }}
        {...this.props}
      />
    );
  }
}

export class Tab extends MaterialUITab {
  render() {
    return (
      <MaterialUITab
        style={{ height: '100%' }}
        buttonStyle={{ height: '32px' }}
        {...this.props}
      />
    );
  }
}
