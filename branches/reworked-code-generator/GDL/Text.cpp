/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Text.h"
#include "GDL/FontManager.h"
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>

using namespace std;

Text::Text() :
text("", *FontManager::GetInstance()->GetFont(""))
{
    //ctor
}

Text::~Text()
{
    //dtor
}

void Text::Draw(sf::RenderWindow& App)
{
    FontManager * fontManager = FontManager::GetInstance();

    text.SetFont(*fontManager->GetFont(fontName));
    App.Draw( text );
}
