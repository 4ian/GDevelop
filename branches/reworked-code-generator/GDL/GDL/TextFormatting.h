/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#include <wx/colour.h>
#include <string>

/**
 * \brief Lightweight class used to define information about how to render a text
 * Currently used to render Instruction in EventsEditor.
 */
class GD_API TextFormatting
{
public:
    wxColour color;
    bool bold;
    bool italic;
    size_t userData;

    TextFormatting() : color(0,0,0), bold(false), italic(false), userData(std::string::npos) {}
    ~TextFormatting() {}
};

#endif // TEXTFORMATTING_H

#endif
