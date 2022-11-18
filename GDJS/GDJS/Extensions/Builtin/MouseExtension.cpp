/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MouseExtension.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

MouseExtension::MouseExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsMouseExtension(*this);

  GetAllConditions()["MouseX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseX");
  GetAllConditions()["MouseY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseY");
  GetAllConditions()["IsMouseInsideCanvas"].SetFunctionName(
      "gdjs.evtTools.input.isMouseInsideCanvas");
  GetAllConditions()["SourisX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseX"); // Deprecated
  GetAllConditions()["SourisY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseY"); // Deprecated
  GetAllConditions()["MouseButtonPressed"].SetFunctionName(
      "gdjs.evtTools.input.isMouseButtonPressed");
  GetAllConditions()["SourisBouton"].SetFunctionName(
      "gdjs.evtTools.input.isMouseButtonPressed"); // Deprecated
  GetAllConditions()["MouseButtonReleased"].SetFunctionName(
      "gdjs.evtTools.input.isMouseButtonReleased");
  GetAllConditions()["MouseButtonFromTextPressed"].SetFunctionName(
      "gdjs.evtTools.input.isMouseButtonPressed");
  GetAllConditions()["MouseButtonFromTextReleased"].SetFunctionName(
      "gdjs.evtTools.input.isMouseButtonReleased");
  GetAllActions()["CacheSouris"].SetFunctionName(
      "gdjs.evtTools.input.hideCursor");
  GetAllActions()["MontreSouris"].SetFunctionName(
      "gdjs.evtTools.input.showCursor");
  GetAllActions()["TouchSimulateMouse"].SetFunctionName(
      "gdjs.evtTools.input.touchSimulateMouse");
  GetAllConditions()["IsAnyTouchPressed"].SetFunctionName(
      "gdjs.evtTools.input.isAnyTouchPressed");

  GetAllConditions()["IsMouseWheelScrollingUp"].SetFunctionName(
      "gdjs.evtTools.input.isScrollingUp");
  GetAllConditions()["IsMouseWheelScrollingDown"].SetFunctionName(
      "gdjs.evtTools.input.isScrollingDown");

  GetAllExpressions()["MouseX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseX");
  GetAllExpressions()["SourisX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseX");  // Deprecated
  GetAllExpressions()["MouseY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseY");
  GetAllExpressions()["SourisY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseY");  // Deprecated

  GetAllConditions()["PopStartedTouch"].SetFunctionName(
      "gdjs.evtTools.input.popStartedTouch");  // Deprecated
  GetAllConditions()["PopEndedTouch"].SetFunctionName(
      "gdjs.evtTools.input.popEndedTouch");  // Deprecated

  GetAllConditions()["TouchX"].SetFunctionName("gdjs.evtTools.input.getTouchX");
  GetAllConditions()["TouchY"].SetFunctionName("gdjs.evtTools.input.getTouchY");
  GetAllExpressions()["TouchX"].SetFunctionName(
      "gdjs.evtTools.input.getTouchX");
  GetAllExpressions()["TouchY"].SetFunctionName(
      "gdjs.evtTools.input.getTouchY");

  GetAllExpressions()["LastTouchId"].SetFunctionName(
      "gdjs.evtTools.input.getLastTouchId");  // Deprecated
  GetAllExpressions()["LastEndedTouchId"].SetFunctionName(
      "gdjs.evtTools.input.getLastEndedTouchId");  // Deprecated

  GetAllConditions()["HasAnyTouchStarted"].SetFunctionName(
      "gdjs.evtTools.input.hasAnyTouchStarted");
  GetAllConditions()["HasTouchEnded"].SetFunctionName(
      "gdjs.evtTools.input.hasTouchEnded");
  GetAllExpressions()["StartedTouchCount"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchCount");
  GetAllExpressions()["StartedTouchId"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchIdentifier");

  GetAllExpressions()["MouseWheelDelta"].SetFunctionName(
      "gdjs.evtTools.input.getMouseWheelDelta");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
