/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <string>
#include <vector>
#include "GDCpp/Extensions/CppPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCpp/IDE/Exporter.h"
#include "GDCpp/IDE/AndroidExporter.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/SoundManager.h"
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCpp/IDE/ChangesNotifier.h"
#include "GDCpp/IDE/Dialogs/CppLayoutPreviewer.h"

//Builtin extensions
#include "GDCpp/Extensions/Builtin/BaseObjectExtension.h"
#include "GDCpp/Extensions/Builtin/CommonInstructionsExtension.h"
#include "GDCpp/Extensions/Builtin/CommonConversionsExtension.h"
#include "GDCpp/Extensions/Builtin/SceneExtension.h"
#include "GDCpp/Extensions/Builtin/StringInstructionsExtension.h"
#include "GDCpp/Extensions/Builtin/MouseExtension.h"
#include "GDCpp/Extensions/Builtin/TimeExtension.h"
#include "GDCpp/Extensions/Builtin/VariablesExtension.h"
#include "GDCpp/Extensions/Builtin/SpriteExtension.h"
#include "GDCpp/Extensions/Builtin/MathematicalToolsExtension.h"
#include "GDCpp/Extensions/Builtin/AdvancedExtension.h"
#include "GDCpp/Extensions/Builtin/KeyboardExtension.h"
#include "GDCpp/Extensions/Builtin/AudioExtension.h"
#include "GDCpp/Extensions/Builtin/CameraExtension.h"
#include "GDCpp/Extensions/Builtin/JoystickExtension.h"
#include "GDCpp/Extensions/Builtin/FileExtension.h"
#include "GDCpp/Extensions/Builtin/NetworkExtension.h"
#include "GDCpp/Extensions/Builtin/WindowExtension.h"
#include "GDCpp/Extensions/Builtin/ExternalLayoutsExtension.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/CommonTools.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/config.h>
#include <wx/filename.h>
#endif

CppPlatform *CppPlatform::singleton = NULL;

#if defined(GD_IDE_ONLY)
ChangesNotifier CppPlatform::changesNotifier;
#endif

CppPlatform::CppPlatform() :
    gd::Platform()
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    //Events compiler setup
    cout << "* Setting up events compiler..." << endl;
    CodeCompiler::Get()->SetBaseDirectory(wxGetCwd());
    wxString eventsCompilerTempDir;
    if ( wxConfigBase::Get()->Read("/Dossier/EventsCompilerTempDir", &eventsCompilerTempDir) && !eventsCompilerTempDir.empty() )
        CodeCompiler::Get()->SetOutputDirectory(eventsCompilerTempDir);
    else
        CodeCompiler::Get()->SetOutputDirectory(wxFileName::GetTempDir()+"/GDTemporaries");
    int eventsCompilerMaxThread = 0;
    if ( wxConfigBase::Get()->Read("/CodeCompiler/MaxThread", &eventsCompilerMaxThread, 0) && eventsCompilerMaxThread >= 0 )
        CodeCompiler::Get()->AllowMultithread(eventsCompilerMaxThread > 1, eventsCompilerMaxThread);
    else
        CodeCompiler::Get()->AllowMultithread(false);

    cout << "* Loading events code compiler configuration" << endl;
    bool deleteTemporaries;
    if ( wxConfigBase::Get()->Read( _T( "/Dossier/EventsCompilerDeleteTemp" ), &deleteTemporaries, true) )
        CodeCompiler::Get()->SetMustDeleteTemporaries(deleteTemporaries);
#endif

    std::cout << "* Loading builtin extensions... "; std::cout.flush();
    AddExtension(std::make_shared<BaseObjectExtension>()); std::cout.flush();
    AddExtension(std::make_shared<SpriteExtension>()); std::cout.flush();
    AddExtension(std::make_shared<CommonInstructionsExtension>()); std::cout.flush();
    AddExtension(std::make_shared<CommonConversionsExtension>()); std::cout.flush();
    AddExtension(std::make_shared<VariablesExtension>()); std::cout.flush();
    AddExtension(std::make_shared<MouseExtension>()); std::cout.flush();
    AddExtension(std::make_shared<KeyboardExtension>()); std::cout.flush();
    AddExtension(std::make_shared<JoystickExtension>()); std::cout.flush();
    AddExtension(std::make_shared<SceneExtension>()); std::cout.flush();
    AddExtension(std::make_shared<TimeExtension>()); std::cout.flush();
    AddExtension(std::make_shared<MathematicalToolsExtension>()); std::cout.flush();
    AddExtension(std::make_shared<CameraExtension>()); std::cout.flush();
    AddExtension(std::make_shared<AudioExtension>()); std::cout.flush();
    AddExtension(std::make_shared<FileExtension>()); std::cout.flush();
    AddExtension(std::make_shared<NetworkExtension>()); std::cout.flush();
    AddExtension(std::make_shared<WindowExtension>()); std::cout.flush();
    AddExtension(std::make_shared<StringInstructionsExtension>()); std::cout.flush();
    AddExtension(std::make_shared<AdvancedExtension>()); std::cout.flush();
    AddExtension(std::make_shared<ExternalLayoutsExtension>()); std::cout.flush();
    std::cout << "done." << std::endl;
}

bool CppPlatform::AddExtension(std::shared_ptr<gd::PlatformExtension> platformExtension)
{
    std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(platformExtension);
    if (extension == std::shared_ptr<ExtensionBase>())
    {
        std::cout << "ERROR: Tried to add an incompatible extension to C++ Platform" << std::endl;
        return false;
    }

    //First add normally the extension
    if (!gd::Platform::AddExtension(extension)) return false;

    //Then Load all runtime objects provided by the extension
    std::vector < gd::String > objectsTypes = extension->GetExtensionObjectsTypes();
    for ( std::size_t i = 0; i < objectsTypes.size();++i)
    {
        runtimeObjCreationFunctionTable[objectsTypes[i]] = extension->GetRuntimeObjectCreationFunctionPtr(objectsTypes[i]);
    }

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    //And Add include directories
    for (std::size_t i = 0;i<extension->GetSupplementaryIncludeDirectories().size();++i)
        CodeCompiler::Get()->AddHeaderDirectory(extension->GetSupplementaryIncludeDirectories()[i]);
    #endif
    return true;
}

std::unique_ptr<RuntimeObject> CppPlatform::CreateRuntimeObject(RuntimeScene & scene, gd::Object & object)
{
    const gd::String & type = object.GetType();

    if ( runtimeObjCreationFunctionTable.find(type) == runtimeObjCreationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << std::endl;
        return std::unique_ptr<RuntimeObject>();
    }

    //Create a new object with the type we want.
    return runtimeObjCreationFunctionTable[type](scene, object);
}

#if defined(GD_IDE_ONLY)
gd::String CppPlatform::GetDescription() const
{
    return _("Allows you to create 2D games that can be compiled and played on Windows or Linux.");
}

#if !defined(GD_NO_WX_GUI)
std::shared_ptr<gd::LayoutEditorPreviewer> CppPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return std::make_shared<CppLayoutPreviewer>(editor);
}

std::vector<std::shared_ptr<gd::ProjectExporter>> CppPlatform::GetProjectExporters() const
{
    return std::vector<std::shared_ptr<gd::ProjectExporter>>{
        std::make_shared<Exporter>(),
        std::make_shared<AndroidExporter>(gd::NativeFileSystem::Get())
    };
}
#endif

void CppPlatform::OnIDEClosed()
{
#if !defined(GD_NO_WX_GUI)
    if ( CodeCompiler::Get()->MustDeleteTemporaries() )
        CodeCompiler::Get()->ClearOutputDirectory();
#endif

    FontManager::Get()->DestroySingleton();
}
#endif

CppPlatform & CppPlatform::Get()
{
    if ( !singleton ) singleton = new CppPlatform;

    return *singleton;
}

void CppPlatform::DestroySingleton()
{
    if ( singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}

#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Platform.cpp"
#endif

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the platform class
 */
extern "C" gd::Platform * GD_API CreateGDPlatform() {
    return &CppPlatform::Get();
}

/**
 * Used by GDevelop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform() {
    CppPlatform::DestroySingleton();
}
#endif
