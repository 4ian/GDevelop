/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "Layout.h"
#include <algorithm>
#include <string>
#include <vector>
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Layer.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
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

void Layout::SetName(const std::string & name_)
{
    name = name_;
    mangledName = gd::SceneNameMangler::GetMangledSceneName(name);
};

gd::Layer & Layout::GetLayer(const std::string & name)
{
    std::vector<gd::Layer>::iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));

    if ( layer != initialLayers.end())
        return *layer;

    return badLayer;
}
const gd::Layer & Layout::GetLayer(const std::string & name) const
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
bool Layout::HasLayerNamed(const std::string & name) const
{
    return ( find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name)) != initialLayers.end() );
}
unsigned int Layout::GetLayerPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        if ( initialLayers[i].GetName() == name ) return i;
    }
    return std::string::npos;
}

void Layout::InsertNewLayer(const std::string & name, unsigned int position)
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

void Layout::RemoveLayer(const std::string & name)
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

void Layout::UpdateAutomatismsSharedData(gd::Project & project)
{
    std::vector < std::string > allAutomatismsTypes;
    std::vector < std::string > allAutomatismsNames;

    //Search in objects for the type and the name of every automatisms.
    for (unsigned int i = 0;i<initialObjects.size();++i)
    {
        std::vector < std::string > objectAutomatisms = initialObjects[i]->GetAllAutomatismNames();
        for (unsigned int j = 0;j<objectAutomatisms.size();++j)
        {
            gd::Automatism & automatism = initialObjects[i]->GetAutomatism(objectAutomatisms[j]);
            allAutomatismsTypes.push_back(automatism.GetTypeName());
            allAutomatismsNames.push_back(automatism.GetName());
        }
    }
    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        std::vector < std::string > objectAutomatisms = project.GetObject(i).GetAllAutomatismNames();
        for (unsigned int j = 0;j<objectAutomatisms.size();++j)
        {
            gd::Automatism & automatism = project.GetObject(i).GetAutomatism(objectAutomatisms[j]);
            allAutomatismsTypes.push_back(automatism.GetTypeName());
            allAutomatismsNames.push_back(automatism.GetName());
        }
    }

    //Create non existing shared data
    for (unsigned int i = 0;i<allAutomatismsTypes.size() && i < allAutomatismsNames.size();++i)
    {
        if ( automatismsInitialSharedDatas.find(allAutomatismsNames[i]) == automatismsInitialSharedDatas.end() )
        {
            std::shared_ptr<gd::AutomatismsSharedData> automatismsSharedDatas = project.CreateAutomatismSharedDatas(allAutomatismsTypes[i]);
            if ( automatismsSharedDatas )
            {
                automatismsSharedDatas->SetName(allAutomatismsNames[i]);
                automatismsInitialSharedDatas[automatismsSharedDatas->GetName()] = automatismsSharedDatas;
            }
        }
    }

    //Remove useless shared data:
    //First construct the list of existing shared data.
    std::vector < std::string > allSharedData;
    for (std::map < std::string, std::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = automatismsInitialSharedDatas.begin();
         it != automatismsInitialSharedDatas.end();++it)
    {
        allSharedData.push_back(it->first);
    }

    //Then delete shared data not linked to an automatism
    for (unsigned int i = 0;i<allSharedData.size();++i)
    {
        if ( std::find(allAutomatismsNames.begin(), allAutomatismsNames.end(), allSharedData[i]) == allAutomatismsNames.end() )
            automatismsInitialSharedDatas.erase(allSharedData[i]);
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

    SerializerElement & automatismDatasElement = element.AddChild("automatismsSharedData");
    automatismDatasElement.ConsiderAsArrayOf("automatismSharedData");
    for (std::map<std::string, std::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = automatismsInitialSharedDatas.begin();
         it != automatismsInitialSharedDatas.end();++it)
    {
        SerializerElement & dataElement = automatismDatasElement.AddChild("automatismSharedData");

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

    SerializerElement & automatismsDataElement = element.GetChild("automatismsSharedData", 0, "AutomatismsSharedDatas");
    automatismsDataElement.ConsiderAsArrayOf("automatismSharedData", "AutomatismSharedDatas");
    for (unsigned int i = 0; i < automatismsDataElement.GetChildrenCount(); ++i)
    {
        SerializerElement & automatismDataElement = automatismsDataElement.GetChild(i);
        std::string type = automatismDataElement.GetStringAttribute("type", "", "Type");

        std::shared_ptr<gd::AutomatismsSharedData> sharedData = project.CreateAutomatismSharedDatas(type);
        if ( sharedData != std::shared_ptr<gd::AutomatismsSharedData>() )
        {
            sharedData->SetName( automatismDataElement.GetStringAttribute("name", "", "Name") );
            sharedData->UnserializeFrom(automatismDataElement);

            automatismsInitialSharedDatas[sharedData->GetName()] = sharedData;
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

    automatismsInitialSharedDatas.clear();
    for (std::map< std::string, std::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = other.automatismsInitialSharedDatas.begin();
         it != other.automatismsInitialSharedDatas.end();++it)
    {
    	automatismsInitialSharedDatas[it->first] = it->second->Clone();
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

#if defined(GD_IDE_ONLY)
std::string GD_CORE_API GetTypeOfObject(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    std::string type;

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

                vector < string > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

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

                vector < string > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(project, layout, groupsObjects[0], false);

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

std::string GD_CORE_API GetTypeOfAutomatism(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    for (unsigned int i = 0;i<layout.GetObjectsCount();++i)
    {
        vector < std::string > automatisms = layout.GetObject(i).GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( layout.GetObject(i).GetAutomatism(automatisms[j]).GetName() == name )
                return layout.GetObject(i).GetAutomatism(automatisms[j]).GetTypeName();
        }
    }

    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        vector < std::string > automatisms = project.GetObject(i).GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( project.GetObject(i).GetAutomatism(automatisms[j]).GetName() == name )
                return project.GetObject(i).GetAutomatism(automatisms[j]).GetTypeName();
        }
    }

    return "";
}

vector < std::string > GD_CORE_API GetAutomatismsOfObject(const gd::Project & project, const gd::Layout & layout, std::string name, bool searchInGroups)
{
    bool automatismsAlreadyInserted = false;
    vector < std::string > automatisms;

    //Search in objects
    if ( layout.HasObjectNamed(name) ) //We check first layout's objects' list.
    {
        vector < std::string > objectAutomatisms = layout.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatisms));
        automatismsAlreadyInserted = true;
    }
    else if ( project.HasObjectNamed(name) ) //Then the global object list
    {
        vector < std::string > objectAutomatisms = project.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatisms));
        automatismsAlreadyInserted = true;
    }

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<layout.GetObjectGroups().size();++i)
        {
            if ( layout.GetObjectGroups()[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = layout.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(project, layout, groupsObjects[j], false);
                	if (!automatismsAlreadyInserted)
                	{
                	    automatismsAlreadyInserted = true;
                	    automatisms = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatisms.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatisms[a]) == objectAutomatisms.end() )
                            {
                                automatisms.erase(automatisms.begin() + a);
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
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = project.GetObjectGroups()[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(project, layout, groupsObjects[j], false);
                	if (!automatismsAlreadyInserted)
                	{
                	    automatismsAlreadyInserted = true;
                	    automatisms = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatisms.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatisms[a]) == objectAutomatisms.end() )
                            {
                                automatisms.erase(automatisms.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
    }

    return automatisms;
}
#endif

}
