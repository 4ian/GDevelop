// @flow
import * as React from 'react';
import { CorsAwareImage } from './CorsAwareImage';

const styles = {
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  icon: {
    background: 'linear-gradient(45deg, #FFFFFF33, #FFFFFF)',
    borderRadius: 4,
  },
};

type Props = {|
  src: string,
  alt: string,
  size: number,
|};

/**
 * Display the specified icon with a background so that it's suitable
 * for display anywhere with a consistent style.
 */
export const IconContainer = ({ src, alt, size }: Props) => {
  const padding = size > 24 ? 4 : 2;
  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{
          ...styles.icon,
          padding,
          width: size - 2 * padding,
          height: size - 2 * padding,
        }}
        src={src}
        alt={alt}
      />
    </div>
  );
};
