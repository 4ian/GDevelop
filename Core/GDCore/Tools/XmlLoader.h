#ifndef GDCORE_XMLLOADER_H
#define GDCORE_XMLLOADER_H

#include "GDCore/String.h"
#include "GDCore/TinyXml/tinyxml.h"

namespace gd {

bool GD_CORE_API LoadXmlFromFile(TiXmlDocument& doc,
                                 const gd::String& filepath);

bool GD_CORE_API SaveXmlToFile(const TiXmlDocument& doc,
                               const gd::String& filepath);

}  // namespace gd

#endif
