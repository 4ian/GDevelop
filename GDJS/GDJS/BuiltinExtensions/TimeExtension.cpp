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
                          _("Built-in extension providing actions and conditions about the time."),
                          "Compil Games",
                          "Freeware");
    CloneExtension("Game Develop C++ platform", "BuiltinTime");

    GetAllConditions()["Timer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.timerElapsedTime");
    GetAllConditions()["TimerPaused"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.timerPaused");
    GetAllActions()["ResetTimer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.resetTimer");
    GetAllActions()["PauseTimer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.pauseTimer");
    GetAllActions()["UnPauseTimer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.unpauseTimer");
    GetAllActions()["RemoveTimer"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.removeTimer");
    GetAllConditions()["TimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTimeScale");
    GetAllActions()["ChangeTimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.setTimeScale");

    GetAllExpressions()["TimeDelta"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");
    GetAllExpressions()["TempsFrame"].codeExtraInformation //Deprecated
        .SetFunctionName("gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");
    GetAllExpressions()["ElapsedTime"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");
    GetAllExpressions()["TimerElapsedTime"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSeconds");
    GetAllExpressions()["TimeFromStart"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTimeFromStartInSeconds");
    GetAllExpressions()["TempsDebut"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTimeFromStartInSeconds");
    GetAllExpressions()["TimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTimeScale");
    GetAllExpressions()["Time"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.getTime");
}
