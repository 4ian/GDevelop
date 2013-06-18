#include "GDL/FontManager.h"
#include "GDL/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

using namespace std;

FontManager *FontManager::_singleton = NULL;

FontManager::~FontManager()
{
    UnloadAllFonts();
}

void FontManager::UnloadAllFonts()
{
    //TODO: Delete defaultFont to avoid ati crash !
    //Need to explicit delete fonts
    for ( map<string, sf::Font*>::iterator it=fonts.begin() ; it != fonts.end(); ++it )
        delete (*it).second;

    fonts.clear();
}

const sf::Font * FontManager::GetFont(const string & fontName)
{
    //Use default font if no font is specified
    if (fontName.empty())
    {
        static sf::Font defaultFont;
        static bool loaded = false;

        if ( !loaded )
        {
            static const char data[] =
            {
                #include "GDL/Arial.hpp"
            };

            defaultFont.loadFromMemory(data, sizeof(data));
            loaded = true;
        }

        return &defaultFont;
    }

    //Find an already loaded font
    if ( fonts.find(fontName) != fonts.end() )
        return fonts[fontName];

    //Load an new font
    gd::RessourcesLoader * ressourcesLoader = gd::RessourcesLoader::GetInstance();
    fonts[fontName] = ressourcesLoader->LoadFont(fontName);

    return fonts[fontName];
}

void FontManager::DestroySingleton()
{
    if ( NULL != _singleton )
    {
        delete _singleton;
        _singleton = NULL;
    }
}

