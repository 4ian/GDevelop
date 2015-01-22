/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Text.h"
#include "GDCpp/FontManager.h"
#include <iostream>
#include <SFML/Graphics.hpp>
#include <string>

using namespace std;

Text::Text() :
text("", *FontManager::Get()->GetFont(""))
{
    //ctor
}

Text::~Text()
{
    //dtor
}

void Text::Draw(sf::RenderWindow& App)
{
    FontManager * fontManager = FontManager::Get();

    text.setFont(*fontManager->GetFont(fontName));
    App.draw( text );
}
