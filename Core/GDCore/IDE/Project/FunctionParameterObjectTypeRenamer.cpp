/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Project/FunctionParameterObjectTypeRenamer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void FunctionParameterObjectTypeRenamer::DoVisitParameter(gd::ParameterMetadata& parameter) {
  if (gd::ParameterMetadata::IsObject(parameter.GetType()) &&
      parameter.GetExtraInfo() == oldObjectType) {
    parameter.SetExtraInfo(newObjectType);
  }
}

FunctionParameterObjectTypeRenamer::~FunctionParameterObjectTypeRenamer() {}

}  // namespace gd
