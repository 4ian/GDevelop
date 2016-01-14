/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef TEXTFORMATTING_H
#define TEXTFORMATTING_H
#if !defined(GD_NO_WX_GUI)
#include <wx/colour.h>
#endif
#include "GDCore/String.h"

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
    TextFormatting() : colorRed(0), colorGreen(0), colorBlue(0), bold(false), italic(false), userData(gd::String::npos) {}
    ~TextFormatting() {}

    /**
     * \brief Return true if the bold style must be applied.
     */
    bool IsBold() const { return bold; }

    /**
     * \brief Return true if the italic style must be applied.
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

    /**
     * Change the color of the text.
     */
    TextFormatting & SetColor(unsigned int r, unsigned int g, unsigned int b)
    {
        colorRed = r;
        colorGreen = g;
        colorBlue = b;
        return *this;
    }

    /**
     * \brief Set if the bold style must be applied.
     */
    TextFormatting & SetBold(bool enable = true)
    {
        bold = enable;
        return *this;
    }

    /**
     * \brief Set if the italic style must be applied.
     */
    TextFormatting & SetItalic(bool enable = true)
    {
        italic = enable;
        return *this;
    }

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Return the color of the text in a wxWidgets "wxColor" object.
     * \note Shortcut for GetColor* methods.
     */
    wxColor GetWxColor() const { return wxColor(colorRed, colorGreen, colorBlue); }

    /**
     * \brief Change the color of the text using a wxWidgets color.
     * \note Shortcut for SetColor(color.Red(), color.Green(), color.Blue())
     */
    TextFormatting & SetColor(wxColor color)
    {
    	return SetColor(color.Red(), color.Green(), color.Blue());
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


