/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#include <wx/colour.h>

/**
 * Lightweight class used to define information about how to render a text
 */
class GD_API TextFormatting
{
public:
    wxColour color;
    bool bold;
    bool italic;

    TextFormatting() : color(0,0,0), bold(false), italic(false) {}
    ~TextFormatting() {}
};

#endif // TEXTFORMATTING_H

#endif
