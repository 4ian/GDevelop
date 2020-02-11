/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "LayoutCodeGenerator.h"
#include "EventsCodeGenerator.h"

namespace gdjs {
gd::String
LayoutCodeGenerator::GenerateLayoutCompleteCode(
    const gd::Layout& layout,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String layoutCode =
      EventsCodeGenerator::GenerateSceneEventsCompleteCode(project,
                                                      layout,
                                                      layout.GetEvents(),
                                                      includeFiles,
                                                      compilationForRuntime);

  return layoutCode;
}

}  // namespace gdjs
