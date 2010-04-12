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
    if (fontName == "") return &sf::Font::GetDefaultFont();

    if ( fonts.find(fontName) != fonts.end() )
    {
        return fonts[fontName];
    }

    //Chargement de la police
    RessourcesLoader * ressourcesLoader = RessourcesLoader::getInstance();
    fonts[fontName] = ressourcesLoader->LoadFont(fontName);

    return fonts[fontName];
}
