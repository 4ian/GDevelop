#include "GDCpp/FontManager.h"
#include "GDCpp/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include <iostream>

using namespace std;

FontManager *FontManager::_singleton = NULL;

FontManager::~FontManager()
{
    UnloadAllFonts();
}

void FontManager::UnloadAllFonts()
{
    //Need to explicit delete fonts
    for ( map<string, sf::Font*>::iterator it=fonts.begin() ; it != fonts.end(); ++it )
        delete (*it).second;

    fonts.clear();
    if ( defaultFont ) delete defaultFont;
    defaultFont = NULL;
}

void FontManager::EnsureDefaultFontIsLoaded()
{
    if ( !defaultFont )
    {
        static const char data[] =
        {
            #include "GDCpp/Arial.hpp"
        };

        defaultFont = new sf::Font;
        if ( !defaultFont->loadFromMemory(data, sizeof(data)) )
            std::cout << "ERROR: Failed to load the default font!" << std::endl;
    }
}

const sf::Font * FontManager::GetFont(const string & fontName)
{
    //Use default font if no font is specified
    if (fontName.empty())
    {
        EnsureDefaultFontIsLoaded();
        return defaultFont;
    }

    //Find an already loaded font
    if ( fonts.find(fontName) != fonts.end() )
        return fonts[fontName];

    //Load an new font
    gd::RessourcesLoader * ressourcesLoader = gd::RessourcesLoader::GetInstance();
    sf::Font * font = ressourcesLoader->LoadFont(fontName);
    if ( font )
    {
        fonts[fontName] = font;
        return font;
    }

    //Loading failed: Fall back to the default font.
    EnsureDefaultFontIsLoaded();
    return defaultFont;
}

void FontManager::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}