import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

export default class MaterialUIMenuImplementation {
  buildFromTemplate(template) {
    return template.map((item, id) => {
      if (item.type === 'separator') {
        return <Divider key={'separator' + id} />;
      }

      return (
        <MenuItem
          key={item.label}
          primaryText={item.label}
          disabled={item.enabled === false}
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
