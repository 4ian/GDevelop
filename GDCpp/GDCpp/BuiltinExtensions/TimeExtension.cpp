/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/TimeExtension.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/ManualTimer.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/TimeExtension.cpp"
#endif

TimeExtension::TimeExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsTimeExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["Timer"].SetFunctionName("TimerElapsedTime").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllConditions()["TimeScale"].SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllConditions()["TimerPaused"].SetFunctionName("TimerPaused").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");

    GetAllActions()["ResetTimer"].SetFunctionName("ResetTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["PauseTimer"].SetFunctionName("PauseTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["UnPauseTimer"].SetFunctionName("UnPauseTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["RemoveTimer"].SetFunctionName("RemoveTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["ChangeTimeScale"].SetFunctionName("SetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");

    GetAllExpressions()["TimeDelta"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TempsFrame"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["ElapsedTime"].SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimerElapsedTime"].SetFunctionName("GetTimerElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeFromStart"].SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TempsDebut"].SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeScale"].SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeScale"].SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["Time"].SetFunctionName("GetTime").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    #endif
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
void TimeExtension::GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if ( propertyNb < scene.timers.size() )
    {
        name = scene.timers[propertyNb].GetName();
        value = gd::String::From(static_cast<double>(scene.timers[propertyNb].GetTime())/1000000.0)+"s";

        return;
    }
}

bool TimeExtension::ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue)
{
    if ( propertyNb < scene.timers.size() )
    {
        scene.timers[propertyNb].SetTime(newValue.To<double>()*1000000.0);

        return true;
    }

    return false;
}

std::size_t TimeExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return scene.timers.size();
}
#endif
