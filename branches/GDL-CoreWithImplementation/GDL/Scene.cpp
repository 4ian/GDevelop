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
#include "GDL/XmlMacros.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDCore/PlatformDefinition/Layout.h"
#endif
#undef GetObject //Disable an annoying macro

Layer Scene::badLayer;

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
    Layer layer;
    layer.SetCameraCount(1);
    layers.push_back(layer);
}

Scene::~Scene()
{
    #if defined(GD_IDE_ONLY) //Make sure a compilation is not being run on this scene.
    CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(*this);
    while ( CodeCompiler::GetInstance()->HasTaskRelatedTo(*this) )
        ;
    #endif
}

Layer & Scene::GetLayer(const std::string & name)
{
    std::vector<Layer>::iterator layer = find_if(layers.begin(), layers.end(), bind2nd(LayerHasName(), name));

    if ( layer != layers.end())
        return *layer;

    return badLayer;
}
const Layer & Scene::GetLayer(const std::string & name) const
{
    std::vector<Layer>::const_iterator layer = find_if(layers.begin(), layers.end(), bind2nd(LayerHasName(), name));

    if ( layer != layers.end())
        return *layer;

    return badLayer;
}
Layer & Scene::GetLayer(unsigned int index)
{
    return layers[index];
}
const Layer & Scene::GetLayer (unsigned int index) const
{
    return layers[index];
}
unsigned int Scene::GetLayersCount() const
{
    return layers.size();
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

bool Scene::HasObjectNamed(const std::string & name) const
{
    return ( find_if(GetInitialObjects().begin(), GetInitialObjects().end(), bind2nd(ObjectHasName(), name)) != GetInitialObjects().end() );
}
gd::Object & Scene::GetObject(const std::string & name)
{
    return *(*find_if(GetInitialObjects().begin(), GetInitialObjects().end(), bind2nd(ObjectHasName(), name)));
}
const gd::Object & Scene::GetObject(const std::string & name) const
{
    return *(*find_if(GetInitialObjects().begin(), GetInitialObjects().end(), bind2nd(ObjectHasName(), name)));
}
gd::Object & Scene::GetObject(unsigned int index)
{
    return *GetInitialObjects()[index];
}
const gd::Object & Scene::GetObject (unsigned int index) const
{
    return *GetInitialObjects()[index];
}
unsigned int Scene::GetObjectPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<GetInitialObjects().size();++i)
    {
        if ( GetInitialObjects()[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int Scene::GetObjectsCount() const
{
    return GetInitialObjects().size();
}

void Scene::InsertNewObject(const std::string & objectType, const std::string & name, unsigned int position)
{
    boost::shared_ptr<Object> newObject = ExtensionsManager::GetInstance()->CreateObject(objectType, name);
    if (position<GetInitialObjects().size())
        GetInitialObjects().insert(GetInitialObjects().begin()+position, newObject);
    else
        GetInitialObjects().push_back(newObject);
}

void Scene::InsertObject(const gd::Object & object, unsigned int position)
{
    try
    {
        const Object & castedObject = dynamic_cast<const Object&>(object);
        boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(castedObject.Clone());
        if (position<GetInitialObjects().size())
            GetInitialObjects().insert(GetInitialObjects().begin()+position, newObject);
        else
            GetInitialObjects().push_back(newObject);
    }
    catch(...) { std::cout << "WARNING: Tried to add an object which is not a GD C++ Platform Object to a GD C++ Platform project"; }
}

void Scene::SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex)
{
    if ( firstObjectIndex >= GetInitialObjects().size() || secondObjectIndex >= GetInitialObjects().size() )
        return;

    boost::shared_ptr<Object> temp = GetInitialObjects()[firstObjectIndex];
    GetInitialObjects()[firstObjectIndex] = GetInitialObjects()[secondObjectIndex];
    GetInitialObjects()[secondObjectIndex] = temp;
}

void Scene::RemoveObject(const std::string & name)
{
    std::vector< boost::shared_ptr<Object> >::iterator object = find_if(GetInitialObjects().begin(), GetInitialObjects().end(), bind2nd(ObjectHasName(), name));
    if ( object == GetInitialObjects().end() ) return;

    GetInitialObjects().erase(object);
}
bool Scene::HasLayerNamed(const std::string & name) const
{
    return ( find_if(layers.begin(), layers.end(), bind2nd(LayerHasName(), name)) != layers.end() );
}
unsigned int Scene::GetLayerPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
        if ( layers[i].GetName() == name ) return i;
    }
    return std::string::npos;
}

void Scene::InsertNewLayer(const std::string & name, unsigned int position)
{
    Layer newLayer;
    newLayer.SetName(name);
    if (position<layers.size())
        layers.insert(layers.begin()+position, newLayer);
    else
        layers.push_back(newLayer);
}

void Scene::InsertLayer(const gd::Layer & layer, unsigned int position)
{
    try
    {
        const Layer & castedLayer = dynamic_cast<const Layer&>(layer);
        if (position<layers.size())
            layers.insert(layers.begin()+position, castedLayer);
        else
            layers.push_back(castedLayer);
    }
    catch(...) { std::cout << "WARNING: Tried to add an layer which is not a GD C++ Platform Layer to a GD C++ Platform project"; }
}

void Scene::RemoveLayer(const std::string & name)
{
    std::vector< Layer >::iterator layer = find_if(layers.begin(), layers.end(), bind2nd(LayerHasName(), name));
    if ( layer == layers.end() ) return;

    layers.erase(layer);
}

void Scene::SwapLayers(unsigned int firstLayerIndex, unsigned int secondLayerIndex)
{
    if ( firstLayerIndex >= layers.size() || secondLayerIndex >= layers.size() )
        return;

    Layer temp = layers[firstLayerIndex];
    layers[firstLayerIndex] = layers[secondLayerIndex];
    layers[secondLayerIndex] = temp;
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
    OpenSaveGame::SaveObjects(GetInitialObjects(), objets);

    TiXmlElement * layersElem = new TiXmlElement( "Layers" );
    scene->LinkEndChild( layersElem );
    OpenSaveGame::SaveLayers(layers, layersElem);

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
    OpenSaveGame::SaveEvents(GetEvents(), eventsElem);
}
#endif

void Scene::LoadFromXml(const TiXmlElement * elem)
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
        OpenSaveGame::OpenObjects(initialObjects, elem->FirstChildElement( "Objets" ));

    if ( elem->FirstChildElement( "Positions" ) != NULL )
        initialInstances.LoadFromXml(elem->FirstChildElement( "Positions" ));

    if ( elem->FirstChildElement( "Layers" ) != NULL )
        OpenSaveGame::OpenLayers(layers, elem->FirstChildElement( "Layers" ));

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "Events" ) != NULL )
        OpenSaveGame::OpenEvents(GetEvents(), elem->FirstChildElement( "Events" ));
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
    	GetInitialObjects().push_back( boost::shared_ptr<Object>(scene.GetInitialObjects()[i]->Clone()) );

    initialInstances = scene.initialInstances;
    layers = scene.layers;
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

