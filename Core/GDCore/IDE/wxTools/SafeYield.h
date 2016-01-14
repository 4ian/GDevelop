/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_SAFEYIELD_H
#define GDCORE_SAFEYIELD_H
#include <wx/utils.h>

namespace gd
{

/**
 * \brief Allow to yield the application to prevent it to look
 * frozen when doing heavy computations.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
class GD_CORE_API SafeYield
{
public:

    /**
     * \brief Launch a yield to prevent the application to appear to be
     * frozen.
     */
    static void Do(wxWindow *win = NULL, bool onlyIfNeeded = false)
    {
    	#if !defined(MACOS) //wxSafeYield froze the app on MacOS.
    	wxSafeYield(win, onlyIfNeeded);
    	#endif
    }

private:
};

}

#endif // GDCORE_SAFEYIELD_H
#endif
