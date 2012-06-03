/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "SceneCanvas.h"
#include <string>
#include <iostream>
#include <vector>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <wx/config.h>
#include <wx/cursor.h>
#include <wx/log.h>
#include <wx/scrolbar.h>
#include <wx/infobar.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ImageManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/CommonTools.h"
#include "GDL/IDE/Dialogs/ChooseLayer.h"
#include "GDL/IDE/Dialogs/ChooseObject.h"
#include "GDL/IDE/CompilerMessagesParser.h"
#include "GDL/IDE/SceneCanvasSettings.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/SoundManager.h"
#include "BuildMessagesPnl.h"
#include "BuildProgressPnl.h"
#include "BuildToolsPnl.h"
#include "EditOptionsPosition.h"
#include "Clipboard.h"
#include "DndTextSceneEditor.h"
#include "InitialPositionBrowserDlg.h"
#include "RenderDialog.h"
#include "AdvancedPasteDlg.h"
#include "EditorObjets.h"
#include "EditorLayers.h"
#include "DebuggerGUI.h"
#include "GridSetup.h"
#include "ProfileDlg.h"

const long SceneCanvas::ID_ADDOBJMENU = wxNewId();
const long SceneCanvas::ID_DELOBJMENU = wxNewId();
const long SceneCanvas::ID_PROPMENU = wxNewId();
const long SceneCanvas::ID_LAYERUPMENU = wxNewId();
const long SceneCanvas::ID_LAYERDOWNMENU = wxNewId();
const long SceneCanvas::ID_COPYMENU = wxNewId();
const long SceneCanvas::ID_CUTMENU = wxNewId();
const long SceneCanvas::ID_PASTEMENU = wxNewId();
const long SceneCanvas::ID_PASTESPECIALMENU = wxNewId();
const long SceneCanvas::idRibbonEditMode = wxNewId();
const long SceneCanvas::idRibbonPreviewMode = wxNewId();
const long SceneCanvas::idRibbonObjectsEditor = wxNewId();
const long SceneCanvas::idRibbonLayersEditor = wxNewId();
const long SceneCanvas::idRibbonChooseObject = wxNewId();
const long SceneCanvas::idRibbonOrigine = wxNewId();
const long SceneCanvas::idRibbonOriginalZoom = wxNewId();
const long SceneCanvas::idRibbonGrid = wxNewId();
const long SceneCanvas::idRibbonWindowMask = wxNewId();
const long SceneCanvas::idRibbonGridSetup = wxNewId();
const long SceneCanvas::idRibbonUndo = wxNewId();
const long SceneCanvas::idRibbonRedo = wxNewId();
const long SceneCanvas::idRibbonObjectsPositionList = wxNewId();
const long SceneCanvas::idRibbonHelp = wxNewId();
const long SceneCanvas::idRibbonRefresh = wxNewId();
const long SceneCanvas::idRibbonPlay = wxNewId();
const long SceneCanvas::idRibbonPlayWin = wxNewId();
const long SceneCanvas::idRibbonPause = wxNewId();
const long SceneCanvas::idRibbonResetGlobalVars = wxNewId();
const long SceneCanvas::idRibbonDebugger = wxNewId();
const long SceneCanvas::idRibbonProfiler = wxNewId();
const long SceneCanvas::idRibbonFullScreen = wxNewId();
const long SceneCanvas::ID_MENUITEM8 = wxNewId();
const long SceneCanvas::ID_MENUITEM1 = wxNewId();
const long SceneCanvas::ID_MENUITEM2 = wxNewId();
const long SceneCanvas::ID_MENUITEM3 = wxNewId();
const long SceneCanvas::ID_MENUITEM4 = wxNewId();
const long SceneCanvas::ID_MENUITEM5 = wxNewId();
const long SceneCanvas::ID_MENUITEM6 = wxNewId();
const long SceneCanvas::ID_MENUITEM7 = wxNewId();
const long SceneCanvas::idUndo10 = wxNewId();
const long SceneCanvas::idUndo20 = wxNewId();
const long SceneCanvas::idClearHistory = wxNewId();

sf::Texture SceneCanvas::reloadingIconImage;
sf::Sprite SceneCanvas::reloadingIconSprite;
sf::Text SceneCanvas::reloadingText;
InitialPosition SceneCanvas::badInstance;

using namespace std;

/**
 * Go in preview mode
 */
void SceneCanvas::OnPreviewBtClick( wxCommandEvent & event )
{
    if ( !editing ) return;
    cout << "Switching to preview mode..." << endl;

    //Let the IDE go into to preview state
    //Note: Working directory is changed later, just before loading the scene
    mainEditorCommand.LockShortcuts(this);
    mainEditorCommand.DisableControlsForScenePreviewing();
    if ( objectsEditor ) objectsEditor->Disable();
    if ( layersEditor ) layersEditor->Disable();
    if ( initialPositionsBrowser ) initialPositionsBrowser->Disable();

    editing = false;
    previewData.scene.running = false;

    scrollBar1->Show(false);
    scrollBar2->Show(false);
    UpdateSize();

    Reload();

    if ( debugger ) debugger->Play();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), false);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}

/**
 * Go in edition mode
 */
void SceneCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( editing ) return;
    cout << "Switching to edition mode..." << endl;

    //Let the IDE go back to edition state
    wxSetWorkingDirectory(mainEditorCommand.GetIDEWorkingDirectory());
    mainEditorCommand.UnLockShortcuts(this);
    mainEditorCommand.EnableControlsAfterScenePreviewing();
    if ( objectsEditor ) objectsEditor->Enable(true);
    if ( layersEditor ) layersEditor->Enable(true);
    if ( initialPositionsBrowser ) initialPositionsBrowser->Enable(true);

    CodeCompiler::GetInstance()->EnableTaskRelatedTo(sceneEdited);

    editing = true;
    previewData.scene.running = false;

    //Let the editor go back to edition state
    scrollBar1->Show(true);
    scrollBar2->Show(true);
    externalWindow->Show(false);
    previewData.scene.ChangeRenderWindow(this);
    UpdateSize();
    UpdateScrollbars();

    //Parse now the results of profiling
    if ( profileDialog ) profileDialog->ParseProfileEvents();

    Reload();

    if ( debugger ) debugger->Pause();
    CreateToolsBar(mainEditorCommand.GetRibbonSceneEditorButtonBar(), true);
    mainEditorCommand.GetRibbonSceneEditorButtonBar()->Refresh();
}


void SceneCanvas::OnRefreshBtClick( wxCommandEvent & event )
{
    previewData.scene.running = false;

    Reload();
}
/**
 * Test scene in editor
 */
void SceneCanvas::OnPlayBtClick( wxCommandEvent & event )
{
    previewData.scene.running = true;
    editing = false;

    externalWindow->Show(false);
    previewData.scene.ChangeRenderWindow(this);

    if ( debugger ) debugger->Play();
}

void SceneCanvas::ExternalWindowClosed()
{
    if ( !editing && previewData.scene.running )
    {
        wxCommandEvent uselessEvent;
        OnPlayBtClick(uselessEvent);
    }
}

/**
 * Test scene in an external window
 */
void SceneCanvas::OnPlayWindowBtClick( wxCommandEvent & event )
{
    previewData.scene.running = true;
    editing = false;

    externalWindow->Show(true);
    externalWindow->renderCanvas->SetFramerateLimit( previewData.game.GetMaximumFPS() );

    externalWindow->SetSizeOfRenderingZone(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());
    previewData.scene.ChangeRenderWindow(externalWindow->renderCanvas);

    externalWindow->SetSizeOfRenderingZone(gameEdited.GetMainWindowDefaultWidth(), gameEdited.GetMainWindowDefaultHeight());
    previewData.scene.ChangeRenderWindow(externalWindow->renderCanvas);

    if ( debugger ) debugger->Play();
}

void SceneCanvas::OnPauseBtClick( wxCommandEvent & event )
{
    previewData.scene.running = false;

    if ( debugger ) debugger->Pause();
}


void SceneCanvas::Reload()
{
    ReloadFirstPart();
}

void SceneCanvas::ReloadFirstPart()
{
    cout << "Scene canvas reloading... ( Step 1/2 )" << endl;
    isReloading = true;

    SoundManager::GetInstance()->ClearAllSoundsAndMusics();
    if ( gameEdited.imageManager ) gameEdited.imageManager->PreventImagesUnloading(); //Images are normally unloaded and loaded again when reloading the scene. We can prevent this to happen as it is time wasting.

    //Reset game
    previewData.game = gameEdited;
    previewData.game.imageManager = gameEdited.imageManager; //Use same image manager.

    //Reset scene
    RuntimeScene newScene(this, &previewData.game);
    previewData.scene = newScene;
    previewData.scene.running = false;
    if ( debugger ) previewData.scene.debugger = debugger.get();

    //Launch now events compilation if it has not been launched by another way. ( Events editor for example )
    //Useful when opening a scene for the first time for example.
    if ( sceneEdited.EventsModified() && !CodeCompiler::GetInstance()->HasTaskRelatedTo(sceneEdited) )
    {
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(gameEdited, sceneEdited);

        if ( !editing )
            mainEditorCommand.GetInfoBar()->ShowMessage(_("Les modifications apportées aux évènements seront prises en compte lors du retour au mode édition."));
    }

    return; //Reload second par will be called by Refresh when appropriate
}

void SceneCanvas::ReloadSecondPart()
{
    cout << "Scene canvas reloading... ( Step 2/2 )" << endl;
    if ( !editing )  CodeCompiler::GetInstance()->DisableTaskRelatedTo(sceneEdited);

    //Switch the working directory as we are making calls to the runtime scene
    wxSetWorkingDirectory(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath());

    previewData.scene.LoadFromSceneAndCustomInstances( sceneEdited, instances );
    sceneEdited.wasModified = false;

    //If a preview is not going to be made, switch back to the IDE working directory
    if ( editing ) wxSetWorkingDirectory(mainEditorCommand.GetIDEWorkingDirectory());

    UpdateSize();
    UpdateScrollbars();

    if ( gameEdited.imageManager ) gameEdited.imageManager->EnableImagesUnloading(); //We were preventing images unloading so as to be sure not to waste time unloading and reloading just after scenes images.

    isReloading = false;
}


void SceneCanvas::Refresh()
{
    if ( isReloading )
    {
        bool wait = false;
        if ( !editing && CodeCompiler::GetInstance()->CompilationInProcess()) //Ensure some events are not being compiled.
            wait =true;

        if ( wait ) //We're still waiting for something to finish
        {
            //Display a message when compiling
            sf::Event event;
            while ( PollEvent( event ) )
                ;

            Clear(sf::Color(255,255,255));

            SaveGLStates();
            SetView(sf::View(sf::Vector2f(GetWidth()/2,GetHeight()/2), sf::Vector2f(GetWidth(),GetHeight())));

            reloadingIconSprite.SetTexture(reloadingIconImage);
            reloadingIconSprite.SetColor(sf::Color(255,255,255,128));
            reloadingIconSprite.SetPosition(GetWidth()/2-reloadingIconSprite.GetSize().x/2, GetHeight()/2-reloadingIconSprite.GetSize().y/2);
            reloadingText.SetPosition(GetWidth()/2-reloadingText.GetRect().Width/2, reloadingIconSprite.GetPosition().y+reloadingIconSprite.GetSize().y+10);

            Draw(reloadingIconSprite);
            Draw(reloadingText);

            RestoreGLStates();
            Display();
            return;
        }
        else //Everything is finished, reloading is complete!
        {

            //But be sure that no error occured.
            if ( !editing && !sceneEdited.codeExecutionEngine->Ready() )
            {
                wxLogError(_("La compilation des évènements a échouée, et la scène ne peut être testée. Afin que le problème soit corrigé, veuillez le rapporter au développeur de Game Develop, en joignant le fichier suivant :\n")+CodeCompiler::GetInstance()->GetOutputDirectory()+"compilationErrors.txt");
                wxCommandEvent useless;
                OnEditionBtClick(useless);
            }
            else
                ReloadSecondPart();

        }
    }
    else //We're displaying the scene
    {
        //First ensure scene does not need to be reloaded
        if ( !previewData.scene.running || editing )
        {
            //Reload changed images.
            if ( !gameEdited.imagesChanged.empty() )
            {
                wxSetWorkingDirectory(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath()); //Resources loading stuff incoming: Switch current work dir.

                for (unsigned int i = 0;i<gameEdited.imagesChanged.size();++i)
                    previewData.game.imageManager->ReloadImage(gameEdited.imagesChanged[i]);

                gameEdited.imageManager->LoadPermanentImages();
                gameEdited.imagesChanged.clear();
                sceneEdited.wasModified = true;

                wxSetWorkingDirectory(mainEditorCommand.GetIDEWorkingDirectory()); //Go back to the IDE cwd.
            }

            if ( sceneEdited.wasModified ) //Reload scene if necessary
                Reload();
        }

        //Then display the scene
        if ( previewData.scene.running ) //At runtime
        {
            int retourEvent = previewData.scene.RenderAndStep(1);

            if ( retourEvent == -2 )
                mainEditorCommand.GetInfoBar()->ShowMessage(_( "Dans le jeu final, le jeu se terminera." ));
            else if ( retourEvent != -1 )
            {
                if (retourEvent < gameEdited.GetLayouts().size())
                    mainEditorCommand.GetInfoBar()->ShowMessage(_( "Dans le jeu final, un changement de scène s'effectuera vers la scène " ) + "\"" + gameEdited.GetLayouts()[retourEvent]->GetName() + "\"");
            }
        }
        else if ( !previewData.scene.running && !editing ) //Runtime paused
            previewData.scene.RenderWithoutStep();
        else //Edittime
            EdittimeRender();
    }
}

void SceneCanvas::EdittimeRender()
{
    previewData.scene.ManageRenderTargetEvents();

    Clear( sf::Color( previewData.scene.GetBackgroundColorRed(), previewData.scene.GetBackgroundColorGreen(), previewData.scene.GetBackgroundColorBlue() ) );
    SetView(editionData.view);

    glClear(GL_DEPTH_BUFFER_BIT);
    SaveGLStates(); //To allow using OpenGL to draw

    //On trie les objets par leurs plans
    ObjList allObjects = previewData.scene.objectsInstances.GetAllObjects();
    previewData.scene.OrderObjectsByZOrder( allObjects );

    std::vector < sf::Shape > GUIelements;

    for (unsigned int layerIndex =0;layerIndex<previewData.scene.GetAllLayers().size();++layerIndex)
    {
        if ( previewData.scene.GetAllLayers()[layerIndex].GetVisibility() )
        {
            //Prepare OpenGL rendering
            RestoreGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            gluPerspective(previewData.scene.oglFOV, static_cast<double>(GetWidth())/static_cast<double>(GetHeight()), previewData.scene.oglZNear, previewData.scene.oglZFar);

            glViewport(0,0, GetWidth(), GetHeight());

            SaveGLStates();

            //Render all objects
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                if ( allObjects[id]->GetLayer() == previewData.scene.GetAllLayers()[layerIndex].GetName())
                {
                    allObjects[id]->DrawEdittime(*previewData.scene.renderWindow);

                    //Selection rectangle
                    if ( find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), allObjects[id]) != editionData.objectsSelected.end() )
                    {
                        sf::Shape selection = sf::Shape::Rectangle( 0, 0,
                                                                   allObjects[id]->GetWidth(),
                                                                   allObjects[id]->GetHeight(),
                                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );

                        selection.SetPosition( allObjects[id]->GetDrawableX(),
                                              allObjects[id]->GetDrawableY() );
                        GUIelements.push_back( selection );

                        if ( editionData.objectsSelected.size() == 1)
                        {
                            sf::Shape resizeXBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape resizeYBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape angleBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape center = sf::Shape::Circle( 0, 0, 2, sf::Color( 0, 0, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape centerToAngle = sf::Shape::Line(0,0, 20, 0, 1, sf::Color( 0, 0, 255, 255 ), 0, sf::Color( 0, 0, 255, 255 ) );

                            resizeXBt.SetPosition(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()-4,
                                                  allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2-2 );

                            resizeYBt.SetPosition(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2-2,
                                                  allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()-4 );

                            center.SetPosition(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                               allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2);

                            angleBt.SetPosition(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2-2
                                                +20*cos(allObjects[id]->GetAngle()/180.f*3.14159),
                                                allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2-2
                                                +20*sin(allObjects[id]->GetAngle()/180.f*3.14159) );

                            centerToAngle.Rotate(allObjects[id]->GetAngle());
                            centerToAngle.SetPosition(  allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                                        allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2);

                            GUIelements.push_back( centerToAngle );
                            GUIelements.push_back( center );
                            GUIelements.push_back( angleBt );
                            GUIelements.push_back( resizeXBt );
                            GUIelements.push_back( resizeYBt );

                        }
                    }
                }
            }
        }
    }

    //Affichage de la grille
    if ( settings.grid )
        RenderGrid();

    //Draw GUI Elements
    for (unsigned int i = 0;i<GUIelements.size();++i)
    	Draw(GUIelements[i]);

    if ( editionData.isSelecting )
    {
        sf::Shape selection = sf::Shape::Rectangle(editionData.xRectangleSelection, editionData.yRectangleSelection,
                                                   editionData.xEndRectangleSelection-editionData.xRectangleSelection, editionData.yEndRectangleSelection-editionData.yRectangleSelection,
                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );
        Draw(selection);
    }

    if ( settings.windowMask )
    {
        sf::Shape windowMaskShape = sf::Shape::Rectangle(editionData.view.GetCenter().x-previewData.scene.game->GetMainWindowDefaultWidth()/2, editionData.view.GetCenter().y-previewData.scene.game->GetMainWindowDefaultHeight()/2,
                                                         previewData.scene.game->GetMainWindowDefaultWidth(), previewData.scene.game->GetMainWindowDefaultHeight(), sf::Color( 0, 0, 0, 0 ), 1, sf::Color( 255, 255, 255, 128 ) );

        Draw(windowMaskShape);
    }

    RestoreGLStates();
    Display();
}

void SceneCanvas::RenderGrid()
{
    int departX = static_cast<int>((editionData.view.GetCenter().x-editionData.view.GetSize().x/2) / settings.gridWidth)-settings.gridWidth;
    departX *= settings.gridWidth;
    int positionX = departX;
    int departY = static_cast<int>((editionData.view.GetCenter().y-editionData.view.GetSize().y/2) / settings.gridHeight)-settings.gridHeight;
    departY *= settings.gridHeight;
    int positionY = departY;

    for ( positionX = departX;positionX < (editionData.view.GetCenter().x+editionData.view.GetSize().x/2) ; positionX += settings.gridWidth )
    {
        sf::Shape line = sf::Shape::Line( positionX, departY, positionX, (editionData.view.GetCenter().y+editionData.view.GetSize().y/2), 1, sf::Color( settings.gridR, settings.gridG, settings.gridB ));

        Draw( line );
    }

    for ( positionY = departY;positionY < (editionData.view.GetCenter().y+editionData.view.GetSize().y/2) ; positionY += settings.gridHeight )
    {
        sf::Shape line = sf::Shape::Line( departX, positionY, (editionData.view.GetCenter().x+editionData.view.GetSize().x/2), positionY, 1, sf::Color( settings.gridR, settings.gridG, settings.gridB ));

        Draw( line );
    }
}

void SceneCanvas::OnUpdate()
{
    Refresh();
    UpdateScrollbars();
}

/**
 * Notify a change has been made : Update history.
 */
void SceneCanvas::ChangesMade()
{
    history.push_back(latestState);
    redoHistory.clear();
    latestState = instances;
}

void SceneCanvas::ClearSelection()
{
    editionData.objectsSelected.clear();
    editionData.xObjectsSelected.clear();
    editionData.yObjectsSelected.clear();
}

void SceneCanvas::SelectObject(boost::shared_ptr<Object> object)
{
    if ( object == boost::shared_ptr<Object> () ) return;

    editionData.objectsSelected.push_back(object);
    editionData.xObjectsSelected.push_back(object->GetX());
    editionData.yObjectsSelected.push_back(object->GetY());
}

////////////////////////////////////////////////////////////
/// Bouton gauche : Déplacement objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDown( wxMouseEvent &event )
{
    SetFocus();

    if ( !editing )
        return;

    if ( hasJustRightClicked )
    {
        hasJustRightClicked = false;
        return;
    }

    ObjSPtr object = FindSmallestObjectUnderCursor();

    int mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
    int mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

    //Suppress selection
    if ( (!sf::Keyboard::IsKeyPressed(sf::Keyboard::LShift) && !sf::Keyboard::IsKeyPressed(sf::Keyboard::RShift)) && //Check that shift is not pressed
        ( object == boost::shared_ptr<Object> () || //If no object is clicked
         find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end()) ) //Or an object which is not currently selected.
    {
        ClearSelection();

        if ( initialPositionsBrowser )
            initialPositionsBrowser->DeselectAll();
    }

    //Manage selection area
    if ( object == boost::shared_ptr<Object> () ) //If no object is clicked
    {
        //Creation
        editionData.isSelecting = true;
        editionData.xRectangleSelection = mouseX;
        editionData.yRectangleSelection = mouseY;
        editionData.xEndRectangleSelection = mouseX;
        editionData.yEndRectangleSelection = mouseY;
    }

    //On ajoute l'objet surligné dans les objets à bouger
    if ( object == boost::shared_ptr<Object> () ) return;

    //Verify if user want to resize the object
    if (    editionData.objectsSelected.size() == 1 &&
            mouseX > object->GetDrawableX()+object->GetWidth()-6 &&
            mouseX < object->GetDrawableX()+object->GetWidth() &&
            mouseY > object->GetDrawableY()+object->GetHeight()/2-3 &&
            mouseY < object->GetDrawableY()+object->GetHeight()/2+3)
    {
        editionData.isMovingObject = false;
        editionData.isRotatingObject = false;
        editionData.isResizingX = true;
    }
    else if (   editionData.objectsSelected.size() == 1 &&
                mouseY > object->GetDrawableY()+object->GetHeight()-6 &&
                mouseY < object->GetDrawableY()+object->GetHeight() &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+3 )
    {
        editionData.isMovingObject = false;
        editionData.isRotatingObject = false;
        editionData.isResizingY = true;
    }
    else if ( editionData.objectsSelected.size() == 1 &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14159)-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14159)+3 &&
                mouseY > object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14159)-3 &&
                mouseY < object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14159)+3 )
    {
        editionData.isRotatingObject = true;
        editionData.isMovingObject = false;
        editionData.isResizingX = false;
        editionData.isResizingY = false;
    }
    else //Add object to selection
    {
        //Adding the object to selection if needed
        if ( find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end() )
        {
            SelectObject(object);

            if ( initialPositionsBrowser )
                initialPositionsBrowser->SelectInitialPosition(GetInitialPositionFromObject(object));
        }

        //Clone the selection using Ctrl
        if (!editionData.isMovingObject && (ctrlPressed))
        {
            for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
            {
                ObjSPtr selectedObject = editionData.objectsSelected[i];

                editionData.objectsSelected[i] = boost::shared_ptr<Object>(selectedObject->Clone()); //Replace the selection with the new object
                previewData.scene.objectsInstances.AddObject(editionData.objectsSelected[i]);
                instances.InsertInitialInstance(GetInitialPositionFromObject(selectedObject));
            }

            if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
        }

        editionData.isMovingObject = true;
        editionData.isRotatingObject = false;
        editionData.isResizingX = false;
        editionData.isResizingY = false;
    }

    editionData.oldMouseX = mouseX; //Position de départ de la souris
    editionData.oldMouseY = mouseY;
}

////////////////////////////////////////////////////////////
/// Bouton gauche relaché : Fin du déplacement
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftUp( wxMouseEvent &event )
{
    #if defined(GD_IDE_ONLY) && defined(LINUX)
    sf::Event myEvent;
    myEvent.Type = sf::Event::MouseButtonReleased;
    myEvent.MouseButton.X = event.GetX();
    myEvent.MouseButton.Y = event.GetY();
    myEvent.MouseButton.Button = sf::Mouse::Left;

    previewData.scene.GetRenderTargetEvents().push_back(myEvent);
    #endif

    if ( !editing ) return;

    //Relachement de la souris :
    //Pour les objets selectionnés, leurs nouvelle
    //position de départ est celle où ils sont.
    if ( editionData.isMovingObject )
    {
        bool changesMade = false;

        if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
        for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
        {
            ObjSPtr object = editionData.objectsSelected.at(i);
            InitialPosition & initialInstance = GetInitialPositionFromObject(object);

            if (editionData.xObjectsSelected[i] != initialInstance.GetX() ||
                editionData.yObjectsSelected[i] != initialInstance.GetY() )
            {
                changesMade = true;
                editionData.xObjectsSelected[i] = initialInstance.GetX();
                editionData.yObjectsSelected[i] = initialInstance.GetY();
            }

            if ( initialPositionsBrowser )
                initialPositionsBrowser->SelectInitialPosition(initialInstance);
        }

        if ( changesMade ) ChangesMade();
    }

    //Select object thanks to the selection area
    if ( editionData.isSelecting )
    {
        //Origin must be at the top left of the area
        if ( editionData.xEndRectangleSelection < editionData.xRectangleSelection) std::swap(editionData.xEndRectangleSelection, editionData.xRectangleSelection);
        if ( editionData.yEndRectangleSelection < editionData.yRectangleSelection) std::swap(editionData.yEndRectangleSelection, editionData.yRectangleSelection);

        ObjList allObjects = previewData.scene.objectsInstances.GetAllObjects();

        for (unsigned int id = 0;id < allObjects.size();++id)
        {
            //Find and add to selection all objects of the selection area
            ObjSPtr object = allObjects[id];
            if ( object->GetX() >= editionData.xRectangleSelection &&
                 object->GetX()+object->GetWidth() <= editionData.xEndRectangleSelection &&
                 object->GetY() >= editionData.yRectangleSelection &&
                 object->GetY()+object->GetHeight() <= editionData.yEndRectangleSelection )
             {
                if ( find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end() )
                {
                    SelectObject(object);
                    if ( initialPositionsBrowser )initialPositionsBrowser->SelectInitialPosition(GetInitialPositionFromObject(object));
                }
            }
        }
    }

    editionData.isResizingX = false;
    editionData.isResizingY = false;
    editionData.isMovingObject = false;
    editionData.isRotatingObject = false;
    editionData.isSelecting = false;
}

////////////////////////////////////////////////////////////
/// A chaque déplacement de la souris :
///
/// -affichage position
/// -bouger la vue si on suit la souris
////////////////////////////////////////////////////////////
void SceneCanvas::OnMotion( wxMouseEvent &event )
{
    //Mille mercis Laurent.
    float mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
    float mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

    if ( !editing )
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". ( Calque de base, Caméra 0 )" ) ) );
    else
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". SHIFT pour sélection multiple, clic droit pour plus d'options." ) ) );

    //The rest is for edittime
    if ( previewData.scene.running )
        return;

    //Moving using middle click
    if ( editionData.isMoving )
        editionData.view.SetCenter( editionData.viewStartPosition.x + editionData.mouseStartPosition.x - sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, editionData.viewStartPosition.y + editionData.mouseStartPosition.y - sf::Mouse::GetPosition(*previewData.scene.renderWindow).y );

    if ( editionData.isResizingX )
    {
        for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
        {
            ObjSPtr object = editionData.objectsSelected.at(i);
            object->SetWidth(mouseX-editionData.xObjectsSelected.at(i));

            InitialPosition & initialInstance = GetInitialPositionFromObject(object);
            initialInstance.SetHasCustomSize(true);
            initialInstance.SetWidth(object->GetWidth());
            initialInstance.SetHeight(object->GetHeight());
        }
    }
    if ( editionData.isResizingY )
    {
        for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
        {
            ObjSPtr object = editionData.objectsSelected.at(i);
            object->SetHeight(mouseY-editionData.yObjectsSelected.at(i));

            InitialPosition & initialInstance = GetInitialPositionFromObject(object);
            initialInstance.SetHasCustomSize(true);
            initialInstance.SetWidth(object->GetWidth());
            initialInstance.SetHeight(object->GetHeight());
        }
    }
    if ( editionData.isRotatingObject )
    {
        for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
        {
            ObjSPtr object = editionData.objectsSelected.at(i);
            float x = mouseX-(object->GetDrawableX()+object->GetWidth()/2);
            float y = mouseY-(object->GetDrawableY()+object->GetHeight()/2);
            float newAngle = atan2(y,x)*180/3.14159;

            object->SetAngle(newAngle);

            GetInitialPositionFromObject(object).SetAngle(newAngle);
        }
    }
    //Moving an instance
    if ( editionData.isMovingObject )
    {
        //Get the displacement of the cursor
        int deltaX = mouseX - editionData.oldMouseX;
        int deltaY = mouseY - editionData.oldMouseY;

        for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
        {
            ObjSPtr object = editionData.objectsSelected.at(i);

            //Compute new position
            int newX = editionData.xObjectsSelected[i] + deltaX;
            int newY = editionData.yObjectsSelected[i] + deltaY;

            if ( settings.grid && settings.snap )
            {
                newX = static_cast<int>(newX/settings.gridWidth)*settings.gridWidth;
                newY = static_cast<int>(newY/settings.gridHeight)*settings.gridHeight;
            }

            //Modification de l'emplacement initial
            InitialPosition & initialInstance = GetInitialPositionFromObject(object);
            initialInstance.SetX(newX);
            initialInstance.SetY(newY);

            //On bouge aussi l'objet actuellement affiché
            object->SetX( newX );
            object->SetY( newY );
        }
    }
    if ( editionData.isSelecting )
    {
        editionData.xEndRectangleSelection = mouseX;
        editionData.yEndRectangleSelection = mouseY;
    }

}

////////////////////////////////////////////////////////////
/// Double clic : insertion objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDClick( wxMouseEvent &event )
{
    editionData.rightClickSelectedObject = FindSmallestObjectUnderCursor();

    wxCommandEvent unusedEvent;
    OnPropObjSelected(unusedEvent);
}

void SceneCanvas::AddObject(const std::string & objectName, float x, float y)
{
    if ( !editing || objectName.empty() ) return;

    editionData.isMovingObject = false;

    std::vector<ObjSPtr>::iterator sceneObject = std::find_if(sceneEdited.GetInitialObjects().begin(), sceneEdited.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), objectName));
    std::vector<ObjSPtr>::iterator globalObject = std::find_if(gameEdited.GetGlobalObjects().begin(), gameEdited.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), objectName));

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( sceneObject != sceneEdited.GetInitialObjects().end() ) //We check first scene's objects' list.
        newObject = boost::shared_ptr<Object>((*sceneObject)->Clone());
    else if ( globalObject != gameEdited.GetGlobalObjects().end() ) //Then the global object list
        newObject = boost::shared_ptr<Object>((*globalObject)->Clone());

    if ( newObject == boost::shared_ptr<Object> () )
    {
        wxLogMessage(_("L'objet à ajouter n'existe pas ou plus dans la liste des objets.\nGlissez-déposez les objets depuis la liste des objets."));
        return;
    }

    //Initial position creation
    InitialPosition pos;
    pos.SetObjectName(objectName);
    if ( settings.grid && settings.snap )
    {
        pos.SetX(static_cast<int>(x/settings.gridWidth)*settings.gridWidth);
        pos.SetY(static_cast<int>(y/settings.gridHeight)*settings.gridHeight);
    }
    else
    {
        pos.SetX(x);
        pos.SetY(y);
    }

    pos.SetZOrder(GetHighestZOrderOnLayer(editionData.currentLayer)+1);
    pos.SetLayer(editionData.currentLayer);
    instances.InsertInitialInstance( pos );

    //Edittime scene object creation
    newObject->SetX( pos.GetX() );
    newObject->SetY( pos.GetY() );
    newObject->SetZOrder( pos.GetZOrder() );
    newObject->SetLayer( pos.GetLayer() );
    newObject->InitializeFromInitialPosition(pos);
    newObject->LoadRuntimeResources( previewData.scene, *previewData.game.imageManager );

    previewData.scene.objectsInstances.AddObject(newObject);

    newObject->LoadResources(previewData.scene, *previewData.game.imageManager); //Global objects images are curiously not displayed if we don't reload resources..

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic droit : edition propriétés objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnRightUp( wxMouseEvent &event )
{
    #if defined(GD_IDE_ONLY) && defined(LINUX)
    sf::Event myEvent;
    myEvent.Type = sf::Event::MouseButtonReleased;
    myEvent.MouseButton.X = event.GetX();
    myEvent.MouseButton.Y = event.GetY();
    myEvent.MouseButton.Button = sf::Mouse::Right;

    previewData.scene.GetRenderTargetEvents().push_back(myEvent);
    #endif

    if ( !editing )
        return;

    ObjSPtr object = FindSmallestObjectUnderCursor();

    //Suppress selection if
    if ( object == boost::shared_ptr<Object> () || /*Not clicked on an object*/
        (( !sf::Keyboard::IsKeyPressed(sf::Keyboard::LShift) && !sf::Keyboard::IsKeyPressed(sf::Keyboard::RShift) ) && /*Clicked without using shift*/
         find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end() ))
    {
        ClearSelection();
        if ( initialPositionsBrowser ) initialPositionsBrowser->DeselectAll();
    }

    if ( object == boost::shared_ptr<Object> () ) //Popup "no object" context menu
    {
        PopupMenu(&noObjectContextMenu);
        return;
    }
    editionData.rightClickSelectedObject = object;

    //Add the object to selection
    if ( find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end() )
    {
        SelectObject(object);
        if ( initialPositionsBrowser ) initialPositionsBrowser->SelectInitialPosition(GetInitialPositionFromObject(object));
    }

    OnUpdate(); //So as to display selection rectangle for the newly selected object
    UpdateContextMenu();
    PopupMenu(&contextMenu);

    hasJustRightClicked = true;
}

////////////////////////////////////////////////////////////
/// Déplacement de(s) objet(s) selectionné(s) sur le calque supérieur
////////////////////////////////////////////////////////////
void SceneCanvas::OnLayerUpSelected(wxCommandEvent & event)
{
    int lowestLayer = GetObjectsSelectedLowestLayer();
    if ( lowestLayer+1 < 0 || static_cast<unsigned>(lowestLayer+1) >= previewData.scene.initialLayers.size() )
        return;

    string layerName = previewData.scene.initialLayers.at(lowestLayer+1).GetName();

    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        GetInitialPositionFromObject(editionData.objectsSelected[i]).SetLayer(layerName);
        editionData.objectsSelected[i]->SetLayer(layerName);
    }

    ChangesMade();
}

void SceneCanvas::OnCopySelected(wxCommandEvent & event)
{
    vector < InitialPosition > copiedPositions;

    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        int mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
        int mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

        copiedPositions.push_back(GetInitialPositionFromObject(editionData.objectsSelected[i]));
        copiedPositions.back().SetX(copiedPositions.back().GetX() - mouseX);
        copiedPositions.back().SetY(copiedPositions.back().GetY() - mouseY);
    }

    Clipboard::GetInstance()->SetPositionsSelection(copiedPositions);
}

void SceneCanvas::OnCutSelected(wxCommandEvent & event)
{
    vector < InitialPosition > copiedPositions;

    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        InitialPosition & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);

        //Copy position
        float mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
        float mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

        copiedPositions.push_back(initialInstance);
        copiedPositions.back().SetX(copiedPositions.back().GetX() - mouseX);
        copiedPositions.back().SetY(copiedPositions.back().GetY() - mouseY);

        //Remove objects
        instances.RemoveInstance(initialInstance);
        previewData.scene.objectsInstances.RemoveObject(editionData.objectsSelected[i]);
    }

    ClearSelection();

    if ( initialPositionsBrowser ) initialPositionsBrowser->DeselectAll();
    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();

    Clipboard::GetInstance()->SetPositionsSelection(copiedPositions);
    ChangesMade();
}

void SceneCanvas::OnPasteSelected(wxCommandEvent & event)
{
    if ( !Clipboard::GetInstance()->HasPositionsSelection() ) return;

    vector < InitialPosition > pastedPositions = Clipboard::GetInstance()->GetPositionsSelection();

    for (unsigned int i =0;i<pastedPositions.size();++i)
    {
        float mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
        float mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

        instances.InsertInitialInstance(pastedPositions[i]);
        gd::InitialInstance & insertedInstance = instances.GetInstance(instances.GetInstancesCount()-1);
        insertedInstance.SetX(insertedInstance.GetX()+mouseX);
        insertedInstance.SetY(insertedInstance.GetY()+mouseY);
    }

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    ChangesMade();
    Reload();
}

void SceneCanvas::OnPasteSpecialSelected(wxCommandEvent & event)
{
    if ( !Clipboard::GetInstance()->HasPositionsSelection() ) return;
    vector < InitialPosition > pastedPositions = Clipboard::GetInstance()->GetPositionsSelection();

    float mouseX = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
    float mouseY = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

    AdvancedPasteDlg dialog(this);
    dialog.SetStartX(mouseX);
    dialog.SetStartY(mouseY);


    ObjSPtr object = GetObjectFromInitialPosition(pastedPositions.front());
    if ( object != boost::shared_ptr<Object>() )
    {
        dialog.SetXGap(object->GetWidth());
        dialog.SetYGap(object->GetHeight());
    }

    if ( dialog.ShowModal() != 1 ) return;

    float angle = dialog.GetRotationIncrementation();
    for (unsigned int i = 0;i<dialog.GetYCount();++i)
    {
        for (unsigned int j = 0;j<dialog.GetXCount();++j)
        {
            instances.InsertInitialInstance(pastedPositions.front());
            gd::InitialInstance & insertedInstance = instances.GetInstance(instances.GetInstancesCount()-1);
            insertedInstance.SetX(dialog.GetStartX()+dialog.GetXGap()*j);
            insertedInstance.SetY(dialog.GetStartY()+dialog.GetYGap()*i);
            insertedInstance.SetAngle(pastedPositions.front().GetAngle() + angle);

            angle += dialog.GetRotationIncrementation();
        }
    }

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    ChangesMade();
    Reload();
}

////////////////////////////////////////////////////////////
/// Déplacement de(s) objet(s) selectionné(s) sur le calque inférieur
////////////////////////////////////////////////////////////
void SceneCanvas::OnLayerDownSelected(wxCommandEvent & event)
{
    int highestLayer = GetObjectsSelectedLowestLayer();
    if ( highestLayer-1 < 0 || static_cast<unsigned>(highestLayer-1) >= previewData.scene.initialLayers.size() )
        return;

    string layerName = previewData.scene.initialLayers.at(highestLayer-1).GetName();

    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        GetInitialPositionFromObject(editionData.objectsSelected[i]).SetLayer(layerName);
        editionData.objectsSelected[i]->SetLayer(layerName);
    }

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Editer les valeurs initiales d'un objet sur la scène
////////////////////////////////////////////////////////////
void SceneCanvas::OnPropObjSelected(wxCommandEvent & event)
{
    if ( !editing )
        return;

    if ( editionData.rightClickSelectedObject == boost::shared_ptr<Object> ()) return;

    InitialPosition & initialInstance = GetInitialPositionFromObject(editionData.rightClickSelectedObject);
    if ( &initialInstance == &badInstance ) return;

    bool hadAPersonalizedSize = initialInstance.HasCustomSize();

    //Display dialog to update properties
    EditOptionsPosition DialogPosition( this, gameEdited, previewData.scene, initialInstance );
    if ( DialogPosition.ShowModal() == 1 )
    {
        initialInstance = DialogPosition.position;

        //We need to update the associated object
        editionData.rightClickSelectedObject->SetX( initialInstance.GetX() );
        editionData.rightClickSelectedObject->SetY( initialInstance.GetY() );
        editionData.rightClickSelectedObject->SetAngle( initialInstance.GetAngle() );
        editionData.rightClickSelectedObject->SetZOrder( initialInstance.GetZOrder() );
        editionData.rightClickSelectedObject->SetLayer( initialInstance.GetLayer() );

        editionData.rightClickSelectedObject->InitializeFromInitialPosition(initialInstance);

        if ( initialInstance.HasCustomSize() )
        {
            editionData.rightClickSelectedObject->SetWidth( initialInstance.GetWidth() );
            editionData.rightClickSelectedObject->SetHeight( initialInstance.GetHeight() );
        }
        else if ( hadAPersonalizedSize ) //For now, we reload the scene so as the object get back its initial size
        {
            Reload();
        }

        if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
        ChangesMade();
    }

    return;
}

////////////////////////////////////////////////////////////
/// Suppression de(s) objet(s) selectionné(s)
////////////////////////////////////////////////////////////
void SceneCanvas::OnDelObjetSelected(wxCommandEvent & event)
{
    if ( !editing ) return;

    for (unsigned int i = 0;i<editionData.objectsSelected.size();++i)
    {
        ObjSPtr object = editionData.objectsSelected.at(i);

        instances.RemoveInstance(GetInitialPositionFromObject(object));
        previewData.scene.objectsInstances.RemoveObject(object);
    }

    ClearSelection();

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic molette : Des/activer déplacement à la souris
////////////////////////////////////////////////////////////
void SceneCanvas::OnMiddleDown( wxMouseEvent &event )
{
    if ( !editing ) return;

    if ( !editionData.isMoving )
    {
        editionData.isMoving = true;
        editionData.mouseStartPosition = sf::Mouse::GetPosition(*previewData.scene.renderWindow);
        editionData.viewStartPosition = GetView().GetCenter();
        SetCursor( wxCursor( wxCURSOR_SIZING ) );

        return;
    }
    else
    {
        editionData.isMoving = false;
        SetCursor( wxNullCursor );
    }
}

////////////////////////////////////////////////////////////
/// Zoom / dezoom à la molette
/// Il faut prendre garde à garder les proportions de la fenêtre
////////////////////////////////////////////////////////////
void SceneCanvas::OnMouseWheel( wxMouseEvent &event )
{
    if (previewData.scene.running)
        return;

    //La rotation de la molette
    float rotation = event.GetWheelRotation()*3;
    editionData.zoom += ( rotation / 25 );

    //Le rapport entre la largeur et la hauteur
    float qwoh = editionData.view.GetSize().x / editionData.view.GetSize().y;

    //La nouvelle hauteur
    float newheight = editionData.view.GetSize().y + ( rotation / 25 );

    editionData.view.SetSize( newheight*qwoh, newheight );
}

int SceneCanvas::GetObjectsSelectedHighestLayer()
{
    int highestLayer = 0;
    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        gd::InitialInstance & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);

        int layerObjId = 0;
        //On cherche le numéro du calque de l'objet
        for (unsigned int layerId = 0;layerId<previewData.scene.initialLayers.size();++layerId)
        {
            if ( previewData.scene.initialLayers[layerId].GetName() == initialInstance.GetLayer() )
               layerObjId = layerId;
        }

        if ( layerObjId > highestLayer )
            highestLayer = layerObjId;
    }

    return highestLayer;
}

int SceneCanvas::GetObjectsSelectedLowestLayer()
{
    int lowestLayer = previewData.scene.initialLayers.size()-1;
    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        gd::InitialInstance & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);

        int layerObjId = 0;
        //On cherche le numéro du calque de l'objet
        for (unsigned int layerId = 0;layerId<previewData.scene.initialLayers.size();++layerId)
        {
            if ( previewData.scene.initialLayers[layerId].GetName() == initialInstance.GetLayer() )
               layerObjId = layerId;
        }

        if ( layerObjId < lowestLayer )
            lowestLayer = layerObjId;
    }

    return lowestLayer;
}

/**
 * Tool function to get the initial position from an object.
 */
InitialPosition & SceneCanvas::GetInitialPositionFromObject(ObjSPtr object)
{
    if ( object == boost::shared_ptr<Object> ()) return badInstance;

    for (unsigned int j = 0;j < instances.GetInstancesCount();++j)
    {
        if (instances.GetInstance( j ).GetObjectName() == object->GetName() &&
            instances.GetInstance( j ).GetX() == object->GetX() &&
            instances.GetInstance( j ).GetY() == object->GetY() )
        {
            return instances.GetInstance( j );
        }
    }

    std::cout << "SceneCanvas: Initial instance not found." << std::endl;
    return badInstance;
}

/**
 * Tool function to get the object from an initial position.
 */
ObjSPtr SceneCanvas::GetObjectFromInitialPosition(const InitialPosition & initialPosition)
{
    ObjList allObjects = previewData.scene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        if (allObjects[id]->GetName() == initialPosition.GetObjectName() &&
            allObjects[id]->GetX() == initialPosition.GetX() &&
            allObjects[id]->GetY() == initialPosition.GetY() )
        {
            return allObjects[id];
        }
    }

    std::cout << "SceneCanvas: Object not found." << std::endl;
    return boost::shared_ptr<Object> ();
}

boost::shared_ptr<Object> SceneCanvas::FindSmallestObjectUnderCursor()
{
    ObjList potentialObjects;
    float x = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).x;
    float y = ConvertCoords(sf::Mouse::GetPosition(*previewData.scene.renderWindow).x, sf::Mouse::GetPosition(*previewData.scene.renderWindow).y).y;

    ObjList allObjects = previewData.scene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        if ( allObjects[id]->GetDrawableX() < x &&
                allObjects[id]->GetDrawableY() < y &&
                allObjects[id]->GetDrawableX() + allObjects[id]->GetWidth() > x &&
                allObjects[id]->GetDrawableY() + allObjects[id]->GetHeight() > y &&
                previewData.scene.GetLayer(allObjects[id]->GetLayer()).GetVisibility())
        {
            potentialObjects.push_back( allObjects[id] );
        }
    }
    if ( potentialObjects.empty() ) return boost::shared_ptr<Object> (); //Aucun objet trouvé

    ObjSPtr smallest = potentialObjects[0];
    for ( unsigned int j = 0;j < potentialObjects.size();j++ )
    {
        if (( potentialObjects[j]->GetWidth() * potentialObjects[j]->GetHeight() ) < ( smallest->GetWidth() * smallest->GetHeight() ) )
        {
            smallest = potentialObjects[j];
        }
    }

    return smallest;
}

void SceneCanvas::OnUndoBtClick( wxCommandEvent & event )
{
    Undo();
    Reload();
}

void SceneCanvas::Undo()
{
    if ( history.empty() ) return;

    redoHistory.push_back(instances); //We can go back to the current state using redo button.
    instances = history.back();
    history.pop_back();

    latestState = instances;
}

void SceneCanvas::OnClearHistorySelected(wxCommandEvent& event)
{
    if (wxMessageBox("Etes-vous sûr de vouloir supprimer l'historique des modifications ?", "Êtes vous sûr ?",wxYES_NO ) != wxYES)
        return;

    history.clear();
    redoHistory.clear();
}

void SceneCanvas::OnRedoBtClick( wxCommandEvent & event )
{
    if ( redoHistory.empty() ) return;

    history.push_back(instances);
    instances = redoHistory.back();
    redoHistory.pop_back();

    latestState = instances;

    Reload();
}



//The rest of the implementation is available in SceneCanvas2.cpp
