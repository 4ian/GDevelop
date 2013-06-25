#include "WindowExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())


WindowExtension::WindowExtension()
{
    SetExtensionInformation("BuiltinWindow",
                          _("Window features"),
                          _("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinWindow");

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
        .codeExtraInformation.SetFunctionName("DisplayLegacyTextOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("SetFullScreen",
                   _("De/activate fullscreen"),
                   _("This action activate or desactivate fullscreen."),
                   _("Activate fullscreen :  _PARAM1_"),
                   _("Game's window"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Activate fullscreen"), "",false)
        .codeExtraInformation.SetFunctionName("SetFullScreen").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("SetWindowSize",
                   _("Change the size of the screen"),
                   _("This action change the size of the game window."),
                   _("Change window size : _PARAM1_x_PARAM2_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Width"), "",false)
        .AddParameter("expression", _("Height"), "",false)
        .AddParameter("yesorno", _("Use this size as default size for new scene cameras \?"), "",false)
        .codeExtraInformation.SetFunctionName("SetWindowSize").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    AddAction("SetWindowIcon",
                   _("Change window's icon"),
                   _("This action change the icon of the game's window."),
                   _("Use _PARAM1_ as icon for the game's window."),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the image to be used as the icon"), "",false)
        .codeExtraInformation.SetFunctionName("SetWindowIcon").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("SetWindowTitle",
                   _("Change window's title"),
                   _("This action change the title of the game window."),
                   _("Change window title to _PARAM1_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("New title"), "",false)
        .codeExtraInformation.SetFunctionName("SetWindowTitle").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("SceneWindowWidth", _("Width of the scene's window"), _("Width of the scene's window"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("SceneWindowHeight", _("Height of the scene's window"), _("Height of the scene's window"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");


    AddExpression("ScreenWidth", _("Width of the current resolution"), _("Width of the current resolution"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetScreenWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("ScreenHeight", _("Height of the current resolution"), _("Height of the current resolution"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetScreenHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("ColorDepth", _("Color depth"), _("Color depth"), _("Screen"), "res/display16.png")
        .codeExtraInformation.SetFunctionName("GetColorDepth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddStrExpression("WindowTitle", _("Window's title"), _("Window's title"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetWindowTitle").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
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
