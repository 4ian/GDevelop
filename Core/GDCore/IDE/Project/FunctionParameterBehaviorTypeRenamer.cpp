/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Project/FunctionParameterBehaviorTypeRenamer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void FunctionParameterBehaviorTypeRenamer::DoVisitParameter(gd::ParameterMetadata& parameter) {
  if (gd::ParameterMetadata::IsBehavior(parameter.GetType()) &&
      parameter.GetExtraInfo() == oldBehaviorType) {
    parameter.SetExtraInfo(newBehaviorType);
  }
}

FunctionParameterBehaviorTypeRenamer::~FunctionParameterBehaviorTypeRenamer() {}

}  // namespace gd
