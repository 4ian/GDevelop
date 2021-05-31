// @flow
import * as React from 'react';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
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
  extensionShortHeader: ExtensionShortHeader,
  size: number,
|};

export const ExtensionIcon = ({
  extensionShortHeader,
  size,
}: Props): React.Element<'div'> => {
  return (
    <div style={styles.iconBackground}>
      <CorsAwareImage
        style={{ ...styles.icon, width: size, height: size }}
        src={extensionShortHeader.previewIconUrl}
        alt={extensionShortHeader.fullName}
      />
    </div>
  );
};
