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
#include "GDL/ChercherScene.h"
#include "GDL/AppelEvent.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Layer.h"
#include "GDL/EventsPreprocessor.h"
#include "GDL/profile.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Position.h"

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
realElapsedTime(0),
elapsedTime(0),
timeScale(1),
timeFromStart(0)
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
    //dtor
}

RuntimeScene::RuntimeScene(const RuntimeScene & scene) : Scene(scene)
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
}

RuntimeScene& RuntimeScene::operator=(const RuntimeScene & scene)
{
    if( (this) != &scene )
    {
        Scene::operator=(scene);

        this->renderWindow = scene.renderWindow;
        this->game = scene.game;
        this->soundManager = scene.soundManager;
        this->input = scene.input;
        #ifdef GDE
        this->debugger = scene.debugger;
        #endif
        this->running = scene.running;

        this->objectsInstances = scene.objectsInstances.CopyAndCloneAllObjects();

        this->variables = scene.variables;
        this->textes = scene.textes;
        this->timers = scene.timers;
        this->pauseTime = scene.pauseTime;
        this->backgroundColorR = scene.backgroundColorR;
        this->backgroundColorG = scene.backgroundColorG;
        this->backgroundColorB = scene.backgroundColorB;
        this->errors = scene.errors;

        this->firstLoop = scene.firstLoop;
        this->isFullScreen = scene.isFullScreen;
        this->realElapsedTime = scene.realElapsedTime;
        this->elapsedTime = scene.elapsedTime;
        this->timeScale = scene.timeScale;
        this->timeFromStart = scene.timeFromStart;
    }

    return *this;
}

void RuntimeScene::ChangeRenderWindow(sf::RenderWindow * newWindow)
{
    if ( newWindow == NULL )
        cout << "Try to change renderWindow to a NULL window.";

    renderWindow = newWindow;
    input = &renderWindow->GetInput();

    glEnable(GL_DEPTH_TEST);
    glDepthMask(GL_TRUE);
    glClearDepth(1.f);

    // Setup a perspective projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    double windowRatio = static_cast<double>(renderWindow->GetWidth())/static_cast<double>(renderWindow->GetHeight());
    gluPerspective(90.f, windowRatio, 1.f, 500.f);
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
        GestionMusique();

        //Gestions des évènements
        //TODO : Optimisation
        EventsExecutor eventsExecutor(this);
        int NouvelleScene = eventsExecutor.ExecuteEventsScene();
        if ( NouvelleScene != -1 )
            return NouvelleScene; //La scène veut autre chose que continuer.

        //Gestions post-évènements
        GestionObjets();

        #ifdef GDE
        if( debugger )
            debugger->Update();
        #endif
        Render();

        textes.clear();

        if ( firstLoop ) firstLoop = false; //On n'est plus la première fois
    }

    return -1;
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
            gluPerspective(90.f, windowRatio, 1.f, 500.f);
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
    y += 15;
    while ( !iter->Is_Done() )
    {
        sf::Text text;
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
                gluPerspective(90.f, camera.GetSFMLView().GetSize().x
                                    /camera.GetSFMLView().GetSize().y, 1.f, 500.f);

                const sf::FloatRect & viewport = camera.GetSFMLView().GetViewport();
                glViewport(viewport.Left*renderWindow->GetWidth(),
                           renderWindow->GetHeight()-(viewport.Top+viewport.GetSize().y)*renderWindow->GetHeight(), //Y start from bottom
                           viewport.GetSize().x*renderWindow->GetWidth(),
                           viewport.GetSize().y*renderWindow->GetHeight());

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
                AfficheTexte(layers.at(layerIndex).GetName());
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
bool RuntimeScene::AfficheTexte(string layer)
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
    SoundManager * soundManager;
    soundManager = SoundManager::getInstance();

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
void RuntimeScene::GestionMusique()
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
 * Delete objects, updates forces and time
 */
void RuntimeScene::GestionObjets()
{
    ObjList allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
    	if ( allObjects[id]->GetName() == "" )
    	{
            objectsInstances.RemoveObject(allObjects[id]); //Remove from objects Instances, not from the temporary list !
    	}
    }

    allObjects = objectsInstances.GetAllObjects();
    for (unsigned int id = 0;id<allObjects.size();++id)
    {
        allObjects[id]->SetX( allObjects[id]->GetX() + ( allObjects[id]->TotalForceX() * GetElapsedTime() ));
        allObjects[id]->SetY( allObjects[id]->GetY() + ( allObjects[id]->TotalForceY() * GetElapsedTime() ));
        allObjects[id]->UpdateTime( GetElapsedTime() );
        allObjects[id]->UpdateForce( GetElapsedTime() );
    }
}


////////////////////////////////////////////////////////////
/// Ouvre un jeu, et stocke dans les tableaux passés en paramétres.
////////////////////////////////////////////////////////////
bool RuntimeScene::LoadFromScene( const Scene & scene )
{
    //Clear RuntimeScene datas
    variables.Clear();
    objectsInstances.Clear();
    textes.clear();
    timers.clear();
    layers.clear();
    firstLoop = true;
    elapsedTime = 0;
    realElapsedTime = 0;
    pauseTime = 0;
    timeFromStart = 0;

    //Copy inherited datas
    initialObjects = scene.initialObjects;
    objectGroups = scene.objectGroups;
    initialLayers = scene.initialLayers;
    variables = scene.variables;
    events = scene.events;
    backgroundColorR = scene.backgroundColorR;
    backgroundColorG = scene.backgroundColorG;
    backgroundColorB = scene.backgroundColorB;
    title = scene.title;
    standardSortMethod = scene.standardSortMethod;

    //Initialize runtime layers
    sf::View defaultView( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) );
    for (unsigned int i = 0;i<initialLayers.size();++i)
    {
        layers.push_back(RuntimeLayer(initialLayers[i], defaultView));
    }

    //Load resources of initial objects
    try
    {
        for (unsigned int i = 0; i < scene.initialObjects.size();++i)
        {
            MessageLoading( "Chargement des images de l'objet : " + scene.initialObjects.at( i )->GetName(), i + 1 / scene.initialObjects.size()*100 / 3 + 33 );
            scene.initialObjects[i]->LoadResources(game->imageManager);
        }
    }
    catch ( std::out_of_range& e )
    {
        std::cout << "Out of range: " << e.what() << "\n";
    }

    //Load resources of global objects
    //TODO : Make this only one time during game
    try
    {
        for (unsigned int i = 0; i < game->globalObjects.size();++i)
        {
            MessageLoading( "Chargement des images de l'objet : " + game->globalObjects[i]->GetName(), i + 1 /  game->globalObjects.size()*100 / 3 + 33 );
            game->globalObjects[i]->LoadResources(game->imageManager);
        }
    }
    catch ( std::out_of_range& e )
    {
        std::cout << "Out of range: " << e.what() << "\n";
    }

    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Create object instances which are originally positionned on scene
    for(unsigned int i = 0;i < scene.initialObjectsPositions.size();++i)
    {
        MessageLoading( "Positionnement de l'objet : " + scene.initialObjectsPositions[i].objectName, i + 1 / scene.initialObjectsPositions.size()*100 / 3 + 33 );

        int IDsceneObject = Picker::PickOneObject( &initialObjects, scene.initialObjectsPositions[i].objectName );
        int IDglobalObject = Picker::PickOneObject( &game->globalObjects, scene.initialObjectsPositions[i].objectName );

        ObjSPtr newObject = boost::shared_ptr<Object> ();

        if ( IDsceneObject != -1 ) //We check first scene's objects' list.
            newObject = extensionManager->CreateObject(initialObjects[IDsceneObject]);
        else if ( IDglobalObject != -1 ) //Then the global object list
            newObject = extensionManager->CreateObject(game->globalObjects.at( IDglobalObject ));
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
            newObject->SetAngle( scene.initialObjectsPositions[i].angle );

            if ( scene.initialObjectsPositions[i].personalizedSize )
            {
                newObject->SetWidth(scene.initialObjectsPositions[i].width);
                newObject->SetHeight(scene.initialObjectsPositions[i].height);
            }

            newObject->InitializeFromInitialPosition(scene.initialObjectsPositions[i]);

            objectsInstances.AddObject(newObject);
        }
    }

    //Preprocess events
    PreprocessScene( *game );

    MessageLoading( "Chargement de la scène terminé", 100 );

    return true;
}

////////////////////////////////////////////////////////////
/// Opération sur les évènements pendant le chargement de la scène
////////////////////////////////////////////////////////////
void RuntimeScene::PreprocessScene( const Game & Jeu )
{
    //Inclusion des liens
    PreprocessEventList( Jeu, events );

    EventsPreprocessor::DeleteUselessEvents(events);

    //Optimisation des appels aux fonctions des évènements
    EventsPreprocessor::PreprocessEvents(*this, events);

}

////////////////////////////////////////////////////////////
/// Insertion des liens
////////////////////////////////////////////////////////////
void RuntimeScene::PreprocessEventList( const Game & game, vector < BaseEventSPtr > & listEvent )
{
    for ( unsigned int i = 0;i < listEvent.size();i++ )
    {
        listEvent[i]->Preprocess(game, *this, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( game, listEvent[i]->GetSubEvents());
    }
}
