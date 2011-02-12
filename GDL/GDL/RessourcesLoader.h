/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RESSOURCESLOADER_H
#define RESSOURCESLOADER_H

#include "GDL/DatFile.h"
class Music;
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#undef LoadImage //Undef macro from windows.h

/**
 * Class that is used by games to load ressources
 * from an Game Develop Executable or from an external file.
 */
class GD_API RessourcesLoader
{
public:

    /**
     * Load a SFML image
     */
    sf::Image * LoadImage( const string & filename );

    /**
     * Load a SFML Font
     */
    sf::Font * LoadFont( const string & filename );

    /**
     * Load a GD Music
     * The caller have to manage the pointer.
     */
    Music * LoadMusic( const string & filename );

    /**
     * Load a SFML Sound Buffer
     */
    sf::SoundBuffer LoadSoundBuffer( const string & filename );

    /**
     * Load a plain text file
     */
    std::string LoadPlainText( const string & filename );

    /**
     * Load a binary text file
     */
    char* LoadBinaryFile( const string & filename );
    int GetBinaryFileSize( const string & filename);

    /**
     * Set the name of the Game Develop Executable to be open
     */
    void SetExeGD( const string & filename );

    static RessourcesLoader *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new RessourcesLoader;
        }

        return ( static_cast<RessourcesLoader*>( _singleton ) );
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
    RessourcesLoader() {};
    virtual ~RessourcesLoader() {};

    DatFile ExeGD; ///< Used to load data from an Executable Game Develop.

    static RessourcesLoader *_singleton;
};

#endif // RESSOURCESLOADER_H
