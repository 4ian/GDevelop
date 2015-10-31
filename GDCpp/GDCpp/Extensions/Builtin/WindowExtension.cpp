/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/WindowExtension.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/WindowExtension.cpp"
#endif

WindowExtension::WindowExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsWindowExtension(*this);

    #if defined(GD_IDE_ONLY)

    GetAllActions()["SetFullScreen"].SetFunctionName("SetFullScreen").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["SetWindowSize"].SetFunctionName("SetWindowSize").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["SetWindowIcon"].SetFunctionName("SetWindowIcon").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["SetWindowTitle"].SetFunctionName("SetWindowTitle").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllExpressions()["SceneWindowWidth"].SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllExpressions()["SceneWindowHeight"].SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenWidth"].SetFunctionName("GetScreenWidth").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenHeight"].SetFunctionName("GetScreenHeight").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllExpressions()["ColorDepth"].SetFunctionName("GetColorDepth").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllStrExpressions()["WindowTitle"].SetFunctionName("GetWindowTitle").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    #endif
}

#if defined(GD_IDE_ONLY)
void WindowExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "SetWindowIcon" && !action.GetParameter( 1 ).GetPlainString().empty() )
    {
        gd::String parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeImage(parameter);
        action.SetParameter(1, parameter);
    }
}
#endif

