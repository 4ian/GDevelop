/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "NetworkExtension.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

NetworkExtension::NetworkExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsNetworkExtension(*this);

  GetAllActions()["SendRequest"].SetFunctionName(
      "gdjs.evtTools.network.sendDeprecatedSynchronousRequest");
  GetAllActions()["SendAsyncRequest"]
      .SetFunctionName("gdjs.evtTools.network.sendAsyncRequest")
      .SetAsyncFunctionName("gdjs.evtTools.network.sendAwaitableAsyncRequest");
  GetAllActions()["EnableMetrics"].SetFunctionName(
      "gdjs.evtTools.network.enableMetrics");
  GetAllActions()["LaunchFile"].SetFunctionName("gdjs.evtTools.window.openURL");

  AddDependency()
      .SetName("InAppBrowser Cordova plugin")
      .SetDependencyType("cordova")
      .SetExportName("cordova-plugin-inappbrowser");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
