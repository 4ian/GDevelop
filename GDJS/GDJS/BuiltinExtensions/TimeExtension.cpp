#include "TimeExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

TimeExtension::TimeExtension()
{
    SetExtensionInformation("BuiltinTime",
                          _("Time"),
                          _("Builtin extension providing actions and conditions about the time."),
                          "Compil Games",
                          "Freeware");
    CloneExtension("Game Develop C++ platform", "BuiltinTime");

    GetAllConditions()["Timer"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.timerElapsedTime");
    GetAllConditions()["TimerPaused"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.timerPaused");
    GetAllActions()["ResetTimer"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.resetTimer");
    GetAllActions()["PauseTimer"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.pauseTimer");
    GetAllActions()["UnPauseTimer"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.unpauseTimer");
    GetAllActions()["RemoveTimer"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.removeTimer");

    GetAllExpressions()["TimeDelta"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getElapsedTimeInSeconds");
    GetAllExpressions()["TempsFrame"].codeExtraInformation //Deprecated
        .SetFunctionName("gdjs.runtimeSceneTools.getElapsedTimeInSeconds");
    GetAllExpressions()["ElapsedTime"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getElapsedTimeInSeconds");
    GetAllExpressions()["TimerElapsedTime"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTimerElapsedTimeInSeconds");
    GetAllExpressions()["TimeFromStart"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTimeFromStartInSeconds");
    GetAllExpressions()["TempsDebut"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTimeFromStartInSeconds");


/*


    AddCondition("TimeScale",
                   _("Time scale"),
                   _("Test the time scale."),
                   _("The time scale is _PARAM1__PARAM2_"),
                   _("Timers and time"),
                   "res/conditions/time24.png",
                   "res/conditions/time.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetTimeScale").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/TimeTools.h");

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
*/
}
