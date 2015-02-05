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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsSceneExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinScene",
                          _("Scene management features"),
                          _("Built-in extension allowing to manipulate scenes"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)

    extension.AddExpression("Random", _("Random value"), _("Random value"), _("Random"), "res/actions/position.png")
        .AddParameter("expression", _("Maximum value"));

    extension.AddCondition("DepartScene",
                   _("At the beginning of the scene"),
                   _("Is true only when scene just begins."),
                   _("At the beginning of the scene"),
                   _("Scene"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsSimple();

    extension.AddAction("Scene",
                   _("Go to a scene"),
                   _("Change and start the specified scene."),
                   _("Go to scene _PARAM1_"),
                   _("Scene"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the scene"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("Quit",
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Scene"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("SceneBackground",
                   _("Change background color"),
                   _("Change the background color of the scene."),
                   _("Set background color to _PARAM1_"),
                   _("Scene"),
                   "res/actions/background24.png",
                   "res/actions/background.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("color", _("Color"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("DisableInputWhenFocusIsLost",
                   _("Disable input when focus is lost"),
                   _("Set if the keyboard and mouse buttons must be taken into account even\nif the window is not active."),
                   _("Disable input when focus is lost: _PARAM1_"),
                   _("Scene"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Deactivate input when focus is lost"))
        .MarkAsAdvanced();

    extension.AddCondition("Egal",
               _("Compare two expressions"),
               _("Test the two expression"),
               _("_PARAM0_ _PARAM1_ _PARAM2_"),
               _("Other"),
               "res/conditions/egal24.png",
               "res/conditions/egal.png")
        .AddParameter("expression", _("Expression 1"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Expression 2"), "",false)
        .MarkAsAdvanced();

    #endif
}

}
