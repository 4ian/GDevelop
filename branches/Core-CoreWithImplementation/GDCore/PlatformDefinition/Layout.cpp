/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "Layout.h"
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
#include "GDCore/Events/Serialization.h"
#include "GDCore/TinyXml/tinyxml.h"
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
{
    gd::Layer layer;
    layer.SetCameraCount(1);
    initialLayers.push_back(layer);
}

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
            boost::shared_ptr<gd::AutomatismsSharedData> automatismsSharedDatas = project.GetPlatform().CreateAutomatismSharedDatas(allAutomatismsTypes[i]);
            automatismsSharedDatas->SetName(allAutomatismsNames[i]);
            automatismsInitialSharedDatas[automatismsSharedDatas->GetName()] = automatismsSharedDatas;
        }
    }

    //Remove useless shared data:
    //First construct the list of existing shared data.
    std::vector < std::string > allSharedData;
    for (std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = automatismsInitialSharedDatas.begin();
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

void Layout::SaveToXml(TiXmlElement * scene) const
{
    if ( scene == NULL ) return;

    scene->SetAttribute( "nom", GetName().c_str() );
    scene->SetDoubleAttribute( "r", GetBackgroundColorRed() );
    scene->SetDoubleAttribute( "v", GetBackgroundColorGreen() );
    scene->SetDoubleAttribute( "b", GetBackgroundColorBlue() );
    scene->SetAttribute( "titre", GetWindowDefaultTitle().c_str() );
    scene->SetDoubleAttribute( "oglFOV", oglFOV );
    scene->SetDoubleAttribute( "oglZNear", oglZNear );
    scene->SetDoubleAttribute( "oglZFar", oglZFar );
    scene->SetAttribute( "standardSortMethod", standardSortMethod ? "true" : "false" );
    scene->SetAttribute( "stopSoundsOnStartup", stopSoundsOnStartup ? "true" : "false" );
    scene->SetAttribute( "disableInputWhenNotFocused", disableInputWhenNotFocused ? "true" : "false" );

    TiXmlElement * settings = new TiXmlElement( "UISettings" );
    scene->LinkEndChild( settings );
    GetAssociatedLayoutEditorCanvasOptions().SaveToXml(settings);

    TiXmlElement * grpsobjets = new TiXmlElement( "GroupesObjets" );
    scene->LinkEndChild( grpsobjets );
    ObjectGroup::SaveToXml(GetObjectGroups(), grpsobjets);

    TiXmlElement * objets = new TiXmlElement( "Objets" );
    scene->LinkEndChild( objets );
    SaveObjectsToXml(objets);

    TiXmlElement * initialLayersElem = new TiXmlElement( "Layers" );
    scene->LinkEndChild( initialLayersElem );
    for ( unsigned int j = 0;j < GetLayersCount();++j )
    {
        TiXmlElement * layer = new TiXmlElement( "Layer" );
        initialLayersElem->LinkEndChild( layer );
        GetLayer(j).SaveToXml(layer);
    }

    TiXmlElement * variables = new TiXmlElement( "Variables" );
    scene->LinkEndChild( variables );
    GetVariables().SaveToXml(variables);

    TiXmlElement * autosSharedDatas = new TiXmlElement( "AutomatismsSharedDatas" );
    scene->LinkEndChild( autosSharedDatas );
    for (std::map<std::string, boost::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = automatismsInitialSharedDatas.begin();
         it != automatismsInitialSharedDatas.end();++it)
    {
        TiXmlElement * autoSharedDatas = new TiXmlElement( "AutomatismSharedDatas" );
        autosSharedDatas->LinkEndChild( autoSharedDatas );

        autoSharedDatas->SetAttribute("Type", it->second->GetTypeName().c_str());
        autoSharedDatas->SetAttribute("Name", it->second->GetName().c_str());
        it->second->SaveToXml(autoSharedDatas);
    }

    TiXmlElement * positions = new TiXmlElement( "Positions" );
    scene->LinkEndChild( positions );
    GetInitialInstances().SaveToXml(positions);

    TiXmlElement * eventsElem = new TiXmlElement( "Events" );
    scene->LinkEndChild( eventsElem );
    gd::EventsListSerialization::SaveEventsToXml(GetEvents(), eventsElem);
}
#endif

void Layout::LoadFromXml(gd::Project & project, const TiXmlElement * elem)
{
    if ( elem->Attribute( "r" ) != NULL && elem->Attribute( "v" ) != NULL && elem->Attribute( "b" ) != NULL)
        SetBackgroundColor(ToInt(elem->Attribute( "r" )), ToInt(elem->Attribute( "v" )), ToInt(elem->Attribute( "b" )));
    SetWindowDefaultTitle( elem->Attribute( "titre" ) != NULL ? elem->Attribute( "titre" ) : "" );

    if ( elem->Attribute( "oglFOV" ) != NULL ) { elem->QueryFloatAttribute("oglFOV", &oglFOV); }
    if ( elem->Attribute( "oglZNear" ) != NULL ) { elem->QueryFloatAttribute("oglZNear", &oglZNear); }
    if ( elem->Attribute( "oglZFar" ) != NULL ) { elem->QueryFloatAttribute("oglZFar", &oglZFar); }
    if ( elem->Attribute( "standardSortMethod" ) != NULL ) { standardSortMethod = ToString(elem->Attribute( "standardSortMethod" )) == "true"; }
    if ( elem->Attribute( "stopSoundsOnStartup" ) != NULL ) { stopSoundsOnStartup = ToString(elem->Attribute( "stopSoundsOnStartup" )) == "true"; }
    if ( elem->Attribute( "disableInputWhenNotFocused" ) != NULL ) { disableInputWhenNotFocused = ToString(elem->Attribute( "disableInputWhenNotFocused" )) == "true"; }

    #if defined(GD_IDE_ONLY)
    associatedSettings.LoadFromXml(elem->FirstChildElement( "UISettings" ));

    if ( elem->FirstChildElement( "GroupesObjets" ) != NULL )
        ObjectGroup::LoadFromXml(GetObjectGroups(), elem->FirstChildElement( "GroupesObjets" ));
    #endif

    if ( elem->FirstChildElement( "Objets" ) != NULL )
        LoadObjectsFromXml(project, elem->FirstChildElement( "Objets" ));

    if ( elem->FirstChildElement( "Positions" ) != NULL )
        initialInstances.LoadFromXml(elem->FirstChildElement( "Positions" ));

    if ( elem->FirstChildElement( "Layers" ) != NULL )
    {
        initialLayers.clear();
        const TiXmlElement * elemLayer = elem->FirstChildElement( "Layers" )->FirstChildElement("Layer");
        while ( elemLayer )
        {
            gd::Layer layer;
            layer.LoadFromXml(elemLayer);

            initialLayers.push_back(layer);
            elemLayer = elemLayer->NextSiblingElement();
        }

    }

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "Events" ) != NULL )
        gd::EventsListSerialization::LoadEventsFromXml(project, GetEvents(), elem->FirstChildElement( "Events" ));
    #endif

    if ( elem->FirstChildElement( "Variables" ) != NULL )
        variables.LoadFromXml(elem->FirstChildElement( "Variables" ));

    if ( elem->FirstChildElement( "AutomatismsSharedDatas" ) != NULL )
    {
        const TiXmlElement * elemSharedDatas = elem->FirstChildElement( "AutomatismsSharedDatas" )->FirstChildElement( "AutomatismSharedDatas" );
        while ( elemSharedDatas != NULL )
        {
            std::string type = elemSharedDatas->Attribute("Type") ? elemSharedDatas->Attribute("Type") : "";
            std::cout << "AutoatmismSharedData" << type << std::endl;
            boost::shared_ptr<gd::AutomatismsSharedData> sharedDatas = project.GetPlatform().CreateAutomatismSharedDatas(type);

            if ( sharedDatas != boost::shared_ptr<gd::AutomatismsSharedData>() )
            {
                sharedDatas->SetName( elemSharedDatas->Attribute("Name") ? elemSharedDatas->Attribute("Name") : "" );
                sharedDatas->LoadFromXml(elemSharedDatas);
                automatismsInitialSharedDatas[sharedDatas->GetName()] = sharedDatas;
            }

            elemSharedDatas = elemSharedDatas->NextSiblingElement("AutomatismSharedDatas");
        }
    }
}

void Layout::Init(const Layout & other)
{
    name = other.name;
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
    	initialObjects.push_back( boost::shared_ptr<gd::Object>(other.initialObjects[i]->Clone()) );

    automatismsInitialSharedDatas.clear();
    for (std::map< std::string, boost::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = other.automatismsInitialSharedDatas.begin();
         it != other.automatismsInitialSharedDatas.end();++it)
    {
    	automatismsInitialSharedDatas[it->first] = it->second->Clone();
    }

    #if defined(GD_IDE_ONLY)
    events = CloneVectorOfEvents(other.events);
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
    vector < std::string > automatims;

    //Search in objects
    if ( layout.HasObjectNamed(name) ) //We check first layout's objects' list.
    {
        vector < std::string > objectAutomatisms = layout.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
        automatismsAlreadyInserted = true;
    }
    else if ( project.HasObjectNamed(name) ) //Then the global object list
    {
        vector < std::string > objectAutomatisms = project.GetObject(name).GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
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
                	    automatims = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatims.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatims[a]) == objectAutomatisms.end() )
                            {
                                automatims.erase(automatims.begin() + a);
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
                	    automatims = objectAutomatisms;
                	}
                	else
                	{
                        for (unsigned int a = 0 ;a<automatims.size();++a)
                        {
                            if ( find(objectAutomatisms.begin(), objectAutomatisms.end(), automatims[a]) == objectAutomatisms.end() )
                            {
                                automatims.erase(automatims.begin() + a);
                                --a;
                            }
                        }
                	}
                }
            }
        }
    }

    return automatims;
}
#endif

}
