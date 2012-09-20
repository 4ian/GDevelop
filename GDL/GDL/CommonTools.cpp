/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */


#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDL/CommonTools.h"
#if defined(GD_IDE_ONLY)
#include <wx/string.h>
#endif

using namespace std;

#if defined(GD_IDE_ONLY)
template<>
std::string GD_API ToString( const wxString & value )
{
    return string(value.mb_str());
}
#endif

