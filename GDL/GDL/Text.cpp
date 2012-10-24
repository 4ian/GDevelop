/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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

    text.setFont(*fontManager->GetFont(fontName));
    App.draw( text );
}

