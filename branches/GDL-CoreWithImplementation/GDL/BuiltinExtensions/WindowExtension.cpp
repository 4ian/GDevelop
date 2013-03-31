/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/WindowExtension.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/Instruction.h"
#endif

WindowExtension::WindowExtension()
{
    DECLARE_THE_EXTENSION("BuiltinWindow",
                          _("Window features"),
                          _("Builtin extension allowing to manipulate the game's window"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_ACTION("EcrireTexte",
                   _("Display a text"),
                   _("Display the specified text to screen"),
                   _("Display _PARAM1_ at _PARAM2_;_PARAM3_ ( color  : _PARAM4_ , size : _PARAM5_, font : _PARAM6_ )"),
                   _("Scene"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("expression", _("X position"), "",false);
        instrInfo.AddParameter("expression", _("Y position"), "",false);
        instrInfo.AddParameter("color", _("Color"), "",false);
        instrInfo.AddParameter("expression", _("Size"), "",false);
        instrInfo.AddParameter("police", _("Font"), "",true);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("DisplayLegacyTextOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetFullScreen",
                   _("De/activate fullscreen"),
                   _("This action activate or desactivate fullscreen."),
                   _("Activate fullscreen :  _PARAM1_"),
                   _("Game's window"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("yesorno", _("Activate fullscreen"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetFullScreen").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowSize",
                   _("Change the size of the screen"),
                   _("This action change the size of the game window."),
                   _("Change window size : _PARAM1_x_PARAM2_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Width"), "",false);
        instrInfo.AddParameter("expression", _("Height"), "",false);
        instrInfo.AddParameter("yesorno", _("Use this size as default size for new scene cameras \?"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowSize").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()
    DECLARE_ACTION("SetWindowIcon",
                   _("Change window's icon"),
                   _("This action change the icon of the game's window."),
                   _("Use _PARAM1_ as icon for the game's window."),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Name of the image to be used as the icon"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowIcon").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetWindowTitle",
                   _("Change window's title"),
                   _("This action change the title of the game window."),
                   _("Change window title to _PARAM1_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("New title"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetWindowTitle").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("SceneWindowWidth", _("Width of the scene's window"), _("Width of the scene's window"), _("Screen"), "res/window.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetSceneWindowWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("SceneWindowHeight", _("Height of the scene's window"), _("Height of the scene's window"), _("Screen"), "res/window.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetSceneWindowHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ScreenWidth", _("Width of the current resolution"), _("Width of the current resolution"), _("Screen"), "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetScreenWidth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ScreenHeight", _("Height of the current resolution"), _("Height of the current resolution"), _("Screen"), "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetScreenHeight").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ColorDepth", _("Color depth"), _("Color depth"), _("Screen"), "res/display16.png")
        instrInfo.cppCallingInformation.SetFunctionName("GetColorDepth").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_STR_EXPRESSION("WindowTitle", _("Window's title"), _("Window's title"), _("Screen"), "res/window.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetWindowTitle").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
    DECLARE_END_STR_EXPRESSION()
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

