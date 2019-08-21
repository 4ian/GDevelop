// @flow
import ReactDOM from 'react-dom';
import FlatButton from './FlatButton';
import RaisedButton from './RaisedButton';

type Button = typeof RaisedButton | typeof FlatButton;

// If you're searching for button components,
// take a look at FlatButton or RaisedButton.

/**
 * Focus a button. This won't display the material-ui Ripple effect
 * but is still better than nothing.
 */
export const focusButton = (buttonRef: React.RefObject<Button>) => {
  if (buttonRef && buttonRef.current) {
    const element = ReactDOM.findDOMNode(buttonRef.current);
    if (element instanceof HTMLButtonElement) {
      element.focus();
    } else if (element instanceof HTMLElement) {
      const children = element.getElementsByTagName('button');
      if (
        children &&
        children.length &&
        children[0] instanceof HTMLButtonElement
      ) {
        children[0].focus();
      }
    }
  }
};
