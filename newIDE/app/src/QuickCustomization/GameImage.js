// @flow
import * as React from 'react';

const styles = {
  image: {
    width: '100%',
    maxHeight: '325px',
    objectFit: 'contain',
    borderRadius: '16px',
    boxSizing: 'border-box',
    aspectRatio: 16 / 9,
  },
};

type Props = {|
  project: gdProject,
|};

const GameImage = ({ project }: Props) => {
  const rocketUrl = 'res/quick_customization/quick_publish.svg';

  const gameThumbnailUrl = React.useMemo(
    () => {
      const resourcesManager = project.getResourcesManager();
      const thumbnailName = project
        .getPlatformSpecificAssets()
        .get('liluo', `thumbnail`);
      if (!thumbnailName) return rocketUrl;
      const path = resourcesManager.getResource(thumbnailName).getFile();
      if (!path) return rocketUrl;

      return path;
    },
    [project]
  );

  return (
    <img
      alt="Customize your game with GDevelop"
      src={gameThumbnailUrl}
      style={styles.image}
    />
  );
};

export default GameImage;
