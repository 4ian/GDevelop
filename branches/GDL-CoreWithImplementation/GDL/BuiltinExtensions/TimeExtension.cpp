/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/TimeExtension.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ManualTimer.h"
#include "GDL/CommonTools.h"

TimeExtension::TimeExtension()
{
    SetExtensionInformation("BuiltinTime",
                          _("Time"),
                          _("Builtin extension providing actions and conditions about the time."),
                          "Compil Games",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddCondition("Timer",
                   _("Value of a timer"),
                   _("Test the time elapsed of a timer."),
                   _("The timer _PARAM2_ is greater to _PARAM1_ seconds"),
                   _("Timers and time"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Time in seconds"))
        .AddParameter("string", _("Timer's name"))

        .codeExtraInformation.SetFunctionName("TimerElapsedTime").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");



    AddCondition("TimeScale",
                   _("Time scale"),
                   _("Test the time scale."),
                   _("The time scale is _PARAM2__PARAM1_"),
                   _("Timers and time"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Value to test"))
        .AddParameter("relationalOperator", _("Sign of the test"))

        .codeExtraInformation.SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");



    AddCondition("TimerPaused",
                   _("State of a timer"),
                   _("Test if specified timer is paused."),
                   _("The timer _PARAM1_ is paused"),
                   _("Timers and time"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))

        .codeExtraInformation.SetFunctionName("TimerPaused").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");



    AddAction("ResetTimer",
                   _("Reset a timer"),
                   _("Reset the specified timer."),
                   _("Reset the timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))

        .codeExtraInformation.SetFunctionName("ResetTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddAction("PauseTimer",
                   _("Pause a timer"),
                   _("Pause a timer."),
                   _("Pause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))

        .codeExtraInformation.SetFunctionName("PauseTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddAction("UnPauseTimer",
                   _("Unpause a timer"),
                   _("Unpause a timer."),
                   _("Unpause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))

        .codeExtraInformation.SetFunctionName("UnPauseTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddAction("RemoveTimer",
                   _("Delete a timer"),
                   _("Delete a timer from memory."),
                   _("Delete timer _PARAM1_ from memory"),
                   _("Timers and time"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))
        .codeExtraInformation.SetFunctionName("RemoveTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddAction("ChangeTimeScale",
                   _("Change time scale"),
                   _("Change the time scale of the game."),
                   _("Set time scale to _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/time24.png",
                   "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Scale ( 1 : Default, 2 : Faster, 0.5 : Slower... )"))

        .codeExtraInformation.SetFunctionName("SetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddExpression("TimeDelta", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")

        .codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddExpression("TempsFrame", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddExpression("ElapsedTime", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");


    AddExpression("TimerElapsedTime", _("Timer value"), _("Value of a timer"), _("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Timer's name"))
        .codeExtraInformation.SetFunctionName("GetTimerElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");


    AddExpression("TimeFromStart", _("Time elapsed since the beginning of the scene"), _("Time elapsed since the beginning of the scene"), _("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")

        .codeExtraInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddExpression("TempsDebut", _("Time elapsed since the beginning of the scene"), _("Time elapsed since the beginning of the scene"), _("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")

        .codeExtraInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");


    AddExpression("TimeScale", _("Time scale"), _("Time scale"), _("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")

        .codeExtraInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    AddExpression("TimeScale", _("Time scale"), _("Time scale"), _("Time"), "res/actions/time.png")
        .SetHidden()
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");


    AddExpression("Time", _("Current time"), _("Current time"), _("Time"), "res/actions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("", _("Hour : hour\nMinutes : min\nSeconds : sec\nDay in the month : mday\nMonths since January : mon\nYear since 1900 : year\nDays since sunday :wday\nDays since January 1st : yday"), "",false)
        .codeExtraInformation.SetFunctionName("GetTime").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    #endif
}

#if defined(GD_IDE_ONLY)
void TimeExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb < scene.timers.size() )
    {
        name = scene.timers[propertyNb].GetName();
        value = ToString(static_cast<double>(scene.timers[propertyNb].GetTime())/1000000.0)+"s";

        return;
    }
}

bool TimeExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb < scene.timers.size() )
    {
        scene.timers[propertyNb].SetTime(ToDouble(newValue)*1000000.0);

        return true;
    }

    return false;
}

unsigned int TimeExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return scene.timers.size();
}
#endif

