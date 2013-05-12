/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include <wx/msgdlg.h> //Must be placed first
#endif
#include "GDL/BuiltinExtensions/RuntimeSceneTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/BuiltinExtensions/CommonInstructionsTools.h"
#include "GDL/RuntimeObject.h"
#include "GDL/ImageManager.h"
#include "GDL/CppPlatform.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/Project.h"
#include "GDL/profile.h"
#include "GDL/CommonTools.h"
#include "GDL/Variable.h"
#include "GDL/Text.h"

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
    for ( unsigned int i = 0;i < scene.game->GetLayoutCount(); ++i )
    {
        if ( scene.game->GetLayout(i).GetName() == newSceneName )
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
    RuntimeObjList allObjects = scene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + allObjects[id]->TotalForceX() * static_cast<double>(scene.GetElapsedTime())/1000000.0 );
        allObjects[id]->SetY( allObjects[id]->GetY() + allObjects[id]->TotalForceY() * static_cast<double>(scene.GetElapsedTime())/1000000.0 );

        allObjects[id]->UpdateForce( static_cast<double>(scene.GetElapsedTime())/1000000.0 );
    }

    return;
}

namespace {

void DoCreateObjectOnScene(RuntimeScene & scene, std::string objectName, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists, float positionX, float positionY, const std::string & layer)
{
    if ( pickedObjectLists.empty() ) return;

    //Find the object to be created
    std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetObjects().begin(), scene.GetObjects().end(), std::bind2nd(ObjectHasName(), objectName));
    std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(scene.game->GetObjects().begin(), scene.game->GetObjects().end(), std::bind2nd(ObjectHasName(), objectName));

    RuntimeObjSPtr newObject = boost::shared_ptr<RuntimeObject> ();

    if ( sceneObject != scene.GetObjects().end() ) //We check first scene's objects' list.
        newObject = CppPlatform::Get().CreateRuntimeObject(scene, **sceneObject);
    else if ( globalObject != scene.game->GetObjects().end() ) //Then the global object list
        newObject = CppPlatform::Get().CreateRuntimeObject(scene, **globalObject);

    if ( newObject == boost::shared_ptr<RuntimeObject> () )
        return; //Unable to create the object

    //Set up the object
    newObject->SetX( positionX );
    newObject->SetY( positionY );
    newObject->SetLayer( layer );

    //Add object to scene and let it be concerned by futures actions
    scene.objectsInstances.AddObject(newObject);
    pickedObjectLists[objectName]->push_back( newObject.get() );
}


}

void GD_API CreateObjectOnScene(RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists, float positionX, float positionY, const std::string & layer)
{
    if ( pickedObjectLists.empty() ) return;

    ::DoCreateObjectOnScene(scene, pickedObjectLists.begin()->first, pickedObjectLists, positionX, positionY, layer);
}

void GD_API CreateObjectFromGroupOnScene(RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists, const std::string & objectWanted, float positionX, float positionY, const std::string & layer)
{
    if ( pickedObjectLists[objectWanted] == NULL ) return; //Bail out if the object is not present in the specified group

    ::DoCreateObjectOnScene(scene, objectWanted, pickedObjectLists, positionX, positionY, layer);
}

bool GD_API PickAllObjects(RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            std::vector<RuntimeObject*> objectsOnScene = scene.objectsInstances.GetObjectsRawPointers(it->first);

            for (unsigned int j = 0;j<objectsOnScene.size();++j)
            {
                if ( find(it->second->begin(), it->second->end(), objectsOnScene[j]) == it->second->end() )
                    it->second->push_back(objectsOnScene[j]);
            }
        }
    }

    return true;
}

bool GD_API PickRandomObject(RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    //Create a list with all objects
    std::vector<RuntimeObject*> allObjects;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(allObjects));
    }

    if ( !allObjects.empty() )
    {
        unsigned int id = GDpriv::CommonInstructions::Random(allObjects.size()-1);
        RuntimeObject * theChosenOne = allObjects[id];

        for (std::map <std::string, std::vector<RuntimeObject*> *>::iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
        {
            if ( it->second != NULL ) it->second->clear();
        }

        if ( pickedObjectLists[theChosenOne->GetName()] != NULL ) pickedObjectLists[theChosenOne->GetName()]->push_back(theChosenOne);
    }

    return true;
}

gd::Variable & GD_API GetSceneVariable(RuntimeScene & scene, const std::string & variableName)
{
    return scene.GetVariables().ObtainVariable(variableName);
}

gd::Variable & GD_API GetGlobalVariable(RuntimeScene & scene, const std::string & variableName)
{

    return scene.game->GetVariables().ObtainVariable(variableName);
}

gd::Variable & GD_API IndexGetSceneVariable(RuntimeScene & scene, unsigned int index)
{
    return scene.GetVariables().GetVariable(index);
}

gd::Variable & GD_API IndexGetGlobalVariable(RuntimeScene & scene, unsigned int index)
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
    boost::shared_ptr<SFMLTextureWrapper> image = scene.game->GetImageManager()->GetSFMLTexture(imageName);
    if ( image == boost::shared_ptr<SFMLTextureWrapper>() )
        return;

    scene.renderWindow->setIcon(image->image.getSize().x, image->image.getSize().y, image->image.getPixelsPtr());
}

void GD_API SetWindowTitle(RuntimeScene & scene, const std::string & newName)
{
    scene.SetWindowDefaultTitle( newName );
    if (scene.renderWindow != NULL) scene.renderWindow->setTitle(scene.GetWindowDefaultTitle());
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
        scene.renderWindow->create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else
    {
        scene.renderWindow->create( sf::VideoMode( windowWidth, windowHeight, 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close );
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
        scene.renderWindow->create( sf::VideoMode( scene.game->GetMainWindowDefaultWidth(), scene.game->GetMainWindowDefaultHeight(), 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close | sf::Style::Fullscreen );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    else if ( !fullscreen && scene.RenderWindowIsFullScreen() )
    {
        scene.SetRenderWindowIsFullScreen(false);
        scene.renderWindow->create( sf::VideoMode( scene.game->GetMainWindowDefaultWidth(), scene.game->GetMainWindowDefaultHeight(), 32 ), scene.GetWindowDefaultTitle(), sf::Style::Close );
        scene.ChangeRenderWindow(scene.renderWindow);
    }
    #endif
}
unsigned int GD_API GetSceneWindowWidth(RuntimeScene & scene)
{
    if ( scene.renderWindow != NULL )
        return scene.renderWindow->getSize().x;

    return 0;
}

unsigned int GD_API GetSceneWindowHeight(RuntimeScene & scene)
{
    if ( scene.renderWindow != NULL )
        return scene.renderWindow->getSize().y;

    return 0;
}

unsigned int GD_API GetScreenWidth()
{
    sf::VideoMode videoMode = sf::VideoMode::getDesktopMode();

    return videoMode.width;
}

unsigned int GD_API GetScreenHeight()
{
    sf::VideoMode videoMode = sf::VideoMode::getDesktopMode();

    return videoMode.height;
}

unsigned int GD_API GetScreenColorDepth()
{
    sf::VideoMode videoMode = sf::VideoMode::getDesktopMode();

    return videoMode.bitsPerPixel;
}

void GD_API DisplayLegacyTextOnScene( RuntimeScene & scene, const std::string & str, float x, float y, const std::string & color, float characterSize, const std::string & fontName, const std::string & layer)
{
    Text texte;
    texte.text.setString(str);
    texte.text.setPosition(x, y);

    vector < string > colors = SplitString <string> (color, ';');
    if ( colors.size() > 2 ) texte.text.setColor(sf::Color(ToInt(colors[0]), ToInt(colors[1]),ToInt(colors[2]) ));

    texte.text.setCharacterSize(characterSize);
    texte.fontName = fontName;
    texte.layer = layer;

    scene.DisplayText(texte);

    return;
}

void GD_API DisableInputWhenFocusIsLost( RuntimeScene & scene, bool disable )
{
    scene.DisableInputWhenFocusIsLost(disable);
}

#if defined(GD_IDE_ONLY)
bool GD_API WarnAboutInfiniteLoop( RuntimeScene & scene )
{
    if (wxMessageBox(_("A \"While\" event was repeated 100000 times: You may have created an infinite loop, which is repeating itself indefinitely and which is going to freeze the software.\n"
                       "\n"
                       "If you want to stop the preview to correct the issue, click on Yes.\n"
                       "If you want to continue the preview, click on No.\n"
                       "You can deactivate this warning by double clicking on While events.\n"
                       "\n"
                       "Stop the preview?"), _("Infinite loop"), wxYES_NO|wxICON_EXCLAMATION ) == wxYES)
    {
        scene.running = false;
        return true;
    }

    return false;
}
#endif

