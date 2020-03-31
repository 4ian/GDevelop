// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';

const styles = {
  container: {
    flex: 1,
  },
};

type Props = {|
  children: React.Node,
  /**
   * If true, scrollbar won't be shown if the content is not clipped.
   */
  autoHideScrollbar?: ?boolean,
  style?: ?Object,
|};

export type ScrollViewInterface = {|
  scrollTo: (target: ?React$Component<any, any>) => void,
|};

export default React.forwardRef<Props, ScrollViewInterface>(
  ({ children, autoHideScrollbar, style }: Props, ref) => {
    const scrollView = React.useRef((null: ?HTMLDivElement));
    React.useImperativeHandle(ref, () => ({
      /**
       * Scroll the view to the target component.
       */
      scrollTo: (target: ?React$Component<any, any>) => {
        const targetElement = ReactDOM.findDOMNode(target);
        if (targetElement instanceof HTMLElement) {
          const yPosition = targetElement.getBoundingClientRect().top;
          const scrollViewElement = scrollView.current;

          if (scrollViewElement) {
            const scrollViewYPosition = scrollViewElement.getBoundingClientRect()
              .top;
            scrollViewElement.scrollTop += yPosition - scrollViewYPosition;
          }
        } else {
          console.error(
            'Tried to scroll to something that is not a HTMLElement'
          );
        }
      },
    }));

    return (
      <div
        style={{
          ...styles.container,
          overflowY: autoHideScrollbar ? 'auto' : 'scroll',
          ...style,
        }}
        ref={scrollView}
      >
        {children}
      </div>
    );
  }
);
