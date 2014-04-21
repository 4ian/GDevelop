/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#if !defined(GD_NO_WX_GUI)
#include <wx/colour.h>
#endif
#include <string>

namespace gd
{

/**
 * \brief Represents the style of a text displayed in the events editor.
 *
 * Notably used by EventsRenderingHelper to render Instruction.
 *
 * \see EventsRenderingHelper
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API TextFormatting
{
public:
    TextFormatting() : colorRed(0), colorGreen(0), colorBlue(0), bold(false), italic(false), userData(std::string::npos) {}
    ~TextFormatting() {}

    /**
     * \bref Return true if the bold style must be applied.
     */
    bool IsBold() const { return bold; }

    /**
     * \bref Return true if the italic style must be applied.
     */
    bool IsItalic() const { return italic; }

    /**
     * \brief Return the red component of the color that must be applied to the text.
     */
    unsigned int GetColorRed() const { return colorRed; }
    /**
     * \brief Return the green component of the color that must be applied to the text.
     */
    unsigned int GetColorGreen() const { return colorGreen; }
    /**
     * \brief Return the blue component of the color that must be applied to the text.
     */
    unsigned int GetColorBlue() const { return colorBlue; }

    #if !defined(GD_NO_WX_GUI)
    /**
     * Return the color of the text in a wxWidgets "wxColor" object.
     */
    wxColor GetWxColor() const { return wxColor(colorRed, colorGreen, colorBlue); }

    /**
     * Change the color of the text.
     */
    void SetColor(wxColor color)
    {
    	colorRed = color.Red();
    	colorGreen = color.Green();
    	colorBlue = color.Blue();
    }
    #endif

    unsigned int colorRed;
    unsigned int colorGreen;
    unsigned int colorBlue;
    bool bold;
    bool italic;
    size_t userData;
};


}

#endif // TEXTFORMATTING_H


