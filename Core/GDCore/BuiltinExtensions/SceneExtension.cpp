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
                          GD_T("Scene management features"),
                          GD_T("Built-in extension allowing to manipulate scenes"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)

    extension.AddExpression("Random", GD_T("Random value"), GD_T("Random value"), GD_T("Random"), "res/actions/position.png")
        .AddParameter("expression", GD_T("Maximum value"));

    extension.AddStrExpression("CurrentSceneName", GD_T("Current scene name"), GD_T("Name of the current scene"), GD_T("Scene"), "res/actions/texte.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddCondition("DepartScene",
                   _("At the beginning of the scene"),
                   _("Is true only when scene just begins."),
                   GD_T("At the beginning of the scene"),
                   _("Scene"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsSimple();

    extension.AddAction("Scene",
                   _("Go to a scene"),
                   _("Change and start the specified scene."),
                   GD_T("Go to scene _PARAM1_"),
                   _("Scene"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Name of the scene"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("Quit",
                   _("Quit the game"),
                   _("Quit the game"),
                   GD_T("Quit the game"),
                   _("Scene"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("SceneBackground",
                   _("Change background color"),
                   _("Change the background color of the scene."),
                   GD_T("Set background color to _PARAM1_"),
                   _("Scene"),
                   "res/actions/background24.png",
                   "res/actions/background.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("color", GD_T("Color"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("DisableInputWhenFocusIsLost",
                   _("Disable input when focus is lost"),
                   _("Set if the keyboard and mouse buttons must be taken into account even\nif the window is not active."),
                   GD_T("Disable input when focus is lost: _PARAM1_"),
                   _("Scene"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", GD_T("Deactivate input when focus is lost"))
        .MarkAsAdvanced();

    extension.AddCondition("Egal",
               _("Compare two expressions"),
               _("Test the two expression"),
               GD_T("_PARAM0_ _PARAM1_ _PARAM2_"),
               _("Other"),
               "res/conditions/egal24.png",
               "res/conditions/egal.png")
        .AddParameter("expression", GD_T("Expression 1"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Expression 2"), "",false)
        .MarkAsAdvanced();
    #endif
}

}
