/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)
#include "GDL/SourceFile.h"
#include "tinyxml.h"
#include "GDL/XmlMacros.h"

SourceFile::SourceFile() :
    lastBuildTimeStamp(0),
    language(CPlusPlus)
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
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("filename", filename);
    int ilastBuildTimeStamp = lastBuildTimeStamp;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("lastBuildTimeStamp", ilastBuildTimeStamp); //Todo : Long + lang
}

/**
 * Save to XML element
 */
void SourceFile::SaveToXml(TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("filename", filename);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("lastBuildTimeStamp", lastBuildTimeStamp);  //Todo : Long + lang
}

#endif
#endif
