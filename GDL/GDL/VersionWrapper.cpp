/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/VersionWrapper.h"
#include "GDL/Version.h"

int GDLVersionWrapper::Major()
{
    return AutoVersion::MAJOR;
}
int GDLVersionWrapper::Minor()
{
     return AutoVersion::MINOR;
}
int GDLVersionWrapper::Build()
{
     return AutoVersion::BUILD;
}
int GDLVersionWrapper::Revision()
{
     return AutoVersion::REVISION;
}
std::string GDLVersionWrapper::FullString()
{
    return AutoVersion::FULLVERSION_STRING;
}
std::string GDLVersionWrapper::Date()
{
    return AutoVersion::DATE;
}
std::string GDLVersionWrapper::Month()
{
    return AutoVersion::MONTH;
}
std::string GDLVersionWrapper::Year()
{
    return AutoVersion::YEAR;
}
std::string GDLVersionWrapper::Status()
{
    return AutoVersion::STATUS;
}
