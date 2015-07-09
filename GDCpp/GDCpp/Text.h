/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef TEXT_H
#define TEXT_H
#include <SFML/Graphics.hpp>
#include "GDCpp/String.h"

/**
 * \brief Old class for drawing objects.
 *
 * \deprecated Do not use this anymore, but the TextObject extension instead.
 * \todo Delete me in a few months.
 */
class GD_API Text
{
public:
    /** Default constructor */
    Text();
    /** Default destructor */
    virtual ~Text();

    sf::Text text;
    gd::String fontName;
    gd::String layer;

    void Draw(sf::RenderWindow& main_window);

protected:
private:
};

#endif // TEXT_H
