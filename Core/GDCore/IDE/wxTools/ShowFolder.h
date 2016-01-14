/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_SHOWFOLDER_H
#define GDCORE_SHOWFOLDER_H
#include <iomanip>
#include "GDCore/Tools/Localization.h"
#include <wx/utils.h>
#include <wx/log.h>

namespace gd
{

/**
 * \brief Open a folder in the system file explorer.
 *
 * On Windows, explorer.exe is used.
 * On MacOS, "open" is called.
 * On Linux, "xdg-open" is called.
 *
 * \ingroup IDE
 * \ingroup wxTools
 */
void GD_CORE_API ShowFolder(wxString path);

}

#endif // GDCORE_SHOWFOLDER_H
#endif
