#include "GDL/Text.h"
#include "GDL/FontManager.h"
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>

using namespace std;

Text::Text() :
text("", *FontManager::getInstance()->GetFont(""))
{
    //ctor
}

Text::~Text()
{
    //dtor
}

void Text::Draw(sf::RenderWindow& App)
{
    FontManager * fontManager = FontManager::getInstance();

    text.SetFont(*fontManager->GetFont(fontName));
    App.Draw( text );
}
