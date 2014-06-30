/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "FileExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

FileExtension::FileExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsFileExtension(*this);

    SetExtensionInformation("BuiltinFile",
                          _("Files"),
                          _("Built-in extension providing functions for storing data."),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllActions()["LoadFile"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.loadJSONFileFromStorage");
    GetAllConditions()["GroupExists"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.elementExistsInJSONFile");
    GetAllActions()["UnloadFile"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.unloadJSONFile");
    GetAllActions()["EcrireFichierExp"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.writeNumberInJSONFile");
    GetAllActions()["EcrireFichierTxt"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.writeStringInJSONFile");
    GetAllActions()["LireFichierExp"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.readNumberFromJSONFile");
    GetAllActions()["LireFichierTxt"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.readStringFromJSONFile");
    GetAllActions()["DeleteGroupFichier"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.deleteElementFromJSONFile");
    GetAllActions()["DeleteFichier"].SetGroup(_("Storage"))
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.clearJSONFile");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddCondition("FileExists",
                   _("A file exists"),
                   _("Test if the file exists."),
                   _("The file _PARAM0_ exists"),
                   _("Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", _("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("FileExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("LaunchFile",
                   _("Launch a file"),
                   _("This action launch the specified file."),
                   _("Launch the file _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("file", _("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("LaunchFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("ExecuteCmd",
                   _("Execute a command"),
                   _("This action execute the specified command."),
                   _("Execute _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", _("Command"), "",false)
        .codeExtraInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    */
}

}
