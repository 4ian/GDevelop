/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/CommonTools.h"
#include <string>
#if defined(GD_IDE_ONLY)
#include <wx/string.h>
#endif

#if defined(GD_IDE_ONLY)
template<>
std::string GD_CORE_API gd::ToString( const wxString & value )
{
    return std::string(value.mb_str());
}
#endif
