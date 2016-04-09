/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "GDCore/Project/ResourcesLoader.h"
#else
//Use a custom implementation at Runtime.

#ifndef RESSOURCESLOADER_H
#define RESSOURCESLOADER_H

#include "GDCpp/Runtime/DatFile.h"
class Music;
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <string>
#include "GDCpp/Runtime/String.h"
#undef LoadImage //Undef macro from windows.h

namespace gd
{

/**
 * \brief Class used by games to load resources from files or from a DatFile.
 * \note See GDCore documentation for the documentation of most functions.
 *
 * \ingroup ResourcesManagement
 */
class GD_API ResourcesLoader
{
public:

    /**
     * \brief Set the name of the resource file to be open.
     * \return true if file was successfully opened.
     */
    bool SetResourceFile( const gd::String & filename );

    sf::Texture LoadSFMLTexture( const gd::String & filename );

    std::pair<sf::Font *, char *> LoadFont( const gd::String & filename );

    sf::SoundBuffer LoadSoundBuffer( const gd::String & filename );

    gd::String LoadPlainText( const gd::String & filename );

    char* LoadBinaryFile( const gd::String & filename );

    long int GetBinaryFileSize( const gd::String & filename);

    bool HasFile(const gd::String & filename);

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

    DatFile resFile; ///< Used to load data from a single resource file.

    static ResourcesLoader *_singleton;
};

}

#endif // RESSOURCESLOADER_H

#endif
