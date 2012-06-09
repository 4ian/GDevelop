/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <sstream>
#include <fstream>
#include <iomanip>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/ImageManager.h"
#include "GDL/SoundManager.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Layer.h"
#include "GDL/profile.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Position.h"
#include "GDL/FontManager.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "GDL/RuntimeContext.h"
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeGame.h"

#include "GDL/CodeExecutionEngine.h"
#if defined(GD_IDE_ONLY)
#include "GDL/ProfileEvent.h"
#include "GDL/IDE/BaseProfiler.h"
#include "GDL/IDE/BaseDebugger.h"
#include "GDL/BuiltinExtensions/ProfileTools.h"
#endif
#undef GetObject //Disable an annoying macro

void MessageLoading( string message, float avancement ); //Prototype de la fonction pour renvoyer un message
//La fonction est implémenté différemment en fonction du runtime ou de l'éditeur

RuntimeLayer RuntimeScene::badLayer;

RuntimeScene::RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_) :
renderWindow(renderWindow_),
game(game_),
#if defined(GD_IDE_ONLY)
debugger(NULL),
#endif
running(true),
firstLoop(true),
isFullScreen(false),
realElapsedTime(0),
elapsedTime(0),
timeScale(1),
timeFromStart(0),
pauseTime(0),
specialAction(-1)
{
    //Calque par défaut
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->GetMainWindowDefaultWidth(), game->GetMainWindowDefaultHeight() ) );
    Layer layer;
    layer.SetCamerasNumber(1);

    layers.push_back(RuntimeLayer(layer, defaultView));

    ChangeRenderWindow(renderWindow);
}

RuntimeScene::~RuntimeScene()
{
    const vector < boost::shared_ptr<ExtensionBase> > extensions = ExtensionsManager::GetInstance()->GetExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
    {
        if ( extensions[i] != boost::shared_ptr<ExtensionBase>() )
            extensions[i]->SceneUnloaded(*this);
    }

    objectsInstances.Clear(); //Force destroy objects NOW as they can have pointers to some
                              //RuntimeScene members which so need to be destroyed AFTER objects.
}

void RuntimeScene::Init(const RuntimeScene & scene)
{
    renderWindow = scene.renderWindow;
    game = scene.game;
    #if defined(GD_IDE_ONLY)
    debugger = scene.debugger;
    #endif
    running = scene.running;

    objectsInstances = scene.objectsInstances.CopyAndCloneAllObjects();

    variables = scene.GetVariables();
    textes = scene.textes;
    timers = scene.timers;
    pauseTime = scene.pauseTime;

    codeExecutionEngine = scene.codeExecutionEngine;

    firstLoop = scene.firstLoop;
    isFullScreen = scene.isFullScreen;
    realElapsedTime = scene.realElapsedTime;
    elapsedTime = scene.elapsedTime;
    timeScale = scene.timeScale;
    timeFromStart = scene.timeFromStart;
    specialAction = scene.specialAction;
    renderTargetEvents = scene.renderTargetEvents;

    automatismsSharedDatas.clear();
    for (std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedDatas> >::const_iterator it = scene.automatismsSharedDatas.begin();
         it != scene.automatismsSharedDatas.end();++it)
    {
    	automatismsSharedDatas[it->first] = it->second->Clone();
    }
}

RuntimeScene::RuntimeScene(const RuntimeScene & scene) : Scene(scene)
{
    Init(scene);
}

RuntimeScene& RuntimeScene::operator=(const RuntimeScene & scene)
{
    if( (this) != &scene )
    {
        Scene::operator=(scene);
        Init(scene);
    }

    return *this;
}

void RuntimeScene::ChangeRenderWindow(sf::RenderWindow * newWindow)
{
    if ( newWindow == NULL )
    {
        cout << "Try to change renderWindow to a NULL window." << endl;
        return;
    }

    renderWindow = newWindow;
    renderWindow->SetTitle(GetWindowDefaultTitle());

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->GetWidth())/static_cast<double>(renderWindow->GetHeight());
    gluPerspective(oglFOV, windowRatio, oglZNear, oglZFar);
}

#ifndef RELEASE
void DisplayProfile(sf::RenderWindow * renderWindow, CProfileIterator * iter, int x, int & y)
{
    FontManager * fontManager = FontManager::GetInstance();

    y += 15;
    while ( !iter->Is_Done() )
    {
        sf::Text text("", *fontManager->GetFont("consola.ttf"));
        text.SetCharacterSize(12);
        ostringstream texte;
        if ( CProfileManager::Get_Frame_Count_Since_Reset() != 0 )
            texte << fixed <<  iter->Get_Current_Name()   << " Calls/Frame:" << iter->Get_Current_Total_Calls()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " Time/Frame:" << iter->Get_Current_Total_Time()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " %Time/Parent " << iter->Get_Current_Total_Time()/iter->Get_Current_Parent_Total_Time()*100.0f;
        text.SetString(texte.str());
        text.SetPosition(x,y);
        renderWindow->Draw(text);

        //Childs
        CProfileIterator * childIter = CProfileManager::Get_Iterator();
        *childIter = *iter;
        childIter->Enter_Child(0);
        DisplayProfile(renderWindow, childIter, x+15, y);
        CProfileManager::Release_Iterator(childIter);

        y += 15;
        iter->Next();
    }
}
#endif

int RuntimeScene::RenderAndStep(unsigned int nbStep)
{
#if defined(DEV) || defined(DEBUG)
    BT_PROFILE("RenderAndStep");
#endif

    for (unsigned int step = 0;step<nbStep;++step)
    {
        //Gestion pré-évènements
        ManageRenderTargetEvents();
        UpdateTime();
        ManageObjectsBeforeEvents();
        SoundManager::GetInstance()->ManageGarbage();

        #if defined(GD_IDE_ONLY)
        if( profiler )
        {
            if ( firstLoop ) profiler->Reset();
            profiler->eventsClock.reset();
        }
        #endif

        {
#if defined(DEV) || defined(DEBUG)
            BT_PROFILE("Events");
#endif
            codeExecutionEngine->Execute();
        }

        #if defined(GD_IDE_ONLY)
        if( profiler && profiler->profilingActivated )
        {
            profiler->lastEventsTime = profiler->eventsClock.getTimeMicroseconds();
            profiler->renderingClock.reset();
        }
        #endif

        //Gestions post-évènements
        ManageObjectsAfterEvents();

        #if defined(GD_IDE_ONLY)
        if( debugger )
            debugger->Update();
        #endif

        //Rendering
        Render();
        textes.clear(); //Legacy texts

        #if defined(GD_IDE_ONLY)
        if( profiler && profiler->profilingActivated )
        {
            profiler->lastRenderingTime = profiler->renderingClock.getTimeMicroseconds();
            profiler->totalSceneTime += profiler->lastRenderingTime + profiler->lastEventsTime;
            profiler->totalEventsTime += profiler->lastEventsTime;
            profiler->Update();
        }
        #endif

        if ( firstLoop ) firstLoop = false; //The first frame is passed
    }

    return specialAction;
}

void RuntimeScene::ManageRenderTargetEvents()
{
    renderTargetEvents.clear();

    sf::Event event;
    while ( renderWindow->PollEvent( event ) )
    {
        renderTargetEvents.push_back(event);

        // Close window : exit
        if ( event.Type == sf::Event::Closed )
        {
            running = false;
            #if defined(GD_IDE_ONLY)
            renderWindow->Close();
            #endif
        }
        else if (event.Type == sf::Event::Resized)
        {
            //Resetup OpenGL
            glEnable(GL_DEPTH_TEST);
            glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            glDepthMask(GL_TRUE);
            glClearDepth(1.f);

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();

            double windowRatio = static_cast<double>(event.Size.Width)/static_cast<double>(event.Size.Height);
            gluPerspective(oglFOV, windowRatio, oglZNear, oglZFar);
        }
    }
}


void RuntimeScene::RenderWithoutStep()
{
    ManageRenderTargetEvents();

    Render();

    #if defined(GD_IDE_ONLY)
    if( debugger )
        debugger->Update();
    #endif
}

void RuntimeScene::Render()
{
    renderWindow->Clear( sf::Color( GetBackgroundColorRed(), GetBackgroundColorGreen(), GetBackgroundColorBlue() ) );

    //Sort object by order to render them
    ObjList allObjects = objectsInstances.GetAllObjects();
    OrderObjectsByZOrder( allObjects );

    //To allow using OpenGL to draw :
    glClear(GL_DEPTH_BUFFER_BIT); // Clear the depth buffer
    renderWindow->SaveGLStates();
    renderWindow->SetActive();

    //Draw layer by layer
    for (unsigned int layerIndex =0;layerIndex<layers.size();++layerIndex)
    {
        if ( layers.at(layerIndex).GetVisibility() )
        {
            for (unsigned int cameraIndex = 0;cameraIndex < layers[layerIndex].GetCamerasNumber();++cameraIndex)
            {
                RuntimeCamera & camera = layers[layerIndex].GetCamera(cameraIndex);

                //Prepare OpenGL rendering
                renderWindow->RestoreGLStates();

                glMatrixMode(GL_PROJECTION);
                glLoadIdentity();
                gluPerspective(oglFOV, camera.GetSFMLView().GetSize().x
                                    /camera.GetSFMLView().GetSize().y, oglZNear, oglZFar);

                const sf::FloatRect & viewport = camera.GetSFMLView().GetViewport();
                glViewport(viewport.Left*renderWindow->GetWidth(),
                           renderWindow->GetHeight()-(viewport.Top+viewport.Height)*renderWindow->GetHeight(), //Y start from bottom
                           viewport.Width*renderWindow->GetWidth(),
                           viewport.Height*renderWindow->GetHeight());

                renderWindow->SaveGLStates();

                //Prepare SFML rendering
                renderWindow->SetView(camera.GetSFMLView());

                //Rendering all objects
                for (unsigned int id = 0;id < allObjects.size();++id)
                {
                    //Affichage de l'objet si il appartient au calque
                    if ( allObjects[id]->GetLayer() == layers[layerIndex].GetName() )
                        allObjects[id]->Draw( *renderWindow );
                }

                //Texts
                DisplayLegacyTexts(layers.at(layerIndex).GetName());
            }
        }
    }

        //Internal profiler
        #ifndef RELEASE
        if ( sf::Keyboard::IsKeyPressed(sf::Keyboard::F2))
            CProfileManager::Reset();

        renderWindow->SetView(sf::View(sf::FloatRect(0.0f,0.0f, game->GetMainWindowDefaultWidth(), game->GetMainWindowDefaultHeight())));

        CProfileIterator * iter = CProfileManager::Get_Iterator();
        int y = 0;
        DisplayProfile(renderWindow, iter, 0,y);
        CProfileManager::Increment_Frame_Counter();
        #endif

    // Display window contents on screen
    renderWindow->RestoreGLStates();
    renderWindow->Display();
}

RuntimeLayer & RuntimeScene::GetLayer(const string & name)
{
    std::vector<RuntimeLayer>::iterator layer = std::find_if(layers.begin(), layers.end(), std::bind2nd(RuntimeLayerHasName(), name));

    if ( layer != layers.end() ) return *layer;

    return badLayer;
}

const RuntimeLayer & RuntimeScene::GetLayer(const string & name) const
{
    std::vector<RuntimeLayer>::const_iterator layer = std::find_if(layers.begin(), layers.end(), std::bind2nd(RuntimeLayerHasName(), name));

    if ( layer != layers.end() ) return *layer;

    return badLayer;
}

bool RuntimeScene::UpdateTime()
{
    //Update time elapsed since last frame
    realElapsedTime = renderWindow->GetFrameTime();
    realElapsedTime -= pauseTime; //On enlève le temps de pause

    //On modifie ce temps écoulé si il est trop bas.
    if ( game->GetMinimumFPS() != 0 && realElapsedTime > 1000.0/static_cast<double>(game->GetMinimumFPS()) )
        realElapsedTime = 1000.0/static_cast<double>(game->GetMinimumFPS()); //On ralentit le jeu si les FPS sont trop bas.

    elapsedTime = realElapsedTime*timeScale; //Le temps écoulé par le jeu est modifié suivant l'échelle du temps

    timeFromStart += elapsedTime;
    pauseTime = 0;

    for (unsigned int i =0;i<timers.size();++i)
        timers[i].UpdateTime(elapsedTime);

    return true;
}

////////////////////////////////////////////////////////////
/// Met à jour un tableau contenant l'ordre d'affichage des objets
////////////////////////////////////////////////////////////
bool RuntimeScene::OrderObjectsByZOrder( ObjList & objList )
{
    if ( standardSortMethod )
        std::sort( objList.begin(), objList.end(), SortByZOrder() );
    else
        std::stable_sort( objList.begin(), objList.end(), SortByZOrder() );

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche le texte
////////////////////////////////////////////////////////////
bool RuntimeScene::DisplayLegacyTexts(string layer)
{
    for ( unsigned int i = 0;i < textes.size();i++ )
    {
        if ( textes[i].layer == layer )
            textes[i].Draw(*renderWindow);
    }

    return true;
}

/**
 * Delete objects, updates time and launch automatisms
 */
void RuntimeScene::ManageObjectsAfterEvents()
{
    ObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
    	if ( allObjects[id]->GetName().empty() )
        {
            for (unsigned int i = 0;i<extensionsToBeNotifiedOnObjectDeletion.size();++i)
                extensionsToBeNotifiedOnObjectDeletion[i]->ObjectDeletedFromScene(*this, allObjects[id].get());

            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects instances, not from the temporary list !
        }
    }

    allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + ( allObjects[id]->TotalForceX() * static_cast<double>(GetElapsedTime())/1000.0f ));
        allObjects[id]->SetY( allObjects[id]->GetY() + ( allObjects[id]->TotalForceY() * static_cast<double>(GetElapsedTime())/1000.0f ));
        allObjects[id]->UpdateTime( static_cast<double>(GetElapsedTime())/1000.0f );
        allObjects[id]->UpdateForce( static_cast<double>(GetElapsedTime())/1000.0f );
        allObjects[id]->DoAutomatismsPostEvents(*this);
    }
}

/**
 * Manage objects before launching events
 */
void RuntimeScene::ManageObjectsBeforeEvents()
{
    ObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
        allObjects[id]->DoAutomatismsPreEvents(*this);

}

void RuntimeScene::GotoSceneWhenEventsAreFinished(int scene)
{
    specialAction = scene;
}

void RuntimeScene::CreateObjectsFrom(const InitialInstancesContainer & container, float xOffset, float yOffset)
{
    for(unsigned int i = 0;i < container.GetInstancesCount();++i)
    {
        const InitialPosition & initialInstance = container.GetInstance(i);

        std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(GetInitialObjects().begin(), GetInitialObjects().end(), std::bind2nd(ObjectHasName(), initialInstance.GetObjectName()));
        std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game->GetGlobalObjects().begin(), game->GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), initialInstance.GetObjectName()));

        ObjSPtr newObject = boost::shared_ptr<Object> ();

        if ( sceneObject != GetInitialObjects().end() ) //We check first scene's objects' list.
            newObject = boost::shared_ptr<Object>((*sceneObject)->Clone());
        else if ( globalObject != game->GetGlobalObjects().end() ) //Then the global object list
            newObject = boost::shared_ptr<Object>((*globalObject)->Clone());

        if ( newObject != boost::shared_ptr<Object> () )
        {
            newObject->SetX( initialInstance.GetX() + xOffset );
            newObject->SetY( initialInstance.GetY() + yOffset );
            newObject->SetZOrder( initialInstance.GetZOrder() );
            newObject->SetLayer( initialInstance.GetLayer() );
            newObject->InitializeFromInitialPosition(initialInstance);
            newObject->SetAngle( initialInstance.GetAngle() );

            if ( initialInstance.HasCustomSize() )
            {
                newObject->SetWidth(initialInstance.GetWidth());
                newObject->SetHeight(initialInstance.GetHeight());
            }

            //Substitute initial variables specific to that object instance.
            const std::vector<Variable> & instanceSpecificVariables = initialInstance.GetVariables().GetVariablesVector();
            for (unsigned int j = 0;j<instanceSpecificVariables.size();++j)
            {
                newObject->GetVariables().ObtainVariable(instanceSpecificVariables[j].GetName()) = instanceSpecificVariables[j];
            }

            newObject->LoadRuntimeResources(*this, *game->imageManager);

            objectsInstances.AddObject(newObject);
        }
        else
            std::cout << "Could not find and put object " << initialInstance.GetObjectName() << std::endl;
    }
}

bool RuntimeScene::LoadFromScene( const Scene & scene )
{
    return LoadFromSceneAndCustomInstances(scene, scene.GetInitialInstances());
}

bool RuntimeScene::LoadFromSceneAndCustomInstances( const Scene & scene, const InitialInstancesContainer & instances )
{
    MessageLoading( "Loading scene", 10 );

    //Copy inherited scene
    Scene::operator=(scene);

    //Clear RuntimeScene datas
    objectsInstances.Clear();
    textes.clear();
    timers.clear();
    layers.clear();
    firstLoop = true;
    elapsedTime = 0;
    realElapsedTime = 0;
    pauseTime = 0;
    timeScale = 1;
    timeFromStart = 0;
    specialAction = -1;

    codeExecutionEngine = scene.codeExecutionEngine;
    codeExecutionEngine->llvmRuntimeContext->scene = this;

    //Initialize variables
    variables = scene.GetVariables();

    //Initialize runtime layers
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->GetMainWindowDefaultWidth(), game->GetMainWindowDefaultHeight() ) );
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        layers.push_back(RuntimeLayer(initialLayers[i], defaultView));
    }

    //Load resources of initial objects
    MessageLoading( "Loading objects resources", 30 );
    for (unsigned int i = 0; i < GetInitialObjects().size();++i)
        GetInitialObjects()[i]->LoadResources(*this, *game->imageManager);

    //Load resources of global objects
    //TODO : Make this only one time during game
    for (unsigned int i = 0; i < game->GetGlobalObjects().size();++i)
        game->GetGlobalObjects()[i]->LoadResources(*this, *game->imageManager);

    //Create object instances which are originally positioned on scene
    MessageLoading( "Adding objects to their initial position", 66 );
    CreateObjectsFrom(instances);

    //Automatisms data
    automatismsSharedDatas.clear();
    for(std::map < std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
        it != scene.automatismsInitialSharedDatas.end();
        ++it)
    {
        automatismsSharedDatas[it->first] = it->second->CreateRuntimeSharedDatas();
    }

    //Extensions specific initialization
    const vector < boost::shared_ptr<ExtensionBase> > extensions = ExtensionsManager::GetInstance()->GetExtensions();
	for (unsigned int i = 0;i<extensions.size();++i)
    {
        if ( extensions[i] != boost::shared_ptr<ExtensionBase>() )
        {
            extensions[i]->SceneLoaded(*this);
            if ( extensions[i]->ToBeNotifiedOnObjectDeletion() ) extensionsToBeNotifiedOnObjectDeletion.push_back(extensions[i].get());
        }
    }

    if ( stopSoundsOnStartup ) {SoundManager::GetInstance()->ClearAllSoundsAndMusics(); }
    if ( renderWindow ) renderWindow->SetTitle(GetWindowDefaultTitle());

    MessageLoading( "Loading finished", 100 );

    return true;
}
