/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <set>

#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/SourceFileMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
} // namespace gd

namespace gd {

class GD_CORE_API UsedObjectTypeFinder : public ArbitraryObjectsWorker {
public:
  static bool ScanProject(gd::Project &project, const gd::String &objectType);

private:
  UsedObjectTypeFinder(gd::Project &project_, const gd::String &objectType_)
      : project(project_), objectType(objectType_){};
  gd::Project &project;
  const gd::String &objectType;
  bool hasFoundObjectType = false;

  // Object Visitor
  void DoVisitObject(gd::Object &object) override;
};

}; // namespace gd
