#include "GDCpp/Extensions/Builtin/FileExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/XmlFilesHelper.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/FileExtension.cpp"
#endif

FileExtension::FileExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsFileExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["GroupExists"].SetFunctionName("GroupExists").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["LoadFile"].SetFunctionName("LoadFileInMemory").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["UnloadFile"].SetFunctionName("UnloadFileFromMemory").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["EcrireFichierExp"].SetFunctionName("WriteValueInFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["EcrireFichierTxt"].SetFunctionName("WriteStringInFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["LireFichierExp"].SetFunctionName("ReadValueFromFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["LireFichierTxt"].SetFunctionName("ReadStringFromFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["DeleteGroupFichier"].SetFunctionName("DeleteGroupFromFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["DeleteFichier"].SetFunctionName("GDDeleteFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllConditions()["FileExists"].SetFunctionName("FileExists").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["LaunchFile"].SetFunctionName("LaunchFile").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
    GetAllActions()["ExecuteCmd"].SetFunctionName("ExecuteCmd").SetIncludeFile("GDCpp/Extensions/Builtin/FileTools.h");
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
