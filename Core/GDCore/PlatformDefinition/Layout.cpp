/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "Layout.h"
#include <algorithm>
#include "GDCore/String.h"
#include <vector>
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Layer.h"
#include "GDCore/PlatformDefinition/Behavior.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/PlatformDefinition/BehaviorsSharedData.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

gd::Layer Layout::badLayer;

Layout::Layout(const Layout & other)
{
    Init(other);
}

Layout & Layout::operator=(const Layout & other)
{
    if ( this != &other )
        Init(other);

    return *this;
}

Layout::~Layout()
{
};

Layout::Layout() :
    backgroundColorR(209),
    backgroundColorG(209),
    backgroundColorB(209),
    stopSoundsOnStartup(true),
    standardSortMethod(true),
    oglFOV(90.0f),
    oglZNear(1.0f),
    oglZFar(500.0f),
    disableInputWhenNotFocused(true)
    #if defined(GD_IDE_ONLY)
    ,profiler(NULL),
    refreshNeeded(false),
    compilationNeeded(true)
    #endif
{
    gd::Layer layer;
    layer.SetCameraCount(1);
    initialLayers.push_back(layer);
}

void Layout::SetName(const gd::String & name_)
{
    name = name_;
    mangledName = gd::SceneNameMangler::GetMangledSceneName(name);
};

gd::Layer & Layout::GetLayer(const gd::String & name)
{
    std::vector<gd::Layer>::iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));

    if ( layer != initialLayers.end())
        return *layer;

    return badLayer;
}
const gd::Layer & Layout::GetLayer(const gd::String & name) const
{
    std::vector<gd::Layer>::const_iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));

    if ( layer != initialLayers.end())
        return *layer;

    return badLayer;
}
gd::Layer & Layout::GetLayer(unsigned int index)
{
    return initialLayers[index];
}
const gd::Layer & Layout::GetLayer (unsigned int index) const
{
    return initialLayers[index];
}
unsigned int Layout::GetLayersCount() const
{
    return initialLayers.size();
}

#if defined(GD_IDE_ONLY)
bool Layout::HasLayerNamed(const gd::String & name) const
{
    return ( find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name)) != initialLayers.end() );
}
unsigned int Layout::GetLayerPosition(const gd::String & name) const
{
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        if ( initialLayers[i].GetName() == name ) return i;
    }
    return gd::String::npos;
}

void Layout::InsertNewLayer(const gd::String & name, unsigned int position)
{
    gd::Layer newLayer;
    newLayer.SetName(name);
    if (position<initialLayers.size())
        initialLayers.insert(initialLayers.begin()+position, newLayer);
    else
        initialLayers.push_back(newLayer);
}

void Layout::InsertLayer(const gd::Layer & layer, unsigned int position)
{
    if (position<initialLayers.size())
        initialLayers.insert(initialLayers.begin()+position, layer);
    else
        initialLayers.push_back(layer);
}

void Layout::RemoveLayer(const gd::String & name)
{
    std::vector< gd::Layer >::iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));
    if ( layer == initialLayers.end() ) return;

    initialLayers.erase(layer);
}

void Layout::SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex)
{
    if ( firstLayerIndex >= initialLayers.size() || secondLayerIndex >= initialLayers.size() )
        return;

    gd::Layer temp = initialLayers[firstLayerIndex];
    initialLayers[firstLayerIndex] = initialLayers[secondLayerIndex];
    initialLayers[secondLayerIndex] = temp;
}

void Layout::UpdateBehaviorsSharedData(gd::Project & project)
{
    std::vector < gd::String > allBehaviorsTypes;
    std::vector < gd::String > allBehaviorsNames;

    //Search in objects for the type and the name of every behaviors.
    for (unsigned int i = 0;i<initialObjects.size();++i)
    {
        std::vector < gd::String > objectBehaviors = initialObjects[i]->GetAllBehaviorNames();
        for (unsigned int j = 0;j<objectBehaviors.size();++j)
        {
            gd::Behavior & behavior = initialObjects[i]->GetBehavior(objectBehaviors[j]);
            allBehaviorsTypes.push_back(behavior.GetTypeName());
            allBehaviorsNames.push_back(behavior.GetName());
        }
    }
    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        std::vector < gd::String > objectBehaviors = project.GetObject(i).GetAllBehaviorNames();
        for (unsigned int j = 0;j<objectBehaviors.size();++j)
        {
            gd::Behavior & behavior = project.GetObject(i).GetBehavior(objectBehaviors[j]);
            allBehaviorsTypes.push_back(behavior.GetTypeName());
            allBehaviorsNames.push_back(behavior.GetName());
        }
    }

    //Create non existing shared data
    for (unsigned int i = 0;i<allBehaviorsTypes.size() && i < allBehaviorsNames.size();++i)
    {
        if ( behaviorsInitialSharedDatas.find(allBehaviorsNames[i]) == behaviorsInitialSharedDatas.end() )
        {
            std::shared_ptr<gd::BehaviorsSharedData> behaviorsSharedDatas = project.CreateBehaviorSharedDatas(allBehaviorsTypes[i]);
            if ( behaviorsSharedDatas )
            {
                behaviorsSharedDatas->SetName(allBehaviorsNames[i]);
                behaviorsInitialSharedDatas[behaviorsSharedDatas->GetName()] = behaviorsSharedDatas;
            }
        }
    }

    //Remove useless shared data:
    //First construct the list of existing shared data.
    std::vector < gd::String > allSharedData;
    for (std::map < gd::String, std::shared_ptr<gd::BehaviorsSharedData> >::const_iterator it = behaviorsInitialSharedDatas.begin();
         it != behaviorsInitialSharedDatas.end();++it)
    {
        allSharedData.push_back(it->first);
    }

    //Then delete shared data not linked to a behavior
    for (unsigned int i = 0;i<allSharedData.size();++i)
    {
        if ( std::find(allBehaviorsNames.begin(), allBehaviorsNames.end(), allSharedData[i]) == allBehaviorsNames.end() )
            behaviorsInitialSharedDatas.erase(allSharedData[i]);
    }
}

void Layout::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute( "name", GetName());
    element.SetAttribute( "mangledName", GetMangledName());
    element.SetAttribute( "r", (int)GetBackgroundColorRed() );
    element.SetAttribute( "v", (int)GetBackgroundColorGreen() );
    element.SetAttribute( "b", (int)GetBackgroundColorBlue() );
    element.SetAttribute( "title", GetWindowDefaultTitle());
    element.SetAttribute( "oglFOV", oglFOV );
    element.SetAttribute( "oglZNear", oglZNear );
    element.SetAttribute( "oglZFar", oglZFar );
    element.SetAttribute( "standardSortMethod", standardSortMethod);
    element.SetAttribute( "stopSoundsOnStartup", stopSoundsOnStartup);
    element.SetAttribute( "disableInputWhenNotFocused", disableInputWhenNotFocused);

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    GetAssociatedLayoutEditorCanvasOptions().SerializeTo(element.AddChild("uiSettings"));
    #endif

    ObjectGroup::SerializeTo(GetObjectGroups(), element.AddChild("objectsGroups"));
    GetVariables().SerializeTo(element.AddChild("variables"));
    GetInitialInstances().SerializeTo(element.AddChild("instances"));
    SerializeObjectsTo(element.AddChild("objects"));
    gd::EventsListSerialization::SerializeEventsTo(events, element.AddChild("events"));

    SerializerElement & layersElement = element.AddChild("layers");
    layersElement.ConsiderAsArrayOf("layer");
    for ( unsigned int j = 0;j < GetLayersCount();++j )
        GetLayer(j).SerializeTo(layersElement.AddChild("layer"));

    SerializerElement & behaviorDatasElement = element.AddChild("behaviorsSharedData");
    behaviorDatasElement.ConsiderAsArrayOf("behaviorSharedData");
    for (std::map<gd::String, std::shared_ptr<gd::BehaviorsSharedData> >::const_iterator it = behaviorsInitialSharedDatas.begin();
         it != behaviorsInitialSharedDatas.end();++it)
    {
        SerializerElement & dataElement = behaviorDatasElement.AddChild("behaviorSharedData");

        dataElement.SetAttribute("type", it->second->GetTypeName());
        dataElement.SetAttribute("name", it->second->GetName());
        it->second->SerializeTo(dataElement);
    }
}
#endif

void Layout::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
    SetBackgroundColor(element.GetIntAttribute( "r" ), element.GetIntAttribute( "v" ), element.GetIntAttribute( "b" ));
    SetWindowDefaultTitle( element.GetStringAttribute("title", "(No title)", "titre") );
    oglFOV = element.GetDoubleAttribute("oglFOV");
    oglZNear = element.GetDoubleAttribute("oglZNear");
    oglZFar = element.GetDoubleAttribute("oglZFar");
    standardSortMethod = element.GetBoolAttribute( "standardSortMethod" );
    stopSoundsOnStartup = element.GetBoolAttribute( "stopSoundsOnStartup" );
    disableInputWhenNotFocused = element.GetBoolAttribute( "disableInputWhenNotFocused" );

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    associatedSettings.UnserializeFrom(element.GetChild("uiSettings", 0, "UISettings"));
    #endif

    #if defined(GD_IDE_ONLY)
    gd::ObjectGroup::UnserializeFrom(objectGroups, element.GetChild( "objectsGroups", 0, "GroupesObjets" ));
    gd::EventsListSerialization::UnserializeEventsFrom(project, GetEvents(), element.GetChild("events", 0, "Events"));
    #endif

    UnserializeObjectsFrom(project, element.GetChild("objects", 0, "Objets"));
    initialInstances.UnserializeFrom(element.GetChild("instances", 0, "Positions"));
    variables.UnserializeFrom(element.GetChild("variables", 0, "Variables"));

    initialLayers.clear();
    SerializerElement & layersElement = element.GetChild("layers", 0, "Layers");
    layersElement.ConsiderAsArrayOf("layer", "Layer");
    for (unsigned int i = 0; i < layersElement.GetChildrenCount(); ++i)
    {
        gd::Layer layer;

        layer.UnserializeFrom(layersElement.GetChild(i));
        initialLayers.push_back(layer);
    }

    //Compatibility with GD <= 4
    gd::String deprecatedTag1 = "automatismsSharedData";
    gd::String deprecatedTag2 = "automatismSharedData";
    if (!element.HasChild(deprecatedTag1)) 
    {
        deprecatedTag1 = "AutomatismsSharedDatas";
        deprecatedTag2 = "AutomatismSharedDatas";
    }

    auto renameOldType = [](gd::String name) {
        gd::String oldWord = "Automatism";
        while (name.find(oldWord) != gd::String::npos)
            name = name.replace(name.find(oldWord), oldWord.size(), "Behavior");

        return name;
    };
    //end of compatibility code

    SerializerElement & behaviorsDataElement = element.GetChild("behaviorsSharedData", 0, deprecatedTag1);
    behaviorsDataElement.ConsiderAsArrayOf("behaviorSharedData", deprecatedTag2);
    for (unsigned int i = 0; i < behaviorsDataElement.GetChildrenCount(); ++i)
    {
        SerializerElement & behaviorDataElement = behaviorsDataElement.GetChild(i);
        gd::String type = renameOldType(behaviorDataElement.GetStringAttribute("type", "", "Type"));

        std::shared_ptr<gd::BehaviorsSharedData> sharedData = project.CreateBehaviorSharedDatas(type);
        if ( sharedData != std::shared_ptr<gd::BehaviorsSharedData>() )
        {
            sharedData->SetName( behaviorDataElement.GetStringAttribute("name", "", "Name") );
            sharedData->UnserializeFrom(behaviorDataElement);

            behaviorsInitialSharedDatas[sharedData->GetName()] = sharedData;
        }

    }
}

void Layout::Init(const Layout & other)
{
    SetName(other.name);
    backgroundColorR = other.backgroundColorR;
    backgroundColorG = other.backgroundColorG;
    backgroundColorB = other.backgroundColorB;
    standardSortMethod = other.standardSortMethod;
    title = other.title;
    oglFOV = other.oglFOV;
    oglZNear = other.oglZNear;
    oglZFar = other.oglZFar;
    stopSoundsOnStartup = other.stopSoundsOnStartup;
    disableInputWhenNotFocused = other.disableInputWhenNotFocused;
    initialInstances = other.initialInstances;
    initialLayers = other.initialLayers;
    variables = other.GetVariables();

    initialObjects.clear();
    for (unsigned int i =0;i<other.initialObjects.size();++i)
    	initialObjects.push_back( std::shared_ptr<gd::Object>(other.initialObjects[i]->Clone()) );

    behaviorsInitialSharedDatas.clear();
    for (std::map< gd::String, std::shared_ptr<gd::BehaviorsSharedData> >::const_iterator it = other.behaviorsInitialSharedDatas.begin();
         it != other.behaviorsInitialSharedDatas.end();++it)
    {
    	behaviorsInitialSharedDatas[it->first] = it->second->Clone();
    }

    #if defined(GD_IDE_ONLY)
    events = other.events;
    objectGroups = other.objectGroups;

    compiledEventsFile = other.compiledEventsFile;
    profiler = other.profiler;
    SetCompilationNeeded(); //Force recompilation/refreshing
    SetRefreshNeeded();
    #endif
}

std::vector<gd::String> GetHiddenLayers(const Layout & layout) 
{
    std::vector<gd::String> hiddenLayers;
    for (unsigned int i = 0;i < layout.GetLayersCount();++i) {
        if (!layout.GetLayer(i).GetVisibility()) {
            hiddenLayers.push_back(layout.GetLayer(i).GetName());
        }
    }

    return hiddenLayers;
}

#if defined(GD_IDE_ONLY)
gd::String GD_CORE_API GetTypeOfObject(const gd::Project & project, const gd::Layout & layout, gd::String name, bool searchInGroups)
{
    gd::String type;

    //Search in objects
    if ( layout.HasObjectNamed(name) )
        type = layout.GetObject(name).GetType();
    else if ( project.HasObjectNamed(name) )
        type = project.GetObject(name).GetType();

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<layout.GetObjectGroups().size();++i)
        {
            if ( layout.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < gd::String > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                gd::String previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(project, layout, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has objects of different type, so the group has not any type.

                type = previousType;
            }
        }
        for (unsigned int i = 0;i<project.GetObjectGroups().size();++i)
        {
            if ( project.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < gd::String > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                gd::String previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(project, layout, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has objects of different type, so the group has not any type.

                type = previousType;
            }
        }
    }

    return type;
}

gd::String GD_CORE_API GetTypeOfBehavior(const gd::Project & project, const gd::Layout & layout, gd::String name, bool searchInGroups)
{
    for (unsigned int i = 0;i<layout.GetObjectsCount();++i)
    {
        vector < gd::String > behaviors = layout.GetObject(i).GetAllBehaviorNames();
        for (unsigned int j = 0;j<behaviors.size();++j)
        {
            if ( layout.GetObject(i).GetBehavior(behaviors[j]).GetName() == name )
                return layout.GetObject(i).GetBehavior(behaviors[j]).GetTypeName();
        }
    }

    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        vector < gd::String > behaviors = project.GetObject(i).GetAllBehaviorNames();
        for (unsigned int j = 0;j<behaviors.size();++j)
        {
            if ( project.GetObject(i).GetBehavior(behaviors[j]).GetName() == name )
                return project.GetObject(i).GetBehavior(behaviors[j]).GetTypeName();
        }
    }

    return "";
}

vector < gd::String > GD_CORE_API GetBehaviorsOfObject(const gd::Project & project, const gd::Layout & layout, gd::String name, bool searchInGroups)
{
    bool behaviorsAlreadyInserted = false;
    vector < gd::String > behaviors;

    //Search in objects
    if ( layout.HasObjectNamed(name) ) //We check first layout's objects' list.
    {
        std::vector < gd::String > objectBehaviors = layout.GetObject(name).GetAllBehaviorNames();
        std::copy(objectBehaviors.begin(), objectBehaviors.end(), back_inserter(behaviors));
        behaviorsAlreadyInserted = true;
    }
    else if ( project.HasObjectNamed(name) ) //Then the global object list
    {
        vector < gd::String > objectBehaviors = project.GetObject(name).GetAllBehaviorNames();
        std::copy(objectBehaviors.begin(), objectBehaviors.end(), back_inserter(behaviors));
        behaviorsAlreadyInserted = true;
    }

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<layout.GetObjectGroups().size();++i)
        {
            if ( layout.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common behaviors.

                vector < gd::String > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get behaviors of the object of the group and delete behavior which are not in commons.
                	vector < gd::String > objectBehaviors = GetBehaviorsOfObject(project, layout, groupsObjects[j], false);
                	if (!behaviorsAlreadyInserted)
                	{
                	    behaviorsAlreadyInserted = true;
                	    behaviors = objectBehaviors;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<behaviors.size();++a)
                        {
                            if ( find(objectBehaviors.begin(), objectBehaviors.end(), behaviors[a]) == objectBehaviors.end() )
                            {
                                behaviors.erase(behaviors.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
        for (unsigned int i = 0;i<project.GetObjectGroups().size();++i)
        {
            if ( project.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common behaviors.

                vector < gd::String > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get behaviors of the object of the group and delete behavior which are not in commons.
                	vector < gd::String > objectBehaviors = GetBehaviorsOfObject(project, layout, groupsObjects[j], false);
                	if (!behaviorsAlreadyInserted)
                	{
                	    behaviorsAlreadyInserted = true;
                	    behaviors = objectBehaviors;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<behaviors.size();++a)
                        {
                            if ( find(objectBehaviors.begin(), objectBehaviors.end(), behaviors[a]) == objectBehaviors.end() )
                            {
                                behaviors.erase(behaviors.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
    }

    return behaviors;
}
#endif

}
