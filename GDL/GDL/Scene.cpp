#include "GDL/Scene.h"
#include "GDL/MemTrace.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Chercher.h"
#include "GDL/Game.h"
#include "GDL/Position.h"

Scene::Scene() :
backgroundColorR(125),
backgroundColorG(125),
backgroundColorB(125),
standardSortMethod(true)
{
    //ctor
    Layer layer;
    layer.SetCamerasNumber(1);
    initialLayers.push_back(layer);
}

Scene::~Scene()
{
    //dtor
}

Scene::Scene(const Scene & scene)
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    name = scene.name;

    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    standardSortMethod = scene.standardSortMethod;
    title = scene.title;

    events = scene.events;

    initialObjects.clear();
    for (unsigned int i =0;i<scene.initialObjects.size();++i)
    	initialObjects.push_back( extensionManager->CreateObject(scene.initialObjects[i]) );

    objectGroups = scene.objectGroups;
    initialObjectsPositions = scene.initialObjectsPositions;
    initialLayers = scene.initialLayers;
    variables = scene.variables;
}

Scene& Scene::operator=(const Scene & scene)
{
    if ( this != &scene )
    {
        gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

        this->name = scene.name;

        this->backgroundColorR = scene.backgroundColorR;
        this->backgroundColorG = scene.backgroundColorG;
        this->backgroundColorB = scene.backgroundColorB;
        this->standardSortMethod = scene.standardSortMethod;
        this->title = scene.title;

        this->events = scene.events;

        this->initialObjects.clear();
        for (unsigned int i =0;i<scene.initialObjects.size();++i)
            this->initialObjects.push_back( extensionManager->CreateObject(scene.initialObjects[i]) );

        this->objectGroups = scene.objectGroups;
        this->initialObjectsPositions = scene.initialObjectsPositions;
        this->initialLayers = scene.initialLayers;
        this->variables = scene.variables;
    }

    return *this;
}

unsigned int GD_API GetTypeIdOfObject(const Game & game, const Scene & scene, std::string name, bool searchInGroups)
{
    unsigned int objectTypeId = 0;

    //Search in objects
    int IDsceneObject = Picker::PickOneObject( &scene.initialObjects, name );
    int IDglobalObject = Picker::PickOneObject( &game.globalObjects, name );

    if ( IDsceneObject != -1 )
        objectTypeId = scene.initialObjects[IDsceneObject]->GetTypeId();
    else if ( IDglobalObject != -1 )
        objectTypeId = game.globalObjects[IDglobalObject]->GetTypeId();

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<scene.objectGroups.size();++i)
        {
            if ( scene.objectGroups[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same typeId.

                vector < string > groupsObjects = scene.objectGroups[i].GetAllObjectsNames();
                unsigned int previousTypeId = groupsObjects.empty() ? 0 : GetTypeIdOfObject(game, scene, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeIdOfObject(game, scene, groupsObjects[j], false) != previousTypeId )
                        return 0; //The group has more than one type.

                }

                if ( objectTypeId != 0 && previousTypeId != objectTypeId )
                    return 0; //The group has not the same type has an object

                objectTypeId = previousTypeId;
            }
        }
    }

    return objectTypeId;
}
