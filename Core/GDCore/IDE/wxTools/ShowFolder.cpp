/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <iomanip>
#include "GDCore/Tools/Localization.h"
#include "ShowFolder.h"
#include <wx/utils.h>
#include <wx/log.h>

namespace gd
{

/**
 * \brief Open a folder with the file explorer/finder.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
void GD_CORE_API ShowFolder(wxString path)
{
    #if defined(WINDOWS)
    wxExecute("explorer.exe \""+path+"\"");
    #elif defined(MACOS)
    system(gd::String("open \""+path+"\"").c_str());
    #elif defined(LINUX)
    int returnCode = system(gd::String("xdg-open \""+path+"\"").c_str());

    if (returnCode != 0) {
        wxString error = _("Oops, it seems that the folder couldn't be displayed. Open your file explorer and go to:\n\n");
        error += path;
        wxLogWarning(error);
    }
    #else
    #warning gd::ShowFolder is not available for your system.
    #endif
}

}

#endif
