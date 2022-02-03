/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "FileExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

FileExtension::FileExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsFileExtension(*this);

  GetAllActions()["LoadFile"].SetFunctionName(
      "gdjs.evtTools.storage.loadJSONFileFromStorage");
  GetAllConditions()["GroupExists"].SetFunctionName(
      "gdjs.evtTools.storage.elementExistsInJSONFile");
  GetAllActions()["UnloadFile"].SetFunctionName(
      "gdjs.evtTools.storage.unloadJSONFile");
  GetAllActions()["EcrireFichierExp"].SetFunctionName(
      "gdjs.evtTools.storage.writeNumberInJSONFile");
  GetAllActions()["EcrireFichierTxt"].SetFunctionName(
      "gdjs.evtTools.storage.writeStringInJSONFile");
  GetAllActions()["LireFichierExp"].SetFunctionName(
      "gdjs.evtTools.storage.readNumberFromJSONFile");
  GetAllActions()["LireFichierTxt"].SetFunctionName(
      "gdjs.evtTools.storage.readStringFromJSONFile");
  GetAllActions()["DeleteGroupFichier"].SetFunctionName(
      "gdjs.evtTools.storage.deleteElementFromJSONFile");
  GetAllActions()["DeleteFichier"]
      .SetGroup(_("Storage"))
      .SetFunctionName("gdjs.evtTools.storage.clearJSONFile");

  StripUnimplementedInstructionsAndExpressions();  // Unimplemented things are
                                                   // listed here:
  /*
  AddCondition("FileExists",
                 _("A file exists"),
                 _("Test if the file exists."),
                 _("The file _PARAM0_ exists"),
                 _("Files"),
                 "res/conditions/fichier24.png",
                 "res/conditions/fichier.png")
      .AddParameter("file", _("Filename"))
      .SetFunctionName("FileExists");

  AddAction("ExecuteCmd",
                 _("Execute a command"),
                 _("This action execute the specified command."),
                 _("Execute _PARAM0_"),
                 _("Files"),
                 "res/actions/launchFile24.png",
                 "res/actions/launchFile.png")
      .AddParameter("string", _("Command"))
      .SetFunctionName("ExecuteCmd");
  */
}

}  // namespace gdjs
