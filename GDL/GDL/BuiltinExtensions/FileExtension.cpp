#include "GDL/BuiltinExtensions/FileExtension.h"
#include "GDL/XmlFilesHelper.h"

FileExtension::FileExtension()
{
    DECLARE_THE_EXTENSION("BuiltinFile",
                          _("Files"),
                          _("Builtin extension providing actions and conditions on files."),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("FileExists",
                   _("A file exists"),
                   _("Test if the file exists."),
                   _("The file _PARAM0_ exists"),
                   _("Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddParameter("file", _("Filename"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("FileExists").SetIncludeFile("GDL/BuiltinExtensions/AudioTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("GroupExists",
                   _("Existence of a group"),
                   _("Test if a group ( Example : Root/Level/3 ) exists in the file.\nWarning ! Spaces are forbidden in group's names."),
                   _("The group _PARAM1_ exists in file _PARAM0_"),
                   _("XML Files"),
                   "res/conditions/fichier24.png",
                   "res/conditions/fichier.png");

        instrInfo.AddParameter("file", _("Filename"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GroupExists").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("LoadFile",
                   _("Load a XML file in memory"),
                   _("This action load the xml file in memory, so as to write and read it.\nYou can open and write without using this action, but it will be slower.\nIf you use this action, do not forget to unload the file from memory."),
                   _("Load XML File _PARAM0_ in memory"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("LoadFileInMemory").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("UnloadFile",
                   _("Close a XML file loaded in memory"),
                   _("This action close the XML file previously loaded in memory, saving all changes made."),
                   _("Close XML File _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierExp",
                   _("Write a value"),
                   _("This action write the result of the expression in the file, in the specified group.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in group's names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);
        instrInfo.AddParameter("expression", _("Expression"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("WriteValueInFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("EcrireFichierTxt",
                   _("Write a text"),
                   _("This action write the text in the file, in the specified group.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)\nWarning ! Spaces are forbidden in group's names."),
                   _("Write _PARAM2_ in _PARAM1_ of file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);
        instrInfo.AddParameter("string", _("Text"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("WriteStringInFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierExp",
                   _("Read a value"),
                   _("This action read the value saved in the specified group and\nsave it in a variable.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)^nWarning ! Spaces are forbidden in group's names."),
                   _("Read group _PARAM1_ from file _PARAM0_ and save value in _PARAM3_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Scene variables"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ReadValueFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LireFichierTxt",
                   _("Read a text"),
                   _("This action read the text saved in the specified group and\nsave it in a variable.\nIndicate the structure leading to the group by separing elements with / ( Example : Root/Level/Current)^nWarning ! Spaces are forbidden in group's names."),
                   _("Read group _PARAM1_ from file _PARAM0_ and save text in _PARAM3_"),
                   _("XML Files"),
                   "res/actions/fichier24.png",
                   "res/actions/fichier.png");

        instrInfo.AddParameter("file", _("File"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("scenevar", _("Scene variables"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ReadStringFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteFichier",
                   _("Delete a file"),
                   _("Delete the file."),
                   _("Delete the file _PARAM0_"),
                   _("Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png");

        instrInfo.AddParameter("file", _("Filename"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDDeleteFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteGroupFichier",
                   _("Delete a group"),
                   _("This action delete the specified group from the XML file.\nIndicate the structure leading to the group by separing elements with / (Example : Root/Level/Current)"),
                   _("Delete the group _PARAM1_ from the file _PARAM0_"),
                   _("XML Files"),
                   "res/actions/delete24.png",
                   "res/actions/delete.png");

        instrInfo.AddParameter("file", _("Filename"), "",false);
        instrInfo.AddParameter("string", _("Group"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("LaunchFile",
                   _("Launch a file"),
                   _("This action launch the specified file."),
                   _("Launch the file _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png");

        instrInfo.AddParameter("file", _("Filename"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("LaunchFile").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ExecuteCmd",
                   _("Execute a command"),
                   _("This action execute the specified command."),
                   _("Execute _PARAM0_"),
                   _("Files"),
                   "res/actions/launchFile24.png",
                   "res/actions/launchFile.png");

        instrInfo.AddParameter("string", _("Command"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDL/BuiltinExtensions/FileTools.h");

    DECLARE_END_ACTION()
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

