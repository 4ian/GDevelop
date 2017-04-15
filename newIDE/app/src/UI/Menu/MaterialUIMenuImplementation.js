import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

export default class MaterialUIMenuImplementation {
  buildFromTemplate(template) {
    return template.map(item => {
      if (item.type === 'separator') {
        return <Divider />;
      }

      return (
        <MenuItem
          key={item.label}
          primaryText={item.label}
          onTouchTap={() => item.click()}
        />
      );
    });
  }

  showMenu() {
    // Automatically done by IconMenu
  }

  getMenuProps() {
    return {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
    };
  }
}
