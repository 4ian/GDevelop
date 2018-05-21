#include "GDCore/Tools/XmlLoader.h"

#include <cstdio>

namespace gd {

namespace {
FILE* GetFileHandle(const gd::String& filename, const gd::String& mode) {
#if defined(WINDOWS)
  return _wfopen(filename.ToWide().c_str(), mode.ToWide().c_str());
#else
  return fopen(filename.ToLocale().c_str(), mode.ToLocale().c_str());
#endif
}
}  // namespace

bool GD_CORE_API LoadXmlFromFile(TiXmlDocument& doc,
                                 const gd::String& filepath) {
  FILE* xmlFile = GetFileHandle(filepath, "rb");
  if (!xmlFile) return false;

  bool res = doc.LoadFile(xmlFile);
  fclose(xmlFile);

  return res;
}

bool GD_CORE_API SaveXmlToFile(const TiXmlDocument& doc,
                               const gd::String& filepath) {
  FILE* xmlFile = GetFileHandle(filepath, "wb");
  if (!xmlFile) return false;

  bool res = doc.SaveFile(xmlFile);
  fclose(xmlFile);

  return res;
}

}  // namespace gd
