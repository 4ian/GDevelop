/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_BEHAVIORTYPERENAMER_H
#define GDCORE_BEHAVIORTYPERENAMER_H
#include <set>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
}  // namespace gd

namespace gd {

class GD_CORE_API BehaviorTypeRenamer : public ArbitraryObjectsWorker {
 public:
  BehaviorTypeRenamer(const gd::String& oldType_,
                      const gd::String& newType_)
      : oldType(oldType_), newType(newType_){};
  virtual ~BehaviorTypeRenamer();

 private:
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::Behavior& behavior) override;

  gd::String oldType;
  gd::String newType;
};

};  // namespace gd

#endif // GDCORE_BEHAVIORTYPERENAMER_H
