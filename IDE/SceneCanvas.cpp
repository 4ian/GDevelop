#include "SceneCanvas.h"
#include <string>
#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/CommonTools.h"
#include "EditOptionsPosition.h"
#include <wx/log.h>
#include <wx/scrolbar.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDL/RuntimeScene.h"
#include "GDL/Chercher.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ImageManager.h"
#include "GDL/RuntimeGame.h"
#include "DndTextSceneEditor.h"
#include <wx/cursor.h>

const long SceneCanvas::ID_ADDOBJMENU = wxNewId();
const long SceneCanvas::ID_DELOBJMENU = wxNewId();
const long SceneCanvas::ID_PROPMENU = wxNewId();
const long SceneCanvas::ID_LAYERUPMENU = wxNewId();
const long SceneCanvas::ID_LAYERDOWNMENU = wxNewId();

SceneCanvas::SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style ) :
        wxSFMLCanvas( Parent, Id, Position, Size, Style ),
        gameEdited(game_),
        sceneEdited(scene_),
        game(gameEdited),
        scene(this, &game),
        mainEditorCommand( mainEditorCommand_ ),
        hasJustRightClicked(false),
        scrollBar1(NULL),
        scrollBar2(NULL)
{
    MemTracer.AddObj( "Editeur de scène", ( long )this );

    //SetDropTarget(new wxTextDropTarget);
    SetView( scene.view );
    SetFramerateLimit( gameEdited.maxFPS );
    UseVerticalSync( gameEdited.verticalSync );
    Clear( sf::Color( 125, 125, 125, 255 ) );

    Connect(ID_ADDOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnAddObjetSelected);
    Connect(ID_DELOBJMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnDelObjetSelected);
    Connect(ID_PROPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnPropObjSelected);
    Connect(ID_LAYERUPMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerUpSelected);
    Connect(ID_LAYERDOWNMENU,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&SceneCanvas::OnLayerDownSelected);

    contextMenu.Append(ID_PROPMENU, _("Propriétés"));
    contextMenu.AppendSeparator();
    contextMenu.Append(ID_ADDOBJMENU, _("Ajouter un objet\tINSER"));
    contextMenu.Append(ID_DELOBJMENU, _("Supprimer la sélection\tDEL"));
    contextMenu.AppendSeparator();
    contextMenu.Append(ID_LAYERUPMENU, _("Passer le(s) objet(s) sur le calque supérieur"));
    contextMenu.Append(ID_LAYERDOWNMENU, _("Passer le(s) objet(s) sur le calque inférieur"));

    contextMenu.FindItem(ID_ADDOBJMENU)->SetBitmap(wxImage( "res/addobjet.png" ) );
    contextMenu.FindItem(ID_DELOBJMENU)->SetBitmap(wxImage( "res/deleteicon.png" ) );
    contextMenu.FindItem(ID_LAYERUPMENU)->SetBitmap(wxImage( "res/up.png" ) );
    contextMenu.FindItem(ID_LAYERDOWNMENU)->SetBitmap(wxImage( "res/down.png" ) );

    SetDropTarget(new DndTextSceneEditor(*this));
}

void SceneCanvas::SetScrollbars(wxScrollBar * scrollbar1_, wxScrollBar * scrollbar2_)
{
    scrollBar1 = scrollbar1_;
    scrollBar2 = scrollbar2_;
}

void SceneCanvas::OnKey( wxKeyEvent& evt )
{
    //Si on est en mode éditeur
    if ( scene.editing )
    {
        //ajout
        if ( evt.GetKeyCode() == WXK_INSERT )
        {
            wxCommandEvent unused;
            OnAddObjetSelected(unused);
        }
        //Suppression
        else if ( evt.GetKeyCode() == WXK_DELETE )
        {
            wxCommandEvent unused;
            OnDelObjetSelected(unused);
        }
        else if ( evt.GetKeyCode() == WXK_DOWN )
        {
            for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
            {
                ObjSPtr object = scene.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].y += 1;
                    object->SetY(object->GetY()+1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_UP )
        {
            for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
            {
                ObjSPtr object = scene.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].y -= 1;
                    object->SetY(object->GetY()-1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_RIGHT )
        {
            for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
            {
                ObjSPtr object = scene.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].x += 1;
                    object->SetX(object->GetX()+1);
                }
            }
        }
        else if ( evt.GetKeyCode() == WXK_LEFT )
        {
            for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
            {
                ObjSPtr object = scene.objectsSelected.at(i);

                int idPos = GetInitialPositionFromObject(object);
                if ( idPos != -1 )
                {
                    sceneEdited.initialObjectsPositions[idPos].x -= 1;
                    object->SetX(object->GetX()-1);
                }
            }
        }
    }
    evt.StopPropagation();
}


void SceneCanvas::Refresh()
{
    //On vérifie qu'on ne doit pas mettre à jour la scène
    if ( !scene.running || scene.editing )
    {
        if ( gameEdited.imagesWereModified )
        {
            gameEdited.imageManager->LoadPermanentImages();
            gameEdited.imagesWereModified = false;
        }
        else if ( sceneEdited.wasModified )
            Reload();
    }

    if ( scene.running )
    {
        int retourEvent = scene.RenderAndStep(1);

        if ( retourEvent == -2 )
        {
            wxLogStatus( _( "Dans le jeu final, le jeu se terminera." ) );
        }
        else if ( retourEvent != -1 )
        {
            wxLogStatus( _( "Dans le jeu final, un changement de scène s'effectuera." ) );
        }

    }
    else if ( !scene.running && !scene.editing )
        scene.RenderWithoutStep();
    else
        scene.RenderEdittimeScene();
}

void SceneCanvas::OnUpdate()
{
    Refresh();
    UpdateScrollbars();
}

void SceneCanvas::ChangesMade()
{
    //Mise à jour de l'historique d'annulation
    history.push_back(sceneEdited.initialObjectsPositions);
    redoHistory.clear();
}

////////////////////////////////////////////////////////////
/// Met à jour les barres de défilements
////////////////////////////////////////////////////////////
void SceneCanvas::UpdateScrollbars()
{
    if ( scrollBar1 == NULL )
        return;
    if ( scrollBar2 == NULL )
        return;

    //On calcule la position du thumb
    int thumbY = scene.view.GetCenter().y+scrollBar2->GetRange()/2-GetHeight()/2;
    scrollBar2->SetScrollbar(thumbY, GetHeight(), scrollBar2->GetRange(), GetHeight());

    int thumbX = scene.view.GetCenter().x+scrollBar1->GetRange()/2-GetWidth()/2;
    scrollBar1->SetScrollbar(thumbX, GetWidth(), scrollBar1->GetRange(), GetWidth());

    //On agrandit les scrollbars si besoin est
    if ( (thumbY+0) <= 0 || (thumbY+GetHeight()) >= scrollBar2->GetRange())
    {
        int ajout = GetHeight();
        scrollBar2->SetScrollbar(thumbY+ajout/2, GetHeight(), scrollBar2->GetRange()+ajout, GetHeight());
    }

    if ( (thumbX+0) <= 0 || (thumbX+GetWidth()) >= scrollBar1->GetRange())
    {
        int ajout = GetWidth();
        scrollBar1->SetScrollbar(thumbX+ajout/2, GetWidth(), scrollBar1->GetRange()+ajout, GetWidth());
    }
}

void SceneCanvas::UpdateContextMenu()
{
    //Peut on remonter les objets sur un calque plus haut ?
    int lowestLayer = GetObjectsSelectedLowestLayer();

    contextMenu.FindItem(ID_LAYERUPMENU)->Enable(false);
    if ( lowestLayer+1 < scene.initialLayers.size() )
    {
        string name = scene.initialLayers[lowestLayer+1].GetName();
        if ( name == "" ) name = _("Calque de base");
        contextMenu.FindItem(ID_LAYERUPMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERUPMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
    }

    //Peut on descendre les objets sur un calque plus bas ? ( pléonasme )
    int highestLayer = GetObjectsSelectedHighestLayer();

    contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(false);
    if ( highestLayer-1 >= 0 )
    {
        string name = scene.initialLayers[highestLayer-1].GetName();
        if ( name == "" ) name = _("Calque de base");

        contextMenu.FindItem(ID_LAYERDOWNMENU)->Enable(true);
        contextMenu.FindItem(ID_LAYERDOWNMENU)->SetItemLabel(string(_("Passer le(s) objet(s) sur le calque \"")) + name +"\"");
    }
}

////////////////////////////////////////////////////////////
/// Bouton gauche : Déplacement objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDown( wxMouseEvent &event )
{
    SetFocus();

    if ( !scene.editing )
        return;

    if ( hasJustRightClicked )
    {
        hasJustRightClicked = false;
        return;
    }

    ObjSPtr object = scene.FindSmallestObject();

    int mouseX = ConvertCoords(scene.input->GetMouseX(), 0).x;
    int mouseY = ConvertCoords(0, scene.input->GetMouseY()).y;

    //Suppress selection
    if ( (!scene.input->IsKeyDown(sf::Key::LShift) && !scene.input->IsKeyDown(sf::Key::RShift)) && //Check that shift is not pressed
        ( object == boost::shared_ptr<Object> () || //If no object is clicked
         find(scene.objectsSelected.begin(), scene.objectsSelected.end(), object) == scene.objectsSelected.end()) ) //Or an object which is not currently selected.
    {
        scene.objectsSelected.clear();
        scene.xObjectsSelected.clear();
        scene.yObjectsSelected.clear();

    }

    //Manage selection area
    if ( object == boost::shared_ptr<Object> () ) //If no object is clicked
    {
        //Creation
        scene.isSelecting = true;
        scene.xRectangleSelection = mouseX;
        scene.yRectangleSelection = mouseY;
        scene.xEndRectangleSelection = mouseX;
        scene.yEndRectangleSelection = mouseY;
    }

    //On ajoute l'objet surligné dans les objets à bouger
    if ( object == boost::shared_ptr<Object> () ) return;

    //Verify if user want to resize the object
    if (    scene.objectsSelected.size() == 1 &&
            mouseX > object->GetDrawableX()+object->GetWidth()-6 &&
            mouseX < object->GetDrawableX()+object->GetWidth() &&
            mouseY > object->GetDrawableY()+object->GetHeight()/2-3 &&
            mouseY < object->GetDrawableY()+object->GetHeight()/2+3)
    {
        scene.isMovingObject = false;
        scene.isRotatingObject = false;
        scene.isResizingX = true;
    }
    else if (   scene.objectsSelected.size() == 1 &&
                mouseY > object->GetDrawableY()+object->GetHeight()-6 &&
                mouseY < object->GetDrawableY()+object->GetHeight() &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+3 )
    {
        scene.isMovingObject = false;
        scene.isRotatingObject = false;
        scene.isResizingY = true;
    }
    else if ( scene.objectsSelected.size() == 1 &&
                mouseX > object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14)-3 &&
                mouseX < object->GetDrawableX()+object->GetWidth()/2+20*cos(object->GetAngle()/180.f*3.14)+3 &&
                mouseY > object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14)-3 &&
                mouseY < object->GetDrawableY()+object->GetHeight()/2+20*sin(object->GetAngle()/180.f*3.14)+3 )
    {
        scene.isRotatingObject = true;
        scene.isMovingObject = false;
        scene.isResizingX = false;
        scene.isResizingY = false;
    }
    else //Add object to selection
    {
        if ( find(scene.objectsSelected.begin(), scene.objectsSelected.end(), object) == scene.objectsSelected.end() )
        {
            scene.objectsSelected.push_back(object);

            //Et on renseigne sa position de départ :
            scene.xObjectsSelected.push_back(object->GetX());
            scene.yObjectsSelected.push_back(object->GetY());
        }

        scene.isMovingObject = true;
        scene.isRotatingObject = false;
        scene.isResizingX = false;
        scene.isResizingY = false;
    }

    scene.oldMouseX = mouseX; //Position de départ de la souris
    scene.oldMouseY = mouseY;
}

////////////////////////////////////////////////////////////
/// Bouton gauche relaché : Fin du déplacement
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftUp( wxMouseEvent &event )
{
    if ( !scene.editing ) return;

    //Relachement de la souris :
    //Pour les objets selectionnés, leurs nouvelle
    //position de départ est celle où ils sont.
    if ( scene.isMovingObject )
    {
        for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
        {
            ObjSPtr object = scene.objectsSelected.at(i);
            int IDInitialPosition = GetInitialPositionFromObject(object);
            if ( IDInitialPosition != -1)
            {
                scene.xObjectsSelected[i] = sceneEdited.initialObjectsPositions.at( IDInitialPosition ).x;
                scene.yObjectsSelected[i] = sceneEdited.initialObjectsPositions.at( IDInitialPosition ).y;
            }
        }
    }

    //Select object thanks to the selection area
    if ( scene.isSelecting )
    {
        //Origin must be at the top left of the area
        if ( scene.xEndRectangleSelection < scene.xRectangleSelection) std::swap(scene.xEndRectangleSelection, scene.xRectangleSelection);
        if ( scene.yEndRectangleSelection < scene.yRectangleSelection) std::swap(scene.yEndRectangleSelection, scene.yRectangleSelection);

        ObjList allObjects = scene.objectsInstances.GetAllObjects();

        for (unsigned int id = 0;id < allObjects.size();++id)
        {
            //Find and add to selection all objects of the selection area
            ObjSPtr object = allObjects[id];
            if ( object->GetX() >= scene.xRectangleSelection &&
                 object->GetX()+object->GetWidth() <= scene.xEndRectangleSelection &&
                 object->GetY() >= scene.yRectangleSelection &&
                 object->GetY()+object->GetHeight() <= scene.yEndRectangleSelection )
             {
                int IDInitialPosition = GetInitialPositionFromObject(object);
                if ( IDInitialPosition != -1)
                {
                    if ( find(scene.objectsSelected.begin(), scene.objectsSelected.end(), object) == scene.objectsSelected.end() )
                    {
                        scene.objectsSelected.push_back(object);

                        //Et on renseigne sa position de départ :
                        scene.xObjectsSelected.push_back(object->GetX());
                        scene.yObjectsSelected.push_back(object->GetY());
                    }
                }
             }
        }
    }

    scene.isResizingX = false;
    scene.isResizingY = false;
    scene.isMovingObject = false;
    scene.isRotatingObject = false;
    scene.isSelecting = false;

    ChangesMade();
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
    int mouseXInScene = 0;
    int mouseYInScene = 0;

    wxString Xstr;
    wxString Ystr;

    if ( !scene.editing )
    {
        mouseXInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(scene.input->GetMouseX(), 0, scene.GetLayer("").GetCamera(0).GetSFMLView()).x);
        mouseYInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(0, scene.input->GetMouseY(), scene.GetLayer("").GetCamera(0).GetSFMLView()).y);
        Xstr =ToString( mouseXInScene );
        Ystr =ToString( mouseYInScene );

        wxLogStatus( wxString( _( "Position " ) ) + Xstr + wxString( _( ";" ) ) + Ystr + wxString( _( ". ( Calque de base, Caméra 0 )" ) ) );
    }
    else
    {
        mouseXInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(scene.input->GetMouseX(), 0).x);
        mouseYInScene = static_cast<int>(sf::RenderWindow::ConvertCoords(0, scene.input->GetMouseY()).y);

        Xstr =ToString( mouseXInScene );
        Ystr =ToString( mouseYInScene );

        wxLogStatus( wxString( _( "Position " ) ) + Xstr + wxString( _( ";" ) ) + Ystr + wxString( _( ". SHIFT pour sélection multiple, clic droit pour plus d'options." ) ) );
    }

    //Le reste concerne juste le mode édition
    if ( scene.running )
        return;

    //Déplacement avec la souris
    if ( scene.isMoving )
        scene.view.Move( scene.deplacementOX - mouseXInScene, scene.deplacementOY - mouseYInScene );

    if ( scene.isResizingX )
    {
        for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
        {
            ObjSPtr object = scene.objectsSelected.at(i);
            object->SetWidth(mouseXInScene-scene.xObjectsSelected.at(i));

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize = true;
                sceneEdited.initialObjectsPositions.at( idPos ).width = object->GetWidth();
                sceneEdited.initialObjectsPositions.at( idPos ).height = object->GetHeight();
            }
        }
    }
    if ( scene.isResizingY )
    {
        for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
        {
            ObjSPtr object = scene.objectsSelected.at(i);
            object->SetHeight(mouseYInScene-scene.yObjectsSelected.at(i));

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize = true;
                sceneEdited.initialObjectsPositions.at( idPos ).height = object->GetHeight();
                sceneEdited.initialObjectsPositions.at( idPos ).width = object->GetWidth();
            }
        }
    }
    if ( scene.isRotatingObject )
    {
        for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
        {
            ObjSPtr object = scene.objectsSelected.at(i);
            float x = mouseXInScene-(object->GetDrawableX()+object->GetWidth()/2);
            float y = mouseYInScene-(object->GetDrawableY()+object->GetHeight()/2);
            float newAngle = atan2(y,x)*180/3.14;

            object->SetAngle(newAngle);

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                sceneEdited.initialObjectsPositions.at( idPos ).angle = newAngle;
            }
        }
    }
    //Déplacement de la position initiale d'un objet
    if ( scene.isMovingObject )
    {
        for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
        {
            ObjSPtr object = scene.objectsSelected.at(i);

            int idPos = GetInitialPositionFromObject(object);
            if ( idPos != -1 )
            {
                //Déplacement effectué par la souris
                int deltaX = mouseXInScene - scene.oldMouseX;
                int deltaY = mouseYInScene - scene.oldMouseY;

                //Anciennes et nouvelles coordonnées
                int oldX = scene.xObjectsSelected[i];
                int oldY = scene.yObjectsSelected[i];
                int newX = oldX + deltaX;
                int newY = oldY + deltaY;

                if ( scene.grid && scene.snap )
                {
                    newX = static_cast<int>(newX/scene.gridWidth)*scene.gridWidth;
                    newY = static_cast<int>(newY/scene.gridHeight)*scene.gridHeight;
                }

                //Modification de l'emplacement initial
                sceneEdited.initialObjectsPositions.at( idPos ).x = newX;
                sceneEdited.initialObjectsPositions.at( idPos ).y = newY;

                //On bouge aussi l'objet actuellement affiché
                object->SetX( newX );
                object->SetY( newY );
            }
        }
    }
    if ( scene.isSelecting )
    {
        scene.xEndRectangleSelection = mouseXInScene;
        scene.yEndRectangleSelection = mouseYInScene;
    }

}

////////////////////////////////////////////////////////////
/// Double clic : insertion objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnLeftDClick( wxMouseEvent &event )
{
    AddObjetSelected(ConvertCoords(scene.input->GetMouseX(), 0).x, ConvertCoords(0, scene.input->GetMouseY()).y);
}

////////////////////////////////////////////////////////////
/// Insertion d'un objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnAddObjetSelected( wxCommandEvent & event )
{
    AddObjetSelected(ConvertCoords(scene.input->GetMouseX(), 0).x, ConvertCoords(0, scene.input->GetMouseY()).y);
}

void SceneCanvas::AddObjetSelected(float x, float y)
{
    //Seulement en mode éditeur
    if ( !scene.editing )
        return;

    scene.isMovingObject = false;

    if ( scene.objectToAdd == "" ) { wxLogMessage( _( "Vous n'avez selectionné aucun objet à ajouter.\nSélectionnez en un avec le bouton \"Choisir un objet à ajouter\" dans la barre d'outils." ) ); return;}

    int IDsceneObject = Picker::PickOneObject( &sceneEdited.initialObjects, scene.objectToAdd );
    int IDglobalObject = Picker::PickOneObject( &gameEdited.globalObjects, scene.objectToAdd );

    ObjSPtr newObject = boost::shared_ptr<Object> ();

    if ( IDsceneObject != -1 ) //We check first scene's objects' list.
        newObject = sceneEdited.initialObjects[IDsceneObject]->Clone();
    else if ( IDglobalObject != -1 ) //Then the global object list
        newObject = gameEdited.globalObjects[IDglobalObject]->Clone();

    if ( newObject == boost::shared_ptr<Object> () )
    {
        wxLogMessage(_("L'objet à ajouter n'existe pas ou plus dans la liste des objets."));
        return;
    }

    //Initial position creation
    InitialPosition pos;
    pos.objectName = scene.objectToAdd; //A choisir avec un dialog approprié ou par drag'n'drop
    if ( scene.grid && scene.snap )
    {
        pos.x = static_cast<int>(x/scene.gridWidth)*scene.gridWidth;
        pos.y = static_cast<int>(y/scene.gridHeight)*scene.gridHeight;
    }
    else
    {
        pos.x = x;
        pos.y = y;
    }

    pos.zOrder = 0;
    pos.layer = scene.addOnLayer;
    sceneEdited.initialObjectsPositions.push_back( pos );

    //Edittime scene object creation
    newObject->errors = &scene.errors;
    newObject->SetX( pos.x );
    newObject->SetY( pos.y );
    newObject->SetZOrder( pos.zOrder );
    newObject->SetLayer( pos.layer );

    newObject->InitializeFromInitialPosition(pos);

    scene.objectsInstances.AddObject(newObject);

    newObject->LoadResources(*game.imageManager); //Global objects images are curiously not displayed if we don't reload resources..

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic droit : edition propriétés objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnRightUp( wxMouseEvent &event )
{
    if ( !scene.editing )
        return;

    ObjSPtr object = scene.FindSmallestObject();

    //Suppression de la selection
    if ( object == boost::shared_ptr<Object> () || /*Si clic n'importe où */
        (( !scene.input->IsKeyDown(sf::Key::LShift) && !scene.input->IsKeyDown(sf::Key::RShift) ) && /*Ou si clic sur un objet sans Shift*/
         find(scene.objectsSelected.begin(), scene.objectsSelected.end(), object) == scene.objectsSelected.end() ))
    {
        scene.objectsSelected.clear();
        scene.xObjectsSelected.clear();
        scene.yObjectsSelected.clear();
    }

    //On ajoute l'objet surligné dans les objets à bouger
    if ( object == boost::shared_ptr<Object> () ) return;

    if ( find(scene.objectsSelected.begin(), scene.objectsSelected.end(), object) == scene.objectsSelected.end() )
    {
        scene.objectsSelected.push_back(object);

        //Et on renseigne sa position de départ :
        scene.xObjectsSelected.push_back(object->GetX());
        scene.yObjectsSelected.push_back(object->GetY());
    }

    OnUpdate(); //Pour afficher le rectangle de selection
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
    if ( lowestLayer+1 < 0 || static_cast<unsigned>(lowestLayer+1) >= scene.initialLayers.size() )
        return;

    string layerName = scene.initialLayers.at(lowestLayer+1).GetName();

    for (unsigned int i =0;i<scene.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(scene.objectsSelected[i]);
        if ( posId != -1 )
        {
            sceneEdited.initialObjectsPositions.at(posId).layer = layerName;
            scene.objectsSelected[i]->SetLayer(layerName);
        }
    }

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Déplacement de(s) objet(s) selectionné(s) sur le calque inférieur
////////////////////////////////////////////////////////////
void SceneCanvas::OnLayerDownSelected(wxCommandEvent & event)
{
    int highestLayer = GetObjectsSelectedLowestLayer();
    if ( highestLayer-1 < 0 || static_cast<unsigned>(highestLayer-1) >= scene.initialLayers.size() )
        return;

    string layerName = scene.initialLayers.at(highestLayer-1).GetName();

    for (unsigned int i =0;i<scene.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(scene.objectsSelected[i]);
        if ( posId != -1 )
        {
            sceneEdited.initialObjectsPositions.at(posId).layer = layerName;
            scene.objectsSelected[i]->SetLayer(layerName);
        }
    }

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Editer les valeurs initiales d'un objet sur la scène
////////////////////////////////////////////////////////////
void SceneCanvas::OnPropObjSelected(wxCommandEvent & event)
{
    if ( !scene.editing )
        return;

    //Cherche l'objet sous la souris
    ObjSPtr smallestObject = scene.FindSmallestObject();
    if ( smallestObject == boost::shared_ptr<Object> ()) return;

    int idPos = GetInitialPositionFromObject(smallestObject);
    if ( idPos == -1 ) return;

    bool hadAPersonalizedSize = sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize;

    //Affichage des propriétés de l'objet sous la souris
    EditOptionsPosition DialogPosition( this, gameEdited, scene, sceneEdited.initialObjectsPositions.at( idPos ) );
    if ( DialogPosition.ShowModal() == 1 )
    {
        sceneEdited.initialObjectsPositions.at( idPos ) = DialogPosition.position;

        smallestObject->SetX( sceneEdited.initialObjectsPositions.at( idPos ).x );
        smallestObject->SetY( sceneEdited.initialObjectsPositions.at( idPos ).y );
        smallestObject->SetZOrder( sceneEdited.initialObjectsPositions.at( idPos ).zOrder );
        smallestObject->SetLayer( sceneEdited.initialObjectsPositions.at( idPos ).layer );

        smallestObject->InitializeFromInitialPosition(sceneEdited.initialObjectsPositions.at( idPos ));

        if ( sceneEdited.initialObjectsPositions.at( idPos ).personalizedSize )
        {
            smallestObject->SetWidth( sceneEdited.initialObjectsPositions.at( idPos ).width );
            smallestObject->SetHeight( sceneEdited.initialObjectsPositions.at( idPos ).height );
        }
        else if ( hadAPersonalizedSize ) //For now, we reload the scene so as the object get back its initial size
        {
            Reload();
        }
        ChangesMade();
    }

    return;
}

////////////////////////////////////////////////////////////
/// Double clic droit : propriétés direct de l'objet
////////////////////////////////////////////////////////////
void SceneCanvas::OnRightDClick( wxMouseEvent &event )
{
    wxCommandEvent unusedEvent;
    OnPropObjSelected(unusedEvent);
}

////////////////////////////////////////////////////////////
/// Suppression de(s) objet(s) selectionné(s)
////////////////////////////////////////////////////////////
void SceneCanvas::OnDelObjetSelected(wxCommandEvent & event)
{
    if ( !scene.editing )
        return;

    for (unsigned int i = 0;i<scene.objectsSelected.size();++i)
    {
        ObjSPtr object = scene.objectsSelected.at(i);

        int idPos = GetInitialPositionFromObject(object);
        if ( idPos != -1 )
        {
            sceneEdited.initialObjectsPositions.erase(sceneEdited.initialObjectsPositions.begin() + idPos);
            scene.objectsInstances.RemoveObject(object);
        }
    }

    scene.objectsSelected.clear();
    scene.xObjectsSelected.clear();
    scene.yObjectsSelected.clear();

    ChangesMade();
}

////////////////////////////////////////////////////////////
/// Clic molette : Des/activer déplacement à la souris
////////////////////////////////////////////////////////////
void SceneCanvas::OnMiddleDown( wxMouseEvent &event )
{
    if ( !scene.isMoving )
    {
        scene.isMoving = true;
        scene.deplacementOX = ConvertCoords(scene.input->GetMouseX(), 0).x;
        scene.deplacementOY = ConvertCoords(0, scene.input->GetMouseY()).y;
        SetCursor( wxCursor( wxCURSOR_SIZING ) );
        return;
    }
    else
    {
        scene.isMoving = false;
        SetCursor( wxNullCursor );
    }
}

void SceneCanvas::OnMiddleUp( wxMouseEvent &event )
{
}


void SceneCanvas::Reload()
{
    game = gameEdited;
    game.imageManager = gameEdited.imageManager; //Use same image manager.

    scene.StopMusic();
    scene.LoadFromScene( sceneEdited );

    sceneEdited.wasModified = false;

    UpdateScrollbars();
}

////////////////////////////////////////////////////////////
/// Zoom / dezoom à la molette
/// Il faut prendre garde à garder les proportions de la fenêtre
////////////////////////////////////////////////////////////
void SceneCanvas::OnMouseWheel( wxMouseEvent &event )
{
    if (scene.running)
        return;

    //La rotation de la molette
    float rotation = event.GetWheelRotation();
    scene.zoom += ( rotation / 25 );

    //Le rapport entre la largeur et la hauteur
    float qwoh = scene.view.GetSize().x / scene.view.GetSize().y;

    //La nouvelle hauteur
    float newheight = scene.view.GetSize().y + ( rotation / 25 );

    scene.view.SetSize( newheight*qwoh, newheight );
}

int SceneCanvas::GetObjectsSelectedHighestLayer()
{
    int highestLayer = 0;
    for (unsigned int i =0;i<scene.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(scene.objectsSelected[i]);
        if ( posId != -1 )
        {
            int layerObjId = 0;
            //On cherche le numéro du calque de l'objet
            for (unsigned int layerId = 0;layerId<scene.initialLayers.size();++layerId)
            {
                if ( scene.initialLayers[layerId].GetName() == sceneEdited.initialObjectsPositions.at(posId).layer )
                   layerObjId = layerId;
            }

            if ( layerObjId > highestLayer )
                highestLayer = layerObjId;
        }
    }

    return highestLayer;
}

int SceneCanvas::GetObjectsSelectedLowestLayer()
{
    int lowestLayer = scene.initialLayers.size()-1;
    for (unsigned int i =0;i<scene.objectsSelected.size();++i)
    {
        //Récupérons la position initiale
        int posId = GetInitialPositionFromObject(scene.objectsSelected[i]);
        if ( posId != -1 )
        {
            int layerObjId = 0;
            //On cherche le numéro du calque de l'objet
            for (unsigned int layerId = 0;layerId<scene.initialLayers.size();++layerId)
            {
                if ( scene.initialLayers[layerId].GetName() == sceneEdited.initialObjectsPositions.at(posId).layer )
                   layerObjId = layerId;
            }

            if ( layerObjId < lowestLayer )
                lowestLayer = layerObjId;
        }
    }

    return lowestLayer;
}

////////////////////////////////////////////////////////////
/// Renvoi l'ID d'une position initiale à partir d'un objet sur la scène
////////////////////////////////////////////////////////////
int SceneCanvas::GetInitialPositionFromObject(ObjSPtr object)
{
    if ( object == boost::shared_ptr<Object> ()) return -1;

    for (unsigned int j = 0;j < sceneEdited.initialObjectsPositions.size();++j)
    {
        if ( sceneEdited.initialObjectsPositions.at( j ).objectName == object->GetName() &&
                sceneEdited.initialObjectsPositions.at( j ).x == object->GetX() &&
                sceneEdited.initialObjectsPositions.at( j ).y == object->GetY() )
        {
            return j;
        }
    }

    return -1;
}
