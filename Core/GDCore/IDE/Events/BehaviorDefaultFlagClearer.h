/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <set>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
}  // namespace gd

namespace gd {

/**
 * @brief This is used for project exports to keep default behaviors in
 * serialized data used by Runtime.
 */
class GD_CORE_API BehaviorDefaultFlagClearer : public ArbitraryObjectsWorker {
 public:
  BehaviorDefaultFlagClearer() {};
  virtual ~BehaviorDefaultFlagClearer();

 private:
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::Behavior& behavior) override;
};

};  // namespace gd
