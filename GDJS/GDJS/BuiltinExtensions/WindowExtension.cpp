/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Window features"),
                          _("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Open source (LGPL)");

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
        .SetFunctionName("gdjs.evtTools.window.getWindowWidth");
    GetAllExpressions()["SceneWindowHeight"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.window.getWindowHeight");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:

    /*
    AddAction("EcrireTexte",
                   _("Display a text"),
                   _("Display the specified text to screen"),
                   _("Display _PARAM1_ at _PARAM2_;_PARAM3_ ( color  : _PARAM4_ , size : _PARAM5_, font : _PARAM6_ )"),
                   _("Scene"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("X position"), "",false)
        .AddParameter("expression", _("Y position"), "",false)
        .AddParameter("color", _("Color"), "",false)
        .AddParameter("expression", _("Size"), "",false)
        .AddParameter("police", _("Font"), "",true)
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("DisplayLegacyTextOnScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");


    AddAction("SetWindowIcon",
                   _("Change window's icon"),
                   _("This action change the icon of the game's window."),
                   _("Use _PARAM1_ as icon for the game's window."),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the image to be used as the icon"), "",false)
        .codeExtraInformation.SetFunctionName("SetWindowIcon").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");


    AddExpression("ScreenWidth", _("Width of the current resolution"), _("Width of the current resolution"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetScreenWidth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("ScreenHeight", _("Height of the current resolution"), _("Height of the current resolution"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetScreenHeight").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("ColorDepth", _("Color depth"), _("Color depth"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetColorDepth").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    */
}

void WindowExtension::ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker)
{
    /*if ( action.GetType() == "EcrireTexte" && !action.GetParameter( 6 ).GetPlainString().empty() )
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
    }*/
}

}
