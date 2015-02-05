/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef FONTMANAGER_H
#define FONTMANAGER_H
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

/**
 * \brief FontManager loads and manages SFML fonts.
 *
 * \ingroup ResourcesManagement
 */
class GD_API FontManager
{
public:

    /**
     * \brief Return a pointer to an SFML font.
     *
     * The font is stored in the font manager.
     *
     * Example :
     * \code
     * sfmlText.SetFont(*fontManager->GetFont(fontName));
     * \endcode
     */
    const sf::Font * GetFont(const std::string & fontName);

    /**
     * \brief Unload all fonts from memory
     */
    void UnloadAllFonts();

    /**
     * \brief Return a pointer to the global singleton class
     */
    static FontManager *Get()
    {
        if ( NULL == _singleton )
        {
            _singleton = new FontManager;
        }

        return ( static_cast<FontManager*>( _singleton ) );
    }

    /**
     * \brief Destroy the global singleton class.
     */
    static void DestroySingleton();

private:

    void EnsureDefaultFontIsLoaded();

    std::map < std::string, sf::Font* > fonts; ///< The font being loaded.
    std::map < std::string, char* > fontsBuffer; ///< The buffer associated to each font, if any.
    sf::Font * defaultFont; ///< The default font used when no font is specified. Initialized at first use.

    FontManager() : defaultFont(NULL) {};
    virtual ~FontManager();

    static FontManager *_singleton;

};

#endif // FONTMANAGER_H
