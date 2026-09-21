// @flow
import * as React from 'react';

type Props = {|
  /**
   * Called to render the children, once (and every time after) the component
   * became visible. This is a function and not a `React.Node` on purpose: an
   * element built by the parent would be captured when the parent rendered,
   * and mounted later - when this component becomes visible - with props that
   * are potentially outdated by then.
   */
  children: () => React.Node,
  placeholderHeight: number,
|};

const findScrollParent = (element: ?Element): ?Element => {
  let current = element ? element.parentElement : null;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
    current = current.parentElement;
  }
  return null;
};

/**
 * Renders a fixed-height placeholder until the component enters (or comes close to)
 * the visible part of the nearest scrollable parent, then mounts its children for good.
 * Useful to avoid paying the mounting cost of large lists of heavy items at once.
 *
 * `children` is a function, called when rendering the children: this guarantees
 * they are always built from up-to-date data, even though mounting them is
 * delayed until the component is visible.
 */
const MountOnFirstVisible = ({
  children,
  placeholderHeight,
}: Props): React.Node => {
  const [isVisible, setIsVisible] = React.useState(false);
  const placeholderRef = React.useRef<?HTMLDivElement>(null);

  React.useEffect(
    () => {
      if (isVisible) return;
      const element = placeholderRef.current;
      if (!element || typeof IntersectionObserver === 'undefined') {
        setIsVisible(true);
        return;
      }
      const observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting)) setIsVisible(true);
        },
        {
          root: findScrollParent(element),
          // Mount items a bit before they are scrolled into view.
          rootMargin: '400px 0px',
        }
      );
      observer.observe(element);
      return () => observer.disconnect();
    },
    [isVisible]
  );

  if (isVisible) return children();
  return <div ref={placeholderRef} style={{ height: placeholderHeight }} />;
};

export default MountOnFirstVisible;
