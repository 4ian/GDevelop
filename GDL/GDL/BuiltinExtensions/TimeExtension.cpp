/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/TimeExtension.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ManualTimer.h"
#include "GDL/CommonTools.h"

TimeExtension::TimeExtension()
{
    DECLARE_THE_EXTENSION("BuiltinTime",
                          _("Time"),
                          _("Builtin extension providing actions and conditions about the time."),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("Timer",
                   _("Value of a timer"),
                   _("Test the time elapsed of a timer."),
                   _("The timer _PARAM2_ is greater to _PARAM1_ seconds"),
                   _("Timers and time"),
                   "res/conditions/timer24.png",
                   "res/conditions/timer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Time in seconds"), "", false);
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("TimerElapsedTime").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimeScale",
                   _("Time scale"),
                   _("Test the time scale."),
                   _("The time scale is _PARAM2__PARAM1_"),
                   _("Timers and time"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("TimerPaused",
                   _("State of a timer"),
                   _("Test if specified timer is paused."),
                   _("The timer _PARAM1_ is paused"),
                   _("Timers and time"),
                   "res/conditions/timerPaused24.png",
                   "res/conditions/timerPaused.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("TimerPaused").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ResetTimer",
                   _("Reset a timer"),
                   _("Reset the specified timer."),
                   _("Reset the timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/timer24.png",
                   "res/actions/timer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("ResetTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("PauseTimer",
                   _("Pause a timer"),
                   _("Pause a timer."),
                   _("Pause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/pauseTimer24.png",
                   "res/actions/pauseTimer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PauseTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnPauseTimer",
                   _("Unpause a timer"),
                   _("Unpause a timer."),
                   _("Unpause timer _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/unPauseTimer24.png",
                   "res/actions/unPauseTimer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("UnPauseTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("RemoveTimer",
                   _("Delete a timer"),
                   _("Delete a timer from memory."),
                   _("Delete timer _PARAM1_ from memory"),
                   _("Timers and time"),
                   "res/actions/time24.png",
                   "res/actions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);
        instrInfo.cppCallingInformation.SetFunctionName("RemoveTimer").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ChangeTimeScale",
                   _("Change time scale"),
                   _("Change the time scale of the game."),
                   _("Set time scale to _PARAM1_"),
                   _("Timers and time"),
                   "res/actions/time24.png",
                   "res/actions/time.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Scale ( 1 : Default, 2 : Faster, 0.5 : Slower... )"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("TimeDelta", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TempsFrame", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("ElapsedTime", _("Time elapsed since the last image"), _("Time elapsed since the last image"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TimerElapsedTime", _("Timer value"), _("Value of a timer"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Timer's name"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTimerElapsedTimeInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeFromStart", _("Time elapsed since the beginning of the scene"), _("Time elapsed since the beginning of the scene"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TempsDebut", _("Time elapsed since the beginning of the scene"), _("Time elapsed since the beginning of the scene"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("TimeScale", _("Time scale"), _("Time scale"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
    DECLARE_END_EXPRESSION()
    DECLARE_EXPRESSION("TimeScale", _("Time scale"), _("Time scale"), _("Time"), "res/actions/time.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.cppCallingInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("Time", _("Current time"), _("Current time"), _("Time"), "res/actions/time.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("", _("Hour : hour\nMinutes : min\nSeconds : sec\nDay in the month : mday\nMonths since January : mon\nYear since 1900 : year\nDays since sunday :wday\nDays since January 1st : yday"), "",false);
        instrInfo.cppCallingInformation.SetFunctionName("GetTime").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");
    DECLARE_END_EXPRESSION()
    #endif
}

#if defined(GD_IDE_ONLY)
void TimeExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    if ( propertyNb < scene.timers.size() )
    {
        name = scene.timers[propertyNb].GetName();
        value = ToString(static_cast<double>(scene.timers[propertyNb].GetTime())/1000.0)+"s";

        return;
    }
}

bool TimeExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb < scene.timers.size() )
    {
        scene.timers[propertyNb].SetTime(ToFloat(newValue)*1000.0);

        return true;
    }

    return false;
}

unsigned int TimeExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return scene.timers.size();
}
#endif

