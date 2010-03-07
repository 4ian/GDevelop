/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SOUNDMANAGER_H
#define SOUNDMANAGER_H

#include <SFML/Audio.hpp>
#include "GDL/constantes.h"
#include "GDL/Son.h"
#include "GDL/Music.h"
#include <string>
#include <vector>

using namespace std;

/**
 * Manage the sound played by the game
 */
class GD_API SoundManager
{
public:
    vector < Music * >  musics;
    vector < Son * >    sounds;

    Music * GetMusicOnChannel(int channel);
    void SetMusicOnChannel(int channel, Music * music);
    Son * GetSoundOnChannel(int channel);
    void SetSoundOnChannel(int channel, Son * son);

    inline float GetGlobalVolume() const { return globalVolume; }
    void SetGlobalVolume(float volume);

    static SoundManager *getInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new SoundManager;
        }

        return ( static_cast<SoundManager*>( _singleton ) );
    }

    static void kill()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:

    vector < Son *>    soundsChannel;
    vector < Music *>  musicsChannel;

    float globalVolume;

    SoundManager();
    ~SoundManager();

    static SoundManager *_singleton;
};


#endif // SOUNDMANAGER_H
