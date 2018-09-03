/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef ParameterMetadataTools_H
#define ParameterMetadataTools_H
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Project;
class ClassWithObjects;
class ParameterMetadata;
}  // namespace gd

namespace gd {
class GD_CORE_API ParameterMetadataTools {
 public:
  static void ParametersToObjectsContainer(
      gd::Project& project,
      const std::vector<gd::ParameterMetadata>& parameters,
      gd::ClassWithObjects& outputObjectsContainer);
};
}  // namespace gd

#endif  // ParameterMetadataTools_H
#endif
