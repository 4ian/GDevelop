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
  GetAllActions()["SendAsyncRequest"].SetFunctionName(
      "gdjs.evtTools.network.sendAsyncRequest");
  GetAllActions()["EnableMetrics"].SetFunctionName(
      "gdjs.evtTools.network.enableMetrics");
  GetAllActions()["JSONToVariableStructure"].SetFunctionName(
      "gdjs.evtTools.network.jsonToVariableStructure");
  GetAllActions()["JSONToGlobalVariableStructure"].SetFunctionName(
      "gdjs.evtTools.network.jsonToVariableStructure");
  GetAllActions()["JSONToObjectVariableStructure"].SetFunctionName(
      "gdjs.evtTools.network.jsonToObjectVariableStructure");


  GetAllStrExpressions()["VarToJSON"].SetFunctionName(
      "gdjs.evtTools.network.variableStructureToJSON");
  GetAllStrExpressions()["ToJSON"].SetFunctionName(
      "gdjs.evtTools.network.variableStructureToJSON");
  GetAllStrExpressions()["GlobalVarToJSON"].SetFunctionName(
      "gdjs.evtTools.network.variableStructureToJSON");
  GetAllStrExpressions()["ObjectVarToJSON"].SetFunctionName(
      "gdjs.evtTools.network.objectVariableStructureToJSON");
  GetAllActions()["LaunchFile"].SetFunctionName("gdjs.evtTools.window.openURL");

  GetAllVariableExpressions()["FromJSON"].SetFunctionName(
      "new gdjs.Variable().fromJSON");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
