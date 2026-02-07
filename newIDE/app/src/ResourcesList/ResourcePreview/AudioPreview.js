// @flow
import * as React from 'react';
import SoundPlayer from '../../UI/SoundPlayer';
import GenericIconPreview from './GenericIconPreview';
import Music from '../../UI/CustomSvgIcons/Music';

type Props = {|
  resourceName: string,
  audioResourceSource: string,
|};

const AudioPreview = ({ resourceName, audioResourceSource }: Props) => {
  const [hasError, setHasError] = React.useState(false);

  const onSoundLoaded = React.useCallback(() => {
    setHasError(false);
  }, []);

  const onSoundError = React.useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return <GenericIconPreview renderIcon={props => <Music {...props} />} />;
  }

  return (
    <SoundPlayer
      soundSrc={audioResourceSource || null}
      onSoundLoaded={onSoundLoaded}
      onSoundError={onSoundError}
      title={resourceName}
      subtitle={null}
    />
  );
};

export default AudioPreview;
