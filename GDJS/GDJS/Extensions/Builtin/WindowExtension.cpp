/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "WindowExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

WindowExtension::WindowExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsWindowExtension(*this);

  GetAllActions()["SetFullScreen"].SetFunctionName(
      "gdjs.evtTools.window.setFullScreen");
  GetAllConditions()["IsFullScreen"].SetFunctionName(
      "gdjs.evtTools.window.isFullScreen");
  GetAllActions()["SetWindowMargins"].SetFunctionName(
      "gdjs.evtTools.window.setMargins");
  GetAllActions()["SetWindowTitle"].SetFunctionName(
      "gdjs.evtTools.window.setWindowTitle");
  GetAllActions()["SetWindowSize"].SetFunctionName(
      "gdjs.evtTools.window.setWindowSize");
  GetAllActions()["CenterWindow"].SetFunctionName(
      "gdjs.evtTools.window.centerWindow");
  GetAllActions()["SetGameResolutionSize"].SetFunctionName(
      "gdjs.evtTools.window.setGameResolutionSize");
  GetAllActions()["SetGameResolutionResizeMode"].SetFunctionName(
      "gdjs.evtTools.window.setGameResolutionResizeMode");
  GetAllActions()["SetAdaptGameResolutionAtRuntime"].SetFunctionName(
      "gdjs.evtTools.window.setAdaptGameResolutionAtRuntime");

  GetAllStrExpressions()["WindowTitle"].SetFunctionName(
      "gdjs.evtTools.window.getWindowTitle");
  GetAllExpressions()["SceneWindowWidth"].SetFunctionName(
      "gdjs.evtTools.window.getGameResolutionWidth");
  GetAllExpressions()["SceneWindowHeight"].SetFunctionName(
      "gdjs.evtTools.window.getGameResolutionHeight");

  // TODO: ScreenWidth should be renamed to WindowInnerWidth
  GetAllExpressions()["ScreenWidth"].SetFunctionName(
      "gdjs.evtTools.window.getWindowInnerWidth");
  // TODO: ScreenHeight should be renamed to WindowInnerHeight
  GetAllExpressions()["ScreenHeight"].SetFunctionName(
      "gdjs.evtTools.window.getWindowInnerHeight");

  // TODO: Expression returning the real screen size called ScreenWidth/ScreenHeight should be added.

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
