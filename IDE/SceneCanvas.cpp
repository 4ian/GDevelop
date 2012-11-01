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
#include <wx/msgdlg.h>
#include <wx/log.h>
#include <wx/scrolbar.h>
#include <wx/infobar.h>
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/IDE/Dialogs/ChooseObjectTypeDialog.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ImageManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/CommonTools.h"
#include "GDCore/IDE/Dialogs/ChooseLayerDialog.h"
#include "GDCore/IDE/Dialogs/ChooseObjectDialog.h"
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
#undef GetObject //Disable an annoying macro

const long SceneCanvas::ID_ADDOBJMENU = wxNewId();
const long SceneCanvas::ID_DELOBJMENU = wxNewId();
const long SceneCanvas::ID_PROPMENU = wxNewId();
const long SceneCanvas::ID_LAYERUPMENU = wxNewId();
const long SceneCanvas::ID_LAYERDOWNMENU = wxNewId();
const long SceneCanvas::ID_COPYMENU = wxNewId();
const long SceneCanvas::ID_CUTMENU = wxNewId();
const long SceneCanvas::ID_PASTEMENU = wxNewId();
const long SceneCanvas::ID_PASTESPECIALMENU = wxNewId();
const long SceneCanvas::ID_CREATEOBJECTMENU = wxNewId();
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
    mainFrameWrapper.LockShortcuts(this);
    mainFrameWrapper.DisableControlsForScenePreviewing();
    if ( objectsEditor ) objectsEditor->Disable();
    if ( layersEditor ) layersEditor->Disable();
    if ( initialPositionsBrowser ) initialPositionsBrowser->Disable();

    editing = false;
    previewData.scene.running = false;

    scrollBar1->Show(false);
    scrollBar2->Show(false);

    Reload();
    UpdateSize();
    UpdateScrollbars();

    SetFocus();

    if ( debugger ) debugger->Play();
    CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), false);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();
}

/**
 * Go in edition mode
 */
void SceneCanvas::OnEditionBtClick( wxCommandEvent & event )
{
    if ( editing ) return;
    cout << "Switching to edition mode..." << endl;

    //Let the IDE go back to edition state
    wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());
    mainFrameWrapper.UnLockShortcuts(this);
    mainFrameWrapper.EnableControlsAfterScenePreviewing();
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

    //Parse now the results of profiling
    if ( profileDialog ) profileDialog->ParseProfileEvents();

    Reload();
    UpdateSize();
    UpdateScrollbars();

    if ( debugger ) debugger->Pause();
    CreateToolsBar(mainFrameWrapper.GetRibbonSceneEditorButtonBar(), true);
    mainFrameWrapper.GetRibbonSceneEditorButtonBar()->Refresh();
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
    externalWindow->renderCanvas->setFramerateLimit( previewData.game.GetMaximumFPS() );

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
    if ( sceneEdited.CompilationNeeded() && !CodeCompiler::GetInstance()->HasTaskRelatedTo(sceneEdited) )
    {
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(gameEdited, sceneEdited);

        if ( !editing )
            mainFrameWrapper.GetInfoBar()->ShowMessage(_("Changes made to events will be taken ino account when you switch to Edition mode"));
    }

    return; //Reload second par will be called by Refresh when appropriate
}

void SceneCanvas::ReloadSecondPart()
{
    cout << "Scene canvas reloading... ( Step 2/2 )" << endl;
    if ( !editing )  CodeCompiler::GetInstance()->DisableTaskRelatedTo(sceneEdited);

    //Switch the working directory as we are making calls to the runtime scene
    if ( wxDirExists(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath()))
        wxSetWorkingDirectory(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath());

    previewData.scene.LoadFromSceneAndCustomInstances( sceneEdited, instances );
    sceneEdited.wasModified = false;

    //If a preview is not going to be made, switch back to the IDE working directory
    if ( editing ) wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory());

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
            while ( pollEvent( event ) )
                ;

            clear(sf::Color(255,255,255));

            pushGLStates();
            setView(sf::View(sf::Vector2f(getSize().x/2, getSize().y/2), sf::Vector2f(getSize().x, getSize().y)));

            reloadingIconSprite.setTexture(reloadingIconImage);
            reloadingIconSprite.setColor(sf::Color(255,255,255,128));
            reloadingIconSprite.setPosition(getSize().x/2-reloadingIconSprite.getLocalBounds().width/2, getSize().y/2-reloadingIconSprite.getLocalBounds().height/2);
            reloadingText.setPosition(getSize().x/2-reloadingText.getLocalBounds().width/2, reloadingIconSprite.getPosition().y+reloadingIconSprite.getLocalBounds().height+10);

            draw(reloadingIconSprite);
            draw(reloadingText);

            popGLStates();
            display();
            return;
        }
        else //Everything is finished, reloading is complete!
        {

            //But be sure that no error occured.
            if ( !editing && !sceneEdited.codeExecutionEngine->Ready() )
            {
                wxLogError(_("Compilation of events failed, and scene cannot be previewed. Please report this problem to Game Develop's developer, joining this file:\n")+CodeCompiler::GetInstance()->GetOutputDirectory()+"compilationErrors.txt");
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
                if ( wxDirExists(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath()))
                    wxSetWorkingDirectory(wxFileName::FileName(gameEdited.GetProjectFile()).GetPath()); //Resources loading stuff incoming: Switch current work dir.

                for (unsigned int i = 0;i<gameEdited.imagesChanged.size();++i)
                    previewData.game.imageManager->ReloadImage(gameEdited.imagesChanged[i]);

                gameEdited.imageManager->LoadPermanentImages();
                gameEdited.imagesChanged.clear();
                sceneEdited.wasModified = true;

                wxSetWorkingDirectory(mainFrameWrapper.GetIDEWorkingDirectory()); //Go back to the IDE cwd.
            }

            if ( sceneEdited.wasModified ) //Reload scene if necessary
                Reload();
        }

        //Then display the scene
        if ( previewData.scene.running ) //At runtime
        {
            int retourEvent = previewData.scene.RenderAndStep();

            if ( retourEvent == -2 )
                mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the game will quit." ));
            else if ( retourEvent != -1 )
            {
                if (retourEvent > 0 && static_cast<unsigned>(retourEvent) < gameEdited.GetLayouts().size())
                    mainFrameWrapper.GetInfoBar()->ShowMessage(_( "In the compiled game, the scene will change for " ) + "\"" + gameEdited.GetLayouts()[retourEvent]->GetName() + "\"");
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

    clear( sf::Color( previewData.scene.GetBackgroundColorRed(), previewData.scene.GetBackgroundColorGreen(), previewData.scene.GetBackgroundColorBlue() ) );
    setView(editionData.view);

    glClear(GL_DEPTH_BUFFER_BIT);
    pushGLStates(); //To allow using OpenGL to draw

    //On trie les objets par leurs plans
    ObjList allObjects = previewData.scene.objectsInstances.GetAllObjects();
    previewData.scene.OrderObjectsByZOrder( allObjects );

    std::vector < boost::shared_ptr<sf::Shape> > GUIelements;

    for (unsigned int layerIndex =0;layerIndex<previewData.scene.GetLayersCount();++layerIndex)
    {
        if ( previewData.scene.GetLayer(layerIndex).GetVisibility() )
        {
            //Prepare OpenGL rendering
            popGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            gluPerspective(previewData.scene.GetOpenGLFOV(), static_cast<double>(getSize().x)/static_cast<double>(getSize().y), previewData.scene.GetOpenGLZNear(), previewData.scene.GetOpenGLZFar());

            glViewport(0,0, getSize().x, getSize().y);

            pushGLStates();

            //Render all objects
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                if ( allObjects[id]->GetLayer() == previewData.scene.GetLayer(layerIndex).GetName())
                {
                    allObjects[id]->DrawEdittime(*previewData.scene.renderWindow);

                    //Selection rectangle
                    if ( find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), allObjects[id]) != editionData.objectsSelected.end() )
                    {
                        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX(), allObjects[id]->GetDrawableY(), editionData.view);
                        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth(),
                                                                               allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight(), editionData.view);

                        boost::shared_ptr<sf::Shape> selection = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(rectangleEnd.x-rectangleOrigin.x, rectangleEnd.y-rectangleOrigin.y)));
                        selection->setPosition(rectangleOrigin.x, rectangleOrigin.y);
                        selection->setFillColor(sf::Color( 0, 0, 200, 40 ));
                        selection->setOutlineColor(sf::Color( 0, 0, 255, 128 ));

                        GUIelements.push_back( selection );

                        if ( editionData.objectsSelected.size() == 1)
                        {
                            boost::shared_ptr<sf::Shape> resizeXBt = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(4, 4)));
                            resizeXBt->setFillColor(sf::Color( 255, 255, 255, 255 )); resizeXBt->setOutlineColor(sf::Color( 0, 0, 255, 255 ));

                            boost::shared_ptr<sf::Shape> resizeYBt = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(4, 4)));
                            resizeYBt->setFillColor(sf::Color( 255, 255, 255, 255 )); resizeYBt->setOutlineColor(sf::Color( 0, 0, 255, 255 ));

                            boost::shared_ptr<sf::Shape> angleBt = boost::shared_ptr<sf::Shape>(new sf::RectangleShape(sf::Vector2f(4, 4)));
                            angleBt->setFillColor(sf::Color( 255, 255, 255, 255 )); angleBt->setOutlineColor(sf::Color( 0, 0, 255, 255 ));

                            boost::shared_ptr<sf::Shape> center = boost::shared_ptr<sf::Shape>(new sf::CircleShape(2));
                            center->setFillColor(sf::Color( 0, 0, 255, 255 )); center->setOutlineColor(sf::Color( 0, 0, 255, 255 ));

                            resizeXBt->setPosition(ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth(),
                                                                             allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2,
                                                                             editionData.view ));
                            resizeXBt->move(-4,-2);

                            resizeYBt->setPosition(ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                                                             allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight(),
                                                                             editionData.view ));
                            resizeYBt->move(-2,-4);

                            center->setPosition(ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                                                          allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2,
                                                                          editionData.view ));
                            center->move(-2,-2);

                            angleBt->setPosition(ConvertToWindowCoordinates(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2
                                                                           +20*cos(allObjects[id]->GetAngle()/180.f*3.14159),
                                                                           allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2
                                                                           +20*sin(allObjects[id]->GetAngle()/180.f*3.14159),
                                                                          editionData.view ));
                            angleBt->move(-2,-2);

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

    //Go back to "window" view before drawing GUI elements
    setView(sf::View(sf::Vector2f(getSize().x/2,getSize().y/2), sf::Vector2f(getSize().x,getSize().y)));

    if ( settings.grid ) RenderGrid();

    for (unsigned int i = 0;i<GUIelements.size();++i)
    	draw(*GUIelements[i]);

    if ( editionData.isSelecting )
    {
        sf::Vector2f rectangleOrigin = sf::Vector2f(editionData.xRectangleSelection,
                                                    editionData.yRectangleSelection);
        rectangleOrigin = ConvertToWindowCoordinates(rectangleOrigin.x, rectangleOrigin.y, editionData.view);

        sf::Vector2f rectangleEnd = sf::Vector2f(editionData.xEndRectangleSelection,
                                                 editionData.yEndRectangleSelection);
        rectangleEnd = ConvertToWindowCoordinates(rectangleEnd.x, rectangleEnd.y, editionData.view);

        sf::RectangleShape selection(sf::Vector2f(rectangleEnd.x-rectangleOrigin.x, rectangleEnd.y-rectangleOrigin.y));
        selection.setPosition(rectangleOrigin.x, rectangleOrigin.y);
        selection.setFillColor(sf::Color( 0, 0, 200, 40 ));
        selection.setOutlineColor(sf::Color( 0, 0, 255, 128 ));
        draw(selection);
    }

    if ( settings.windowMask )
    {
        sf::Vector2f rectangleOrigin = ConvertToWindowCoordinates(editionData.view.getCenter().x-previewData.scene.game->GetMainWindowDefaultWidth()/2,
                                                                  editionData.view.getCenter().y-previewData.scene.game->GetMainWindowDefaultHeight()/2,
                                                                  editionData.view);

        sf::Vector2f rectangleEnd = ConvertToWindowCoordinates(editionData.view.getCenter().x+previewData.scene.game->GetMainWindowDefaultWidth()/2,
                                                                  editionData.view.getCenter().y+previewData.scene.game->GetMainWindowDefaultHeight()/2,
                                                                  editionData.view);

        sf::RectangleShape mask(sf::Vector2f(rectangleEnd.x-rectangleOrigin.x, rectangleEnd.y-rectangleOrigin.y));
        mask.setPosition(rectangleOrigin.x, rectangleOrigin.y);
        mask.setFillColor(sf::Color( 0, 0, 0, 0 ));
        mask.setOutlineColor(sf::Color( 255, 255, 255, 128 ));
        draw(mask);
    }

    setView(editionData.view);
    popGLStates();
    display();
}

void SceneCanvas::RenderGrid()
{
    int initialXPos = floor((editionData.view.getCenter().x-editionData.view.getSize().x/2) / settings.gridWidth)-settings.gridWidth;
    initialXPos *= settings.gridWidth;
    int initialYPos = floor((editionData.view.getCenter().y-editionData.view.getSize().y/2) / settings.gridHeight)-settings.gridHeight;
    initialYPos *= settings.gridHeight;

    for ( int Xpos = initialXPos;Xpos < (editionData.view.getCenter().x+editionData.view.getSize().x/2) ; Xpos += settings.gridWidth )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(Xpos, initialYPos, editionData.view), sf::Color(settings.gridR, settings.gridG, settings.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(Xpos, editionData.view.getCenter().y+editionData.view.getSize().y/2, editionData.view), sf::Color(settings.gridR, settings.gridG, settings.gridB))};
        draw(line, 2, sf::Lines);
    }

    for ( int Ypos = initialYPos;Ypos < (editionData.view.getCenter().y+editionData.view.getSize().y/2) ; Ypos += settings.gridHeight )
    {
        sf::Vertex line[2] = {sf::Vertex(ConvertToWindowCoordinates(initialXPos, Ypos, editionData.view), sf::Color(settings.gridR, settings.gridG, settings.gridB)),
                              sf::Vertex(ConvertToWindowCoordinates(editionData.view.getCenter().x+editionData.view.getSize().x/2, Ypos, editionData.view), sf::Color(settings.gridR, settings.gridG, settings.gridB))};
        draw(line, 2, sf::Lines);
    }
}

sf::Vector2f SceneCanvas::ConvertToWindowCoordinates(float x, float y, const sf::View & view)
{
    //Transform by the view matrix
    sf::Vector2f hCoords = view.getTransform().transformPoint(x,y);

    //Go back from homogeneous coordinates to viewport ones.
    sf::IntRect viewport = getViewport(view);
    return sf::Vector2f(( hCoords.x + 1.f ) / 2.f * viewport.width + viewport.left,
                        (-hCoords.y + 1.f ) / 2.f * viewport.height + viewport.top);
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

void SceneCanvas::OnCreateObjectSelected(wxCommandEvent & event)
{
    gd::ChooseObjectTypeDialog chooseTypeDialog(this, gameEdited);
    if ( chooseTypeDialog.ShowModal() == 0 )
        return;

    //Find a new unique name for the object
    std::string name = ToString(_("NewObject"));
    for (unsigned int i = 0;sceneEdited.HasObjectNamed(name);)
    {
        ++i;
        name =  _("NewObject")+ToString(i);
    }

    //Add a new object of selected type to objects list
    sceneEdited.InsertNewObject(chooseTypeDialog.GetSelectedObjectType(), name, sceneEdited.GetObjectsCount());
    if ( objectsEditor ) objectsEditor->Refresh();

    //Add it on the scene ( Use editionData.oldMouseX/Y as the cursor has moved since the right click )
    AddObject(name, editionData.oldMouseX, editionData.oldMouseY);

    //Edit now the object
    sceneEdited.GetObject(name).EditObject(this, gameEdited, mainFrameWrapper);
    gameEdited.GetChangesNotifier().OnObjectEdited(gameEdited, &sceneEdited, sceneEdited.GetObject(name));
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

    float mouseX = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).x;
    float mouseY = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).y;

    //Suppress selection
    if ( (!sf::Keyboard::isKeyPressed(sf::Keyboard::LShift) && !sf::Keyboard::isKeyPressed(sf::Keyboard::RShift)) && //Check that shift is not pressed
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
    myEvent.type = sf::Event::MouseButtonReleased;
    myEvent.mouseButton.x = event.GetX();
    myEvent.mouseButton.y = event.GetY();
    myEvent.mouseButton.button = sf::Mouse::Left;

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
    float mouseX = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).x;
    float mouseY = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).y;

    if ( !editing )
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". ( Base layer, camera 0 )" ) ) );
    else
        wxLogStatus( wxString( _( "Position " ) ) + ToString( mouseX ) + wxString( _( ";" ) ) + ToString( mouseY ) + wxString( _( ". SHIFT for multiple selection, right click for more options." ) ) );

    //The rest is for edittime
    if ( previewData.scene.running )
        return;

    //Moving using middle click
    if ( editionData.isMoving )
    {
        float zoomFactor = static_cast<float>(getSize().x)/editionData.view.getSize().x;

        editionData.view.setCenter( editionData.viewStartPosition.x + (editionData.mouseStartPosition.x - sf::Mouse::getPosition(*previewData.scene.renderWindow).x)/zoomFactor,
                                   editionData.viewStartPosition.y + (editionData.mouseStartPosition.y - sf::Mouse::getPosition(*previewData.scene.renderWindow).y)/zoomFactor );
    }

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
        wxLogMessage(_("The object to add does not exist ( anymore ) in the object list.\nDrag and drop objects on the scene from the objects list."));
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
    myEvent.type = sf::Event::MouseButtonReleased;
    myEvent.mouseButton.x = event.GetX();
    myEvent.mouseButton.y = event.GetY();
    myEvent.mouseButton.button = sf::Mouse::Right;

    previewData.scene.GetRenderTargetEvents().push_back(myEvent);
    #endif

    if ( !editing )
        return;

    ObjSPtr object = FindSmallestObjectUnderCursor();

    //Suppress selection if the user
    if ( object == boost::shared_ptr<Object> () || /*Did not click on an object*/
        (( !sf::Keyboard::isKeyPressed(sf::Keyboard::LShift) && !sf::Keyboard::isKeyPressed(sf::Keyboard::RShift) ) && /*Clicked without using shift*/
         find(editionData.objectsSelected.begin(), editionData.objectsSelected.end(), object) == editionData.objectsSelected.end() ))
    {
        ClearSelection();
        if ( initialPositionsBrowser ) initialPositionsBrowser->DeselectAll();
    }

    //Remember now the position of the mouse for latter use
    editionData.oldMouseX = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).x;
    editionData.oldMouseY = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).y;

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
    if ( lowestLayer+1 < 0 || static_cast<unsigned>(lowestLayer+1) >= previewData.scene.GetLayersCount() )
        return;

    string layerName = previewData.scene.GetLayer(lowestLayer+1).GetName();

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
        copiedPositions.push_back(GetInitialPositionFromObject(editionData.objectsSelected[i]));
        copiedPositions.back().SetX(copiedPositions.back().GetX() - editionData.oldMouseX);
        copiedPositions.back().SetY(copiedPositions.back().GetY() - editionData.oldMouseY);
    }

    Clipboard::GetInstance()->SetPositionsSelection(copiedPositions);
}

void SceneCanvas::OnCutSelected(wxCommandEvent & event)
{
    vector < InitialPosition > copiedPositions;

    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        InitialPosition & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);
        copiedPositions.push_back(initialInstance);
        copiedPositions.back().SetX(copiedPositions.back().GetX() - editionData.oldMouseX);
        copiedPositions.back().SetY(copiedPositions.back().GetY() - editionData.oldMouseY);

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
        instances.InsertInitialInstance(pastedPositions[i]);
        gd::InitialInstance & insertedInstance = instances.GetInstance(instances.GetInstancesCount()-1);
        insertedInstance.SetX(insertedInstance.GetX()+editionData.oldMouseX);
        insertedInstance.SetY(insertedInstance.GetY()+editionData.oldMouseY);
    }

    if ( initialPositionsBrowser ) initialPositionsBrowser->Refresh();
    ChangesMade();
    Reload();
}

void SceneCanvas::OnPasteSpecialSelected(wxCommandEvent & event)
{
    if ( !Clipboard::GetInstance()->HasPositionsSelection() ) return;
    vector < InitialPosition > pastedPositions = Clipboard::GetInstance()->GetPositionsSelection();

    AdvancedPasteDlg dialog(this);
    dialog.SetStartX(editionData.oldMouseX);
    dialog.SetStartY(editionData.oldMouseY);

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
    if ( highestLayer-1 < 0 || static_cast<unsigned>(highestLayer-1) >= previewData.scene.GetLayersCount() )
        return;

    string layerName = previewData.scene.GetLayer(highestLayer-1).GetName();

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
        editionData.mouseStartPosition = sf::Mouse::getPosition(*previewData.scene.renderWindow);
        editionData.viewStartPosition = getView().getCenter();
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

    float rotation = event.GetWheelRotation()*3;
    float newheight = editionData.view.getSize().y + ( rotation / 25 );
    float newZoomFactor = static_cast<float>(getSize().y)/newheight;
    if ( newZoomFactor > 0 ) settings.zoomFactor = newZoomFactor;
    UpdateAccordingToZoomFactor();
}

int SceneCanvas::GetObjectsSelectedHighestLayer()
{
    int highestLayer = 0;
    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        gd::InitialInstance & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);

        int layerObjId = 0;
        //On cherche le numéro du calque de l'objet
        for (unsigned int layerId = 0;layerId<previewData.scene.GetLayersCount();++layerId)
        {
            if ( previewData.scene.GetLayer(layerId).GetName() == initialInstance.GetLayer() )
               layerObjId = layerId;
        }

        if ( layerObjId > highestLayer )
            highestLayer = layerObjId;
    }

    return highestLayer;
}

int SceneCanvas::GetObjectsSelectedLowestLayer()
{
    int lowestLayer = previewData.scene.GetLayersCount()-1;
    for (unsigned int i =0;i<editionData.objectsSelected.size();++i)
    {
        gd::InitialInstance & initialInstance = GetInitialPositionFromObject(editionData.objectsSelected[i]);

        int layerObjId = 0;
        //On cherche le numéro du calque de l'objet
        for (unsigned int layerId = 0;layerId<previewData.scene.GetLayersCount();++layerId)
        {
            if ( previewData.scene.GetLayer(layerId).GetName() == initialInstance.GetLayer() )
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
    float x = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).x;
    float y = convertCoords(sf::Mouse::getPosition(*previewData.scene.renderWindow)).y;

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

