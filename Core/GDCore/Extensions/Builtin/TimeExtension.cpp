/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsTimeExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinTime",
          _("Timers and time"),
          "Actions and conditions to run timers, get the current time or "
          "modify the time scale (speed at which the game is running - useful "
          "for slow motion effects).",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/timers-and-time");
  extension.AddInstructionOrExpressionGroupMetadata(_("Timers and time"))
      .SetIcon("res/conditions/timer24.png");

  // Deprecated and replaced by CompareTimer
  extension
      .AddCondition("Timer",
                    _("Value of a scene timer"),
                    _("Test the elapsed time of a scene timer."),
                    _("The timer _PARAM2_ is greater than _PARAM1_ seconds"),

                    "",
                    "res/conditions/timer24.png",
                    "res/conditions/timer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Time in seconds"))
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .SetHidden();

  extension
      .AddCondition("CompareTimer",
                    _("Value of a scene timer"),
                    _("Compare the elapsed time of a scene timer. This "
                      "condition doesn't start the timer."),
                    _("The timer _PARAM1_ _PARAM2_ _PARAM3_ seconds"),

                    "",
                    "res/conditions/timer24.png",
                    "res/conditions/timer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .AddParameter("relationalOperator", _("Sign of the test"), "time")
      .AddParameter("expression", _("Time in seconds"))
      .SetManipulatedType("number");

  extension
      .AddCondition("TimeScale",
                    _("Time scale"),
                    _("Compare the time scale of the scene."),
                    _("the time scale of the scene"),

                    "",
                    "res/conditions/time24.png",
                    "res/conditions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Time scale (1 by default)")))
      .MarkAsAdvanced();

  extension
      .AddCondition("TimerPaused",
                    _("Scene timer paused"),
                    _("Test if the specified scene timer is paused."),
                    _("The timer _PARAM1_ is paused"),

                    "",
                    "res/conditions/timerPaused24.png",
                    "res/conditions/timerPaused.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .MarkAsAdvanced();

  extension
      .AddAction(
          "ResetTimer",
          _("Start (or reset) a scene timer"),
          _("Reset the specified scene timer, if the timer doesn't exist "
            "it's created and started."),
          _("Start (or reset) the timer _PARAM1_"),

          "",
          "res/actions/timer24.png",
          "res/actions/timer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer");

  extension
      .AddAction("PauseTimer",
                 _("Pause a scene timer"),
                 _("Pause a scene timer."),
                 _("Pause timer _PARAM1_"),

                 "",
                 "res/actions/pauseTimer24.png",
                 "res/actions/pauseTimer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .MarkAsAdvanced();

  extension
      .AddAction("UnPauseTimer",
                 _("Unpause a scene timer"),
                 _("Unpause a scene timer."),
                 _("Unpause timer _PARAM1_"),

                 "",
                 "res/actions/unPauseTimer24.png",
                 "res/actions/unPauseTimer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .MarkAsAdvanced();

  extension
      .AddAction("RemoveTimer",
                 _("Delete a scene timer"),
                 _("Delete a scene timer from memory."),
                 _("Delete timer _PARAM1_ from memory"),

                 "",
                 "res/actions/timer24.png",
                 "res/actions/timer.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer")
      .MarkAsAdvanced();

  extension
      .AddAction("ChangeTimeScale",
                 _("Time scale"),
                 _("Change the time scale of the scene."),
                 _("Set the time scale of the scene to _PARAM1_"),
                 "",
                 "res/actions/time24.png",
                 "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression",
                    _("Scale (1: Default, 2: 2x faster, 0.5: 2x slower...)"));

  extension
      .AddAction("Wait",
                 _("Wait X seconds"),
                 _("Waits a number of seconds before running "
                   "the next actions (and sub-events)."),
                 _("Wait _PARAM0_ seconds"),
                 "",
                 "res/timer_black.svg",
                 "res/timer_black.svg")
      .AddParameter("expression", _("Time to wait in seconds"))
      .SetHelpPath("/all-features/timers-and-time/wait-action");

  extension
      .AddExpression("TimeDelta",
                     _("Time elapsed since the last frame"),
                     _("Time elapsed since the last frame rendered on screen"),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("TempsFrame",
                     _("Time elapsed since the last frame"),
                     _("Time elapsed since the last frame rendered on screen"),
                     "",
                     "res/actions/time.png")
      .SetHidden()
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("ElapsedTime",
                     _("Time elapsed since the last frame"),
                     _("Time elapsed since the last frame rendered on screen"),
                     "",
                     "res/actions/time.png")
      .SetHidden()
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("TimerElapsedTime",
                     _("Scene timer value"),
                     _("Value of a scene timer"),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("identifier", _("Timer's name"), "sceneTimer");

  extension
      .AddExpression("TimeFromStart",
                     _("Time elapsed since the beginning of the scene"),
                     _("Time elapsed since the beginning of the scene"),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("TempsDebut",
                     _("Time elapsed since the beginning of the scene"),
                     _("Time elapsed since the beginning of the scene"),
                     "",
                     "res/actions/time.png")
      .SetHidden()
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("TimeScale",
                     _("Time scale"),
                     _("Returns the time scale of the scene."),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("Time",
                     _("Current time"),
                     _("Current time"),
                     "",
                     "res/actions/time.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter(
          "stringWithSelector",
          _("Hour: hour - Minutes: min - Seconds: sec - Day of month: "
            "mday - Months since January: mon - Year since 1900: year - Days "
            "since Sunday: wday - Days since Jan 1st: yday - Timestamp (ms): "
            "timestamp\""),
          "[\"hour\", \"min\", \"sec\", \"mon\", \"year\", \"wday\", \"mday\", "
          "\"yday\", \"timestamp\"]");
}

}  // namespace gd
