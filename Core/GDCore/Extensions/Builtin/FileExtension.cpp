/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsFileExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinFile",
                          _("Storage and files"),
                          _("Built-in extension providing functions to store data and manipulate files."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("GroupExists",
                   _("Existence of a group"),
                   _("Check if an element (example : PlayerState/CurrentLevel) exists in the file.\nSpaces are forbidden in element names."),
                   _("_PARAM1_ exists in file _PARAM0_"),
                   _("Storage"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", _("Filename"))
        .AddParameter("string", _("Group"))
        .MarkAsAdvanced();

    extension.AddAction("LoadFile",
                   _("Load a structured file in memory"),
                   _("This action loads the structured file in memory, so you can write and read it.\nYou can open and write without using this action, but it will be slower.\nIf you use this action, do not forget to unload the file from memory.\n\nFor the native platform, the file format is XML."),
                   _("Load structured file _PARAM0_ in memory"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .MarkAsAdvanced();

    extension.AddAction("UnloadFile",
                   _("Close a structured file"),
                   _("This action closes the structured file previously loaded in memory, saving all changes made."),
                   _("Close structured file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .MarkAsAdvanced();

    extension.AddAction("EcrireFichierExp",
                   _("Write a value"),
                   _("Write the result of the expression in the file, in the specified element.\nSpecify the structure leading to the element using / (example : Root/Level/Current)\nSpaces are forbidden in element names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Group"))
        .AddParameter("expression", _("Expression"));

    extension.AddAction("EcrireFichierTxt",
                   _("Write a text"),
                   _("Write the text in the file, in the specified element.\nSpecify the structure leading to the element using / (example : Root/Level/Current)\nSpaces are forbidden in element names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Group"))
        .AddParameter("string", _("Text"));

    extension.AddAction("LireFichierExp",
                   _("Read a value"),
                   _("Read the value saved in the specified element and store it in a variable.\nSpecify the structure leading to the element using / (example : Root/Level/Current)\nSpaces are forbidden in element names."),
                   _("Read _PARAM1_ from file _PARAM0_ and store value in _PARAM3_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Group"))
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"));

    extension.AddAction("LireFichierTxt",
                   _("Read a text"),
                   _("Read the text saved in the specified element and store it in a variable.\nSpecify the structure leading to the element using / (example : Root/Level/Current)\nSpaces are forbidden in element names."),
                   _("Read _PARAM1_ from file _PARAM0_ and store as text in _PARAM3_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"))
        .AddParameter("string", _("Group"))
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"));

    extension.AddAction("DeleteGroupFichier",
                   _("Delete an element"),
                   _("This action deletes the specified element from the structured file.\nSpecify the structure leading to the element using / (example : Root/Level/Current)\nSpaces are forbidden in element names."),
                   _("Delete _PARAM1_ from the file _PARAM0_"),
                   _("Storage"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"))
        .AddParameter("string", _("Group"))
        .MarkAsAdvanced();

    extension.AddAction("DeleteFichier",
                   _("Delete a file"),
                   _("Delete the file."),
                   _("Delete the file _PARAM0_"),
                   _("Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"));

    extension.AddCondition("FileExists",
                   _("A file exists"),
                   _("Test if the file exists."),
                   _("File _PARAM0_ exists"),
                   _("Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", _("Filename"))
        .MarkAsAdvanced();

    extension.AddAction("LaunchFile",
                   _("Open a URL or a file"),
                   _("This action launches the specified file or URL, in a browser (or in a new tab if the game is using the Web platform and is launched inside a browser)."),
                   _("Open URL (or file) _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", _("URL (or filename)"))
        .MarkAsAdvanced();

    extension.AddAction("ExecuteCmd",
                   _("Execute a command"),
                   _("This action executes the specified command."),
                   _("Execute _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", _("Command"))
        .MarkAsAdvanced();
    #endif
}

}
