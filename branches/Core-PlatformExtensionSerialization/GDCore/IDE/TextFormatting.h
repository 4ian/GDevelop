/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#include <wx/colour.h>
#include <string>

namespace gd
{

/**
 * \brief Internal class used by gd::EventsRenderingHelper
 *
 * Lightweight internal class used to define information about how to render a text
 * Currently used by EventsRenderingHelper to render Instruction.
 *
 * \see EventsRenderingHelper
 *
 * \ingroup IDE
 */
class GD_CORE_API TextFormatting
{
public:
    wxColour color;
    bool bold;
    bool italic;
    size_t userData;

    TextFormatting() : color(0,0,0), bold(false), italic(false), userData(std::string::npos) {}
    ~TextFormatting() {}
};


}

#endif // TEXTFORMATTING_H


