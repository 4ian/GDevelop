/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/SourceFile.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/XmlMacros.h"

namespace GDpriv
{

SourceFile::SourceFile() :
    lastBuildTimeStamp(0),
    language(CPlusPlus),
    gdManaged(false)
{
    //ctor
}

SourceFile::~SourceFile()
{
    //dtor
}

 //Todo : Language not saved/loaded

/**
 * Load from XML element
 */
void SourceFile::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("filename", filename);
    int ilastBuildTimeStamp = lastBuildTimeStamp;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("lastBuildTimeStamp", ilastBuildTimeStamp);
    lastBuildTimeStamp = ilastBuildTimeStamp;

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("gdManaged", gdManaged);
    if ( elem->Attribute("gdManaged") == NULL ) gdManaged = false;
}

/**
 * Save to XML element
 */
void SourceFile::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("filename", filename);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("lastBuildTimeStamp", lastBuildTimeStamp);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("gdManaged", gdManaged);
}

}

#endif
