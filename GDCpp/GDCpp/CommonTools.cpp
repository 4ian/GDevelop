/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */


#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDCpp/CommonTools.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

using namespace std;

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
template<>
std::string GD_API ToString( const wxString & value )
{
    return string(value.mb_str());
}
#endif
