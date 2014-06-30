/**
This code is re-adapted from SFMLTheora distributed under zlib licence.
*/

#ifndef _SFMLAUDIOINTERFACE_H_
#define _SFMLAUDIOINTERFACE_H_

#include <vector>
#include <SFML/System.hpp>
#include <SFML/Audio.hpp>
#include <TheoraAudioInterface.h>
#include <TheoraVideoClip.h>
#include <TheoraTimer.h>

#define SFMLT_AI_MAXBUFFERSIZE 4096


class VideoAudioInterface;
class VideoAudioInterfaceFactory;
class VideoWrapper;


///////////////////////////////////////////////////////////
//Audio Interface class                                  //
///////////////////////////////////////////////////////////
class VideoAudioInterface :
  public TheoraAudioInterface, TheoraTimer, sf::SoundStream
{
public:
  VideoAudioInterface(TheoraVideoClip* owner, int nChannels, int freq);

  void insertData(float** data, int nSamples);
  void destroy   ();
  void play      ();
  void pause     ();
  void stop      ();
  void seek      (float time);


private:
  friend class Video;

  bool OnGetData(sf::SoundStream::Chunk& data);
  void OnSeek   (sf::Uint32 timeOffset);

  sf::Mutex dataMutex_;

  int nChannels_;
  int freq_;

  unsigned int read_;

  std::vector<sf::Int16> data_;
};


///////////////////////////////////////////////////////////
//Audio Interface Factory class                          //
///////////////////////////////////////////////////////////
class VideoAudioInterfaceFactory : public TheoraAudioInterfaceFactory
{
public:
  VideoAudioInterfaceFactory();

  ~VideoAudioInterfaceFactory();

	VideoAudioInterface* createInstance(TheoraVideoClip* owner,
                                             int nChannels, int freq);
private:
  friend class VideoWrapper;

  VideoAudioInterface* audioInterface_;
};



#endif //_SFMLAUDIOINTERFACE_H_







