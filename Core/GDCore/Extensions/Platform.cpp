/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/ChangesNotifier.h"
#include "GDCore/IDE/ProjectExporter.h"
#include "GDCore/Project/Object.h"
#include "GDCore/String.h"

using namespace std;

#undef CreateEvent

namespace gd
{

#if defined(GD_IDE_ONLY)
gd::ChangesNotifier Platform::defaultEmptyChangesNotifier;
#endif

Platform::Platform()
{
    //ctor
}

Platform::~Platform()
{
    //dtor
}

bool Platform::AddExtension(std::shared_ptr<gd::PlatformExtension> extension)
{
    std::cout << extension->GetName();
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == extension->GetName() ) {
            std::cout << "(Already loaded!)" << std::endl;
    	    return false;
        }
    }

    //Load all creation/destruction functions for objects provided by the extension
    vector < gd::String > objectsTypes = extension->GetExtensionObjectsTypes();
    for ( std::size_t i = 0; i < objectsTypes.size();++i)
    {
        creationFunctionTable[objectsTypes[i]] = extension->GetObjectCreationFunctionPtr(objectsTypes[i]);
    }

    extensionsLoaded.push_back(extension);
    std::cout << ", ";
    return true;
}

bool Platform::IsExtensionLoaded(const gd::String & name) const
{
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return true;
    }

    return false;
}

std::shared_ptr<gd::PlatformExtension> Platform::GetExtension(const gd::String & name) const
{
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return extensionsLoaded[i];
    }

    return std::shared_ptr<gd::PlatformExtension> ();
}

std::unique_ptr<gd::Object> Platform::CreateObject(gd::String type, const gd::String & name) const
{
    if ( creationFunctionTable.find(type) == creationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << " for platform " << GetName() << "!" << std::endl;
        type = "";
        if ( creationFunctionTable.find("") == creationFunctionTable.end() ) {
            std::cout << "Unable to create a Base object!" << std::endl;
            return nullptr;
        }
    }

    //Create a new object with the type we want.
    std::unique_ptr<gd::Object> object = (creationFunctionTable.find(type)->second)(name);
    object->SetType(type);

    return std::unique_ptr<gd::Object>(std::move(object));
}

std::unique_ptr<gd::Behavior> Platform::CreateBehavior(const gd::String & behaviorType) const
{
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
        std::unique_ptr<gd::Behavior> behavior = extensionsLoaded[i]->CreateBehavior(behaviorType);
        if ( behavior )
            return behavior;
    }

    return nullptr;
}

std::shared_ptr<gd::BehaviorsSharedData> Platform::CreateBehaviorSharedDatas(const gd::String & behaviorType) const
{
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
        std::shared_ptr<gd::BehaviorsSharedData> behavior = extensionsLoaded[i]->CreateBehaviorSharedDatas(behaviorType);
        if ( behavior != std::shared_ptr<gd::BehaviorsSharedData>() )
            return behavior;
    }

    return std::shared_ptr<gd::BehaviorsSharedData>();
}

#if defined(GD_IDE_ONLY)
std::shared_ptr<gd::BaseEvent> Platform::CreateEvent(const gd::String & eventType) const
{
    for (std::size_t i =0;i<extensionsLoaded.size();++i)
    {
        std::shared_ptr<gd::BaseEvent> event = extensionsLoaded[i]->CreateEvent(eventType);
        if ( event != std::shared_ptr<gd::BaseEvent>() )
            return event;
    }

    return std::shared_ptr<gd::BaseEvent>();
}

#if !defined(GD_NO_WX_GUI)
std::shared_ptr<gd::LayoutEditorPreviewer> Platform::GetLayoutPreviewer(gd::LayoutEditorCanvas & editor) const
{
    return std::make_shared<gd::LayoutEditorPreviewer>();
}

std::vector<std::shared_ptr<gd::ProjectExporter>> Platform::GetProjectExporters() const
{
    return std::vector<std::shared_ptr<gd::ProjectExporter>>{std::make_shared<gd::ProjectExporter>()};
}
#endif

#endif

}
