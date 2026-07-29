// @flow
import * as React from 'react';

type Props = {|
  children: React.Node,
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

  if (isVisible) return children;
  return <div ref={placeholderRef} style={{ height: placeholderHeight }} />;
};

export default MountOnFirstVisible;
