/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include <wx/msgdlg.h> //Must be placed first
#endif
#include "GDL/BuiltinExtensions/RuntimeSceneTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/BuiltinExtensions/CommonInstructionsTools.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/RuntimeGame.h"

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
    vector < string > colors = SplitString <string> (newColor, ';');
    if ( colors.size() > 2 ) scene.SetBackgroundColor( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2]) );

    return;
}

void GD_API StopGame( RuntimeScene & scene )
{
    scene.GotoSceneWhenEventsAreFinished(-2);
    return;
}

void GD_API ChangeScene( RuntimeScene & scene, std::string newSceneName )
{
    for ( unsigned int i = 0;i < scene.game->GetLayouts().size() ; ++i )
    {
        if ( scene.game->GetLayouts()[i]->GetName() == newSceneName )
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
        allObjects[id]->SetX( allObjects[id]->GetX() + allObjects[id]->TotalForceX() * static_cast<double>(scene.GetElapsedTime())/1000.0f );
        allObjects[id]->SetY( allObjects[id]->GetY() + allObjects[id]->TotalForceY() * static_cast<double>(scene.GetElapsedTime())/1000.0f );

        allObjects[id]->UpdateForce( static_cast<double>(scene.GetElapsedTime())/1000.0f );
    }

    return;
}

void GD_API CreateObjectOnScene(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int useless, const std::string & objectWanted, float positionX, float positionY, const std::string & layer)
{
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(scene.game->GetGlobalObjects().begin(), scene.game->GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), objectWanted));

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
        newObject = boost::shared_ptr<Object>((*sceneObject)->Clone());
    else if ( globalObject != scene.game->GetGlobalObjects().end() ) //Then the global object list
        newObject = boost::shared_ptr<Object>((*globalObject)->Clone());
    else
        return;

    //Ajout à la liste d'objet et configuration de sa position
    newObject->SetX( positionX );
    newObject->SetY( positionY );
    newObject->LoadRuntimeResources(scene, *scene.game->imageManager);

    newObject->SetLayer( layer );

    //Add object to scene and let it be concerned by futures actions
    scene.objectsInstances.AddObject(newObject);
    if ( pickedObjectLists[objectWanted] != NULL && find(pickedObjectLists[objectWanted]->begin(), pickedObjectLists[objectWanted]->end(), newObject.get()) == pickedObjectLists[objectWanted]->end() )
        pickedObjectLists[objectWanted]->push_back( newObject.get() );
}

void GD_API CreateObjectFromGroupOnScene(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, const std::string &, const std::string & objectWanted, float positionX, float positionY, const std::string & layer)
{
    if ( pickedObjectLists[objectWanted] == NULL ) return; //Bail out if the object is not present in the specified group

    CreateObjectOnScene(scene, pickedObjectLists, 0, objectWanted, positionX, positionY, layer);
}

bool GD_API PickAllObjects(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int, const std::string &)
{
    for (std::map <std::string, std::vector<Object*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            std::vector<Object*> objectsOnScene = scene.objectsInstances.GetObjectsRawPointers(it->first);

            for (unsigned int j = 0;j<objectsOnScene.size();++j)
            {
                if ( find(it->second->begin(), it->second->end(), objectsOnScene[j]) == it->second->end() )
                    it->second->push_back(objectsOnScene[j]);
            }
        }
    }

    return true;
}

bool GD_API PickRandomObject(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int useless, const std::string & objectName)
{
    //Create a list with all objects
    std::vector<Object*> allObjects;
    for (std::map <std::string, std::vector<Object*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(allObjects));
    }

    if ( !allObjects.empty() )
    {
        unsigned int id = GDpriv::CommonInstructions::Random(allObjects.size()-1);
        Object * theChosenOne = allObjects[id];

        for (std::map <std::string, std::vector<Object*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
        {
            if ( it->second != NULL ) it->second->clear();
        }

        if ( pickedObjectLists[theChosenOne->GetName()] != NULL ) pickedObjectLists[theChosenOne->GetName()]->push_back(theChosenOne);
    }

    return true;
}

Variable & GD_API GetSceneVariable(RuntimeScene & scene, const std::string & variableName)
{
    return scene.GetVariables().ObtainVariable(variableName);
}

Variable & GD_API GetGlobalVariable(RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->GetVariables().ObtainVariable(variableName);
}

Variable & GD_API IndexGetSceneVariable(RuntimeScene & scene, unsigned int index)
{
    return scene.GetVariables().GetVariable(index);
}

Variable & GD_API IndexGetGlobalVariable(RuntimeScene & scene, unsigned int index)
{
    return scene.game->GetVariables().GetVariable(index);
}

bool GD_API SceneVariableDefined(RuntimeScene & scene, const std::string & variableName)
{
    return scene.GetVariables().HasVariableNamed(variableName);
}

bool GD_API GlobalVariableDefined(RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->GetVariables().HasVariableNamed(variableName);
}

double GD_API GetSceneVariableValue( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.GetVariables().GetVariableValue( variableName );
}

const std::string & GD_API GetSceneVariableString( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.GetVariables().GetVariableString( variableName );
}

double GD_API GetGlobalVariableValue( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->GetVariables().GetVariableValue( variableName );
}

const std::string & GD_API GetGlobalVariableString( const RuntimeScene & scene, const std::string & variableName)
{
    return scene.game->GetVariables().GetVariableString( variableName );
}

double GD_API IndexGetSceneVariableValue( const RuntimeScene & scene, unsigned int index)
{
    return scene.GetVariables().GetVariablesVector()[index].GetValue();
}

const std::string & GD_API IndexGetSceneVariableString( const RuntimeScene & scene, unsigned int index)
{
    return scene.GetVariables().GetVariable(index).GetString();
}

double GD_API IndexGetGlobalVariableValue( const RuntimeScene & scene, unsigned int index)
{
    return scene.game->GetVariables().GetVariable(index).GetValue();
}

const std::string & GD_API IndexGetGlobalVariableString( const RuntimeScene & scene, unsigned int index)
{
    return scene.game->GetVariables().GetVariable(index).GetString();
}

void GD_API SetWindowIcon(RuntimeScene & scene, const std::string & imageName)
{
    //Retrieve the image
    boost::shared_ptr<SFMLTextureWrapper> image = scene.game->imageManager->GetSFMLTexture(imageName);
    if ( image == boost::shared_ptr<SFMLTextureWrapper>() )
        return;

    scene.renderWindow->SetIcon(image->image.GetWidth(), image->image.GetHeight(), image->image.GetPixelsPtr());
}

void GD_API SetWindowTitle(RuntimeScene & scene, const std::string & newName)
{
    scene.SetWindowDefaultTitle( newName );
    if (scene.renderWindow != NULL) scene.renderWindow->SetTitle(scene.GetWindowDefaultTitle());
}

const std::string & GD_API GetWindowTitle(RuntimeScene & scene)
{
    return scene.GetWindowDefaultTitle();
}

void GD_API SetWindowSize( RuntimeScene & scene, int windowWidth, int windowHeight, bool useTheNewSizeForCameraDefaultSize)
{
    #if !defined(GD_IDE_ONLY)
    if ( useTheNewSizeForCameraDefaultSize ) //Change future cameras default size if wanted.
    {
        scene.game->SetMainWindowDefaultWidth( windowWidth );
        scene.game->SetMainWindowDefaultHeight( windowHeight );
    }

    if ( scene.RenderWindowIsFullScreen() )
    {
        scene.renderWindow->Create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else
    {
        scene.renderWindow->Create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif
}

void GD_API SetFullScreen(RuntimeScene & scene, bool fullscreen)
{
    #if !defined(GD_IDE_ONLY)
    if ( fullscreen && !scene.RenderWindowIsFullScreen() )
    {
        scene.SetRenderWindowIsFullScreen();
        scene.renderWindow->Create( sf::VideoMode( scene.game->GetMainWindowDefaultWidth(), scene.game->GetMainWindowDefaultHeight(), 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else if ( !fullscreen && scene.RenderWindowIsFullScreen() )
    {
        scene.SetRenderWindowIsFullScreen(false);
        scene.renderWindow->Create( sf::VideoMode( scene.game->GetMainWindowDefaultWidth(), scene.game->GetMainWindowDefaultHeight(), 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif
}
unsigned int GD_API GetSceneWindowWidth(RuntimeScene & scene)
{
    if ( scene.renderWindow != NULL )
        return scene.renderWindow->GetWidth();

    return 0;
}

unsigned int GD_API GetSceneWindowHeight(RuntimeScene & scene)
{
    if ( scene.renderWindow != NULL )
        return scene.renderWindow->GetHeight();

    return 0;
}

unsigned int GD_API GetScreenWidth()
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Width;
}

unsigned int GD_API GetScreenHeight()
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.Height;
}

unsigned int GD_API GetScreenColorDepth()
{
    sf::VideoMode videoMode = sf::VideoMode::GetDesktopMode();

    return videoMode.BitsPerPixel;
}

void GD_API DisplayLegacyTextOnScene( RuntimeScene & scene, const std::string & str, float x, float y, const std::string & color, float characterSize, const std::string & fontName, const std::string & layer)
{
    Text texte;
    texte.text.SetString(str);
    texte.text.SetPosition(x, y);

    vector < string > colors = SplitString <string> (color, ';');
    if ( colors.size() > 2 ) texte.text.SetColor(sf::Color(ToInt(colors[0]), ToInt(colors[1]),ToInt(colors[2]) ));

    texte.text.SetCharacterSize(characterSize);
    texte.fontName = fontName;
    texte.layer = layer;

    scene.DisplayText(texte);

    return;
}

#if defined(GD_IDE_ONLY)
bool GD_API WarnAboutInfiniteLoop( RuntimeScene & scene )
{
    if (wxMessageBox(_("Un évènement \"Tant que\" s'est repété pendant 100000 itérations : Il se peut que vous ayez créé une boucle infine, qui se répète sans s'arrêter et qui va donc bloquer le logiciel.\n\n"
                       "Si vous souhaitez arrêter l'aperçu pour corriger le problème, cliquez sur Oui.\n"
                       "Si vous souhaitez continuer l'aperçu, cliquez sur Non.\n"
                       "Vous pouvez désactiver cette avertissement en éditant les évènements \"Tant que\" en double cliquant dessus.\n\n"
                        "Arrêter l'aperçu ?"), _("Risque de boucle infine"), wxYES_NO|wxICON_EXCLAMATION ) == wxYES)
    {
        scene.running = false;
        return true;
    }

    return false;
}
#endif
