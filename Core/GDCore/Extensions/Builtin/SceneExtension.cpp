/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsSceneExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinScene",
          _("Scene"),
          _("Actions and conditions to manipulate the scenes during the game."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("" /*TODO: Add a documentation page for this */);
  extension.AddInstructionOrExpressionGroupMetadata(_("Scene"))
      .SetIcon("res/conditions/depart24.png");

  extension
      .AddStrExpression("CurrentSceneName",
                        _("Current scene name"),
                        _("Name of the current scene"),
                        "",
                        "res/actions/texte.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddCondition("DepartScene",
                    _("At the beginning of the scene"),
                    _("Is true only when scene just begins."),
                    _("At the beginning of the scene"),
                    "",
                    "res/conditions/depart24.png",
                    "res/conditions/depart.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  extension
      .AddCondition("SceneJustResumed",
                    _("Scene just resumed"),
                    _("The scene has just resumed after being paused."),
                    _("Scene just resumed"),
                    "",
                    "res/conditions/depart24.png",
                    "res/conditions/depart.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  extension
      .AddCondition("DoesSceneExist",
                    _("Does scene exist"),
                    _("Check if a scene exists."),
                    _("Scene _PARAM1_ exists"),
                    "",
                    "res/actions/texte.png",
                    "res/actions/texte.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Name of the scene to check"))
      .MarkAsSimple();

  extension
      .AddAction("Scene",
                 _("Change the scene"),
                 _("Stop this scene and start the specified one instead."),
                 _("Change to scene _PARAM1_"),
                 "",
                 "res/actions/replaceScene24.png",
                 "res/actions/replaceScene.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Name of the new scene"))
      .AddParameter("yesorno", _("Stop any other paused scenes?"))
      .SetDefaultValue("true")
      .MarkAsAdvanced();

  extension
      .AddAction("PushScene",
                 _("Pause and start a new scene"),
                 _("Pause this scene and start the specified one.\nLater, you "
                   "can use the \"Stop and go back to previous scene\" action "
                   "to go back to this scene."),
                 _("Pause the scene and start _PARAM1_"),
                 "",
                 "res/actions/pushScene24.png",
                 "res/actions/pushScene.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Name of the new scene"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "PopScene",
          _("Stop and go back to previous scene"),
          _("Stop this scene and go back to the previous paused one.\nTo pause "
            "a scene, use the \"Pause and start a new scene\" action."),
          _("Stop the scene and go back to the previous paused one"),
          "",
          "res/actions/popScene24.png",
          "res/actions/popScene.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("Quit",
                 _("Quit the game"),
                 _("Quit the game"),
                 _("Quit the game"),
                 "",
                 "res/actions/quit24.png",
                 "res/actions/quit.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("SceneBackground",
                 _("Background color"),
                 _("Change the background color of the scene."),
                 _("Set background color to _PARAM1_"),
                 "",
                 "res/actions/background24.png",
                 "res/actions/background.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("color", _("Color"))
      .MarkAsAdvanced();

  extension
      .AddAction("DisableInputWhenFocusIsLost",
                 _("Disable input when focus is lost"),
                 _("mouse buttons must be taken "
                   "into account even\nif the window is not active."),
                 _("Disable input when focus is lost: _PARAM1_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno", _("Deactivate input when focus is lost"))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "HasGameJustResumed",
          _("Game has just resumed"),
          _("Check if the game has just resumed from being hidden. It "
            "happens when the game tab is selected, a minimized window is "
            "restored or the application is put back on front."),
          _("Game has just resumed"),
          "",
          "res/actions/window24.png",
          "res/actions/window.png")
      .SetHelpPath("/interface/scene-editor/events")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddAction("PrioritizeLoadingOfScene",
                 _("Preload scene"),
                 _("Preload a scene resources as soon as possible in background."),
                 _("Preload scene _PARAM1_ in background"),
                 "",
                 "res/actions/hourglass_black.svg",
                 "res/actions/hourglass_black.svg")
      .SetHelpPath("/all-features/resources-loading")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Name of the new scene"))
      .MarkAsAdvanced();

  extension.AddExpressionAndCondition("number",
                                "SceneLoadingProgress",
                                _("Scene loading progress"),
                                _("The progress of resources loading in background for a scene (between 0 and 1)."),
                                _("_PARAM0_ loading progress"),
                                _(""),
                                "res/actions/hourglass_black.svg")
      .SetHelpPath("/all-features/resources-loading")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Scene name"))
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddCondition("AreSceneAssetsLoaded",
                    _("Scene preloaded"),
                    _("Check if scene resources have finished to load in background."),
                    _("Scene _PARAM1_ was preloaded in background"),
                    "",
                    "res/actions/hourglass_black.svg",
                    "res/actions/hourglass_black.svg")
      .SetHelpPath("/all-features/resources-loading")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("sceneName", _("Scene name"))
      .MarkAsAdvanced();
}

}  // namespace gd
