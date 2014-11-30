/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/Tools/HelpFileAccess.h"
#include <wx/mimetype.h> // mimetype support

namespace gd
{

HelpFileAccess * HelpFileAccess::_singleton = NULL;

}
#endif
