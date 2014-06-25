/*
 * Game Develop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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

    GetAllActions()["EcrireTexte"].codeExtraInformation.SetFunctionName("DisplayLegacyTextOnScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetFullScreen"].codeExtraInformation.SetFunctionName("SetFullScreen").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowSize"].codeExtraInformation.SetFunctionName("SetWindowSize").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowIcon"].codeExtraInformation.SetFunctionName("SetWindowIcon").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SetWindowTitle"].codeExtraInformation.SetFunctionName("SetWindowTitle").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllExpressions()["SceneWindowWidth"].codeExtraInformation.SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["SceneWindowHeight"].codeExtraInformation.SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenWidth"].codeExtraInformation.SetFunctionName("GetScreenWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ScreenHeight"].codeExtraInformation.SetFunctionName("GetScreenHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllExpressions()["ColorDepth"].codeExtraInformation.SetFunctionName("GetColorDepth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllStrExpressions()["WindowTitle"].codeExtraInformation.SetFunctionName("GetWindowTitle").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    #endif
}

#if defined(GD_IDE_ONLY)
void WindowExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    if ( action.GetType() == "EcrireTexte" && !action.GetParameter( 6 ).GetPlainString().empty() )
    {
        std::string parameter = action.GetParameter(6).GetPlainString();
        worker.ExposeResource(parameter);
        action.SetParameter(6, parameter);
    }
    if ( action.GetType() == "SetWindowIcon" && !action.GetParameter( 1 ).GetPlainString().empty() )
    {
        std::string parameter = action.GetParameter(1).GetPlainString();
        worker.ExposeImage(parameter);
        action.SetParameter(1, parameter);
    }
}
#endif

