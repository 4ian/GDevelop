/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "MouseExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

MouseExtension::MouseExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsMouseExtension(*this);

    SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extensions allowing to use the mouse"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllConditions()["SourisX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js");
    GetAllConditions()["SourisY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js");
    GetAllConditions()["SourisBouton"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isMouseButtonPressed").SetIncludeFile("inputtools.js");
    GetAllActions()["CacheSouris"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.hideCursor").SetIncludeFile("inputtools.js");
    GetAllActions()["MontreSouris"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.showCursor").SetIncludeFile("inputtools.js");

    GetAllConditions()["SourisSurObjet"].codeExtraInformation.
        SetFunctionName("gdjs.evtTools.input.cursorOnObject").SetIncludeFile("inputtools.js");

    GetAllExpressions()["MouseX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js");
    GetAllExpressions()["SourisX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js"); //Deprecated
    GetAllExpressions()["MouseY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js");
    GetAllExpressions()["SourisY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js"); //Deprecated

    GetAllConditions()["PopStartedTouch"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.popStartedTouch").SetIncludeFile("inputtools.js");
    GetAllConditions()["PopEndedTouch"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.popEndedTouch").SetIncludeFile("inputtools.js");

    GetAllConditions()["TouchX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getTouchX").SetIncludeFile("inputtools.js");
    GetAllConditions()["TouchY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getTouchY").SetIncludeFile("inputtools.js");
    GetAllExpressions()["TouchX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getTouchX").SetIncludeFile("inputtools.js");
    GetAllExpressions()["TouchY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getTouchY").SetIncludeFile("inputtools.js");

    GetAllExpressions()["LastTouchId"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getLastTouchId").SetIncludeFile("inputtools.js");
    GetAllExpressions()["LastEndedTouchId"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getLastEndedTouchId").SetIncludeFile("inputtools.js");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
}

}
