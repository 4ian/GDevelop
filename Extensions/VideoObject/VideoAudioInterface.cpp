/**
This code is re-adapted from SFMLTheora distributed under zlib licence.
*/

#include "VideoAudioInterface.h"

VideoAudioInterface::VideoAudioInterface
  (TheoraVideoClip* owner, int nChannels, int freq) :
	  TheoraAudioInterface(owner, nChannels, freq), TheoraTimer()
{
  nChannels_ = nChannels;
  freq_      = freq;

  read_ = 0;

  Initialize(nChannels_, freq_);
}


void VideoAudioInterface::insertData(float** data, int nSamples)
{
  sf::Lock lock(dataMutex_);

  for (int i = 0; i < nSamples; ++i) {
    for (int j = 0; j < nChannels_; ++j) {
      float fSample = data[j][i];
      fSample = fSample < -1.0f ? -1.0f : fSample;
      fSample = fSample >  1.0f ?  1.0f : fSample;
      sf::Int16 iSample = static_cast<sf::Int16>(fSample * 32767);

      data_.push_back(iSample);
    }
  }

  if (GetStatus() != sf::SoundStream::Playing)
    Play();
}

void VideoAudioInterface::destroy()
{
  data_.clear();
  read_ = 0;
}

void VideoAudioInterface::play()
{
  Play();
}

void VideoAudioInterface::pause()
{
  Pause();
}

void VideoAudioInterface::stop()
{
  Stop();
}

void VideoAudioInterface::seek(float time)
{
  Stop();

  mTime = time;

  data_.clear();
  read_ = 0;

  Play();
}


bool VideoAudioInterface::OnGetData(sf::SoundStream::Chunk& data)
{
  sf::Lock lock(dataMutex_);

  if (data_.size() == 0)
    return false;

  if (read_ > 0)
    data_.erase(data_.begin(), data_.begin() + read_);

  read_ = data_.size();
  read_ = read_ > SFMLT_AI_MAXBUFFERSIZE ? SFMLT_AI_MAXBUFFERSIZE : read_;

  if (read_ == 0)
    return false;

  data.Samples   = &data_[0];
  data.NbSamples = read_;

  return true;
}

void VideoAudioInterface::OnSeek(sf::Uint32 timeOffset)
{
}


///////////////////////////////////////////////////////////
//Audio Interface Factory class                          //
///////////////////////////////////////////////////////////
VideoAudioInterfaceFactory::VideoAudioInterfaceFactory()
{
  audioInterface_ = NULL;
}


VideoAudioInterfaceFactory::~VideoAudioInterfaceFactory()
{
  if (audioInterface_ != NULL) {
    delete audioInterface_;
    audioInterface_ = NULL;
  }
}


VideoAudioInterface*
  VideoAudioInterfaceFactory::createInstance(TheoraVideoClip* owner,
                                                    int nChannels, int freq)
{
  if (audioInterface_ != NULL) {
    delete audioInterface_;
    audioInterface_ = NULL;
  }

  audioInterface_ = new VideoAudioInterface(owner, nChannels, freq);

  return audioInterface_;
}








