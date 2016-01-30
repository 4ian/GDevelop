#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/ResourcesLoader.h"
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
    //Need to explicit delete fonts...
    for ( map<gd::String, sf::Font*>::iterator it=fonts.begin() ; it != fonts.end(); ++it )
    {
        if ((*it).second) delete (*it).second;
    }
    //...and their buffers
    for ( map<gd::String, char*>::iterator it=fontsBuffer.begin() ; it != fontsBuffer.end(); ++it )
    {
        if ((*it).second) delete (*it).second;
    }

    fonts.clear();
    fontsBuffer.clear();
    if ( defaultFont ) delete defaultFont;
    defaultFont = NULL;
}

void FontManager::EnsureDefaultFontIsLoaded()
{
    if ( !defaultFont )
    {
        static const unsigned char data[] =
        {
            #include "GDCpp/Runtime/Liberation.hpp"
        };

        defaultFont = new sf::Font;
        if ( !defaultFont->loadFromMemory(data, sizeof(data)) )
            std::cout << "ERROR: Failed to load the default font!" << std::endl;
        else
            std::cout << "Loaded default font" << std::endl;
    }
}

const sf::Font * FontManager::GetFont(const gd::String & fontName)
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
    gd::ResourcesLoader * ressourcesLoader = gd::ResourcesLoader::Get();
    std::pair<sf::Font *, char*> font = ressourcesLoader->LoadFont(fontName);
    if (font.first)
    {
        if (font.second) //Store the buffer if any.
            fontsBuffer[fontName] = font.second;

        fonts[fontName] = font.first;
        return font.first;
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
