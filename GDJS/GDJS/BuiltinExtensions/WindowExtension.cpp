/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "WindowExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

WindowExtension::WindowExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsWindowExtension(*this);

    SetExtensionInformation("BuiltinWindow",
                          GD_T("Window features"),
                          GD_T("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllActions()["SetFullScreen"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.setFullScreen");
    GetAllActions()["SetWindowMargins"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.setMargins");
    GetAllActions()["SetWindowTitle"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.setWindowTitle");
    GetAllActions()["SetWindowSize"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.setCanvasSize");

    GetAllStrExpressions()["WindowTitle"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getWindowTitle");
    GetAllExpressions()["SceneWindowWidth"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getCanvasWidth");
    GetAllExpressions()["SceneWindowHeight"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getCanvasHeight");
    GetAllExpressions()["ScreenWidth"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getWindowWidth");
    GetAllExpressions()["ScreenHeight"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getWindowHeight");

    StripUnimplementedInstructionsAndExpressions();
}

}
