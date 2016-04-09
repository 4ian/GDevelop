/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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

    GetAllConditions()["SourisX"].SetFunctionName("gdjs.evtTools.input.getMouseX");
    GetAllConditions()["SourisY"].SetFunctionName("gdjs.evtTools.input.getMouseY");
    GetAllConditions()["SourisBouton"].SetFunctionName("gdjs.evtTools.input.isMouseButtonPressed");
    GetAllConditions()["MouseButtonReleased"].SetFunctionName("gdjs.evtTools.input.isMouseButtonReleased");
    GetAllActions()["CacheSouris"].SetFunctionName("gdjs.evtTools.input.hideCursor");
    GetAllActions()["MontreSouris"].SetFunctionName("gdjs.evtTools.input.showCursor");
    GetAllActions()["TouchSimulateMouse"].SetFunctionName("gdjs.evtTools.input.touchSimulateMouse");

    GetAllConditions()["SourisSurObjet"].SetFunctionName("gdjs.evtTools.input.cursorOnObject");

    GetAllExpressions()["MouseX"].SetFunctionName("gdjs.evtTools.input.getMouseX");
    GetAllExpressions()["SourisX"].SetFunctionName("gdjs.evtTools.input.getMouseX"); //Deprecated
    GetAllExpressions()["MouseY"].SetFunctionName("gdjs.evtTools.input.getMouseY");
    GetAllExpressions()["SourisY"].SetFunctionName("gdjs.evtTools.input.getMouseY"); //Deprecated

    GetAllConditions()["PopStartedTouch"].SetFunctionName("gdjs.evtTools.input.popStartedTouch");
    GetAllConditions()["PopEndedTouch"].SetFunctionName("gdjs.evtTools.input.popEndedTouch");

    GetAllConditions()["TouchX"].SetFunctionName("gdjs.evtTools.input.getTouchX");
    GetAllConditions()["TouchY"].SetFunctionName("gdjs.evtTools.input.getTouchY");
    GetAllExpressions()["TouchX"].SetFunctionName("gdjs.evtTools.input.getTouchX");
    GetAllExpressions()["TouchY"].SetFunctionName("gdjs.evtTools.input.getTouchY");

    GetAllExpressions()["LastTouchId"].SetFunctionName("gdjs.evtTools.input.getLastTouchId");
    GetAllExpressions()["LastEndedTouchId"].SetFunctionName("gdjs.evtTools.input.getLastEndedTouchId");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
}

}
