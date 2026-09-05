// @flow
import * as React from 'react';

const styles = {
  container: {
    display: 'contents',
    // The `fade-in` keyframes are global (see Theme/Global/Animation.css).
    animation: 'fade-in 150ms ease-in',
  },
};

type Props = {|
  children: React.Node,
|};

/**
 * Quickly fade in its children when they are mounted: for an element
 * appearing in an existing layout (like a button shown in a toolbar) to
 * appear smoothly rather than popping in.
 */
const FadeIn = ({ children }: Props): React.Node => (
  <div style={styles.container}>{children}</div>
);

export default FadeIn;
