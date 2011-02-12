#include "GDL/FontManager.h"
#include "GDL/RessourcesLoader.h"
#include <SFML/Graphics.hpp>
#include <iostream>
#include <string>
#include <vector>

using namespace std;


FontManager *FontManager::_singleton = NULL;

FontManager::FontManager()
{
    //ctor
}

FontManager::~FontManager()
{
    //Need to explicit delete fonts
    for ( map<string, sf::Font*>::iterator it=fonts.begin() ; it != fonts.end(); ++it )
        delete (*it).second;
}


////////////////////////////////////////////////////////////
/// Renvoie la police souhaitée, après l'avoir chargée si besoin
////////////////////////////////////////////////////////////
const sf::Font * FontManager::GetFont(string fontName)
{
    //Use default font
    if (fontName == "")
    {
        static sf::Font defaultFont;
        static bool loaded = false;

        if ( !loaded )
        {
            static const char data[] =
            {
                #include "GDL/Arial.hpp"
            };

            defaultFont.LoadFromMemory(data, sizeof(data));
            loaded = true;
        }

        return &defaultFont;
    }

    //Find an already loaded font
    if ( fonts.find(fontName) != fonts.end() )
        return fonts[fontName];

    //Load an new font
    RessourcesLoader * ressourcesLoader = RessourcesLoader::GetInstance();
    fonts[fontName] = ressourcesLoader->LoadFont(fontName);

    return fonts[fontName];
}
