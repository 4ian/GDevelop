/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "MouseExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

MouseExtension::MouseExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsMouseExtension(*this);

    SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extension allowing to use the mouse"),
                          "Florian Rival",
                          "Open source (MIT License)");

    GetAllConditions()["SourisX"].SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js");
    GetAllConditions()["SourisY"].SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js");
    GetAllConditions()["SourisBouton"].SetFunctionName("gdjs.evtTools.input.isMouseButtonPressed").SetIncludeFile("inputtools.js");
    GetAllConditions()["MouseButtonReleased"].SetFunctionName("gdjs.evtTools.input.isMouseButtonReleased").SetIncludeFile("inputtools.js");
    GetAllActions()["CacheSouris"].SetFunctionName("gdjs.evtTools.input.hideCursor").SetIncludeFile("inputtools.js");
    GetAllActions()["MontreSouris"].SetFunctionName("gdjs.evtTools.input.showCursor").SetIncludeFile("inputtools.js");
    GetAllActions()["TouchSimulateMouse"].SetFunctionName("gdjs.evtTools.input.touchSimulateMouse").SetIncludeFile("inputtools.js");

    GetAllConditions()["SourisSurObjet"].SetFunctionName("gdjs.evtTools.input.cursorOnObject").SetIncludeFile("inputtools.js");

    GetAllExpressions()["MouseX"].SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js");
    GetAllExpressions()["SourisX"].SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.js"); //Deprecated
    GetAllExpressions()["MouseY"].SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js");
    GetAllExpressions()["SourisY"].SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.js"); //Deprecated

    GetAllConditions()["PopStartedTouch"].SetFunctionName("gdjs.evtTools.input.popStartedTouch").SetIncludeFile("inputtools.js");
    GetAllConditions()["PopEndedTouch"].SetFunctionName("gdjs.evtTools.input.popEndedTouch").SetIncludeFile("inputtools.js");

    GetAllConditions()["TouchX"].SetFunctionName("gdjs.evtTools.input.getTouchX").SetIncludeFile("inputtools.js");
    GetAllConditions()["TouchY"].SetFunctionName("gdjs.evtTools.input.getTouchY").SetIncludeFile("inputtools.js");
    GetAllExpressions()["TouchX"].SetFunctionName("gdjs.evtTools.input.getTouchX").SetIncludeFile("inputtools.js");
    GetAllExpressions()["TouchY"].SetFunctionName("gdjs.evtTools.input.getTouchY").SetIncludeFile("inputtools.js");

    GetAllExpressions()["LastTouchId"].SetFunctionName("gdjs.evtTools.input.getLastTouchId").SetIncludeFile("inputtools.js");
    GetAllExpressions()["LastEndedTouchId"].SetFunctionName("gdjs.evtTools.input.getLastEndedTouchId").SetIncludeFile("inputtools.js");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
}

}
