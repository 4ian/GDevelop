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
void FileExtension::GetPropertyForDebugger(RuntimeScene & scene, std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    const std::map < gd::String, std::shared_ptr<XmlFile> > & openedFiles = XmlFilesManager::GetOpenedFilesList();

    std::size_t i = 0;
    std::map < gd::String, std::shared_ptr<XmlFile> >::const_iterator end = openedFiles.end();
    for (std::map < gd::String, std::shared_ptr<XmlFile> >::const_iterator iter = openedFiles.begin();iter != end;++iter)
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

bool FileExtension::ChangeProperty(RuntimeScene & scene, std::size_t propertyNb, gd::String newValue)
{
    return false;
}

std::size_t FileExtension::GetNumberOfProperties(RuntimeScene & scene) const
{
    return XmlFilesManager::GetOpenedFilesList().size();
}
#endif
