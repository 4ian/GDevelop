/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "LayoutCodeGenerator.h"
#include "EventsCodeGenerator.h"
#include "GDCore/IDE/SceneNameMangler.h"

namespace gdjs {
gd::String LayoutCodeGenerator::GenerateLayoutCompleteCode(
    const gd::Layout& layout,
    std::set<gd::String>& includeFiles,
    bool compilationForRuntime) {
  gd::String sceneMangledName =
      gd::SceneNameMangler::Get()->GetMangledSceneName(layout.GetName());
  gd::String codeNamespace = "gdjs." + sceneMangledName + "Code";

  gd::String layoutCode = EventsCodeGenerator::GenerateLayoutCode(
      project, layout, codeNamespace, includeFiles, compilationForRuntime);

  // Export the symbols to avoid them being stripped by the Closure Compiler:
  gd::String exportCode =
      "gdjs['" + sceneMangledName + "Code']" + " = " + codeNamespace + ";\n";

  return layoutCode + "\n" + exportCode;
}

}  // namespace gdjs
