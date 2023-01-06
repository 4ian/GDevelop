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

  GetAllConditions()["CursorX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX");
  GetAllConditions()["CursorY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY");
  GetAllConditions()["MouseOnlyOnlyCursorX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseOnlyCursorX");
  GetAllConditions()["MouseOnlyCursorY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseOnlyCursorY");
  // Deprecated
  GetAllConditions()["MouseX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX");
  // Deprecated
  GetAllConditions()["MouseY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY");
  GetAllConditions()["IsMouseInsideCanvas"].SetFunctionName(
      "gdjs.evtTools.input.isMouseInsideCanvas");
  GetAllConditions()["SourisX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX"); // Deprecated
  GetAllConditions()["SourisY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY"); // Deprecated
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

  GetAllConditions()["IsMouseWheelScrollingUp"].SetFunctionName(
      "gdjs.evtTools.input.isScrollingUp");
  GetAllConditions()["IsMouseWheelScrollingDown"].SetFunctionName(
      "gdjs.evtTools.input.isScrollingDown");

  GetAllExpressions()["CursorX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX");
  // Deprecated
  GetAllExpressions()["MouseX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX");
  // Deprecated
  GetAllExpressions()["SourisX"].SetFunctionName(
      "gdjs.evtTools.input.getCursorX");

  GetAllExpressions()["CursorY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY");
  // Deprecated
  GetAllExpressions()["MouseY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY");
  // Deprecated
  GetAllExpressions()["SourisY"].SetFunctionName(
      "gdjs.evtTools.input.getCursorY");

  GetAllExpressions()["MouseOnlyCursorX"].SetFunctionName(
      "gdjs.evtTools.input.getMouseOnlyCursorX");
  GetAllExpressions()["MouseOnlyCursorY"].SetFunctionName(
      "gdjs.evtTools.input.getMouseOnlyCursorY");

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
  
  // Deprecated
  GetAllConditions()["HasAnyTouchStarted"].SetFunctionName(
      "gdjs.evtTools.input.hasAnyTouchStarted");
  // Deprecated
  GetAllExpressions()["StartedTouchCount"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchCount");
  // Deprecated
  GetAllExpressions()["StartedTouchId"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchIdentifier");

  GetAllConditions()["HasAnyTouchOrMouseStarted"].SetFunctionName(
      "gdjs.evtTools.input.hasAnyTouchOrMouseStarted");
  GetAllExpressions()["StartedTouchOrMouseCount"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchOrMouseCount");
  GetAllExpressions()["StartedTouchOrMouseId"].SetFunctionName(
      "gdjs.evtTools.input.getStartedTouchOrMouseIdentifier");
  GetAllConditions()["HasTouchEnded"].SetFunctionName(
      "gdjs.evtTools.input.hasTouchEnded");

  GetAllExpressions()["MouseWheelDelta"].SetFunctionName(
      "gdjs.evtTools.input.getMouseWheelDelta");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
