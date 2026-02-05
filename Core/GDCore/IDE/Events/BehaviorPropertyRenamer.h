/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <set>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
} // namespace gd

namespace gd {

/**
 * \brief Rename a property in behaviors of all objects.
 */
class GD_CORE_API BehaviorPropertyRenamer : public ArbitraryObjectsWorker {
public:
  BehaviorPropertyRenamer(const gd::String &behaviorType_,
                          const gd::String &oldName_,
                          const gd::String &newName_)
      : behaviorType(behaviorType_), oldName(oldName_), newName(newName_){};
  virtual ~BehaviorPropertyRenamer();

private:
  void DoVisitObject(gd::Object &object) override;
  void DoVisitBehavior(gd::Behavior &behavior) override;

  gd::String behaviorType;
  gd::String oldName;
  gd::String newName;
};

}; // namespace gd
