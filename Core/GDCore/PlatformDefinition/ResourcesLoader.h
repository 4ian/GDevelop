/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef RESSOURCESLOADER_H
#define RESSOURCESLOADER_H
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include "GDCore/String.h"
#undef LoadImage //Undef macro from windows.h

namespace gd
{

/**
 * \brief Class used by games to load resources from files: this is purely an abstraction
 * to most SFML loadFrom* functions.
 *
 * This class is replaced in GDCpp by an equivalent that can load also from memory.
 *
 * \ingroup ResourcesManagement
 */
class GD_CORE_API ResourcesLoader
{
public:

    /**
     * Load a SFML texture.
     */
    sf::Texture LoadSFMLTexture( const gd::String & filename );

    /**
     * Load a SFML Font.
     * \warning The function calling LoadFont is the owner of the returned font and buffer (if any):
     * Don't forget to delete them after use.
     *
     * \return A pair containing the loaded font, or NULL if loading failed, and the buffer
     * that need to be kept alive while the font is used (can be NULL if the font was loaded
     * from a file).
     */
    std::pair<sf::Font *, char *> LoadFont( const gd::String & filename );

    /**
     * Load a SFML Sound Buffer
     */
    sf::SoundBuffer LoadSoundBuffer( const gd::String & filename );

    /**
     * Load a plain text file
     */
    gd::String LoadPlainText( const gd::String & filename );

    /**
     * Get a buffer for file.
     * Be careful, the buffer will be invalided by any subsequent call to Load[Something]. Make
     * a copy of the buffer if you want it to stay alive longer.
     */
    char* LoadBinaryFile( const gd::String & filename );

    /**
     * Get the size of a file
     */
    long int GetBinaryFileSize( const gd::String & filename);

    static ResourcesLoader *Get()
    {
        if ( NULL == _singleton )
        {
            _singleton = new ResourcesLoader;
        }

        return ( static_cast<ResourcesLoader*>( _singleton ) );
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
    ResourcesLoader() {};
    virtual ~ResourcesLoader() {};

    static ResourcesLoader *_singleton;
};


}
#endif // RESSOURCESLOADER_H
