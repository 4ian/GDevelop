#include "GDCpp/BuiltinExtensions/FileExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/XmlFilesHelper.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/FileExtension.cpp"
#endif

FileExtension::FileExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsFileExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["GroupExists"].codeExtraInformation.SetFunctionName("GroupExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LoadFile"].codeExtraInformation.SetFunctionName("LoadFileInMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["UnloadFile"].codeExtraInformation.SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["EcrireFichierExp"].codeExtraInformation.SetFunctionName("WriteValueInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["EcrireFichierTxt"].codeExtraInformation.SetFunctionName("WriteStringInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LireFichierExp"].codeExtraInformation.SetFunctionName("ReadValueFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LireFichierTxt"].codeExtraInformation.SetFunctionName("ReadStringFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["DeleteGroupFichier"].codeExtraInformation.SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["DeleteFichier"].codeExtraInformation.SetFunctionName("GDDeleteFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllConditions()["FileExists"].codeExtraInformation.SetFunctionName("FileExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LaunchFile"].codeExtraInformation.SetFunctionName("LaunchFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["ExecuteCmd"].codeExtraInformation.SetFunctionName("ExecuteCmd").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    #endif
}

#if defined(GD_IDE_ONLY)
void FileExtension::GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const
{
    const std::map < std::string, std::shared_ptr<XmlFile> > & openedFiles = XmlFilesManager::GetOpenedFilesList();

    unsigned int i = 0;
    std::map < std::string, std::shared_ptr<XmlFile> >::const_iterator end = openedFiles.end();
    for (std::map < std::string, std::shared_ptr<XmlFile> >::const_iterator iter = openedFiles.begin();iter != end;++iter)
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

