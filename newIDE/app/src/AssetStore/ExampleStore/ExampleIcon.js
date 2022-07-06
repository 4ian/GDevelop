// @flow
import * as React from 'react';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { CorsAwareImage } from '../../UI/CorsAwareImage';

const styles = {
  iconBackground: {
    flex: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  icon: {
    background: 'linear-gradient(45deg, #FFFFFF33, #FFFFFF)',
    padding: 4,
    borderRadius: 4,
  },
};

const ICON_SIZES = {
  preview: 120,
  thumbnail: 40,
};

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  type: 'thumbnail' | 'preview',
|};

export const ExampleIcon = ({ exampleShortHeader, type }: Props) => {
  const size = type === 'thumbnail' ? ICON_SIZES.thumbnail : ICON_SIZES.preview;
  let iconUrl = exampleShortHeader.previewImageUrls[0];
  if (type === 'thumbnail') {
    const thumbnailUrl = exampleShortHeader.previewImageUrls.find(url =>
      url.endsWith('thumbnail.png')
    );
    if (thumbnailUrl) iconUrl = thumbnailUrl;
  }
  if (type === 'preview') {
    const previewUrl = exampleShortHeader.previewImageUrls.find(url =>
      url.endsWith('preview.png')
    );
    if (previewUrl) iconUrl = previewUrl;
  }
  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, height: size }}
        src={iconUrl}
        alt={exampleShortHeader.name}
      />
    </div>
  );
};
