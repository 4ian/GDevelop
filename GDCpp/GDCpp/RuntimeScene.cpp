/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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

void MessageLoading( string message, float avancement ); //Prototype de la fonction pour renvoyer un message
//La fonction est implémenté différemment en fonction du runtime ou de l'éditeur

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
    specialAction(-1),
    windowHasFocus(true),
    codeExecutionEngine(new CodeExecutionEngine)
{
    ChangeRenderWindow(renderWindow);
}

RuntimeScene::~RuntimeScene()
{
	for (unsigned int i = 0;i<game->GetUsedExtensions().size();++i)
    {
        boost::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game->GetUsedExtensions()[i]);
        boost::shared_ptr<ExtensionBase> extension = boost::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension != boost::shared_ptr<ExtensionBase>() )
            extension->SceneUnloaded(*this);
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

    SetCodeExecutionEngine(scene.GetCodeExecutionEngine());

    firstLoop = scene.firstLoop;
    isFullScreen = scene.isFullScreen;
    realElapsedTime = scene.realElapsedTime;
    elapsedTime = scene.elapsedTime;
    timeScale = scene.timeScale;
    timeFromStart = scene.timeFromStart;
    specialAction = scene.specialAction;
    renderTargetEvents = scene.renderTargetEvents;
    windowHasFocus = scene.windowHasFocus;

    automatismsSharedDatas.clear();
    for (std::map < std::string, boost::shared_ptr<AutomatismsRuntimeSharedData> >::const_iterator it = scene.automatismsSharedDatas.begin();
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

boost::shared_ptr<gd::ImageManager> RuntimeScene::GetImageManager() const
{
    return game->GetImageManager();
}

void RuntimeScene::ChangeRenderWindow(sf::RenderWindow * newWindow)
{
    renderWindow = newWindow;

    if (!renderWindow) return;
    renderWindow->setTitle(GetWindowDefaultTitle());

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->getSize().x)/static_cast<double>(renderWindow->getSize().y);
    gluPerspective(GetOpenGLFOV(), windowRatio, GetOpenGLZNear(), GetOpenGLZFar());
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

int RuntimeScene::RenderAndStep()
{
    //Gestion pré-évènements
    {
        ManageRenderTargetEvents();
    }
    {
        UpdateTime();
    }
    {
        ManageObjectsBeforeEvents();
    }
    SoundManager::Get()->ManageGarbage();

    #if defined(GD_IDE_ONLY)
    if( GetProfiler() )
    {
        if ( firstLoop ) GetProfiler()->Reset();
        GetProfiler()->eventsClock.reset();
    }
    #endif

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

    //Gestions post-évènement
    {
        ManageObjectsAfterEvents();
    }

    #if defined(GD_IDE_ONLY)
    if( debugger )
    {
        debugger->Update();
    }
    #endif

    //Rendering
    {
        Render();
        textes.clear(); //Legacy texts
    }

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

    return specialAction;
}

void RuntimeScene::ManageRenderTargetEvents()
{
    renderTargetEvents.clear();
    if (!renderWindow) return;

    sf::Event event;
    while ( renderWindow->pollEvent( event ) )
    {
        renderTargetEvents.push_back(event);

        // Close window : exit
        if ( event.type == sf::Event::Closed )
        {
            running = false;
            renderWindow->close();
        }
        else if (event.type == sf::Event::Resized)
        {
            //Resetup OpenGL
            glEnable(GL_DEPTH_TEST);
            glBlendFunc (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            glDepthMask(GL_TRUE);
            glClearDepth(1.f);

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();

            double windowRatio = static_cast<double>(event.size.width)/static_cast<double>(event.size.height);
            gluPerspective(GetOpenGLFOV(), windowRatio, GetOpenGLZNear(), GetOpenGLZFar());
        }
        else if ( event.type == sf::Event::GainedFocus)
            windowHasFocus = true;
        else if ( event.type == sf::Event::LostFocus)
            windowHasFocus = false;
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
    OrderObjectsByZOrder( allObjects );

    //To allow using OpenGL to draw :
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
                    //Affichage de l'objet si il appartient au calque
                    if ( allObjects[id]->GetLayer() == layers[layerIndex].GetName() )
                        allObjects[id]->Draw( *renderWindow );
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

bool RuntimeScene::OrderObjectsByZOrder( RuntimeObjList & objList )
{
    if ( StandardSortMethod() )
        std::sort( objList.begin(), objList.end(), SortByZOrder() );
    else
        std::stable_sort( objList.begin(), objList.end(), SortByZOrder() );

    return true;
}

void RuntimeScene::DisplayText(Text & text)
{
    textes.push_back(text);
}
bool RuntimeScene::DisplayLegacyTexts(string layer)
{
    if (!renderWindow) return false;

    for ( unsigned int i = 0;i < textes.size();i++ )
    {
        if ( textes[i].layer == layer )
            textes[i].Draw(*renderWindow);
    }

    return true;
}

RuntimeLayer & RuntimeScene::GetRuntimeLayer(const std::string & name)
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
        if ( layers[i].GetName() == name )
            return layers[i];
    }

    return badRuntimeLayer;
}

/**
 * Delete objects, updates time and launch automatisms
 */
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

            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects instances, not from the temporary list !
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

/**
 * Manage objects before launching events
 */
void RuntimeScene::ManageObjectsBeforeEvents()
{
    RuntimeObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
        allObjects[id]->DoAutomatismsPreEvents(*this);

}

void RuntimeScene::GotoSceneWhenEventsAreFinished(int scene)
{
    //Just store the next scene index:
    specialAction = scene;
}

/**
 * \brief Internal Tool class used by RuntimeScene::CreateObjectsFrom
 */
class ObjectsFromInitialInstanceCreator : public gd::InitialInstanceFunctor
{
public:
    ObjectsFromInitialInstanceCreator(gd::Project & game_, RuntimeScene & scene_, float xOffset_, float yOffset_, std::map<const gd::InitialInstance *, boost::shared_ptr<RuntimeObject> > * optionalMap_) :
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

        RuntimeObjSPtr newObject = boost::shared_ptr<RuntimeObject> ();

        if ( sceneObject != scene.GetObjects().end() ) //We check first scene's objects' list.
            newObject = CppPlatform::Get().CreateRuntimeObject(scene, **sceneObject);
        else if ( globalObject != scene.game->GetObjects().end() ) //Then the global object list
            newObject = CppPlatform::Get().CreateRuntimeObject(scene, **globalObject);

        if ( newObject != boost::shared_ptr<RuntimeObject> () )
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
    std::map<const gd::InitialInstance *, boost::shared_ptr<RuntimeObject> > * optionalMap;
};

void RuntimeScene::CreateObjectsFrom(const gd::InitialInstancesContainer & container, float xOffset, float yOffset, std::map<const gd::InitialInstance *, boost::shared_ptr<RuntimeObject> > * optionalMap)
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
    textes.clear();
    timers.clear();
    firstLoop = true;
    elapsedTime = 0;
    realElapsedTime = 0;
    pauseTime = 0;
    timeScale = 1;
    timeFromStart = 0;
    specialAction = -1;

    std::cout << ".";
    GetCodeExecutionEngine()->runtimeContext.scene = this;

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

    //Automatisms data
    std::cout << ".";
    automatismsSharedDatas.clear();
    for(std::map < std::string, boost::shared_ptr<gd::AutomatismsSharedData> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
        it != scene.automatismsInitialSharedDatas.end();
        ++it)
    {
        boost::shared_ptr<AutomatismsRuntimeSharedData> data = it->second->CreateRuntimeSharedDatas();

        if ( data )
            automatismsSharedDatas[it->first] = data;
        else
            std::cout << "ERROR: Unable to create shared data for automatism \"" << it->second->GetName() <<"\".";
    }

    std::cout << ".";
    //Extensions specific initialization
	for (unsigned int i = 0;i<game->GetUsedExtensions().size();++i)
    {
        boost::shared_ptr<gd::PlatformExtension> gdExtension = CppPlatform::Get().GetExtension(game->GetUsedExtensions()[i]);
        boost::shared_ptr<ExtensionBase> extension = boost::dynamic_pointer_cast<ExtensionBase>(gdExtension);
        if ( extension != boost::shared_ptr<ExtensionBase>() )
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
