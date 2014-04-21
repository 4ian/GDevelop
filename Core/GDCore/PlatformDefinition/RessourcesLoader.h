/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef RESSOURCESLOADER_H
#define RESSOURCESLOADER_H
class Music;
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#undef LoadImage //Undef macro from windows.h

namespace gd
{

/**
 * \brief Class that is used by games to load resources from an Game Develop Executable ( DatFile ) or from an external file.
 *
 * \todo Rename and refactor this class.
 * \ingroup ResourcesManagement
 */
class GD_CORE_API RessourcesLoader
{
public:

    /**
     * Load a SFML image
     */
    sf::Texture * LoadSFMLTexture( const std::string & filename );

    /**
     * Load a SFML Font
     */
    sf::Font * LoadFont( const std::string & filename );

    /**
     * Load a SFML Sound Buffer
     */
    sf::SoundBuffer LoadSoundBuffer( const std::string & filename );

    /**
     * Load a plain text file
     */
    std::string LoadPlainText( const std::string & filename );

    /**
     * Get a buffer for file.
     * Be careful, the buffer will be invalided by any subsequent call to Load[Something]. Make
     * a copy of the buffer if you want it to stay alive longer.
     */
    char* LoadBinaryFile( const std::string & filename );

    /**
     * Get the size of a file
     */
    long int GetBinaryFileSize( const std::string & filename);

    static RessourcesLoader *Get()
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

    static RessourcesLoader *_singleton;
};


}
#endif // RESSOURCESLOADER_H