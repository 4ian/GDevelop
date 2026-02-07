// @flow
import * as React from 'react';
import SoundPlayer, { type SoundPlayerInterface } from '../../UI/SoundPlayer';
import Paper from '../../UI/Paper';
import GenericIconPreview from './GenericIconPreview';
import Music from '../../UI/CustomSvgIcons/Music';

type Props = {|
  resourceName: string,
  audioResourceSource: string,
|};

const AudioPreview = ({ resourceName, audioResourceSource }: Props) => {
  const soundPlayerRef = React.useRef<?SoundPlayerInterface>(null);
  const [hasError, setHasError] = React.useState(false);

  const onSoundLoaded = React.useCallback(() => {
    // Sound loaded callback
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
      ref={soundPlayerRef}
      soundSrc={audioResourceSource || null}
      onSoundLoaded={onSoundLoaded}
      onSoundError={onSoundError}
      title={resourceName}
      subtitle={null}
    />
  );
};

export default AudioPreview;
