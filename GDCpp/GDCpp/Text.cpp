/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCpp/Text.h"
#include "GDCpp/FontManager.h"
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