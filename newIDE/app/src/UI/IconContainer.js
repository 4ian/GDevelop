// @flow
import * as React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import ObjectTypeIcon from './ObjectTypeIcon';
import { isObjectTypeIcon } from '../ObjectsRendering/ObjectTypeIcons';

export const iconWithBackgroundStyle = {
  background: 'linear-gradient(45deg, #FFFFFF33, #FFFFFF)',
  borderRadius: 4,
};

const styles = {
  iconBackground: {
    display: 'inline',
    textAlign: 'center',
  },
  icon: iconWithBackgroundStyle,
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
export const IconContainer = ({
  src,
  alt,
  size,
}: Props): React.MixedElement => {
  if (isObjectTypeIcon(src)) {
    // Object type icons are designed for both themes: no background needed.
    return (
      <span style={styles.iconBackground}>
        <ObjectTypeIcon src={src} width={size} height={size} title={alt} />
      </span>
    );
  }

  const padding = size > 24 ? 4 : 2;
  return (
    <span style={styles.iconBackground}>
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
    </span>
  );
};
