/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExternalLayoutsExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

ExternalLayoutsExtension::ExternalLayoutsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsExternalLayoutsExtension(*this);

  GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"]
      .SetFunctionName(
          "gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
