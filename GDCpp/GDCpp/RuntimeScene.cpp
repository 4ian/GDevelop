/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be include first otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <sstream>
#include <fstream>
#include <iomanip>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeLayer.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Project.h"
#include "GDCpp/Object.h"
#include "GDCpp/ObjectHelpers.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/SoundManager.h"
#include "GDCpp/Layer.h"
#include "GDCpp/profile.h"
#include "GDCpp/Position.h"
#include "GDCpp/FontManager.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCpp/AutomatismsRuntimeSharedData.h"
#include "GDCpp/RuntimeContext.h"
#include "GDCpp/Project.h"
#include "GDCpp/Text.h"
#include "GDCpp/ManualTimer.h"
#include "GDCpp/CppPlatform.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

#include "GDCpp/CodeExecutionEngine.h"
#if defined(GD_IDE_ONLY)
#include "GDCpp/ProfileEvent.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/IDE/BaseDebugger.h"
#include "GDCpp/BuiltinExtensions/ProfileTools.h"
#endif
#include "GDCpp/ExtensionBase.h"
#undef GetObject //Disable an annoying macro

RuntimeLayer RuntimeScene::badRuntimeLayer;

RuntimeScene::RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_) :
    renderWindow(renderWindow_),
    game(game_),
    #if defined(GD_IDE_ONLY)
    debugger(NULL),
    #endif
    firstLoop(true),
    isFullScreen(false),
    inputManager(renderWindow_),
    realElapsedTime(0),
    elapsedTime(0),
    timeScale(1),
    timeFromStart(0),
    pauseTime(0),
    codeExecutionEngine(new CodeExecutionEngine)
{
    ChangeRenderWindow(renderWindow);
}

RuntimeScene::~RuntimeScene()
{
	for (unsigned int i = 0;i<game->GetUsedExtensions().size();++i)
    {
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game->GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension != std::shared_ptr<ExtensionBase>() )
            extension->SceneUnloaded(*this);
    }

    objectsInstances.Clear(); //Force destroy objects NOW as they can have pointers to some
                              //RuntimeScene members which so need to be destroyed AFTER objects.
}

std::shared_ptr<gd::ImageManager> RuntimeScene::GetImageManager() const
{
    return game->GetImageManager();
}

void RuntimeScene::ChangeRenderWindow(sf::RenderWindow * newWindow)
{
    renderWindow = newWindow;
    inputManager.SetWindow(newWindow);

    if (!renderWindow) return;

    renderWindow->setTitle(GetWindowDefaultTitle());
    SetupOpenGLProjection();
}

void RuntimeScene::SetupOpenGLProjection()
{
    glEnable(GL_DEPTH_TEST);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->getSize().x)/static_cast<double>(renderWindow->getSize().y);
    gluPerspective(GetOpenGLFOV(), windowRatio, GetOpenGLZNear(), GetOpenGLZFar());
}

void RuntimeScene::RequestChange(SceneChange::Change change, gd::String sceneName) {
    requestedChange.change = change;
    requestedChange.requestedScene = sceneName;
}

#ifndef RELEASE
void DisplayProfile(sf::RenderWindow * renderWindow, CProfileIterator * iter, int x, int & y)
{
    if (!renderWindow) return;
    FontManager * fontManager = FontManager::Get();

    y += 15;
    while ( !iter->Is_Done() )
    {
        sf::Text text("", *fontManager->GetFont(""));
        text.setCharacterSize(12);
        ostringstream texte;
        if ( CProfileManager::Get_Frame_Count_Since_Reset() != 0 )
            texte << fixed <<  iter->Get_Current_Name()   << " Calls/Frame:" << iter->Get_Current_Total_Calls()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " Time/Frame:" << iter->Get_Current_Total_Time()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " %Time/Parent " << iter->Get_Current_Total_Time()/iter->Get_Current_Parent_Total_Time()*100.0f;
        text.setString(texte.str());
        text.setPosition(x,y);
        renderWindow->draw(text);

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

bool RuntimeScene::RenderAndStep()
{
    requestedChange.change = SceneChange::CONTINUE;
    ManageRenderTargetEvents();
    UpdateTime();
    ManageObjectsBeforeEvents();
    SoundManager::Get()->ManageGarbage();

    #if defined(GD_IDE_ONLY)
    if( GetProfiler() )
    {
        if ( firstLoop ) GetProfiler()->Reset();
        GetProfiler()->eventsClock.reset();
    }
    #endif

    if (GetCodeExecutionEngine()->Ready())
    {
        #if !defined(RELEASE)
        BT_PROFILE("Events");
        #endif
        GetCodeExecutionEngine()->Execute();
    }

    #if defined(GD_IDE_ONLY)
    if( GetProfiler() && GetProfiler()->profilingActivated )
    {
        GetProfiler()->lastEventsTime = GetProfiler()->eventsClock.getTimeMicroseconds();
        GetProfiler()->renderingClock.reset();
    }
    #endif

    ManageObjectsAfterEvents();

    #if defined(GD_IDE_ONLY)
    if( debugger ) debugger->Update();
    #endif

    //Rendering
    Render();
    legacyTexts.clear();

    #if defined(GD_IDE_ONLY)
    if( GetProfiler() && GetProfiler()->profilingActivated )
    {
        GetProfiler()->lastRenderingTime = GetProfiler()->renderingClock.getTimeMicroseconds();
        GetProfiler()->totalSceneTime += GetProfiler()->lastRenderingTime + GetProfiler()->lastEventsTime;
        GetProfiler()->totalEventsTime += GetProfiler()->lastEventsTime;
        GetProfiler()->Update();
    }
    #endif

    firstLoop = false; //The first frame was rendered
    return requestedChange.change != SceneChange::CONTINUE;
}

void RuntimeScene::ManageRenderTargetEvents()
{
    if (!renderWindow) return;
    inputManager.NextFrame();

    sf::Event event;
    while (renderWindow->pollEvent(event))
    {
        if ( event.type == sf::Event::Closed )
        {
            //Handle window closing
            RequestChange(SceneChange::STOP_GAME);
            renderWindow->close();
        }
        else if (event.type == sf::Event::Resized)
        {
            //Resetup OpenGL when window is resized
            SetupOpenGLProjection();
        }
        else
        {
            //Most events will be input related and should be forwarded
            //to the InputManager:
            inputManager.HandleEvent(event);
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
    if (!renderWindow) return;

    renderWindow->clear( sf::Color( GetBackgroundColorRed(), GetBackgroundColorGreen(), GetBackgroundColorBlue() ) );

    //Sort object by order to render them
    RuntimeObjList allObjects = objectsInstances.GetAllObjects();
    OrderObjectsByZOrder(allObjects);

    //To allow using OpenGL to draw:
    glClear(GL_DEPTH_BUFFER_BIT); // Clear the depth buffer
    renderWindow->pushGLStates();
    renderWindow->setActive();

    //Draw layer by layer
    for (unsigned int layerIndex =0;layerIndex<layers.size();++layerIndex)
    {
        if ( layers[layerIndex].GetVisibility() )
        {
            for (unsigned int cameraIndex = 0;cameraIndex < layers[layerIndex].GetCameraCount();++cameraIndex)
            {
                RuntimeCamera & camera = layers[layerIndex].GetCamera(cameraIndex);

                //Prepare OpenGL rendering
                renderWindow->popGLStates();

                glMatrixMode(GL_PROJECTION);
                glLoadIdentity();
                gluPerspective(GetOpenGLFOV(), camera.GetWidth()/camera.GetHeight(), GetOpenGLZNear(), GetOpenGLZFar());

                const sf::FloatRect & viewport = camera.GetSFMLView().getViewport();
                glViewport(viewport.left*renderWindow->getSize().x,
                           renderWindow->getSize().y-(viewport.top+viewport.height)*renderWindow->getSize().y, //Y start from bottom
                           viewport.width*renderWindow->getSize().x,
                           viewport.height*renderWindow->getSize().y);

                renderWindow->pushGLStates();

                //Prepare SFML rendering
                renderWindow->setView(camera.GetSFMLView());

                //Rendering all objects
                for (unsigned int id = 0;id < allObjects.size();++id)
                {
                    if (allObjects[id]->GetLayer() == layers[layerIndex].GetName())
                        allObjects[id]->Draw(*renderWindow);
                }

                //Texts
                DisplayLegacyTexts(layers[layerIndex].GetName());
            }
        }
    }

    //Internal profiler
    #ifndef RELEASE
    if ( sf::Keyboard::isKeyPressed(sf::Keyboard::F2))
        CProfileManager::Reset();

    renderWindow->setView(sf::View(sf::FloatRect(0.0f,0.0f, game->GetMainWindowDefaultWidth(), game->GetMainWindowDefaultHeight())));

    CProfileIterator * iter = CProfileManager::Get_Iterator();
    int y = 0;
    DisplayProfile(renderWindow, iter, 0,y);
    CProfileManager::Increment_Frame_Counter();
    #endif

    // Display window contents on screen
    renderWindow->popGLStates();
    renderWindow->display();
}

bool RuntimeScene::UpdateTime()
{
    //Update time elapsed since last frame
    realElapsedTime = clock.restart().asMicroseconds();
    realElapsedTime -= pauseTime;

    //Make sure that the elapsed time is not beyond the limit (slow down the game if necessary)
    if ( game->GetMinimumFPS() != 0 && realElapsedTime > 1000000.0/static_cast<double>(game->GetMinimumFPS()) )
        realElapsedTime = 1000000.0/static_cast<double>(game->GetMinimumFPS());

    //Apply time scale
    elapsedTime = realElapsedTime*timeScale;

    //Update timers
    timeFromStart += elapsedTime;
    pauseTime = 0;

    for (unsigned int i =0;i<timers.size();++i)
        timers[i].UpdateTime(elapsedTime);

    return true;
}

bool RuntimeScene::OrderObjectsByZOrder(RuntimeObjList & objList)
{
    if ( StandardSortMethod() )
        std::sort( objList.begin(), objList.end(), [](const RuntimeObjSPtr & o1, const RuntimeObjSPtr & o2) {
            return o1->GetZOrder() < o2->GetZOrder();
        });
    else
        std::stable_sort( objList.begin(), objList.end(), [](const RuntimeObjSPtr & o1, const RuntimeObjSPtr & o2) {
            return o1->GetZOrder() < o2->GetZOrder();
        });

    return true;
}

void RuntimeScene::DisplayText(Text & text)
{
    legacyTexts.push_back(text);
}

bool RuntimeScene::DisplayLegacyTexts(gd::String layer)
{
    if (!renderWindow) return false;

    for ( unsigned int i = 0;i < legacyTexts.size();i++ )
    {
        if ( legacyTexts[i].layer == layer )
            legacyTexts[i].Draw(*renderWindow);
    }

    return true;
}

RuntimeLayer & RuntimeScene::GetRuntimeLayer(const gd::String & name)
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
        if ( layers[i].GetName() == name )
            return layers[i];
    }

    return badRuntimeLayer;
}

void RuntimeScene::ManageObjectsAfterEvents()
{
    //Delete objects that were removed.
    RuntimeObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
    	if ( allObjects[id]->GetName().empty() )
        {
            for (unsigned int i = 0;i<extensionsToBeNotifiedOnObjectDeletion.size();++i)
                extensionsToBeNotifiedOnObjectDeletion[i]->ObjectDeletedFromScene(*this, allObjects[id].get());

            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects instances, not from the temporary list!
        }
    }

    //Update objects positions, forces and automatisms
    allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + ( allObjects[id]->TotalForceX() * static_cast<double>(GetElapsedTime())/1000000.0 ));
        allObjects[id]->SetY( allObjects[id]->GetY() + ( allObjects[id]->TotalForceY() * static_cast<double>(GetElapsedTime())/1000000.0 ));
        allObjects[id]->UpdateTime( static_cast<double>(GetElapsedTime())/1000000.0 );
        allObjects[id]->UpdateForce( static_cast<double>(GetElapsedTime())/1000000.0 );
        allObjects[id]->DoAutomatismsPostEvents(*this);
    }
}

void RuntimeScene::ManageObjectsBeforeEvents()
{
    RuntimeObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
        allObjects[id]->DoAutomatismsPreEvents(*this);
}

/**
 * \brief Internal Tool class used by RuntimeScene::CreateObjectsFrom
 */
class ObjectsFromInitialInstanceCreator : public gd::InitialInstanceFunctor
{
public:
    ObjectsFromInitialInstanceCreator(gd::Project & game_, RuntimeScene & scene_, float xOffset_, float yOffset_, std::map<const gd::InitialInstance *, std::shared_ptr<RuntimeObject> > * optionalMap_) :
        game(game_),
        scene(scene_),
        xOffset(xOffset_),
        yOffset(yOffset_),
        optionalMap(optionalMap_)
    {};
    virtual ~ObjectsFromInitialInstanceCreator() {};

    virtual void operator()(gd::InitialInstance * instancePtr)
    {
        gd::InitialInstance & instance = *instancePtr;
        std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetObjects().begin(), scene.GetObjects().end(), std::bind2nd(ObjectHasName(), instance.GetObjectName()));
        std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.GetObjects().begin(), game.GetObjects().end(), std::bind2nd(ObjectHasName(), instance.GetObjectName()));

        RuntimeObjSPtr newObject = std::shared_ptr<RuntimeObject> ();

        if ( sceneObject != scene.GetObjects().end() ) //We check first scene's objects' list.
            newObject = CppPlatform::Get().CreateRuntimeObject(scene, **sceneObject);
        else if ( globalObject != scene.game->GetObjects().end() ) //Then the global object list
            newObject = CppPlatform::Get().CreateRuntimeObject(scene, **globalObject);

        if ( newObject != std::shared_ptr<RuntimeObject> () )
        {
            newObject->SetX( instance.GetX() + xOffset );
            newObject->SetY( instance.GetY() + yOffset );
            newObject->SetZOrder( instance.GetZOrder() );
            newObject->SetLayer( instance.GetLayer() );
            newObject->ExtraInitializationFromInitialInstance(instance);
            newObject->SetAngle( instance.GetAngle() );

            if ( instance.HasCustomSize() )
            {
                newObject->SetWidth(instance.GetCustomWidth());
                newObject->SetHeight(instance.GetCustomHeight());
            }

            //Substitute initial variables specific to that object instance.
            newObject->GetVariables().Merge(instance.GetVariables());

            scene.objectsInstances.AddObject(newObject);
        }
        else
            std::cout << "Could not find and put object " << instance.GetObjectName() << std::endl;

        if ( optionalMap ) (*optionalMap)[&instance] = newObject;
    }

private:
    gd::Project & game;
    RuntimeScene & scene;
    float xOffset;
    float yOffset;
    std::map<const gd::InitialInstance *, std::shared_ptr<RuntimeObject> > * optionalMap;
};

void RuntimeScene::CreateObjectsFrom(const gd::InitialInstancesContainer & container, float xOffset, float yOffset, std::map<const gd::InitialInstance *, std::shared_ptr<RuntimeObject> > * optionalMap)
{
    ObjectsFromInitialInstanceCreator func(*game, *this, xOffset, yOffset, optionalMap);
    const_cast<gd::InitialInstancesContainer&>(container).IterateOverInstances(func);
}

bool RuntimeScene::LoadFromScene( const gd::Layout & scene )
{
    return LoadFromSceneAndCustomInstances(scene, scene.GetInitialInstances());
}

bool RuntimeScene::LoadFromSceneAndCustomInstances( const gd::Layout & scene, const gd::InitialInstancesContainer & instances )
{
    std::cout << "Loading RuntimeScene from a scene.";
    if (!game)
    {
        std::cout << "..No valid gd::Project associated to the RuntimeScene. Aborting loading." << std::endl;
        return false;
    }

    //Copy inherited scene
    Scene::operator=(scene);

    //Clear RuntimeScene datas
    objectsInstances.Clear();
    legacyTexts.clear();
    timers.clear();
    firstLoop = true;
    elapsedTime = 0;
    realElapsedTime = 0;
    pauseTime = 0;
    timeScale = 1;
    timeFromStart = 0;

    std::cout << ".";
    codeExecutionEngine->runtimeContext.scene = this;
    inputManager.DisableInputWhenFocusIsLost(IsInputDisabledWhenFocusIsLost());

    //Initialize variables
    variables = scene.GetVariables();

    //Initialize layers
    std::cout << ".";
    layers.clear();
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->GetMainWindowDefaultWidth(), game->GetMainWindowDefaultHeight() ) );
    for (unsigned int i = 0;i<GetLayersCount();++i) {
        layers.push_back(RuntimeLayer(GetLayer(i), defaultView));
    }

    //Create object instances which are originally positioned on scene
    std::cout << ".";
    CreateObjectsFrom(instances);

    //Automatisms shared data
    std::cout << ".";
    automatismsSharedDatas.LoadFrom(scene.automatismsInitialSharedDatas);

    std::cout << ".";
    //Extensions specific initialization
	for (unsigned int i = 0;i<game->GetUsedExtensions().size();++i)
    {
        std::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game->GetUsedExtensions()[i]);
        std::shared_ptr<ExtensionBase> extension = std::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension != std::shared_ptr<ExtensionBase>() )
        {
            extension->SceneLoaded(*this);
            if ( extension->ToBeNotifiedOnObjectDeletion() ) extensionsToBeNotifiedOnObjectDeletion.push_back(extension.get());
        }
    }

    std::cout << ".";
    if ( StopSoundsOnStartup() ) {SoundManager::Get()->ClearAllSoundsAndMusics(); }
    if ( renderWindow ) renderWindow->setTitle(GetWindowDefaultTitle());

    std::cout << " Done." << std::endl;

    return true;
}
