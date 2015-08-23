/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <string>
#include <vector>
#include "GDCpp/CppPlatform.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/IDE/Exporter.h"
#include "GDCpp/Project.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCpp/SoundManager.h"
#include "GDCpp/Behavior.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/IDE/CodeCompiler.h"
#include "GDCpp/IDE/ChangesNotifier.h"
#include "GDCpp/IDE/Dialogs/CppLayoutPreviewer.h"

//Builtin extensions
#include "GDCpp/BuiltinExtensions/BaseObjectExtension.h"
#include "GDCpp/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDCpp/BuiltinExtensions/CommonConversionsExtension.h"
#include "GDCpp/BuiltinExtensions/SceneExtension.h"
#include "GDCpp/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDCpp/BuiltinExtensions/MouseExtension.h"
#include "GDCpp/BuiltinExtensions/TimeExtension.h"
#include "GDCpp/BuiltinExtensions/VariablesExtension.h"
#include "GDCpp/BuiltinExtensions/SpriteExtension.h"
#include "GDCpp/BuiltinExtensions/MathematicalToolsExtension.h"
#include "GDCpp/BuiltinExtensions/AdvancedExtension.h"
#include "GDCpp/BuiltinExtensions/KeyboardExtension.h"
#include "GDCpp/BuiltinExtensions/AudioExtension.h"
#include "GDCpp/BuiltinExtensions/CameraExtension.h"
#include "GDCpp/BuiltinExtensions/JoystickExtension.h"
#include "GDCpp/BuiltinExtensions/FileExtension.h"
#include "GDCpp/BuiltinExtensions/NetworkExtension.h"
#include "GDCpp/BuiltinExtensions/WindowExtension.h"
#include "GDCpp/BuiltinExtensions/ExternalLayoutsExtension.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/Object.h"
#include "GDCpp/CommonTools.h"

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
    AddExtension(std::shared_ptr<ExtensionBase>(new BaseObjectExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new SpriteExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new CommonInstructionsExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new CommonConversionsExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new VariablesExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new MouseExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new KeyboardExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new JoystickExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new SceneExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new TimeExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new MathematicalToolsExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new CameraExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new AudioExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new FileExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new NetworkExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new WindowExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new StringInstructionsExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new AdvancedExtension())); std::cout.flush();
    AddExtension(std::shared_ptr<ExtensionBase>(new ExternalLayoutsExtension())); std::cout.flush();
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

std::shared_ptr<RuntimeObject> CppPlatform::CreateRuntimeObject(RuntimeScene & scene, gd::Object & object)
{
    const gd::String & type = object.GetType();

    if ( runtimeObjCreationFunctionTable.find(type) == runtimeObjCreationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << std::endl;
        return std::shared_ptr<RuntimeObject>();
    }

    //Create a new object with the type we want.
    RuntimeObject * newObject = runtimeObjCreationFunctionTable[type](scene, object);
    return std::shared_ptr<RuntimeObject>(newObject);
}

#if defined(GD_IDE_ONLY)
gd::String CppPlatform::GetDescription() const
{
    return _("Allows to create 2D games which can be compiled and played on Windows or Linux.");
}

#if !defined(GD_NO_WX_GUI)
std::shared_ptr<gd::LayoutEditorPreviewer> CppPlatform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return std::shared_ptr<gd::LayoutEditorPreviewer>(new CppLayoutPreviewer(editor));
}

std::shared_ptr<gd::ProjectExporter> CppPlatform::GetProjectExporter() const
{
    return std::shared_ptr<gd::ProjectExporter>(new Exporter);
}
#endif

void CppPlatform::OnIDEClosed()
{
#if !defined(GD_NO_WX_GUI)
    if ( CodeCompiler::Get()->MustDeleteTemporaries() )
        CodeCompiler::Get()->ClearOutputDirectory();
#endif

    SoundManager::Get()->DestroySingleton();
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
#include "GDCore/PlatformDefinition/Platform.cpp"
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
