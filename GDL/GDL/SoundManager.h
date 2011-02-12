/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
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
 * \brief Manage sounds and musics played by games.
 */
class GD_API SoundManager
{
public:
    vector < Music * >  musics;
    vector < Son * >    sounds;

    /**
     * Return pointer to a music on a channel
     */
    Music * GetMusicOnChannel(int channel);

    /**
     * Change music on a channel. Automatically destroy the old music.
     */
    void SetMusicOnChannel(int channel, Music * music);

    /**
     * Return pointer to a sound on a channel
     */
    Son * GetSoundOnChannel(int channel);

    /**
     * Change sound on a channel. Automatically destroy the old sound.
     */
    void SetSoundOnChannel(int channel, Son * son);

    /**
     * Get global game sound volume.
     * Example :
     * \code
     * float currentVolume = SoundManager::GetInstance()->GetGlobalVolume();
     * \endcode
     */
    inline float GetGlobalVolume() const { return globalVolume; }

    /**
     * Change global game sound volume.
     * Example :
     * \code
     * SoundManager::GetInstance()->SetGlobalVolume(50);
     * \endcode
     */
    void SetGlobalVolume(float volume);

    static SoundManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new SoundManager;
        }

        return ( static_cast<SoundManager*>( _singleton ) );
    }

    static void DestroySingleton()
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
