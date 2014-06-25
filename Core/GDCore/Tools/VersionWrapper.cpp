/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Tools/Version.h"

namespace gd
{

int VersionWrapper::Major()
{
    return AutoVersion::GDCore_MAJOR;
}
int VersionWrapper::Minor()
{
     return AutoVersion::GDCore_MINOR;
}
int VersionWrapper::Build()
{
     return AutoVersion::GDCore_BUILD;
}
int VersionWrapper::Revision()
{
     return AutoVersion::GDCore_REVISION;
}
std::string VersionWrapper::FullString()
{
    return AutoVersion::GDCore_FULLVERSION_STRING;
}
std::string VersionWrapper::Date()
{
    return AutoVersion::GDCore_DATE;
}
std::string VersionWrapper::Month()
{
    return AutoVersion::GDCore_MONTH;
}
std::string VersionWrapper::Year()
{
    return AutoVersion::GDCore_YEAR;
}
std::string VersionWrapper::Status()
{
    return AutoVersion::GDCore_STATUS;
}
bool VersionWrapper::CompiledForEdittime()
{
#if defined(GD_IDE_ONLY)
    return true;
#else
    return false;
#endif
}


}
