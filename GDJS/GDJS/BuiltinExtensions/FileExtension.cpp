#include "FileExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

FileExtension::FileExtension()
{
    SetExtensionInformation("BuiltinFile",
                          _("Files"),
                          _("Built-in extension providing functions for manipulation files."),
                          "Compil Games",
                          "Freeware");

    CloneExtension("Game Develop C++ platform", "BuiltinFile");

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
        .codeExtraInformation.SetFunctionName("FileExists").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");



    AddCondition("GroupExists",
                   _("Existence of a group"),
                   _("Test if a group ( Example : Root/Level/3 ) exists in the file.\nWarning ! Spaces are forbidden in group's names."),
                   _("The group _PARAM1_ exists in file _PARAM0_"),
                   _("XML Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", _("Filename"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .codeExtraInformation.SetFunctionName("GroupExists").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");



    AddAction("LoadFile",
                   _("Load a XML file in memory"),
                   _("This action load the xml file in memory, so as to write and read it.\nYou can open and write without using this action, but it will be slower.\nIf you use this action, do not forget to unload the file from memory."),
                   _("Load XML File _PARAM0_ in memory"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .codeExtraInformation.SetFunctionName("LoadFileInMemory").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("UnloadFile",
                   _("Close a XML file loaded in memory"),
                   _("This action close the XML file previously loaded in memory, saving all changes made."),
                   _("Close XML File _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .codeExtraInformation.SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("EcrireFichierExp",
                   _("Write a value"),
                   _("This action write the result of the expression in the file, in the specified group.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in group's names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddParameter("expression", _("Expression"), "",false)
        .codeExtraInformation.SetFunctionName("WriteValueInFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("EcrireFichierTxt",
                   _("Write a text"),
                   _("This action write the text in the file, in the specified group.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in group's names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddParameter("string", _("Text"), "",false)
        .codeExtraInformation.SetFunctionName("WriteStringInFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("LireFichierExp",
                   _("Read a value"),
                   _("This action read the value saved in the specified group and\nsave it in a variable.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)^nWarning ! Spaces are forbidden in group's names."),
                   _("Read group _PARAM1_ from file _PARAM0_ and save value in _PARAM3_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"), "",false)
        .codeExtraInformation.SetFunctionName("ReadValueFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("LireFichierTxt",
                   _("Read a text"),
                   _("This action read the text saved in the specified group and\nsave it in a variable.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)^nWarning ! Spaces are forbidden in group's names."),
                   _("Read group _PARAM1_ from file _PARAM0_ and save text in _PARAM3_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"), "",false)
        .codeExtraInformation.SetFunctionName("ReadStringFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("DeleteFichier",
                   _("Delete a file"),
                   _("Delete the file."),
                   _("Delete the file _PARAM0_"),
                   _("Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("GDDeleteFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("DeleteGroupFichier",
                   _("Delete a group"),
                   _("This action delete the specified group from the XML file.\nIndicate the structure leading to the group by separing elements with / (Example : Root/Level/Current)"),
                   _("Delete the group _PARAM1_ from the file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .codeExtraInformation.SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("LaunchFile",
                   _("Launch a file"),
                   _("This action launch the specified file."),
                   _("Launch the file _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("file", _("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("LaunchFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    AddAction("ExecuteCmd",
                   _("Execute a command"),
                   _("This action execute the specified command."),
                   _("Execute _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", _("Command"), "",false)
        .codeExtraInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");
    */
}
