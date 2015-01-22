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
    GetAllConditions()["Timer"].codeExtraInformation.SetFunctionName("TimerElapsedTime").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllConditions()["TimeScale"].codeExtraInformation.SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllConditions()["TimerPaused"].codeExtraInformation.SetFunctionName("TimerPaused").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");

    GetAllActions()["ResetTimer"].codeExtraInformation.SetFunctionName("ResetTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["PauseTimer"].codeExtraInformation.SetFunctionName("PauseTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["UnPauseTimer"].codeExtraInformation.SetFunctionName("UnPauseTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["RemoveTimer"].codeExtraInformation.SetFunctionName("RemoveTimer").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllActions()["ChangeTimeScale"].codeExtraInformation.SetFunctionName("SetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");

    GetAllExpressions()["TimeDelta"].codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TempsFrame"].codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["ElapsedTime"].codeExtraInformation.SetFunctionName("GetElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimerElapsedTime"].codeExtraInformation.SetFunctionName("GetTimerElapsedTimeInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeFromStart"].codeExtraInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TempsDebut"].codeExtraInformation.SetFunctionName("GetTimeFromStartInSeconds").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeScale"].codeExtraInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["TimeScale"].codeExtraInformation.SetFunctionName("GetTimeScale").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    GetAllExpressions()["Time"].codeExtraInformation.SetFunctionName("GetTime").SetIncludeFile("GDCpp/BuiltinExtensions/TimeTools.h");
    #endif
}

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
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

