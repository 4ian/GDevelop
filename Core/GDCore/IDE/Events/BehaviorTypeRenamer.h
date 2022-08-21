/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_BEHAVIORTYPERENAMER_H
#define GDCORE_BEHAVIORTYPERENAMER_H
#include <set>

#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class BehaviorContent;
}  // namespace gd

namespace gd {

class GD_CORE_API BehaviorTypeRenamer : public ArbitraryObjectsWorker {
 public:
  BehaviorTypeRenamer(const gd::Project& project_,
                          const gd::String& oldType_,
                          const gd::String& newType_)
      : project(project_), oldType(oldType_), newType(newType_){};
  virtual ~BehaviorTypeRenamer();

 private:
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::BehaviorContent& behavior) override;

  const gd::Project& project;
  gd::String oldType;
  gd::String newType;
};

};  // namespace gd

#endif // GDCORE_BEHAVIORTYPERENAMER_H
