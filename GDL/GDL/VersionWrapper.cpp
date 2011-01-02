/**
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
string GDLVersionWrapper::FullString()
{
    return AutoVersion::FULLVERSION_STRING;
}
string GDLVersionWrapper::Date()
{
    return AutoVersion::DATE;
}
string GDLVersionWrapper::Month()
{
    return AutoVersion::MONTH;
}
string GDLVersionWrapper::Year()
{
    return AutoVersion::YEAR;
}
string GDLVersionWrapper::Status()
{
    return AutoVersion::STATUS;
}
