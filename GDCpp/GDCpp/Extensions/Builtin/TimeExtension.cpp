/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/TimeExtension.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/ManualTimer.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/TimeExtension.cpp"
#endif

TimeExtension::TimeExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsTimeExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["Timer"].SetFunctionName("TimerElapsedTime").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllConditions()["TimeScale"].SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllConditions()["TimerPaused"].SetFunctionName("TimerPaused").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");

    GetAllActions()["ResetTimer"].SetFunctionName("ResetTimer").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllActions()["PauseTimer"].SetFunctionName("PauseTimer").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllActions()["UnPauseTimer"].SetFunctionName("UnPauseTimer").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllActions()["RemoveTimer"].SetFunctionName("RemoveTimer").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllActions()["ChangeTimeScale"].SetFunctionName("SetTimeScale").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");

    GetAllExpressions()["TimeDelta"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TempsFrame"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["ElapsedTime"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TimerElapsedTime"].SetFunctionName("GetTimerElapsedTimeInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TimeFromStart"].SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TempsDebut"].SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TimeScale"].SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["TimeScale"].SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    GetAllExpressions()["Time"].SetFunctionName("GetTime").SetIncludeFile("GDCpp/Extensions/Builtin/TimeTools.h");
    #endif
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
void TimeExtension::GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    auto timers = scene.GetTimeManager().GetTimers();
    size_t i = 0;
    for(auto it = timers.begin();it != timers.end();++i, ++it) {
        if (i != propertyNb) continue;

        name = it->first;
        value = gd::String::From(static_cast<double>(it->second.GetTime())/1000000.0)+"s";
    }

}

bool TimeExtension::ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue)
{
    auto timers = scene.GetTimeManager().GetTimers();
    size_t i = 0;
    for(auto it = timers.begin();it != timers.end();++i, ++it) {
        if (i != propertyNb) continue;

        it->second.SetTime(newValue.To<double>()*1000000.0);
        return true;
    }

    return false;
}

std::size_t TimeExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    auto timers = scene.GetTimeManager().GetTimers();
    return timers.size();
}
#endif
