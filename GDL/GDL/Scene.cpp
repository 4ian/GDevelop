/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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

Scene::Scene() :
backgroundColorR(209),
backgroundColorG(209),
backgroundColorB(209),
standardSortMethod(true),
oglFOV(90.0f),
oglZNear(1.0f),
oglZFar(500.0f),
stopSoundsOnStartup(true),
#if defined(GD_IDE_ONLY)
profiler(NULL),
#endif
codeExecutionEngine(boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine))
#if defined(GD_IDE_ONLY)
,wasModified(false),
eventsModified(true),
grid( false ),
snap( false),
gridWidth( 32 ),
gridHeight( 32 ),
gridR( 158 ),
gridG( 180 ),
gridB( 255 ),
windowMask(false)
#endif
{
    //ctor
    Layer layer;
    layer.SetCamerasNumber(1);
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

#if defined(GD_IDE_ONLY)
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

void Scene::InsertNewObject(std::string & name, unsigned int position)
{
    boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(new Object(name));
    if (position<GetInitialObjects().size())
        GetInitialObjects().insert(GetInitialObjects().begin()+position, newObject);
    else
        GetInitialObjects().push_back(newObject);
}

void Scene::InsertObject(const gd::Object & events, unsigned int position)
{
    try
    {
        const Object & castedEvents = dynamic_cast<const Object&>(events);
        boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(new Object(castedEvents));
        if (position<GetInitialObjects().size())
            GetInitialObjects().insert(GetInitialObjects().begin()+position, newObject);
        else
            GetInitialObjects().push_back(newObject);
    }
    catch(...) { std::cout << "WARNING: Tried to add an object which is not a GD C++ Platform Object to a GD C++ Platform project"; }
}

void Scene::RemoveObject(const std::string & name)
{
    std::vector< boost::shared_ptr<Object> >::iterator events = find_if(GetInitialObjects().begin(), GetInitialObjects().end(), bind2nd(ObjectHasName(), name));
    if ( events == GetInitialObjects().end() ) return;

    GetInitialObjects().erase(events);
}

void Scene::SaveToXml(TiXmlElement * elem) const
{
    //TODO: For now, everything is still managed by OpenSaveGame
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
    #if defined(GD_IDE_ONLY)
    if ( elem->Attribute( "grid" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("grid", grid); }
    if ( elem->Attribute( "snap" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("snap", snap); }
    if ( elem->Attribute( "windowMask" ) != NULL ) { GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("windowMask", windowMask); }
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridWidth", gridWidth);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridHeight", gridHeight);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridR", gridR);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridG", gridG);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridB", gridB);
    #endif

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "GroupesObjets" ) != NULL )
        OpenSaveGame::OpenGroupesObjets(GetObjectGroups(), elem->FirstChildElement( "GroupesObjets" ));
    #endif

    if ( elem->FirstChildElement( "Objets" ) != NULL )
        OpenSaveGame::OpenObjects(initialObjects, elem->FirstChildElement( "Objets" ));

    if ( elem->FirstChildElement( "Positions" ) != NULL )
        OpenSaveGame::OpenPositions(initialObjectsPositions, elem->FirstChildElement( "Positions" ));

    if ( elem->FirstChildElement( "Layers" ) != NULL )
        OpenSaveGame::OpenLayers(initialLayers, elem->FirstChildElement( "Layers" ));

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "Events" ) != NULL )
        OpenSaveGame::OpenEvents(GetEvents(), elem->FirstChildElement( "Events" ));
    if ( OpenSaveGame::updateEventsFromGD1x ) OpenSaveGame::AdaptEventsFromGD1x(GetEvents());
    #endif

    if ( elem->FirstChildElement( "Variables" ) != NULL )
        OpenSaveGame::OpenVariablesList(variables, elem->FirstChildElement( "Variables" ));

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

    externalSourcesDependList.clear();
    const TiXmlElement * dependenciesElem = elem->FirstChildElement( "Dependencies" );
    if ( dependenciesElem != NULL)
    {
        const TiXmlElement * dependencyElem = dependenciesElem->FirstChildElement();
        while(dependencyElem)
        {
            externalSourcesDependList.push_back(dependencyElem->Attribute("sourceFile") != NULL ? dependencyElem->Attribute("sourceFile") : "");

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

    #if defined(GD_IDE_ONLY)
    profiler = scene.profiler;

    events = CloneVectorOfEvents(scene.events);
    #endif

    externalSourcesDependList = scene.externalSourcesDependList;
    codeExecutionEngine = boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine);

    GetInitialObjects().clear();
    for (unsigned int i =0;i<scene.GetInitialObjects().size();++i)
    	GetInitialObjects().push_back( boost::shared_ptr<Object>(scene.GetInitialObjects()[i]->Clone()) );

    initialObjectsPositions = scene.initialObjectsPositions;
    initialLayers = scene.initialLayers;
    variables = scene.GetVariables();

    automatismsInitialSharedDatas.clear();
    for (std::map< std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
         it != scene.automatismsInitialSharedDatas.end();++it)
    {
    	automatismsInitialSharedDatas[it->first] = it->second->Clone();
    }

    #if defined(GD_IDE_ONLY)
    eventsModified = true; //Force recompilation/refreshing
    wasModified = true;

    grid = scene.grid;
    snap = scene.snap ;
    gridWidth = scene.gridWidth ;
    gridHeight = scene.gridHeight ;
    gridR = scene.gridR ;
    gridG = scene.gridG ;
    gridB = scene.gridB ;
    windowMask = scene.windowMask ;
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
