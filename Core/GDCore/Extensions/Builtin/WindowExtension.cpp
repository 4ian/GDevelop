/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
                          _("This Built-in extension enables the manipulation of the game's window"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("SetFullScreen",
                   _("De/activate fullscreen"),
                   _("This action activates or deactivates fullscreen."),
                   _("Activate fullscreen: _PARAM1_ (keep aspect ratio: _PARAM2_)"),
                   _("Game's window"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Activate fullscreen"))
        .AddParameter("yesorno", _("Keep aspect ratio (HTML5 games only, yes by default)"), "",true).SetDefaultValue("yes");

    extension.AddAction("SetWindowMargins",
                   _("Change the window's margins"),
                   _("This action changes the margins, in pixels, of the game's window."),
                   _("Set margins of game window to _PARAM1_;_PARAM2_;_PARAM3_;_PARAM4_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Top"))
        .AddParameter("expression", _("Right"))
        .AddParameter("expression", _("Bottom"))
        .AddParameter("expression", _("Left"));

    extension.AddAction("SetWindowSize",
                   _("Change the size of the window"),
                   _("This action changes the size of the game's window."),
                   _("Change window size: _PARAM1_x_PARAM2_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Width"))
        .AddParameter("expression", _("Height"))
        .AddParameter("yesorno", _("Do you want to use this size as the default size for new scene cameras\?\n(Yes to change the size of the game's viewable area,\nNo to stretch the game to the window's size)."));

    extension.AddAction("SetWindowIcon",
                   _("Change the window's icon"),
                   _("This action changes the icon of the game's window."),
                   _("Use _PARAM1_ as the icon for the game's window."),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the image to be used as the icon"));

    extension.AddAction("SetWindowTitle",
                   _("Change the window's title"),
                   _("This action changes the title of the game's window."),
                   _("Change window title to _PARAM1_"),
                   _("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("New title"));

    extension.AddExpression("SceneWindowWidth", _("Width of the scene window"), _("Width of the scene window (or scene canvas for HTML5 games)"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("SceneWindowHeight", _("Height of the scene window"), _("Height of the scene window (or scene canvas for HTML5 games)"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("ScreenWidth", _("Width of the screen/page"), _("Width of the screen (or the page for HTML5 games in browser)"), _("Screen"), "res/display16.png");

    extension.AddExpression("ScreenHeight", _("Height of the screen/page"), _("Height of the screen (or the page for HTML5 games in browser)"), _("Screen"), "res/display16.png");

    extension.AddExpression("ColorDepth", _("Color depth"), _("Color depth"), _("Screen"), "res/display16.png");

    extension.AddStrExpression("WindowTitle", _("Window's title"), _("Window's title"), _("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}
