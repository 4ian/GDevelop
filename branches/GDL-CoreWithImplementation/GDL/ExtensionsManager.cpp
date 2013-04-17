/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <map>
#include <string>

#include "GDL/ExtensionsManager.h"
#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDL/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDL/BuiltinExtensions/CommonConversionsExtension.h"
#include "GDL/BuiltinExtensions/SceneExtension.h"
#include "GDL/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDL/BuiltinExtensions/MouseExtension.h"
#include "GDL/BuiltinExtensions/TimeExtension.h"
#include "GDL/BuiltinExtensions/VariablesExtension.h"
#include "GDL/BuiltinExtensions/SpriteExtension.h"
#include "GDL/BuiltinExtensions/MathematicalToolsExtension.h"
#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/BuiltinExtensions/KeyboardExtension.h"
#include "GDL/BuiltinExtensions/AudioExtension.h"
#include "GDL/BuiltinExtensions/CameraExtension.h"
#include "GDL/BuiltinExtensions/JoystickExtension.h"
#include "GDL/BuiltinExtensions/FileExtension.h"
#include "GDL/BuiltinExtensions/NetworkExtension.h"
#include "GDL/BuiltinExtensions/WindowExtension.h"
#include "GDL/BuiltinExtensions/ExternalLayoutsExtension.h"
#include "GDL/RuntimeObject.h"
#include "GDL/Object.h"
#include "GDL/IDE/CodeCompiler.h"

#if defined(GD_IDE_ONLY)
#include "GDL/Game.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif

ExtensionsManager *ExtensionsManager::_singleton = NULL;

/**
 * Initializing Extension Manager
 */
ExtensionsManager::ExtensionsManager()
{
    //Load all extensions
    AddExtension(boost::shared_ptr<ExtensionBase>(new BaseObjectExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new SpriteExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonConversionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new VariablesExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new MouseExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new KeyboardExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new JoystickExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new SceneExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new TimeExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new MathematicalToolsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CameraExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AudioExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new FileExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new NetworkExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new WindowExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new StringInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AdvancedExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new ExternalLayoutsExtension()));
}

////////////////////////////////////////////////////////////
/// Ajouter une extension au manager
////////////////////////////////////////////////////////////
bool ExtensionsManager::AddExtension(boost::shared_ptr<ExtensionBase> extension)
{
    cout << "New extension added to manager : " << extension->GetName() << endl;
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == extension->GetName() )
    	    return false;
    }

    //Load all objects provided by the extension
    vector < string > objectsTypes = extension->GetExtensionObjectsTypes();
    for ( unsigned int i = 0; i < objectsTypes.size();++i)
    {
        //Adding creations and destruction functions
        creationFunctionTable[objectsTypes[i]] = extension->GetObjectCreationFunctionPtr(objectsTypes[i]);
        destroyFunctionTable[objectsTypes[i]] = extension->GetDestroyObjectFunction(objectsTypes[i]);
        runtimeObjCreationFunctionTable[objectsTypes[i]] = extension->GetRuntimeObjectCreationFunctionPtr(objectsTypes[i]);
        runtimeObjDestroyFunctionTable[objectsTypes[i]] = extension->GetDestroyRuntimeObjectFunction(objectsTypes[i]);
    }

    #if defined(GD_IDE_ONLY)
    //Add include directories
    for (unsigned int i = 0;i<extension->GetSupplementaryIncludeDirectories().size();++i)
        CodeCompiler::GetInstance()->AddHeaderDirectory(extension->GetSupplementaryIncludeDirectories()[i]);
    #endif

    extensionsLoaded.push_back(extension);
    return true;
}

////////////////////////////////////////////////////////////
/// Une extension est elle chargée ?
/// -> Vérifie si elle est dans la liste des extensions
////////////////////////////////////////////////////////////
bool ExtensionsManager::IsExtensionLoaded(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Renvoie l'extension voulue, si chargée
////////////////////////////////////////////////////////////
boost::shared_ptr<ExtensionBase> ExtensionsManager::GetExtension(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return extensionsLoaded[i];
    }

    return boost::shared_ptr<ExtensionBase> ();
}

#if defined(GD_IDE_ONLY)
bool ExtensionsManager::HasEventType(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateEvent(eventType) != boost::shared_ptr<gd::BaseEvent>() )
            return true;
    }

    return false;
}

boost::shared_ptr<gd::BaseEvent> ExtensionsManager::CreateEvent(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<gd::BaseEvent> event = extensionsLoaded[i]->CreateEvent(eventType);
        if ( event != boost::shared_ptr<gd::BaseEvent>() )
            return event;
    }

    return boost::shared_ptr<gd::BaseEvent>();
}

bool ExtensionsManager::HasAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateAutomatism(automatismType) != NULL )
            return true;
    }

    return false;
}
#endif

boost::shared_ptr<RuntimeObject> ExtensionsManager::CreateRuntimeObject(RuntimeScene & scene, gd::Object & object)
{
    const std::string & type = object.GetType();

    if ( runtimeObjCreationFunctionTable.find(type) == runtimeObjCreationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << std::endl;
        return boost::shared_ptr<RuntimeObject> ();
    }

    //Create a new object with the type we want.
    RuntimeObject * newObject = runtimeObjCreationFunctionTable[type](scene, object);
    return boost::shared_ptr<RuntimeObject> (newObject, runtimeObjDestroyFunctionTable[type]);
}

boost::shared_ptr<gd::Object> ExtensionsManager::CreateObject(std::string type, std::string name)
{
    if ( creationFunctionTable.find(type) == creationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << std::endl;
        type = "";
    }

    //Create a new object with the type we want.
    gd::Object * object = creationFunctionTable[type](name);
    object->SetType(type);

    return boost::shared_ptr<gd::Object> (object, destroyFunctionTable[type]);
}

Automatism* ExtensionsManager::CreateAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        Automatism* automatism = extensionsLoaded[i]->CreateAutomatism(automatismType);
        if ( automatism != NULL )
            return automatism;
    }

    return NULL;
}

boost::shared_ptr<gd::AutomatismsSharedData> ExtensionsManager::CreateAutomatismSharedDatas(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<gd::AutomatismsSharedData> automatism = extensionsLoaded[i]->CreateAutomatismSharedDatas(automatismType);
        if ( automatism != boost::shared_ptr<gd::AutomatismsSharedData>() )
            return automatism;
    }

    return boost::shared_ptr<gd::AutomatismsSharedData>();
}
