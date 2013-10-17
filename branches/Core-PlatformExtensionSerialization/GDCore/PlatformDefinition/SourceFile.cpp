/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCore/TinyXml/tinyxml.h"
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

/**
 * Load from XML element
 */
void SourceFile::LoadFromXml(const TiXmlElement * elem)
{
    filename = elem->Attribute("filename") ? elem->Attribute("filename") : NULL;
    lastBuildTimeStamp = elem->Attribute("lastBuildTimeStamp") ? ToInt(elem->Attribute("lastBuildTimeStamp")) : 0;

    if ( elem->Attribute("gdManaged") == NULL ) gdManaged = false;
    else gdManaged = ToString(elem->Attribute("gdManaged")) == "true";
}

/**
 * Save to XML element
 */
void SourceFile::SaveToXml(TiXmlElement * elem)
{
    elem->SetAttribute("filename", filename.c_str());
    elem->SetAttribute("lastBuildTimeStamp", lastBuildTimeStamp);
    elem->SetAttribute("gdManaged", gdManaged ? "true" : "false");
}

}

#endif

