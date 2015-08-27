/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/WindowExtension.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/WindowExtension.cpp"
#endif

WindowExtension::WindowExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsWindowExtension(*this);

    #if defined(GD_IDE_ONLY)

    GetAllActions()["SetFullScreen"].SetFunctionName("SetFullScreen").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowSize"].SetFunctionName("SetWindowSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowIcon"].SetFunctionName("SetWindowIcon").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowTitle"].SetFunctionName("SetWindowTitle").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["SceneWindowWidth"].SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["SceneWindowHeight"].SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenWidth"].SetFunctionName("GetScreenWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenHeight"].SetFunctionName("GetScreenHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ColorDepth"].SetFunctionName("GetColorDepth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllStrExpressions()["WindowTitle"].SetFunctionName("GetWindowTitle").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

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

