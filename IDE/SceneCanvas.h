#ifndef SceneCanvas_H
#define SceneCanvas_H

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include "wxSFMLCanvas.hpp"
#include <wx/dnd.h>
#include <wx/aui/aui.h>
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
#include "GDL/RuntimeGame.h"
#include "GDL/MainEditorCommand.h"
#include "MemTrace.h"
#include "EdittimeScene.h"
class RenderDialog;
class EditorObjets;
class EditorLayers;
class DebuggerGUI;
class InitialPositionBrowserDlg;

extern MemTrace MemTracer;

////////////////////////////////////////////////////////////
/// Partie graphique de l'éditeur de scène
/// Utilise la SFML
////////////////////////////////////////////////////////////
class SceneCanvas : public wxSFMLCanvas
{
public :

    SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_, wxWindowID Id, const wxPoint& Position, const wxSize& Size, long Style );
    ~SceneCanvas() { MemTracer.DelObj((long)this); }

    //Le jeu
    RuntimeGame & gameEdited;
    Scene & sceneEdited;

    //Used during testing
    RuntimeGame game;
    EdittimeScene scene;

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
    void SetInitialPositionBrowser(InitialPositionBrowserDlg * browser) { initialPositionsBrowser = browser; }

    void OnAddObjetSelected(wxCommandEvent & event);
    void AddObjetSelected(float x, float y);

    int GetInitialPositionFromObject(ObjSPtr object);

    EditorObjets *  objectsEditor;
    EditorLayers *  layersEditor;
    DebuggerGUI *   debugger;
    RenderDialog *   externalWindow;
    InitialPositionBrowserDlg * initialPositionsBrowser;
    wxAuiManager * m_mgr;

    static wxRibbonButtonBar * CreateRibbonPage(wxRibbonPage * page);

    /**
     * Tool function so as to easily create toolbars for edition or preview
     */
    static void CreateToolsBar(wxRibbonButtonBar * bar, bool editing);

    void ConnectEvents();

    void ChangeSize(int parentPanelWidht, int parentPanelHeight);

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
    void OnCopySelected(wxCommandEvent & event);
    void OnCutSelected(wxCommandEvent & event);
    void OnPasteSelected(wxCommandEvent & event);

    //Fonctions outils
    int GetObjectsSelectedHighestLayer();
    int GetObjectsSelectedLowestLayer();

    static const long ID_ADDOBJMENU;
    static const long ID_DELOBJMENU;
    static const long ID_PROPMENU;
    static const long ID_LAYERUPMENU;
    static const long ID_LAYERDOWNMENU;
    static const long ID_COPYMENU;
    static const long ID_CUTMENU;
    static const long ID_PASTEMENU;

    //Identifiers for changing mode
    static const long idRibbonEditMode;
    static const long idRibbonPreviewMode;

    //Edition mode identifiers
    static const long idRibbonObjectsEditor;
    static const long idRibbonLayersEditor;
    static const long idRibbonChooseObject;
    static const long idRibbonChooseLayer;
    static const long idRibbonOrigine;
    static const long idRibbonOriginalZoom;
    static const long idRibbonGrid;
    static const long idRibbonWindowMask;
    static const long idRibbonGridSetup;
    static const long idRibbonUndo;
    static const long idRibbonRedo;

    //Preview mode identifiers
    static const long idRibbonRefresh;
    static const long idRibbonPlay;
    static const long idRibbonPlayWin;
    static const long idRibbonPause;
    static const long idRibbonResetGlobalVars;
    static const long idRibbonDebugger;

    static const long idRibbonHelp;

    bool hasJustRightClicked;

    wxMenu contextMenu;
    wxMenu noObjectContextMenu;

    MainEditorCommand & mainEditorCommand;

    wxScrollBar * scrollBar1; ///< Link to the scrollbar used by the sceneCanvas.
    wxScrollBar * scrollBar2; ///< Link to the scrollbar used by the sceneCanvas.

    void OnRefreshBtClick( wxCommandEvent & event );
    void OnPreviewBtClick( wxCommandEvent & event );
    void OnEditionBtClick( wxCommandEvent & event );

    void OnOrigineBtClick( wxCommandEvent & event );
    void OnChoisirObjetBtClick( wxCommandEvent & event );
    void OnChoisirLayerBtClick( wxCommandEvent & event );
    void OnZoomInitBtClick( wxCommandEvent & event );
    void OnZoomMoreBtClick( wxRibbonButtonBarEvent & event );
    void OnGridBtClick( wxCommandEvent & event );
    void OnGridSetupBtClick( wxCommandEvent & event );

    void OnPlayBtClick( wxCommandEvent & event );
    void OnPlayWindowBtClick( wxCommandEvent & event );
    void OnPauseBtClick( wxCommandEvent & event );

    void OnDebugBtClick( wxCommandEvent & event );

    void OnObjectsEditor( wxCommandEvent & event );
    void OnLayersEditor( wxCommandEvent & event );

    void OnUndoBtClick( wxCommandEvent & event );
    void OnRedoBtClick( wxCommandEvent & event );
    void OnWindowMaskBtClick( wxCommandEvent & event );

    void OnHelpBtClick( wxCommandEvent & event );
};


#endif // SceneCanvas_H
