/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/Tools/HelpFileAccess.h"
#include <wx/mimetype.h> // mimetype support

namespace gd
{

HelpFileAccess * HelpFileAccess::_singleton = NULL;

}
#endif