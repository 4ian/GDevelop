#ifndef GDCORE_XMLLOADER_H
#define GDCORE_XMLLOADER_H

#include "GDCore/String.h"

#include "GDCore/TinyXml/tinyxml2.h"

namespace gd
{

bool GD_CORE_API LoadXmlFromFile(tinyxml2::XMLDocument & doc, const gd::String & filepath);

bool GD_CORE_API SaveXmlToFile(const tinyxml2::XMLDocument & doc, const gd::String & filepath);

}

#endif
