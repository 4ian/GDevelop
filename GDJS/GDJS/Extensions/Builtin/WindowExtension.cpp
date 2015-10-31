/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "WindowExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

WindowExtension::WindowExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsWindowExtension(*this);

    SetExtensionInformation("BuiltinWindow",
                          _("Window features"),
                          _("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["SetFullScreen"].SetFunctionName("gdjs.evtTools.window.setFullScreen");
    GetAllActions()["SetWindowMargins"].SetFunctionName("gdjs.evtTools.window.setMargins");
    GetAllActions()["SetWindowTitle"].SetFunctionName("gdjs.evtTools.window.setWindowTitle");
    GetAllActions()["SetWindowSize"].SetFunctionName("gdjs.evtTools.window.setCanvasSize");

    GetAllStrExpressions()["WindowTitle"].SetFunctionName("gdjs.evtTools.window.getWindowTitle");
    GetAllExpressions()["SceneWindowWidth"].SetFunctionName("gdjs.evtTools.window.getCanvasWidth");
    GetAllExpressions()["SceneWindowHeight"].SetFunctionName("gdjs.evtTools.window.getCanvasHeight");
    GetAllExpressions()["ScreenWidth"].SetFunctionName("gdjs.evtTools.window.getWindowWidth");
    GetAllExpressions()["ScreenHeight"].SetFunctionName("gdjs.evtTools.window.getWindowHeight");

    StripUnimplementedInstructionsAndExpressions();
}

}
