/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
                          GD_T("Storage and files"),
                          GD_T("Built-in extension providing functions to store data and manipulate files."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("GroupExists",
                   GD_T("Existence of a group"),
                   GD_T("Test if an element ( Example : PlayerState/CurrentLevel ) exists in the file.\nWarning! Spaces are forbidden in element's names."),
                   GD_T("_PARAM1_ exists in file _PARAM0_"),
                   GD_T("Storage"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", GD_T("Filename"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("LoadFile",
                   GD_T("Load a structured file in memory"),
                   GD_T("This action load the structured file in memory, so as to write and read it.\nYou can open and write without using this action, but it will be slower.\nIf you use this action, do not forget to unload the file from memory.\n\nFor the native platform, the file format is XML."),
                   GD_T("Load structured file _PARAM0_ in memory"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("UnloadFile",
                   GD_T("Close a structured file"),
                   GD_T("This action close the structured file previously loaded in memory, saving all changes made."),
                   GD_T("Close structured file _PARAM0_"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("EcrireFichierExp",
                   GD_T("Write a value"),
                   GD_T("Write the result of the expression in the file, in the specified element.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   GD_T("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .AddParameter("expression", GD_T("Expression"), "",false);

    extension.AddAction("EcrireFichierTxt",
                   GD_T("Write a text"),
                   GD_T("Write the text in the file, in the specified element.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   GD_T("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .AddParameter("string", GD_T("Text"), "",false);

    extension.AddAction("LireFichierExp",
                   GD_T("Read a value"),
                   GD_T("Read the value saved in the specified element and\nstore it in a variable.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   GD_T("Read _PARAM1_ from file _PARAM0_ and store value in _PARAM3_"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", GD_T("Scene variables"), "",false);

    extension.AddAction("LireFichierTxt",
                   GD_T("Read a text"),
                   GD_T("Read the text saved in the specified element and\nstore it in a variable.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   GD_T("Read _PARAM1_ from file _PARAM0_ and store as text in _PARAM3_"),
                   GD_T("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", GD_T("File"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", GD_T("Scene variables"), "",false);

    extension.AddAction("DeleteGroupFichier",
                   GD_T("Delete an element"),
                   GD_T("This action delete the specified element from the structured file.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   GD_T("Delete _PARAM1_ from the file _PARAM0_"),
                   GD_T("Storage"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", GD_T("Filename"), "",false)
        .AddParameter("string", GD_T("Group"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("DeleteFichier",
                   GD_T("Delete a file"),
                   GD_T("Delete the file."),
                   GD_T("Delete the file _PARAM0_"),
                   GD_T("Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", GD_T("Filename"), "",false);

    extension.AddCondition("FileExists",
                   GD_T("A file exists"),
                   GD_T("Test if the file exists."),
                   GD_T("File _PARAM0_ exists"),
                   GD_T("Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", GD_T("Filename"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("LaunchFile",
                   GD_T("Open an URL or a file"),
                   GD_T("This action launch the specified file or URL, in a browser (or in a new tab if the game is using the Web platform and is launched inside a browser)."),
                   GD_T("Open URL (or file) _PARAM0_"),
                   GD_T("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", GD_T("URL (or filename)"), "",false)
        .MarkAsAdvanced();

    extension.AddAction("ExecuteCmd",
                   GD_T("Execute a command"),
                   GD_T("This action execute the specified command."),
                   GD_T("Execute _PARAM0_"),
                   GD_T("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png")
        .AddParameter("string", GD_T("Command"), "",false)
        .MarkAsAdvanced();
    #endif
}

}
