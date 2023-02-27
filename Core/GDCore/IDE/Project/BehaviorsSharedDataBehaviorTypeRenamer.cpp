/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Project/BehaviorsSharedDataBehaviorTypeRenamer.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {

void BehaviorsSharedDataBehaviorTypeRenamer::DoVisitSharedData(
    gd::BehaviorsSharedData &sharedData) {
  if (sharedData.GetTypeName() == oldBehaviorType) {
    sharedData.SetTypeName(newBehaviorType);
  }
}

BehaviorsSharedDataBehaviorTypeRenamer::~BehaviorsSharedDataBehaviorTypeRenamer() {}

} // namespace gd
