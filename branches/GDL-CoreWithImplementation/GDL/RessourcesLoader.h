/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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
 * \brief Class that is used by games to load resources from an Game Develop Executable ( DatFile ) or from an external file.
 *
 * \ingroup ResourcesManagement
 */
class GD_API RessourcesLoader
{
public:

    /**
     * Load a SFML image
     */
    sf::Texture * LoadSFMLTexture( const string & filename );

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
     * Get a buffer for file.
     * Be careful, the buffer will be invalided by any subsequent call to Load[Something]. Make
     * a copy of the buffer if you want it to stay alive longer.
     */
    char* LoadBinaryFile( const string & filename );

    /**
     * Get the size of a file
     */
    long int GetBinaryFileSize( const string & filename);

    /**
     * Check if a file is present inside resource file.
     * \return true if filename can be found inside resourcefile.
     */
    bool HasFile(const std::string & filename);

    /**
     * Set the name of the resource file to be open.
     * \return true if file was successfully opened.
     */
    bool SetResourceFile( const string & filename );

    static RessourcesLoader *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new RessourcesLoader;
        }

        return ( static_cast<RessourcesLoader*>( _singleton ) );
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
    RessourcesLoader() {};
    virtual ~RessourcesLoader() {};

    DatFile resFile; ///< Used to load data from a single resource file.

    static RessourcesLoader *_singleton;
};

#endif // RESSOURCESLOADER_H

