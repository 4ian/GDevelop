// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import ReactDOM from 'react-dom';
import ContextMenu, { type ContextMenuInterface } from './ContextMenu';
import { type MenuItemTemplate } from './Menu.flow';

type Props = {|
  element: React$Element<any>,
  buildMenuTemplate: (i18n: I18nType) => Array<MenuItemTemplate>,
  openMenuWithSecondaryClick?: boolean,
  passExtraProps?: boolean,

  // Search "activate cloud projects" in the codebase for everything to
  // remove once cloud projects are activated for the desktop app.
  exceptionallyDontShowMenuAndFakeClickOnFirstElement?: boolean,
|};

type State = {||};

/**
 * Wrap an element and display a menu when `onClick` prop is called on the element.
 */

export default class ElementWithMenu extends React.Component<Props, State> {
  _contextMenu: ?ContextMenuInterface;
  _wrappedElement: ?any;

  open = () => {
    const { _contextMenu } = this;
    if (!_contextMenu) return;

    // Search "activate cloud projects" in the codebase for everything to
    // remove once cloud projects are activated for the desktop app.
    if (this.props.exceptionallyDontShowMenuAndFakeClickOnFirstElement) {
      const fakeI18n = { _: messageIdentifier => messageIdentifier.id };
      // $FlowFixMe - we pass a fake i18n object as we don't care about translations.
      const menuItemTemplates = this.props.buildMenuTemplate(fakeI18n);
      if (menuItemTemplates[0] && menuItemTemplates[0].click) {
        menuItemTemplates[0].click();
      }

      return;
    }

    const node = ReactDOM.findDOMNode(this._wrappedElement);
    if (node instanceof HTMLElement) {
      const dimensions = node.getBoundingClientRect();

      _contextMenu.open(
        Math.round(dimensions.left + dimensions.width / 2),
        Math.round(dimensions.top + dimensions.height)
      );
    }
  };

  render() {
    const {
      element,
      buildMenuTemplate,
      openMenuWithSecondaryClick,
      passExtraProps,
      ...otherProps
    } = this.props;

    return (
      <React.Fragment>
        {React.cloneElement(element, {
          onContextMenu: this.open,
          // $FlowFixMe - Flow complaining about using too much spread operators
          ...(openMenuWithSecondaryClick ? {} : { onClick: this.open }),
          ref: wrappedElement => (this._wrappedElement = wrappedElement),
          ...(passExtraProps ? otherProps : {}),
        })}
        <ContextMenu
          ref={contextMenu => (this._contextMenu = contextMenu)}
          buildMenuTemplate={buildMenuTemplate}
        />
      </React.Fragment>
    );
  }
}
