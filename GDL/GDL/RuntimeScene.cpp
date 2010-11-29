/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include <exception>
#include <stdexcept>
#include <sstream>
#include "GDL/RuntimeScene.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ImageManager.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Layer.h"
#include "GDL/EventsPreprocessor.h"
#include "GDL/profile.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Position.h"
#include "GDL/FontManager.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/AutomatismsSharedDatas.h"
#if defined(GDE)
#include "GDL/ProfileEvent.h"
#include "GDL/profile.h"
#endif

void MessageLoading( string message, float avancement ); //Prototype de la fonction pour renvoyer un message
//La fonction est implémenté différemment en fonction du runtime ou de l'éditeur

RuntimeLayer RuntimeScene::badLayer;

RuntimeScene::RuntimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_) :
renderWindow(renderWindow_),
game(game_),
input(&renderWindow->GetInput()),
#ifdef GDE
debugger(NULL),
#endif
running(true),
pauseTime(0),
backgroundColorR(125),
backgroundColorG(125),
backgroundColorB(125),
firstLoop(true),
isFullScreen(false),
realElapsedTime(0),
elapsedTime(0),
timeScale(1),
timeFromStart(0),
specialAction(-1)
{
    //ctor
    soundManager = SoundManager::getInstance();
    renderWindow->ShowMouseCursor( true );

    //Calque par défaut
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) );
    Layer layer;
    layer.SetCamerasNumber(1);

    layers.push_back(RuntimeLayer(layer, defaultView));

    ChangeRenderWindow(renderWindow);
}

RuntimeScene::~RuntimeScene()
{
}

void RuntimeScene::Init(const RuntimeScene & scene)
{
    renderWindow = scene.renderWindow;
    game = scene.game;
    soundManager = scene.soundManager;
    input = scene.input;
    #ifdef GDE
    debugger = scene.debugger;
    #endif
    running = scene.running;

    objectsInstances = scene.objectsInstances.CopyAndCloneAllObjects();

    variables = scene.variables;
    textes = scene.textes;
    timers = scene.timers;
    pauseTime = scene.pauseTime;
    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    errors = scene.errors;

    firstLoop = scene.firstLoop;
    isFullScreen = scene.isFullScreen;
    realElapsedTime = scene.realElapsedTime;
    elapsedTime = scene.elapsedTime;
    timeScale = scene.timeScale;
    timeFromStart = scene.timeFromStart;
    specialAction = scene.specialAction;

    automatismsSharedDatas.clear();
    for (boost::interprocess::flat_map < unsigned int, boost::shared_ptr<AutomatismsRuntimeSharedDatas> >::const_iterator it = scene.automatismsSharedDatas.begin();
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
    input = &renderWindow->GetInput();
    renderWindow->SetTitle(title);

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->GetWidth())/static_cast<double>(renderWindow->GetHeight());
    gluPerspective(oglFOV, windowRatio, oglZNear, oglZFar);
}

////////////////////////////////////////////////////////////
/// Avancer l'état de la scène et la dessiner
/// Appelé habituellement à chaque tour de boucle de jeu
////////////////////////////////////////////////////////////
int RuntimeScene::RenderAndStep(unsigned int nbStep)
{
    BT_PROFILE("RenderAndStep");
    for (unsigned int step = 0;step<nbStep;++step)
    {
        //Gestion pré-évènements
        ManageRenderTargetEvents();
        UpdateTime();
        ManageObjectsBeforeEvents();
        ManageSounds();

        //Gestions des évènements
        ObjectsConcerned objectsConcerned(&objectsInstances, &objectGroups);
        for (unsigned int i = 0;i<events.size();++i)
        {
            ObjectsConcerned objectsConcernedForEvent;
            objectsConcernedForEvent.InheritsFrom(&objectsConcerned);

            events[i]->Execute(*this, objectsConcernedForEvent);
        }

        //Gestions post-évènements
        ManageObjectsAfterEvents();

        #ifdef GDE
        if( debugger )
            debugger->Update();
        #endif
        Render();

        textes.clear();

        if ( firstLoop ) firstLoop = false; //On n'est plus la première fois
    }

    return specialAction;
}

////////////////////////////////////////////////////////////
/// Gestion des évènements basiques de la fenêtre
////////////////////////////////////////////////////////////
void RuntimeScene::ManageRenderTargetEvents()
{

    sf::Event event;
    while ( renderWindow->GetEvent( event ) )
    {
        // Close window : exit
        if ( event.Type == sf::Event::Closed )
        {
            running = false;
            #if defined(GDE)
            renderWindow->Close();
            #endif
        }
        else if (event.Type == sf::Event::KeyPressed)
        {
            inputKeyPressed = true;
        }
        else if (event.Type == sf::Event::KeyReleased )
        {
            inputKeyPressed = false;
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

////////////////////////////////////////////////////////////
/// Affichage simple
////////////////////////////////////////////////////////////
void RuntimeScene::RenderWithoutStep()
{
    ManageRenderTargetEvents();

    Render();

    #ifdef GDE
    if( debugger )
        debugger->Update();
    #endif
}

#ifndef RELEASE
void RuntimeScene::DisplayProfile(CProfileIterator * iter, int x, int & y)
{
    FontManager * fontManager = FontManager::getInstance();

    y += 15;
    while ( !iter->Is_Done() )
    {
        sf::Text text("", *fontManager->GetFont(""));
        text.SetCharacterSize(12);
        ostringstream texte;
        if ( CProfileManager::Get_Frame_Count_Since_Reset() != 0 )
            texte << iter->Get_Current_Name()   << " Calls/Frame:" << iter->Get_Current_Total_Calls()/CProfileManager::Get_Frame_Count_Since_Reset()
                                                << " Time/Frame:" << iter->Get_Current_Total_Time()/CProfileManager::Get_Frame_Count_Since_Reset();
        text.SetString(texte.str());
        text.SetPosition(x,y);
        renderWindow->Draw(text);

        //Childs
        CProfileIterator * childIter = CProfileManager::Get_Iterator();
        *childIter = *iter;
        childIter->Enter_Child(0);
        DisplayProfile(childIter, x+15, y);
        CProfileManager::Release_Iterator(childIter);

        y += 15;
        iter->Next();
    }
}
#endif

////////////////////////////////////////////////////////////
/// Affichage dans une sf::RenderWindow
////////////////////////////////////////////////////////////
void RuntimeScene::Render()
{
    renderWindow->Clear( sf::Color( backgroundColorR, backgroundColorG, backgroundColorB ) );

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

    //Résultats du profiler
    #ifndef RELEASE
    if ( renderWindow->GetInput().IsKeyDown(sf::Key::F2))
        CProfileManager::Reset();

    renderWindow->SetView(renderWindow->GetDefaultView());

    CProfileIterator * iter = CProfileManager::Get_Iterator();
    int y = 0;
    DisplayProfile(iter, 0,y);
    CProfileManager::Increment_Frame_Counter();
    #endif

    // Display window contents on screen
    renderWindow->RestoreGLStates();
    renderWindow->Display();
}

////////////////////////////////////////////////////////////
/// Renvoie le calque avec le nom indiqué
////////////////////////////////////////////////////////////
RuntimeLayer & RuntimeScene::GetLayer(string name)
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
    	if( layers[i].GetName() == name )
            return layers[i];
    }

    cout << "Impossible de trouver le calque \""+name+"\".";
    return badLayer;
}

////////////////////////////////////////////////////////////
/// Renvoie le calque avec le nom indiqué
////////////////////////////////////////////////////////////
const RuntimeLayer & RuntimeScene::GetLayer(string name) const
{
    for (unsigned int i = 0;i<layers.size();++i)
    {
    	if( layers[i].GetName() == name )
            return layers[i];
    }

    cout << "Impossible de trouver le calque \""+name+"\".";
    return badLayer;
}

////////////////////////////////////////////////////////////
/// Met à jour le temps
////////////////////////////////////////////////////////////
bool RuntimeScene::UpdateTime()
{
    //Temps écoulé depuis la dernière frame
    realElapsedTime = renderWindow->GetFrameTime();
    realElapsedTime -= pauseTime; //On enlève le temps de pause

    //On modifie ce temps écoulé si il est trop bas.
    if ( game->minFPS != 0 && realElapsedTime > 1.f/static_cast<float>(game->minFPS) )
        realElapsedTime = 1.f/static_cast<float>(game->minFPS); //On ralentit le jeu si les FPS sont trop bas.

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

////////////////////////////////////////////////////////////
/// Stoppe toutes les musiques de la scène
////////////////////////////////////////////////////////////
bool RuntimeScene::StopMusic()
{
    SoundManager * soundManager = SoundManager::getInstance();

    //Arrêt des musiques : simples musiques
    for ( unsigned int i = 0;i < soundManager->musics.size();i++ )
    {
        soundManager->musics.at( i )->Stop();
    }
    soundManager->musics.clear();

    //Arrêt des musiques : musiques sur channels
    for ( unsigned int i = 0;i < MAX_CANAUX_MUSIC;i++ )
    {
        soundManager->GetMusicOnChannel(i)->Stop();
    }

    //Arrêt des sons
    for ( unsigned int i = 0;i < soundManager->sounds.size();i++ )
    {
        soundManager->sounds.at( i )->sound.Stop();
    }
    soundManager->sounds.clear();

    //Arrêt des sons : sons sur channels
    for ( unsigned int i = 0;i < MAX_CANAUX_SON;i++ )
    {
        soundManager->GetSoundOnChannel(i)->sound.Stop();
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Efface les musiques et sons terminés
////////////////////////////////////////////////////////////
void RuntimeScene::ManageSounds()
{
    //Bruitages sans canaux. On les détruits si besoin est.
    for ( int i = soundManager->sounds.size() - 1;i >= 0;i-- )
    {
        if ( soundManager->sounds.at( i )->sound.GetStatus() == sf::Sound::Stopped )
        {
            delete soundManager->sounds.at( i ); //Les sounds sont gerés par pointeurs
            soundManager->sounds.erase( soundManager->sounds.begin() + i );
        }
    }


    //Musiques sans canaux.
    for ( unsigned int i = 0;i < soundManager->musics.size();i++ )
    {
        if ( soundManager->musics.at( i )->GetStatus() == sf::Music::Stopped )
        {
            soundManager->musics.erase( soundManager->musics.begin() + i );
        }
    }
}

/**
 * Delete objects, updates time and launch automatisms
 */
void RuntimeScene::ManageObjectsAfterEvents()
{
    ObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
    	if ( allObjects[id]->GetObjectIdentifier() == 0 ) //0 stand always for object without name, to delete.
            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects Instances, not from the temporary list !

    }

    allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + ( allObjects[id]->TotalForceX() * GetElapsedTime() ));
        allObjects[id]->SetY( allObjects[id]->GetY() + ( allObjects[id]->TotalForceY() * GetElapsedTime() ));
        allObjects[id]->UpdateTime( GetElapsedTime() );
        allObjects[id]->UpdateForce( GetElapsedTime() );
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

////////////////////////////////////////////////////////////
/// Ouvre un jeu, et stocke dans les tableaux passés en paramétres.
////////////////////////////////////////////////////////////
bool RuntimeScene::LoadFromScene( const Scene & scene )
{
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

    //Copy inherited datas
    initialObjects = scene.initialObjects;
    objectGroups = scene.objectGroups;
    initialLayers = scene.initialLayers;
    variables = scene.variables;

    events.clear();
    for (unsigned int i =0;i<scene.events.size();++i)
    	events.push_back( scene.events[i]->Clone() );

    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    title = scene.title;
    standardSortMethod = scene.standardSortMethod;
    title = scene.title;
    oglFOV = scene.oglFOV;
    oglZNear = scene.oglZNear;
    oglZFar = scene.oglZFar;

    //Add global object groups
    copy(game->objectGroups.begin(), game->objectGroups.end(), back_inserter(objectGroups));

    //Initialize runtime layers
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) );
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        layers.push_back(RuntimeLayer(initialLayers[i], defaultView));
    }

    //Load resources of initial objects
    for (unsigned int i = 0; i < scene.initialObjects.size();++i)
    {
        MessageLoading( "Loading object resources : " + scene.initialObjects.at( i )->GetName(), i + 1 / scene.initialObjects.size()*100 / 3 + 33 );
        scene.initialObjects[i]->LoadResources(*game->imageManager);
    }

    //Load resources of global objects
    //TODO : Make this only one time during game
    for (unsigned int i = 0; i < game->globalObjects.size();++i)
    {
        MessageLoading( "Loading object resources : " + game->globalObjects[i]->GetName(), i + 1 /  game->globalObjects.size()*100 / 3 + 33 );
        game->globalObjects[i]->LoadResources(*game->imageManager);
    }

    //Create object instances which are originally positionned on scene
    for(unsigned int i = 0;i < scene.initialObjectsPositions.size();++i)
    {
        MessageLoading( "Placing object : " + scene.initialObjectsPositions[i].objectName, i + 1 / scene.initialObjectsPositions.size()*100 / 3 + 33 );

        int IDsceneObject = Picker::PickOneObject( &initialObjects, scene.initialObjectsPositions[i].objectName );
        int IDglobalObject = Picker::PickOneObject( &game->globalObjects, scene.initialObjectsPositions[i].objectName );

        ObjSPtr newObject = boost::shared_ptr<Object> ();

        if ( IDsceneObject != -1 ) //We check first scene's objects' list.
            newObject = initialObjects[IDsceneObject]->Clone();
        else if ( IDglobalObject != -1 ) //Then the global object list
            newObject = game->globalObjects.at( IDglobalObject )->Clone();
        else
        {
            string nom = scene.initialObjectsPositions[i].objectName;
            errors.Add( "N'a pas pu trouver et positionner l'objet nommé " + nom + " ( N'existe pas dans la liste des objets de la scène ou globale )", "", nom, -1, 2 );
        }

        if ( newObject != boost::shared_ptr<Object> () )
        {
            newObject->errors = &errors;
            newObject->SetX( scene.initialObjectsPositions[i].x );
            newObject->SetY( scene.initialObjectsPositions[i].y );
            newObject->SetZOrder( scene.initialObjectsPositions[i].zOrder );
            newObject->SetLayer( scene.initialObjectsPositions[i].layer );
            newObject->InitializeFromInitialPosition(scene.initialObjectsPositions[i]);
            newObject->SetAngle( scene.initialObjectsPositions[i].angle );

            if ( scene.initialObjectsPositions[i].personalizedSize )
            {
                newObject->SetWidth(scene.initialObjectsPositions[i].width);
                newObject->SetHeight(scene.initialObjectsPositions[i].height);
            }

            newObject->LoadRuntimeResources(*game->imageManager);

            objectsInstances.AddObject(newObject);
        }
    }

    //Preprocess events
    PreprocessEventList( *game, events );
    EventsPreprocessor::DeleteUselessEvents(events);
    EventsPreprocessor::PreprocessEvents(*this, events);

    //Automatisms datas
    automatismsSharedDatas.clear();
    for(boost::interprocess::flat_map < unsigned int, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = scene.automatismsInitialSharedDatas.begin();
        it != scene.automatismsInitialSharedDatas.end();
        ++it)
    {
        automatismsSharedDatas[it->first] = it->second->CreateRuntimeSharedDatas();
    }

    MessageLoading( "Loading finished", 100 );

    return true;
}

/**
 * Call preprocession method of each event
 */
void RuntimeScene::PreprocessEventList( const Game & game, vector < BaseEventSPtr > & listEvent )
{
    #if defined(GDE)
    boost::shared_ptr<ProfileEvent> previousProfileEvent;
    boost::shared_ptr<btClock> clock = boost::shared_ptr<btClock>(new btClock);
    #endif

    for ( unsigned int i = 0;i < listEvent.size();++i )
    {
        listEvent[i]->Preprocess(game, *this, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( game, listEvent[i]->GetSubEvents());

        #if defined(GDE)
        if ( listEvent[i]->IsExecutable() )
        {
            //Define a new profile event
            boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_ptr<ProfileEvent>(new ProfileEvent);
            profileEvent->SetClock(clock);
            profileEvent->SetPreviousProfileEvent(previousProfileEvent);

            //Add it before the event to profile
            listEvent.insert(listEvent.begin()+i, profileEvent);

            previousProfileEvent = profileEvent;
            ++i;
        }
        #endif
    }
}
