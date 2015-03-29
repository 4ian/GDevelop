/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
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
                          GD_T("Files"),
                          GD_T("Built-in extension providing functions for storing data."),
                          "Florian Rival",
                          "Open source (MIT License)");

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
    GetAllActions()["DeleteFichier"].SetGroup(GD_T("Storage"))
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.storage.clearJSONFile");
    GetAllActions()["LaunchFile"]
        .codeExtraInformation.SetFunctionName("gdjs.evtTools.window.openURL");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddCondition("FileExists",
                   GD_T("A file exists"),
                   GD_T("Test if the file exists."),
                   GD_T("The file _PARAM0_ exists"),
                   GD_T("Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", GD_T("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("FileExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("ExecuteCmd",
                   GD_T("Execute a command"),
                   GD_T("This action execute the specified command."),
                   GD_T("Execute _PARAM0_"),
                   GD_T("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", GD_T("Command"), "",false)
        .codeExtraInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    */
}

}
