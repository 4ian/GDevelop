/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/Position.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/Layer.h"
#include "GDL/XmlMacros.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/Serialization.h"
#endif
#undef GetObject //Disable an annoying macro

gd::Layer Scene::badLayer;

Scene::Scene() :
backgroundColorR(209),
backgroundColorG(209),
backgroundColorB(209),
codeExecutionEngine(boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine)),
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
    //ctor
    gd::Layer layer;
    layer.SetCameraCount(1);
    initialLayers.push_back(layer);
}

Scene::~Scene()
{
    #if defined(GD_IDE_ONLY) //Make sure a compilation is not being run on this scene.
    CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(*this);
    while ( CodeCompiler::GetInstance()->HasTaskRelatedTo(*this) )
        ;
    #endif
}

gd::Layer & Scene::GetLayer(const std::string & name)
{
    std::vector<gd::Layer>::iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));

    if ( layer != initialLayers.end())
        return *layer;

    return badLayer;
}
const gd::Layer & Scene::GetLayer(const std::string & name) const
{
    std::vector<gd::Layer>::const_iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));

    if ( layer != initialLayers.end())
        return *layer;

    return badLayer;
}
gd::Layer & Scene::GetLayer(unsigned int index)
{
    return initialLayers[index];
}
const gd::Layer & Scene::GetLayer (unsigned int index) const
{
    return initialLayers[index];
}
unsigned int Scene::GetLayersCount() const
{
    return initialLayers.size();
}

#if defined(GD_IDE_ONLY)
void Scene::UpdateAutomatismsSharedData(Game & game)
{
    std::vector < std::string > allAutomatismsTypes;
    std::vector < std::string > allAutomatismsNames;

    //Search in objects for the type and the name of every automatisms.
    for (unsigned int i = 0;i<GetInitialObjects().size();++i)
    {
        std::vector < std::string > objectAutomatisms = GetInitialObjects()[i]->GetAllAutomatismNames();
        for (unsigned int j = 0;j<objectAutomatisms.size();++j)
        {
            gd::Automatism & automatism = GetInitialObjects()[i]->GetAutomatism(objectAutomatisms[j]);
            allAutomatismsTypes.push_back(automatism.GetTypeName());
            allAutomatismsNames.push_back(automatism.GetName());
        }
    }
    for (unsigned int i = 0;i<game.GetGlobalObjects().size();++i)
    {
        std::vector < std::string > objectAutomatisms = game.GetGlobalObjects()[i]->GetAllAutomatismNames();
        for (unsigned int j = 0;j<objectAutomatisms.size();++j)
        {
            gd::Automatism & automatism = game.GetGlobalObjects()[i]->GetAutomatism(objectAutomatisms[j]);
            allAutomatismsTypes.push_back(automatism.GetTypeName());
            allAutomatismsNames.push_back(automatism.GetName());
        }
    }

    //Create non existing shared data
    for (unsigned int i = 0;i<allAutomatismsTypes.size() && i < allAutomatismsNames.size();++i)
    {
        if ( automatismsInitialSharedDatas.find(allAutomatismsNames[i]) == automatismsInitialSharedDatas.end() )
        {
            boost::shared_ptr<AutomatismsSharedDatas> automatismsSharedDatas = ExtensionsManager::GetInstance()->CreateAutomatismSharedDatas(allAutomatismsTypes[i]);
            automatismsSharedDatas->SetName(allAutomatismsNames[i]);
            automatismsInitialSharedDatas[automatismsSharedDatas->GetName()] = automatismsSharedDatas;
        }
    }

    //Remove useless shared data:
    //First construct the list of existing shared data.
    std::vector < std::string > allSharedData;
    for (std::map < std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = automatismsInitialSharedDatas.begin();
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

bool Scene::HasLayerNamed(const std::string & name) const
{
    return ( find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name)) != initialLayers.end() );
}
unsigned int Scene::GetLayerPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        if ( initialLayers[i].GetName() == name ) return i;
    }
    return std::string::npos;
}

void Scene::InsertNewLayer(const std::string & name, unsigned int position)
{
    gd::Layer newLayer;
    newLayer.SetName(name);
    if (position<initialLayers.size())
        initialLayers.insert(initialLayers.begin()+position, newLayer);
    else
        initialLayers.push_back(newLayer);
}

void Scene::InsertLayer(const gd::Layer & layer, unsigned int position)
{
    if (position<initialLayers.size())
        initialLayers.insert(initialLayers.begin()+position, layer);
    else
        initialLayers.push_back(layer);
}

void Scene::RemoveLayer(const std::string & name)
{
    std::vector< gd::Layer >::iterator layer = find_if(initialLayers.begin(), initialLayers.end(), bind2nd(gd::LayerHasName(), name));
    if ( layer == initialLayers.end() ) return;

    initialLayers.erase(layer);
}

void Scene::SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex)
{
    if ( firstLayerIndex >= initialLayers.size() || secondLayerIndex >= initialLayers.size() )
        return;

    gd::Layer temp = initialLayers[firstLayerIndex];
    initialLayers[firstLayerIndex] = initialLayers[secondLayerIndex];
    initialLayers[secondLayerIndex] = temp;
}

void Scene::SaveToXml(TiXmlElement * scene) const
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
    OpenSaveGame::SaveGroupesObjets(GetObjectGroups(), grpsobjets);

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
    for (std::map<std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = automatismsInitialSharedDatas.begin();
         it != automatismsInitialSharedDatas.end();++it)
    {
        TiXmlElement * autoSharedDatas = new TiXmlElement( "AutomatismSharedDatas" );
        autosSharedDatas->LinkEndChild( autoSharedDatas );

        autoSharedDatas->SetAttribute("Type", it->second->GetTypeName().c_str());
        autoSharedDatas->SetAttribute("Name", it->second->GetName().c_str());
        it->second->SaveToXml(autoSharedDatas);
    }

    TiXmlElement * dependenciesElem = new TiXmlElement( "Dependencies" );
    scene->LinkEndChild( dependenciesElem );
    for ( unsigned int j = 0;j < externalBitCodeDependList.size();++j)
    {
        TiXmlElement * dependencyElem = new TiXmlElement( "Dependency" );
        dependenciesElem->LinkEndChild( dependencyElem );

        dependencyElem->SetAttribute("bitcodeFile", externalBitCodeDependList[j].c_str());
    }

    TiXmlElement * positions = new TiXmlElement( "Positions" );
    scene->LinkEndChild( positions );
    GetInitialInstances().SaveToXml(positions);

    TiXmlElement * eventsElem = new TiXmlElement( "Events" );
    scene->LinkEndChild( eventsElem );
    gd::EventsListSerialization::SaveEventsToXml(GetEvents(), eventsElem);
}
#endif

void Scene::LoadFromXml(gd::Project & project, const TiXmlElement * elem)
{
    if ( elem->Attribute( "r" ) != NULL && elem->Attribute( "v" ) != NULL && elem->Attribute( "b" ) != NULL)
        SetBackgroundColor(ToInt(elem->Attribute( "r" )), ToInt(elem->Attribute( "v" )), ToInt(elem->Attribute( "b" )));
    SetWindowDefaultTitle( elem->Attribute( "titre" ) != NULL ? elem->Attribute( "titre" ) : "" );

    if ( elem->Attribute( "oglFOV" ) != NULL ) { elem->QueryFloatAttribute("oglFOV", &oglFOV); }
    if ( elem->Attribute( "oglZNear" ) != NULL ) { elem->QueryFloatAttribute("oglZNear", &oglZNear); }
    if ( elem->Attribute( "oglZFar" ) != NULL ) { elem->QueryFloatAttribute("oglZFar", &oglZFar); }
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("standardSortMethod", standardSortMethod);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("stopSoundsOnStartup", stopSoundsOnStartup);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("disableInputWhenNotFocused", disableInputWhenNotFocused);

    #if defined(GD_IDE_ONLY)
    associatedSettings.LoadFromXml(elem->FirstChildElement( "UISettings" ));

    if ( elem->FirstChildElement( "GroupesObjets" ) != NULL )
        OpenSaveGame::OpenGroupesObjets(GetObjectGroups(), elem->FirstChildElement( "GroupesObjets" ));
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
            boost::shared_ptr<AutomatismsSharedDatas> sharedDatas = ExtensionsManager::GetInstance()->CreateAutomatismSharedDatas(type);

            if ( sharedDatas != boost::shared_ptr<AutomatismsSharedDatas>() )
            {
                sharedDatas->SetName( elemSharedDatas->Attribute("Name") ? elemSharedDatas->Attribute("Name") : "" );
                sharedDatas->LoadFromXml(elemSharedDatas);
                automatismsInitialSharedDatas[sharedDatas->GetName()] = sharedDatas;
            }

            elemSharedDatas = elemSharedDatas->NextSiblingElement("AutomatismSharedDatas");
        }
    }

    externalBitCodeDependList.clear();
    const TiXmlElement * dependenciesElem = elem->FirstChildElement( "Dependencies" );
    if ( dependenciesElem != NULL)
    {
        const TiXmlElement * dependencyElem = dependenciesElem->FirstChildElement();
        while(dependencyElem)
        {
            externalBitCodeDependList.push_back(dependencyElem->Attribute("bitcodeFile") != NULL ? dependencyElem->Attribute("bitcodeFile") : "");

            dependencyElem = dependencyElem->NextSiblingElement();
        }
    }

}

void Scene::Init(const Scene & scene)
{
    name = scene.name;
    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    standardSortMethod = scene.standardSortMethod;
    title = scene.title;
    oglFOV = scene.oglFOV;
    oglZNear = scene.oglZNear;
    oglZFar = scene.oglZFar;
    stopSoundsOnStartup = scene.stopSoundsOnStartup;
    disableInputWhenNotFocused = scene.disableInputWhenNotFocused;

    externalBitCodeDependList = scene.GetExternalBitCodeDependList();
    codeExecutionEngine = boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine);

    GetInitialObjects().clear();
    for (unsigned int i =0;i<scene.GetInitialObjects().size();++i)
    	GetInitialObjects().push_back( boost::shared_ptr<gd::Object>(scene.GetInitialObjects()[i]->Clone()) );

    initialInstances = scene.initialInstances;
    initialLayers = scene.initialLayers;
    variables = scene.GetVariables();

    automatismsInitialSharedDatas.clear();
    for (std::map< std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
         it != scene.automatismsInitialSharedDatas.end();++it)
    {
    	automatismsInitialSharedDatas[it->first] = it->second->Clone();
    }

    #if defined(GD_IDE_ONLY)
    profiler = scene.profiler;
    associatedSettings = scene.associatedSettings;
    events = CloneVectorOfEvents(scene.events);

    SetCompilationNeeded(); //Force recompilation/refreshing
    SetRefreshNeeded();
    #endif
}
Scene::Scene(const Scene & scene)
#if defined(GD_IDE_ONLY)
    : gd::Layout(scene)
#endif
{
    Init(scene);
}

Scene& Scene::operator=(const Scene & scene)
{
    if ( this != &scene )
    {
#if defined(GD_IDE_ONLY)
        gd::Layout::operator=(scene);
#endif
        Init(scene);
    }

    return *this;
}

