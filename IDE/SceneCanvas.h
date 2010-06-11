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
#include "GDL/CommonTools.h"
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

    SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, MainEditorCommand & nr_, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style );

    ~SceneCanvas() { MemTracer.DelObj((long)this); }

    //Le jeu
    RuntimeGame & gameEdited;
    Scene & sceneEdited;

    //Used during testing
    RuntimeGame game;
    EdittimeScene scene;

    MainEditorCommand & mainEditorCommand;

    /**
     * Call this method when any changes are made so as to manage undo/redo.
     */
    void ChangesMade();
    vector < vector < InitialPosition > > history; //History of changes
    vector < vector < InitialPosition > > redoHistory; //Histoy of changes so as to "redo"

    void Reload();
    inline void ManualRefresh() { Refresh(); };

    void UpdateScrollbars();
    void SetScrollbars(wxScrollBar * scrollbar1_, wxScrollBar * scrollbar2_);

    void OnAddObjetSelected(wxCommandEvent & event);
    void AddObjetSelected(float x, float y);

private :

    //Mise à jour
    virtual void OnUpdate();
    void Refresh();
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
    int GetInitialPositionFromObject(ObjSPtr object);
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
