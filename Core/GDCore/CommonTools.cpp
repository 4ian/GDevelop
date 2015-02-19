/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/CommonTools.h"
#include <string>
#include <iostream>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/string.h>
#endif

namespace gd
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
template<>
std::string GD_CORE_API ToString( const wxString & value )
{
    return std::string(value.mb_str());
}
#endif
}
