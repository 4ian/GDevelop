#include "GDCpp/BuiltinExtensions/FileExtension.h"
#include "GDCpp/XmlFilesHelper.h"

FileExtension::FileExtension()
{
    SetExtensionInformation("BuiltinFile",
                          _("Storage and files"),
                          _("Built-in extension providing functions to store data and manipulate files."),
                          "Florian Rival",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddCondition("GroupExists",
                   _("Existence of a group"),
                   _("Test if an element ( Example : PlayerState/CurrentLevel ) exists in the file.\nWarning! Spaces are forbidden in element's names."),
                   _("_PARAM1_ exists in file _PARAM0_"),
                   _("Storage"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png")
        .AddParameter("file", _("Filename"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .codeExtraInformation.SetFunctionName("GroupExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("LoadFile",
                   _("Load a structured file in memory"),
                   _("This action load the structured file in memory, so as to write and read it.\nYou can open and write without using this action, but it will be slower.\nIf you use this action, do not forget to unload the file from memory.\n\nFor the native platform, the file format is XML."),
                   _("Load structured file _PARAM0_ in memory"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .codeExtraInformation.SetFunctionName("LoadFileInMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("UnloadFile",
                   _("Close a structured file"),
                   _("This action close the structured file previously loaded in memory, saving all changes made."),
                   _("Close structured file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .codeExtraInformation.SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("EcrireFichierExp",
                   _("Write a value"),
                   _("Write the result of the expression in the file, in the specified element.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddParameter("expression", _("Expression"), "",false)
        .codeExtraInformation.SetFunctionName("WriteValueInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("EcrireFichierTxt",
                   _("Write a text"),
                   _("Write the text in the file, in the specified element.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddParameter("string", _("Text"), "",false)
        .codeExtraInformation.SetFunctionName("WriteStringInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("LireFichierExp",
                   _("Read a value"),
                   _("Read the value saved in the specified element and\nstore it in a variable.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   _("Read _PARAM1_ from file _PARAM0_ and store value in _PARAM3_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"), "",false)
        .codeExtraInformation.SetFunctionName("ReadValueFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("LireFichierTxt",
                   _("Read a text"),
                   _("ead the text saved in the specified element and\nstore it in a variable.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   _("Read _PARAM1_ from file _PARAM0_ and store as text in _PARAM3_"),
                   _("Storage"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png")
        .AddParameter("file", _("File"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("scenevar", _("Scene variables"), "",false)
        .codeExtraInformation.SetFunctionName("ReadStringFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("DeleteGroupFichier",
                   _("Delete an element"),
                   _("This action delete the specified element from the structured file.\nSpecify the structure leading to the element using / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in elements' names."),
                   _("Delete _PARAM1_ from the file _PARAM0_"),
                   _("Storage"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"), "",false)
        .AddParameter("string", _("Group"), "",false)
        .codeExtraInformation.SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

    AddAction("DeleteFichier",
                   _("Delete a file"),
                   _("Delete the file."),
                   _("Delete the file _PARAM0_"),
                   _("Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png")
        .AddParameter("file", _("Filename"), "",false)
        .codeExtraInformation.SetFunctionName("GDDeleteFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");

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
    #endif
}

#if defined(GD_IDE_ONLY)
void FileExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    const std::map < std::string, boost::shared_ptr<XmlFile> > & openedFiles = XmlFilesManager::GetOpenedFilesList();

    unsigned int i = 0;
    std::map < std::string, boost::shared_ptr<XmlFile> >::const_iterator end = openedFiles.end();
    for (std::map < std::string, boost::shared_ptr<XmlFile> >::const_iterator iter = openedFiles.begin();iter != end;++iter)
    {
        if ( propertyNb == i )
        {
            name = _("Opened file:");
            value = iter->first;

            return;
        }

        ++i;
    }
}

bool FileExtension::ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue)
{
    return false;
}

unsigned int FileExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return XmlFilesManager::GetOpenedFilesList().size();
}
#endif

