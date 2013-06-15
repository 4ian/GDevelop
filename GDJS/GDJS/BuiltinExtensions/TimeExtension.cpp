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
    GetAllConditions()["TimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTimeScale");
    GetAllActions()["ChangeTimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.setTimeScale");

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
    GetAllExpressions()["TimeScale"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTimeScale");
    GetAllExpressions()["Time"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.getTime");
}
