/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
                          GD_T("Window features"),
                          GD_T("Built-in extension allowing to manipulate the game's window"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("EcrireTexte",
                   GD_T("Display a text"),
                   GD_T("Display the specified text to screen"),
                   GD_T("Display _PARAM1_ at _PARAM2_;_PARAM3_ ( color  : _PARAM4_ , size : _PARAM5_, font : _PARAM6_ )"),
                   GD_T("Scene"),
                   "res/actions/texte24.png",
                   "res/actions/texte.png")
        .SetHidden() //Deprecated
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("expression", GD_T("X position"), "",false)
        .AddParameter("expression", GD_T("Y position"), "",false)
        .AddParameter("color", GD_T("Color"), "",false)
        .AddParameter("expression", GD_T("Size"), "",false)
        .AddParameter("police", GD_T("Font"), "",true)
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "",true).SetDefaultValue("\"\"");

    extension.AddAction("SetFullScreen",
                   GD_T("De/activate fullscreen"),
                   GD_T("This action activate or desactivate fullscreen."),
                   GD_T("Activate fullscreen:  _PARAM1_ (Keep aspect ratio: _PARAM2_)"),
                   GD_T("Game's window"),
                   "res/actions/fullscreen24.png",
                   "res/actions/fullscreen.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", GD_T("Activate fullscreen"), "",false)
        .AddParameter("yesorno", GD_T("Keep aspect ratio (HTML5 games only, yes by default)"), "",true).SetDefaultValue("yes");

    extension.AddAction("SetWindowMargins",
                   GD_T("Change window's margins"),
                   GD_T("This action change the margins, in pixels, of the game's window."),
                   GD_T("Set margins of game window to _PARAM1_;_PARAM2_;_PARAM3_;_PARAM4_"),
                   GD_T("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Top"), "",false)
        .AddParameter("expression", GD_T("Right"), "",false)
        .AddParameter("expression", GD_T("Bottom"), "",false)
        .AddParameter("expression", GD_T("Left"), "",false);

    extension.AddAction("SetWindowSize",
                   GD_T("Change the size of the screen"),
                   GD_T("This action change the size of the game window."),
                   GD_T("Change window size : _PARAM1_x_PARAM2_"),
                   GD_T("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Width"), "",false)
        .AddParameter("expression", GD_T("Height"), "",false)
        .AddParameter("yesorno", GD_T("Use this size as default size for new scene cameras\?\n(Yes to change extend the game area, No to stretch the game to the window's size)."), "",false);

    extension.AddAction("SetWindowIcon",
                   GD_T("Change window's icon"),
                   GD_T("This action change the icon of the game's window."),
                   GD_T("Use _PARAM1_ as icon for the game's window."),
                   GD_T("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Name of the image to be used as the icon"), "",false);

    extension.AddAction("SetWindowTitle",
                   GD_T("Change window's title"),
                   GD_T("This action change the title of the game window."),
                   GD_T("Change window title to _PARAM1_"),
                   GD_T("Game's window"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("New title"), "",false);

    extension.AddExpression("SceneWindowWidth", GD_T("Width of the scene window"), GD_T("Width of the scene window (or scene canvas for HTML5 games)"), GD_T("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("SceneWindowHeight", GD_T("Height of the scene window"), GD_T("Height of the scene window (or scene canvas for HTML5 games)"), GD_T("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("ScreenWidth", GD_T("Width of the screen/page"), GD_T("Width of the screen (or the page for HTML5 games in browser)"), GD_T("Screen"), "res/display16.png");

    extension.AddExpression("ScreenHeight", GD_T("Height of the screen/page"), GD_T("Height of the screen (or the page for HTML5 games in browser)"), GD_T("Screen"), "res/display16.png");

    extension.AddExpression("ColorDepth", GD_T("Color depth"), GD_T("Color depth"), GD_T("Screen"), "res/display16.png");

    extension.AddStrExpression("WindowTitle", GD_T("Window's title"), GD_T("Window's title"), GD_T("Screen"), "res/window.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}
