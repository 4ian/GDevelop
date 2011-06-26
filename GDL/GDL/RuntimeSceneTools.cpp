#include "GDL/RuntimeSceneTools.h"
#include "GDL/RuntimeScene.h"

void CreateObjectOnScene(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectWanted, float positionX, float positionY, const std::string & layer)
{
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game->globalObjects.begin(), game->globalObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( sceneObject != scene.initialObjects.end() ) //We check first scene's objects' list.
        newObject = (*sceneObject)->Clone();
    else if ( globalObject != game->globalObjects.end() ) //Then the global object list
        newObject = (*globalObject)->Clone();
    else
        return;

    //Ajout à la liste d'objet et configuration de sa position
    newObject->SetX( positionX );
    newObject->SetY( positionY );
    newObject->LoadRuntimeResources(scene, *scene.game->imageManager);

    newObject->SetLayer( layer );

    //Add object to scene and let it be concerned by futures actions
    scene.objectsInstances.AddObject(newObject);
    pickedObjects.push_back( newObject.get() );
}

void PickAllObjects(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName)
{
    std::vector<Object*> objectsOnScene = scene.objectsInstances.GetObjectsRawPointers(objectName);
    for (unsigned int i = 0;i<objectsOnScene.size();++i)
    {
        if ( find(pickedObjects.begin(), pickedObjects.end(), objectsOnScene[i]) == pickedObjects.end() )
            pickedObjects.push_back(objectsOnScene[i]);
    }
}

void PickRandomObject(std::vector<Object*> & pickedObjects, const std::string & objectName)
{
    if ( !pickedObjects.empty() )
    {
        unsigned int id = sf::Randomizer::Random(0, pickedObjects.size()-1);
        Object * theChosenOne = pickedObjects[id];

        pickedObjects.clear();
        pickedObjects.push_back(theChosenOne);
    }
}

Variable & GetSceneVariable(RuntimeScene & scene, std::string variableName)
{
    return scene.variables.ObtainVariable(variableName);
}

Variable & GetGlobalVariable(RuntimeScene & scene, std::string variableName)
{
    return scene.game->variables.ObtainVariable(variableName);
}

bool SceneVariableDefined(RuntimeScene & scene, std::string variableName)
{
    return scene.variables.HasVariable(variableName);
}

bool GlobalVariableDefined(RuntimeScene & scene, std::string variableName)
{
    return scene.game->variables.HasVariable(variableName);
}

double GetVariableValue( const RuntimeScene & scene, std::string variableName)
{
    return scene.variables.GetVariableValue( variableName );
}

const std::string & GetVariableString( const RuntimeScene & scene, std::string variableName)
{
    return scene.variables.GetVariableString( variableName );
}

double GetGlobalVariableValue( const RuntimeScene & scene, std::string variableName)
{
    return scene.game->variables.GetVariableValue( variableName );
}

const std::string & GetGlobalVariableString( const RuntimeScene & scene, std::string variableName)
{
    return scene.game->variables.GetVariableString( variableName );
}
