/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

namespace gd
{

SourceFile::SourceFile() :
    lastBuildTimeStamp(0),
    gdManaged(false)
{
    //ctor
}

SourceFile::~SourceFile()
{
    //dtor
}

void SourceFile::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("filename", filename);
    element.SetAttribute("language", language);
    element.SetAttribute("lastBuildTimeStamp", (int)lastBuildTimeStamp);
    element.SetAttribute("gdManaged", gdManaged);
}

void SourceFile::UnserializeFrom(const SerializerElement & element)
{
    filename = element.GetStringAttribute("filename");
    language = element.GetStringAttribute("language", "C++");
    lastBuildTimeStamp = element.GetIntAttribute("lastBuildTimeStamp");
    gdManaged = element.GetBoolAttribute("gdManaged");
}

}

#endif

