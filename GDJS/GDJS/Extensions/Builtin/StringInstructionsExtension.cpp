/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "StringInstructionsExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

StringInstructionsExtension::StringInstructionsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(
      *this);

  GetAllStrExpressions()["NewLine"].SetFunctionName(
      "gdjs.evtTools.string.newLine");
  GetAllStrExpressions()["FromCodePoint"].SetFunctionName(
      "gdjs.evtTools.string.fromCodePoint");
  GetAllStrExpressions()["ToUpperCase"].SetFunctionName(
      "gdjs.evtTools.string.toUpperCase");
  GetAllStrExpressions()["ToLowerCase"].SetFunctionName(
      "gdjs.evtTools.string.toLowerCase");
  GetAllStrExpressions()["SubStr"].SetFunctionName(
      "gdjs.evtTools.string.subStr");
  GetAllStrExpressions()["StrAt"].SetFunctionName("gdjs.evtTools.string.strAt");
  GetAllStrExpressions()["StrRepeat"].SetFunctionName(
      "gdjs.evtTools.string.strRepeat");
  GetAllExpressions()["StrLength"].SetFunctionName(
      "gdjs.evtTools.string.strLen");
  GetAllExpressions()["StrFind"].SetFunctionName(
      "gdjs.evtTools.string.strFind");
  GetAllExpressions()["StrRFind"].SetFunctionName(
      "gdjs.evtTools.string.strFindLast");
  GetAllExpressions()["StrFindLast"].SetFunctionName(
      "gdjs.evtTools.string.strFindLast");
  GetAllExpressions()["StrFindFrom"].SetFunctionName(
      "gdjs.evtTools.string.strFindFrom");
  GetAllExpressions()["StrRFindFrom"].SetFunctionName(
      "gdjs.evtTools.string.strFindLastFrom");
  GetAllExpressions()["StrFindLastFrom"].SetFunctionName(
      "gdjs.evtTools.string.strFindLastFrom");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
