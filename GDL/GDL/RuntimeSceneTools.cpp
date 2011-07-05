#include "GDL/RuntimeSceneTools.h"
#include "GDL/RuntimeScene.h"

bool GD_API LayerVisible( RuntimeScene & scene, const std::string & layer )
{
    return scene.GetLayer(layer).GetVisibility();
}

void GD_API ShowLayer( RuntimeScene & scene, const std::string & layer )
{
    scene.GetLayer(layer).SetVisibility(true);
}

void GD_API HideLayer( RuntimeScene & scene, const std::string & layer )
{
    scene.GetLayer(layer).SetVisibility(false);
}

void GD_API ChangeSceneBackground( RuntimeScene & scene, std::string newColor )
{
    vector < string > colors = SpliterStringToVector <string> (newColor, ';');

    if ( colors.size() > 2 )
    {
        scene.backgroundColorR = ToInt(colors[0]);
        scene.backgroundColorG = ToInt(colors[1]);
        scene.backgroundColorB = ToInt(colors[2]);
    }

    return;
}

void GD_API StopGame( RuntimeScene & scene )
{
    scene.GotoSceneWhenEventsAreFinished(-2);
    return;
}

void GD_API ChangeScene( RuntimeScene & scene, std::string newSceneName )
{
    for ( unsigned int i = 0;i < scene.game->scenes.size() ; ++i )
    {
        if ( scene.game->scenes[i]->GetName() == newSceneName )
        {
            scene.GotoSceneWhenEventsAreFinished(i);
            return;
        }
    }

   return;
}

bool GD_API SceneJustBegins(RuntimeScene & scene )
{
    return scene.IsFirstLoop();
}

void GD_API MoveObjects( RuntimeScene & scene )
{
    ObjList allObjects = scene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + allObjects[id]->TotalForceX() * scene.GetElapsedTime() );
        allObjects[id]->SetY( allObjects[id]->GetY() + allObjects[id]->TotalForceY() * scene.GetElapsedTime() );

        allObjects[id]->UpdateForce( scene.GetElapsedTime() );
    }

    return;
}

void GD_API CreateObjectOnScene(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectWanted, float positionX, float positionY, const std::string & layer)
{
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.initialObjects.begin(), scene.initialObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(scene.game->globalObjects.begin(), scene.game->globalObjects.end(), std::bind2nd(ObjectHasName(), objectWanted));

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( sceneObject != scene.initialObjects.end() ) //We check first scene's objects' list.
        newObject = (*sceneObject)->Clone();
    else if ( globalObject != scene.game->globalObjects.end() ) //Then the global object list
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

bool GD_API PickAllObjects(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName)
{
    std::vector<Object*> objectsOnScene = scene.objectsInstances.GetObjectsRawPointers(objectName);
    for (unsigned int i = 0;i<objectsOnScene.size();++i)
    {
        if ( find(pickedObjects.begin(), pickedObjects.end(), objectsOnScene[i]) == pickedObjects.end() )
            pickedObjects.push_back(objectsOnScene[i]);
    }

    return true;
}

bool GD_API PickRandomObject(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName)
{
    if ( !pickedObjects.empty() )
    {
        unsigned int id = sf::Randomizer::Random(0, pickedObjects.size()-1);
        Object * theChosenOne = pickedObjects[id];

        pickedObjects.clear();
        pickedObjects.push_back(theChosenOne);
    }

    return true;
}

Variable & GD_API GetSceneVariable(RuntimeScene & scene, const std::string & variableName)
{
    return scene.variables.ObtainVariable(variableName);
}

Variable & GD_API GetGlobalVariable(RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->variables.ObtainVariable(variableName);
}

bool GD_API SceneVariableDefined(RuntimeScene & scene, const std::string & variableName)
{
    return scene.variables.HasVariable(variableName);
}

bool GD_API GlobalVariableDefined(RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->variables.HasVariable(variableName);
}

double GD_API GetSceneVariableValue( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.variables.GetVariableValue( variableName );
}

const std::string & GD_API GetSceneVariableString( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.variables.GetVariableString( variableName );
}

double GD_API GetGlobalVariableValue( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->variables.GetVariableValue( variableName );
}

const std::string & GD_API GetGlobalVariableString( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->variables.GetVariableString( variableName );
}
