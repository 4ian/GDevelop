#include "VersionWrapper.h"
#include "version.h"

int GDEditorVersionWrapper::Major()
{
    return AutoVersion::MAJOR;
}
int GDEditorVersionWrapper::Minor()
{
     return AutoVersion::MINOR;
}
int GDEditorVersionWrapper::Build()
{
     return AutoVersion::BUILD;
}
int GDEditorVersionWrapper::Revision()
{
     return AutoVersion::REVISION;
}
string GDEditorVersionWrapper::FullString()
{
    return AutoVersion::FULLVERSION_STRING;
}
string GDEditorVersionWrapper::Date()
{
    return AutoVersion::DATE;
}
string GDEditorVersionWrapper::Month()
{
    return AutoVersion::MONTH;
}
string GDEditorVersionWrapper::Year()
{
    return AutoVersion::YEAR;
}
string GDEditorVersionWrapper::Status()
{
    return AutoVersion::STATUS;
}
