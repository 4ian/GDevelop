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

type Props = {|
  exampleShortHeader: ExampleShortHeader,
  size: number,
|};

export const ExampleIcon = ({ exampleShortHeader, size }: Props) => {
  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, height: size }}
        src={
          exampleShortHeader.previewImageUrls.find(url =>
            url.endsWith('thumbnail.png')
          ) || exampleShortHeader.previewImageUrls[0]
        }
        alt={exampleShortHeader.name}
      />
    </div>
  );
};
