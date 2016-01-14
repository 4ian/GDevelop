/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_GUICONTENTSCALEFACTOR_H
#define GDCORE_GUICONTENTSCALEFACTOR_H
#include <wx/window.h>

namespace gd
{

/**
 * \brief Store the Content Scale Factor, i.e 2 for retina
 * screens and 1 for normal screens.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
class GD_CORE_API GUIContentScaleFactor
{
public:

    /**
     * \brief Return the scale factor.
     * 
     * The scale is 1 for normal screen, 2 for "retina" ones
     * or more.
     */
    static double Get()
    {
        return scaleFactor;
    }

    /**
     * \brief Set the scale factor.
     * 
     * \note Should be called at the initialization of the application
     * that is using GDCore (i.e: The IDE).
     */
    static void Set(double factor)
    {
    	scaleFactor = factor;
    }

private:
    static double scaleFactor;
};

}

#endif // GDCORE_GUICONTENTSCALEFACTOR_H
#endif
