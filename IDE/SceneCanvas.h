#ifndef SceneCanvas_H
#define SceneCanvas_H

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include "wxSFMLCanvas.hpp"
#include <wx/dnd.h>
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <iostream>
#include <sstream>
#include <wx/scrolbar.h>

#include "GDL/Object.h"
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Game.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ImageManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/MainEditorCommand.h"
#include "MemTrace.h"
#include "EdittimeScene.h"

extern MemTrace MemTracer;

////////////////////////////////////////////////////////////
/// Partie graphique de l'éditeur de scène
/// Utilise la SFML
////////////////////////////////////////////////////////////
class SceneCanvas : public wxSFMLCanvas
{
public :

    SceneCanvas( wxWindow* Parent, Game & game_, Scene * scene_, RuntimeGame & runtimeGame_, MainEditorCommand & nr_, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style );

    ~SceneCanvas() { MemTracer.DelObj((long)this); }

    //Le jeu
    Game & gameEdited;
    RuntimeGame & game;

    Scene * sceneEdited;
    EdittimeScene scene;

    MainEditorCommand & mainEditorCommand;


    void Reload();
    void UpdateScrollbars();
    void ChangeScenePtr(Scene * newScenePtr, bool refresh);

    void SetScrollbars(wxScrollBar * scrollbar1_, wxScrollBar * scrollbar2_);

    void OnAddObjetSelected(wxCommandEvent & event);

private :

    //Mise à jour
    virtual void OnUpdate();
    void UpdateContextMenu();

    //Interaction
    virtual void OnLeftDown( wxMouseEvent &event );
    virtual void OnLeftUp( wxMouseEvent &event );
    virtual void OnLeftDClick( wxMouseEvent &event );
    virtual void OnRightUp( wxMouseEvent &event );
    virtual void OnRightDClick( wxMouseEvent &event );
    virtual void OnMiddleDown( wxMouseEvent &event );
    virtual void OnMiddleUp( wxMouseEvent &event );
    virtual void OnKey( wxKeyEvent& evt );
    virtual void OnMotion( wxMouseEvent &event );
    virtual void OnMouseWheel( wxMouseEvent &event );
    void OnPropObjSelected(wxCommandEvent & event);
    void OnDelObjetSelected(wxCommandEvent & event);
    void OnLayerUpSelected(wxCommandEvent & event);
    void OnLayerDownSelected(wxCommandEvent & event);

    //Fonctions outils
    int GetPositionInitialeIdFromObjectId(int objectId);
    int GetObjectsSelectedHighestLayer();
    int GetObjectsSelectedLowestLayer();

    static const long ID_ADDOBJMENU;
    static const long ID_DELOBJMENU;
    static const long ID_PROPMENU;
    static const long ID_LAYERUPMENU;
    static const long ID_LAYERDOWNMENU;

    bool hasJustRightClicked;

    wxMenu contextMenu;

    //Pointeurs vers les barres de défilements
    wxScrollBar * scrollBar1;
    wxScrollBar * scrollBar2;
};


#endif // SceneCanvas_H
