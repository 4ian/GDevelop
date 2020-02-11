/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsExtensionCodeGenerator.h"
#include "EventsCodeGenerator.h"

namespace gdjs {
gd::String
EventsFunctionsExtensionCodeGenerator::GenerateFreeEventsFunctionCompleteCode(
    const gd::EventsFunction& eventsFunction,
    const gd::String& codeNamespace,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String eventsFunctionCode =
      EventsCodeGenerator::GenerateEventsFunctionCode(project,
                                                      eventsFunction,
                                                      codeNamespace,
                                                      includeFiles,
                                                      compilationForRuntime);

  return eventsFunctionCode;
}

}  // namespace gdjs
