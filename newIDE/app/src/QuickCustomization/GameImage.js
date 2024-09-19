// @flow
import * as React from 'react';
import classes from './GameImage.module.css';
import classNames from 'classnames';

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
      className={classNames({
        [classes.illustrationImage]: true,
      })}
    />
  );
};

export default GameImage;
