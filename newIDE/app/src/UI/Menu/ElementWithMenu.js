// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import ContextMenu from './ContextMenu';

type Props = {|
  element: React$Element<any>,
  onClick?: () => void,
  buildMenuTemplate?: () => Array<any>,
  buildMenuTemplateRight?: () => Array<any>,
|};

type State = {||};

/**
 * Wrap an element and display a menu when `onClick` prop is called on the element.
 */

export default class ElementWithMenu extends React.Component<Props, State> {
  _contextMenu: ?ContextMenu;
  _contextMenuR: ?ContextMenu;
  _wrappedElement: ?any;

  open = (element: any) => {
    if (!this.props.buildMenuTemplate) {
      this.props.element.props.onClick();
    } else {
      const { _contextMenu } = this;
      if (!_contextMenu) return;

      const node = ReactDOM.findDOMNode(this._wrappedElement);
      if (node instanceof HTMLElement) {
        const dimensions = node.getBoundingClientRect();

        _contextMenu.open(
          Math.round(dimensions.left + dimensions.width / 2),
          Math.round(dimensions.top + dimensions.height)
        );
      }
    }
  };

  openRight = () => {
    const { _contextMenuR } = this;
    if (!_contextMenuR) return;

    const node = ReactDOM.findDOMNode(this._wrappedElement);
    if (node instanceof HTMLElement) {
      const dimensions = node.getBoundingClientRect();

      _contextMenuR.open(
        Math.round(dimensions.left + dimensions.width / 2),
        Math.round(dimensions.top + dimensions.height)
      );
    }
  };

  render() {
    const { element, buildMenuTemplate, buildMenuTemplateRight } = this.props;

    return (
      <React.Fragment>
        {React.cloneElement(element, {
          onClick: this.open,
          onContextMenu: this.openRight,
          ref: wrappedElement => (this._wrappedElement = wrappedElement),
        })}
        {buildMenuTemplateRight && (
          <ContextMenu
            ref={contextMenuR => (this._contextMenuR = contextMenuR)}
            buildMenuTemplate={buildMenuTemplateRight}
          />
        )}
        {buildMenuTemplate && (
          <ContextMenu
            ref={contextMenu => (this._contextMenu = contextMenu)}
            buildMenuTemplate={buildMenuTemplate}
          />
        )}
      </React.Fragment>
    );
  }
}
