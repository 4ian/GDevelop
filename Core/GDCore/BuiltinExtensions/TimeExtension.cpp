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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsTimeExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinTime",
                          GD_T("Time"),
                          GD_T("Built-in extension providing actions and conditions about the time."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)

    extension.AddCondition("Timer",
                   _("Value of a timer"),
                   _("Test the time elapsed of a timer."),
                   GD_T("The timer _PARAM2_ is greater than _PARAM1_ seconds"),
                   _("Timers and time"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Time in seconds"))
        .AddParameter("string", GD_T("Timer's name"));

    extension.AddCondition("TimeScale",
                   _("Time scale"),
                   _("Test the time scale."),
                   GD_T("The time scale is _PARAM1__PARAM2_"),
                   _("Timers and time"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("TimerPaused",
                   _("State of a timer"),
                   _("Test if specified timer is paused."),
                   GD_T("The timer _PARAM1_ is paused"),
                   _("Timers and time"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"))
        .MarkAsAdvanced();

    extension.AddAction("ResetTimer",
                   _("Reset a timer"),
                   _("Reset the specified timer."),
                   GD_T("Reset the timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"));

    extension.AddAction("PauseTimer",
                   _("Pause a timer"),
                   _("Pause a timer."),
                   GD_T("Pause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"))
        .MarkAsAdvanced();

    extension.AddAction("UnPauseTimer",
                   _("Unpause a timer"),
                   _("Unpause a timer."),
                   GD_T("Unpause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"))
        .MarkAsAdvanced();

    extension.AddAction("RemoveTimer",
                   _("Delete a timer"),
                   _("Delete a timer from memory."),
                   GD_T("Delete timer _PARAM1_ from memory"),
                   _("Timers and time"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"))
        .MarkAsAdvanced();

    extension.AddAction("ChangeTimeScale",
                   _("Change time scale"),
                   _("Change the time scale of the game."),
                   GD_T("Set time scale to _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/time24.png",
                   "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Scale (1 : Default, 2 : Faster, 0.5 : Slower...)"));

    extension.AddExpression("TimeDelta", GD_T("Time elapsed since the last image"), GD_T("Time elapsed since the last image"), GD_T("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("TempsFrame", GD_T("Time elapsed since the last image"), GD_T("Time elapsed since the last image"), GD_T("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("ElapsedTime", GD_T("Time elapsed since the last image"), GD_T("Time elapsed since the last image"), GD_T("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "");


    extension.AddExpression("TimerElapsedTime", GD_T("Timer value"), GD_T("Value of a timer"), GD_T("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Timer's name"));


    extension.AddExpression("TimeFromStart", GD_T("Time elapsed since the beginning of the scene"), GD_T("Time elapsed since the beginning of the scene"), GD_T("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
;

    extension.AddExpression("TempsDebut", GD_T("Time elapsed since the beginning of the scene"), GD_T("Time elapsed since the beginning of the scene"), GD_T("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
;


    extension.AddExpression("TimeScale", GD_T("Time scale"), GD_T("Time scale"), GD_T("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
;

    extension.AddExpression("TimeScale", GD_T("Time scale"), GD_T("Time scale"), GD_T("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "");


    extension.AddExpression("Time", GD_T("Current time"), GD_T("Current time"), GD_T("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("", GD_T("Hour : hour\nMinutes : min\nSeconds : sec\nDay in the month : mday\nMonths since January : mon\nYear since 1900 : year\nDays since sunday :wday\nDays since January 1st : yday"), "",false);

    #endif
}

}
