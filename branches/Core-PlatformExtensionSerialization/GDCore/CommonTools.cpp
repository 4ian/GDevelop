/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/CommonTools.h"
#include <string>
#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
template<>
std::string GD_CORE_API gd::ToString( const wxString & value )
{
    return std::string(value.mb_str());
}
#endif