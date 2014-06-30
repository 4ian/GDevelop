/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "TimeExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

TimeExtension::TimeExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsTimeExtension(*this);

    SetExtensionInformation("BuiltinTime",
                          _("Time"),
                          _("Built-in extension providing actions and conditions about the time."),
                          "Florian Rival",
                          "Open source (LGPL)");

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

}
