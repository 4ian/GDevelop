/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SceneCanvas_H
#define SceneCanvas_H

#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include "wxSFMLCanvas.hpp"
#include <wx/dnd.h>
#include <wx/aui/aui.h>
#include <vector>
#include <string>
#include <wx/scrolbar.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>

#include "GDL/Object.h"
#include "GDCore/Events/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/SceneCanvasSettings.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeGame.h"
#include "GDL/IDE/MainEditorCommand.h"
#include "GDL/InitialInstancesContainer.h"
#include "SceneEdittimeRenderer.h"
class RenderDialog;
class EditorObjets;
class EditorLayers;
class DebuggerGUI;
class ProfileDlg;
class InitialPositionBrowserDlg;

/**
 * Canvas for display, edit and preview a scene.
 * Several editors can be plugged in ( and then owned ) by the scene canvas.
 */
class SceneCanvas : public wxSFMLCanvas
{
public :

    /**
     * \brief Default constructor
     * \param Parent Parent window.
     * \param game The game owning the instances.
     * \param scene Scene associated with the instances.
     * \param instances Instances to be edited. Note that the instances do not necessarily belong to the scene.
     * \param settings A reference to the class where settings must be stored.
     * \param mainEditorCommand A MainEditorCommand object to be used to communicate with the IDE.
     */
    SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, InitialInstancesContainer & instances, SceneCanvasSettings & settings, MainEditorCommand & mainEditorCommand_);
    ~SceneCanvas();

    /**
     * Set the scene canvas to own the object editor passed in parameter
     */
    void SetOwnedObjectsEditor(boost::shared_ptr<EditorObjets> objectsEditor_);

    /**
     * Set the scene canvas to own the layer editor passed in parameter
     */
    void SetOwnedLayersEditor(boost::shared_ptr<EditorLayers> layersEditor_);

    /**
     * Set the scene canvas to own the debugger passed in parameter
     */
    void SetOwnedDebugger(boost::shared_ptr<DebuggerGUI> debugger_);

    /**
     * Set the scene canvas to own the preview window passed in parameter
     */
    void SetOwnedExternalWindow(boost::shared_ptr<RenderDialog> externalWindow_);

    /**
     * Set the scene canvas to own the initial position browser passed in parameter
     */
    void SetOwnedInitialPositionBrowser(boost::shared_ptr<InitialPositionBrowserDlg> initialPositionsBrowser_);

    /**
     * Set the scene canvas to own the profile dialog passed in parameter
     */
    void SetOwnedProfileDialog(boost::shared_ptr<ProfileDlg> profileDialog_);

    boost::shared_ptr<EditorObjets> GetOwnedObjectsEditor() const { return objectsEditor; };
    boost::shared_ptr<EditorLayers> GetOwnedLayersEditor() const { return layersEditor; };
    boost::shared_ptr<DebuggerGUI> GetOwnedDebugger() const { return debugger; };
    boost::shared_ptr<RenderDialog> GetOwnedExternalWindow() const { return externalWindow; };
    boost::shared_ptr<InitialPositionBrowserDlg> GetOwnedInitialPositionBrowser() const { return initialPositionsBrowser; };
    boost::shared_ptr<ProfileDlg> GetOwnedProfileDialog() const { return profileDialog; };

    /**
     * Set the parent panel in which the sceneCanvas is placed and the wxAuiManager managing editors panes.
     */
    void SetParentPanelAndDockManager(wxPanel * parentPanel_, wxAuiManager * m_mgr_) {parentPanel = parentPanel_; m_mgr = m_mgr_; };

    /**
     * Set scrollbars to be used with the sceneCanvas
     */
    void SetScrollbars(wxScrollBar * scrollbar1_, wxScrollBar * scrollbar2_) { scrollBar1 = scrollbar1_; scrollBar2 = scrollbar2_;};

    RuntimeGame & gameEdited; ///< Game to edit
    Scene & sceneEdited; ///< Scene to edit

    RuntimeGame game; ///< Runtime game used during preview
    SceneEdittimeRenderer edittimeRenderer; ///< Used to render the scene

    /**
     * Call this method when any changes are made so as to manage undo/redo.
     */
    void ChangesMade();

    /**
     * Reload the scene edited
     */
    void Reload();

    /**
     * Refresh the scene canvas immediatly
     */
    inline void ManualRefresh() { Refresh(); };

    void UpdateScrollbars();

    void OnAddObjetSelected(wxCommandEvent & event);
    void AddObjetSelected(float x, float y);

    int GetInitialPositionFromObject(ObjSPtr object);
    ObjSPtr GetObjectFromInitialPosition(const InitialPosition & initialPosition);

    static wxRibbonButtonBar * CreateRibbonPage(wxRibbonPage * page);

    /**
     * Tool function so as to easily create toolbars for edition or preview
     */
    static void CreateToolsBar(wxRibbonButtonBar * bar, bool editing);

    void ConnectEvents();
    void UpdateSize();

private :

    virtual void OnUpdate();
    void Refresh();
    void UpdateContextMenu();
    void CreateMenus();
    void Undo();

    //Interaction
    virtual void OnLeftDown( wxMouseEvent &event );
    virtual void OnLeftUp( wxMouseEvent &event );
    virtual void OnLeftDClick( wxMouseEvent &event );
    virtual void OnRightUp( wxMouseEvent &event );
    virtual void OnMiddleDown( wxMouseEvent &event );
    virtual void OnKey( wxKeyEvent& evt );
    virtual void OnKeyUp( wxKeyEvent& evt );
    virtual void OnMotion( wxMouseEvent &event );
    virtual void OnAnyMouseEvent( wxMouseEvent &event );
    virtual void OnMouseWheel( wxMouseEvent &event );
    void OnPropObjSelected(wxCommandEvent & event);
    void OnDelObjetSelected(wxCommandEvent & event);
    void OnLayerUpSelected(wxCommandEvent & event);
    void OnLayerDownSelected(wxCommandEvent & event);
    void OnCopySelected(wxCommandEvent & event);
    void OnCutSelected(wxCommandEvent & event);
    void OnPasteSelected(wxCommandEvent & event);
    void OnPasteSpecialSelected(wxCommandEvent & event);
    void OnRefreshBtClick( wxCommandEvent & event );
    void OnPreviewBtClick( wxCommandEvent & event );
    void OnEditionBtClick( wxCommandEvent & event );
    void OnOrigineBtClick( wxCommandEvent & event );
    void OnChoisirObjetBtClick( wxCommandEvent & event );
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
    void OnUndoMoreBtClick( wxRibbonButtonBarEvent & event );
    void OnRedoBtClick( wxCommandEvent & event );
    void OnWindowMaskBtClick( wxCommandEvent & event );
    void OnHelpBtClick( wxCommandEvent & event );
    void OnObjectsPositionList( wxCommandEvent & event );
    void OnProfilerBtClick( wxCommandEvent & event );
    void Onzoom5Selected(wxCommandEvent& event);
    void Onzoom10Selected(wxCommandEvent& event);
    void Onzoom25Selected(wxCommandEvent& event);
    void Onzoom50Selected(wxCommandEvent& event);
    void Onzoom100Selected(wxCommandEvent& event);
    void Onzoom150Selected(wxCommandEvent& event);
    void Onzoom200Selected(wxCommandEvent& event);
    void Onzoom500Selected(wxCommandEvent& event);
    void OnUndo10Selected(wxCommandEvent& event);
    void OnUndo20Selected(wxCommandEvent& event);
    void OnClearHistorySelected(wxCommandEvent& event);
    void OnFullScreenBtClick(wxCommandEvent& event);

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
    static const long ID_PASTESPECIALMENU;
    //Identifiers for changing mode
    static const long idRibbonEditMode;
    static const long idRibbonPreviewMode;
    //Edition mode identifiers
    static const long idRibbonObjectsEditor;
    static const long idRibbonLayersEditor;
    static const long idRibbonChooseObject;
    static const long idRibbonOrigine;
    static const long idRibbonOriginalZoom;
    static const long idRibbonGrid;
    static const long idRibbonWindowMask;
    static const long idRibbonGridSetup;
    static const long idRibbonUndo;
    static const long idUndo10;
    static const long idUndo20;
    static const long idClearHistory;
    static const long idRibbonRedo;
    static const long idRibbonObjectsPositionList;
    //Preview mode identifiers
    static const long idRibbonRefresh;
    static const long idRibbonPlay;
    static const long idRibbonPlayWin;
    static const long idRibbonPause;
    static const long idRibbonResetGlobalVars;
    static const long idRibbonDebugger;
    static const long idRibbonProfiler;
    static const long idRibbonFullScreen;
    static const long idRibbonHelp;
    static const long ID_MENUITEM8; ///< Zoom menu item
    static const long ID_MENUITEM1; ///< Zoom menu item
    static const long ID_MENUITEM2; ///< Zoom menu item
    static const long ID_MENUITEM3; ///< Zoom menu item
    static const long ID_MENUITEM4; ///< Zoom menu item
    static const long ID_MENUITEM5; ///< Zoom menu item
    static const long ID_MENUITEM6; ///< Zoom menu item
    static const long ID_MENUITEM7; ///< Zoom menu item

    bool hasJustRightClicked;
    bool ctrlPressed;

    wxMenu contextMenu;
    wxMenu noObjectContextMenu;
    wxMenu zoomMenu;
    wxMenu undoMenu;

    void ReloadFirstPart();
    void ReloadSecondPart();

    bool isReloading; ///< True when the scene is being reloaded ( and dynamic extensions compiled ) and cannot be previewed yet.


    InitialInstancesContainer & instances; ///< Instances to be edited
    SceneCanvasSettings & settings; ///< Settings to be used
    MainEditorCommand & mainEditorCommand; ///< Provide a link to the main editor
    wxScrollBar * scrollBar1; ///< Link to the scrollbar used by the sceneCanvas.
    wxScrollBar * scrollBar2; ///< Link to the scrollbar used by the sceneCanvas.
    boost::shared_ptr<EditorObjets> objectsEditor; ///< Object editor owned by the sceneCanvas
    boost::shared_ptr<EditorLayers> layersEditor; ///< Layer editor owned by the sceneCanvas
    boost::shared_ptr<DebuggerGUI> debugger; ///< Debugger owned by the sceneCanvas
    boost::shared_ptr<RenderDialog> externalWindow; ///< External preview window owned by the sceneCanvas
    boost::shared_ptr<InitialPositionBrowserDlg> initialPositionsBrowser;  ///< Initial position browser owned by the sceneCanvas
    boost::shared_ptr<ProfileDlg> profileDialog;  ///< Profile dialog window owned by the sceneCanvas
    wxAuiManager * m_mgr; ///< Link to the wxAuiManager managing editors windows.
    wxPanel * parentPanel;  ///< Link to the panel in which the sceneCanvas is inserted

    vector < InitialInstancesContainer > history; ///< History of changes
    vector < InitialInstancesContainer > redoHistory; ///< Histoy of changes so as to "redo"
    InitialInstancesContainer latestState; ///< Necessary to keep track of what changed

    static sf::Texture reloadingIconImage;
    static sf::Sprite reloadingIconSprite;
    static sf::Text reloadingText;
};


#endif // SceneCanvas_H
