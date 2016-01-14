/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
gd::String VersionWrapper::FullString()
{
    return AutoVersion::GDCore_FULLVERSION_STRING;
}
gd::String VersionWrapper::Date()
{
    return AutoVersion::GDCore_DATE;
}
gd::String VersionWrapper::Month()
{
    return AutoVersion::GDCore_MONTH;
}
gd::String VersionWrapper::Year()
{
    return AutoVersion::GDCore_YEAR;
}
gd::String VersionWrapper::Status()
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

bool VersionWrapper::IsOlder(int major, int minor, int build, int revision,
    int major2, int minor2, int build2, int revision2)
{
    return (major < major2) ||
        (major == major2 && minor < minor2) ||
        (major == major2 && minor == minor2 && build < build2) ||
        (major == major2 && minor == minor2 && build == build2 && revision < revision2);
}

bool VersionWrapper::IsOlderOrEqual(int major, int minor, int build, int revision,
    int major2, int minor2, int build2, int revision2)
{
    return (major == major2 && minor == minor2 && build == build2 && revision == revision2) ||
        IsOlder(major, minor, build, revision, major2, minor2, build2, revision2);
}


}
