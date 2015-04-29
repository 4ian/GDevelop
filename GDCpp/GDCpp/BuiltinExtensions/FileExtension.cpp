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
    GetAllConditions()["GroupExists"].SetFunctionName("GroupExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LoadFile"].SetFunctionName("LoadFileInMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["UnloadFile"].SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["EcrireFichierExp"].SetFunctionName("WriteValueInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["EcrireFichierTxt"].SetFunctionName("WriteStringInFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LireFichierExp"].SetFunctionName("ReadValueFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LireFichierTxt"].SetFunctionName("ReadStringFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["DeleteGroupFichier"].SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["DeleteFichier"].SetFunctionName("GDDeleteFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllConditions()["FileExists"].SetFunctionName("FileExists").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["LaunchFile"].SetFunctionName("LaunchFile").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
    GetAllActions()["ExecuteCmd"].SetFunctionName("ExecuteCmd").SetIncludeFile("GDCpp/BuiltinExtensions/FileTools.h");
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

