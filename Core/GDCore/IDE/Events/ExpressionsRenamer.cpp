/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionsRenamer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

bool ExpressionsRenamer::DoVisitInstruction(gd::Instruction& instruction,
                                            bool isCondition) {
  auto& metadata = isCondition ? gd::MetadataProvider::GetConditionMetadata(
                                     platform, instruction.GetType())
                               : gd::MetadataProvider::GetActionMetadata(
                                     platform, instruction.GetType());

  for (std::size_t pNb = 0; pNb < metadata.parameters.size() &&
                            pNb < instruction.GetParametersCount();
       ++pNb) {
    // Replace object's name in parameters
    if (gd::ParameterMetadata::IsExpression("number",
                                            metadata.parameters[pNb].type) ||
        gd::ParameterMetadata::IsExpression("string",
                                            metadata.parameters[pNb].type)) {
      // This raw replacement is theorically too broad and a ExpressionParser
      // should be used instead with callbacks to rename only the function. But
      // as ExpressionsRenamer is only used for renaming EventsFunction, which
      // have namespaces (i.e: Extension::MyFunction), it's safe enough to do
      // this raw search/replace.
      instruction.SetParameter(
          pNb,
          instruction.GetParameter(pNb).GetPlainString().FindAndReplace(
              oldType, newType));
    }
  }

  return false;
}

ExpressionsRenamer::~ExpressionsRenamer() {}

}  // namespace gd
