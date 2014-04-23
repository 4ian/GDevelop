/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsWindowExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinWindow",
                          _("Window features"),
                          _("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("EcrireTexte",
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
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");

    extension.AddAction("SetFullScreen",
                   _("De/activate fullscreen"),
                   _("This action activate or desactivate fullscreen."),
                   _("Activate fullscreen :  _PARAM1_"),
                   _("Game's window"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Activate fullscreen"), "",false);

    extension.AddAction("SetWindowSize",
                   _("Change the size of the screen"),
                   _("This action change the size of the game window."),
                   _("Change window size : _PARAM1_x_PARAM2_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Width"), "",false)
        .AddParameter("expression", _("Height"), "",false)
        .AddParameter("yesorno", _("Use this size as default size for new scene cameras\?\n(Yes to change extend the game area, No to stretch the game to the window's size)."), "",false);
    extension.AddAction("SetWindowIcon",
                   _("Change window's icon"),
                   _("This action change the icon of the game's window."),
                   _("Use _PARAM1_ as icon for the game's window."),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the image to be used as the icon"), "",false);

    extension.AddAction("SetWindowTitle",
                   _("Change window's title"),
                   _("This action change the title of the game window."),
                   _("Change window title to _PARAM1_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("New title"), "",false);

    extension.AddExpression("SceneWindowWidth", _("Width of the scene's window"), _("Width of the scene's window"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("SceneWindowHeight", _("Height of the scene's window"), _("Height of the scene's window"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");


    extension.AddExpression("ScreenWidth", _("Width of the current resolution"), _("Width of the current resolution"), _("Screen"), "res/display16.png");

    extension.AddExpression("ScreenHeight", _("Height of the current resolution"), _("Height of the current resolution"), _("Screen"), "res/display16.png");

    extension.AddExpression("ColorDepth", _("Color depth"), _("Color depth"), _("Screen"), "res/display16.png");

    extension.AddStrExpression("WindowTitle", _("Window's title"), _("Window's title"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}