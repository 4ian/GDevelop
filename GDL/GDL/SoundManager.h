/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  SoundManager : Classe unique qui gère les sons et musiques
 *  Les sons et musiques sur canaux peuvent être accédées avec
 *  les fonctions membres faites pour.
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
