#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/Position.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include <iostream>

Scene::Scene() :
backgroundColorR(125),
backgroundColorG(125),
backgroundColorB(125),
standardSortMethod(true),
oglFOV(90.0f),
oglZNear(1.0f),
oglZFar(500.0f),
stopSoundsOnStartup(true)
#if defined(GD_IDE_ONLY)
,wasModified(false),
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

    events = CloneVectorOfEvents(scene.events);

    initialObjects.clear();
    for (unsigned int i =0;i<scene.initialObjects.size();++i)
    	initialObjects.push_back( scene.initialObjects[i]->Clone() );

    objectGroups = scene.objectGroups;
    initialObjectsPositions = scene.initialObjectsPositions;
    initialLayers = scene.initialLayers;
    variables = scene.variables;

    automatismsInitialSharedDatas.clear();
    for (std::map< std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
         it != scene.automatismsInitialSharedDatas.end();++it)
    {
    	automatismsInitialSharedDatas[it->first] = it->second->Clone();
    }

    #if defined(GD_IDE_ONLY)
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
{
    Init(scene);
}

Scene& Scene::operator=(const Scene & scene)
{
    if ( this != &scene )
        Init(scene);

    return *this;
}

std::string GD_API GetTypeOfObject(const Game & game, const Scene & scene, std::string name, bool searchInGroups)
{
    std::string type;

    //Search in objects
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), name));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.globalObjects.begin(), game.globalObjects.end(), std::bind2nd(ObjectHasName(), name));

    if ( sceneObject != scene.initialObjects.end() ) //We check first scene's objects' list.
        type = (*sceneObject)->GetType();
    else if ( globalObject != game.globalObjects.end() ) //Then the global object list
        type = (*globalObject)->GetType();

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<scene.objectGroups.size();++i)
        {
            if ( scene.objectGroups[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < string > groupsObjects = scene.objectGroups[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(game, scene, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(game, scene, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has not the same type has an object

                type = previousType;
            }
        }
        for (unsigned int i = 0;i<game.objectGroups.size();++i)
        {
            if ( game.objectGroups[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have the same type.

                vector < string > groupsObjects = game.objectGroups[i].GetAllObjectsNames();
                std::string previousType = groupsObjects.empty() ? "" : GetTypeOfObject(game, scene, groupsObjects[0], false);

                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    if ( GetTypeOfObject(game, scene, groupsObjects[j], false) != previousType )
                        return ""; //The group has more than one type.

                }

                if ( !type.empty() && previousType != type )
                    return ""; //The group has not the same type has an object

                type = previousType;
            }
        }
    }

    return type;
}

std::string GD_API GetTypeOfAutomatism(const Game & game, const Scene & scene, std::string name, bool searchInGroups)
{
    for (unsigned int i = 0;i<scene.initialObjects.size();++i)
    {
        vector < std::string > automatisms = scene.initialObjects[i]->GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( scene.initialObjects[i]->GetAutomatism(automatisms[j])->GetName() == name )
                return scene.initialObjects[i]->GetAutomatism(automatisms[j])->GetTypeName();
        }
    }

    for (unsigned int i = 0;i<game.globalObjects.size();++i)
    {
        vector < std::string > automatisms = game.globalObjects[i]->GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            if ( game.globalObjects[i]->GetAutomatism(automatisms[j])->GetName() == name )
                return game.globalObjects[i]->GetAutomatism(automatisms[j])->GetTypeName();
        }
    }

    return "";
}

vector < std::string > GD_API GetAutomatismsOfObject(const Game & game, const Scene & scene, std::string name, bool searchInGroups)
{
    bool automatismsAlreadyInserted = false;
    vector < std::string > automatims;

    //Search in objects
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), name));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.globalObjects.begin(), game.globalObjects.end(), std::bind2nd(ObjectHasName(), name));

    if ( sceneObject != scene.initialObjects.end() ) //We check first scene's objects' list.
    {
        vector < std::string > objectAutomatisms = (*sceneObject)->GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
        automatismsAlreadyInserted = true;
    }
    else if ( globalObject != game.globalObjects.end() ) //Then the global object list
    {
        vector < std::string > objectAutomatisms = (*globalObject)->GetAllAutomatismNames();
        copy(objectAutomatisms.begin(), objectAutomatisms.end(), back_inserter(automatims));
        automatismsAlreadyInserted = true;
    }

    //Search in groups
    if ( searchInGroups )
    {
        for (unsigned int i = 0;i<scene.objectGroups.size();++i)
        {
            if ( scene.objectGroups[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = scene.objectGroups[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(game, scene, groupsObjects[j], false);
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
        for (unsigned int i = 0;i<game.objectGroups.size();++i)
        {
            if ( game.objectGroups[i].GetName() == name )
            {
                //A group has the name searched
                //Verifying now that all objects have common automatisms.

                vector < string > groupsObjects = game.objectGroups[i].GetAllObjectsNames();
                for (unsigned int j = 0;j<groupsObjects.size();++j)
                {
                    //Get automatisms of the object of the group and delete automatism which are not in commons.
                	vector < std::string > objectAutomatisms = GetAutomatismsOfObject(game, scene, groupsObjects[j], false);
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
