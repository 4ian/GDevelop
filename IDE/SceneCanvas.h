/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SCENECANVAS_H
#define SCENECANVAS_H

#include <vector>
#include <string>
#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include "wxSFMLCanvas.hpp"
#include <wx/dnd.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/scrolbar.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include "GDCore/Events/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeGame.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDL/InitialInstancesContainer.h"
#include "SceneCanvasEditionData.h"
#include "SceneCanvasPreviewData.h"
class RenderDialog;
class EditorObjets;
class EditorLayers;
class DebuggerGUI;
class ProfileDlg;
class InitialPositionBrowserDlg;
class SceneCanvasSettings;

/**
 * \brief Control to be used to render, edit and preview a layout.
 *
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
     * \param gd::MainFrameWrapper A gd::MainFrameWrapper object to be used to communicate with the IDE.
     * \param allowPreview If set to false, preview mode will be deactivated ( Useful when editing an external layout )
     */
    SceneCanvas( wxWindow* Parent, RuntimeGame & game_, Scene & scene_, InitialInstancesContainer & instances, SceneCanvasSettings & settings, gd::MainFrameWrapper & mainFrameWrapper_, bool allowPreview = true);

    /**
     * \brief Default destructor
     */
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

    /**
     * Return the objects editor owned by the SceneCanvas.
     */
    boost::shared_ptr<EditorObjets> GetOwnedObjectsEditor() const { return objectsEditor; };

    /**
     * Return the layers editor owned by the SceneCanvas.
     */
    boost::shared_ptr<EditorLayers> GetOwnedLayersEditor() const { return layersEditor; };

    /**
     * Return the debugger owned by the SceneCanvas.
     */
    boost::shared_ptr<DebuggerGUI> GetOwnedDebugger() const { return debugger; };

    /**
     * Return the external window owned by the SceneCanvas.
     */
    boost::shared_ptr<RenderDialog> GetOwnedExternalWindow() const { return externalWindow; };

    /**
     * Return the initial instances browser owned by the SceneCanvas.
     */
    boost::shared_ptr<InitialPositionBrowserDlg> GetOwnedInitialPositionBrowser() const { return initialPositionsBrowser; };

    /**
     * Return the profiler dialog owned by the SceneCanvas.
     */
    boost::shared_ptr<ProfileDlg> GetOwnedProfileDialog() const { return profileDialog; };

    /**
     * To be called when the size must be updated ( Parent panel size have changed )
     *
     * \see SceneCanvas::SetParentPanelAndDockManager
     */
    void UpdateSize();

    /**
     * Set the parent panel in which the sceneCanvas is placed and the wxAuiManager managing editors panes.
     * \see SceneCanvas::UpdateSize
     */
    void SetParentPanelAndDockManager(wxPanel * parentPanel_, wxAuiManager * m_mgr_) {parentPanel = parentPanel_; m_mgr = m_mgr_; };

    /**
     * Set scrollbars to be used with the sceneCanvas
     */
    void SetScrollbars(wxScrollBar * scrollbar1_, wxScrollBar * scrollbar2_) { scrollBar1 = scrollbar1_; scrollBar2 = scrollbar2_;};

    /**
     * Call this method when any changes are made so as to manage undo/redo.
     */
    void ChangesMade();

    /**
     * Reload the scene edited
     */
    void Reload();

    /**
     * Refresh the scene canvas immediately
     */
    inline void ManualRefresh() { Refresh(); };

    /**
     * Add the object \a objectName to the specified position on the current layer
     */
    void AddObject(const std::string & objectName, float x, float y);

    /**
     * Get the current layer
     */
    const std::string & GetCurrentLayer() const { return editionData.currentLayer; };

    /**
     * Change the layer where objects are added
     */
    void SetCurrentLayer(const std::string & newLayer) { editionData.currentLayer = newLayer; };

    /**
     * Return the sf::View used for edition
     */
    sf::View & GetEditionView() { return editionData.view; }

    /**
     * Return true if the edition mode is activated
     */
    bool IsEditing() { return editing; }

    /**
     * Return a reference to the scene being edited
     */
    Scene & GetEditedScene() { return sceneEdited; }

    /**
     * Return a reference to the runtime game being edited
     */
    RuntimeGame & GetEditedGame() { return gameEdited; }

    /**
     * Return the runtime scene used for preview/render the scene.
     */
    RuntimeScene & GetRuntimeScene() { return previewData.scene; };

    /**
     * Clear the current selection
     */
    void ClearSelection();

    /**
     * Select an object
     */
    void SelectObject(boost::shared_ptr<Object> object);

    /**
     * Scene canvas manages simultaneously the instances and their equivalent real objects in the associated RuntimeScene used for rendering.
     * This function helps to get an InitialInstance from an object of the RuntimeScene.
     *
     * \see SceneCanvas::GetObjectFromInitialPosition
     */
    InitialPosition & GetInitialPositionFromObject(ObjSPtr object);

    /**
     * Scene canvas manages simultaneously the instances and their equivalent real objects in the associated RuntimeScene used for rendering.
     * This function helps to get a "real" Object from the associated InitialPosition.
     *
     * \see SceneCanvas::GetInitialPositionFromObject
     */
    ObjSPtr GetObjectFromInitialPosition(const InitialPosition & initialPosition);

    /**
     * Called by the external preview window, when it is closed.
     */
    void ExternalWindowClosed();

    static wxRibbonButtonBar * CreateRibbonPage(wxRibbonPage * page);

    /**
     * Tool function so as to easily create toolbars for edition or preview
     */
    static void CreateToolsBar(wxRibbonButtonBar * bar, bool editing);

    void ConnectEvents();

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
    void OnCreateObjectSelected(wxCommandEvent& event);


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
    static const long ID_CREATEOBJECTMENU;
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

    void ReloadSecondPart();
    void UpdateScrollbars();
    boost::shared_ptr<Object> FindSmallestObjectUnderCursor();
    int GetHighestZOrderOnLayer(const std::string & layer);

    /**
     * Update the zoom according to the value stored in settings.zoomFactor
     */
    void UpdateAccordingToZoomFactor();

    /**
     * Used to render a scene when editing it. For previewing a scene, the RuntimeScene takes care of rendering itself.
     */
    void EdittimeRender();

    /**
     * Render a grid in edition mode
     */
    void RenderGrid();

    /**
     * Inverse function of sf::RenderTarget::ConvertCoords. Convert from view coordinates to window coordinates.
     *
     * \param x X coordinate of the point to convert, relative to the view
     * \param x Y coordinate of the point to convert, relative to the view
     * \param view The view to use for converting the point
     *
     * \return The converted point, in "window" units
     */
    sf::Vector2f ConvertToWindowCoordinates(float x, float y, const sf::View & view);

    bool hasJustRightClicked;
    bool ctrlPressed;

    wxMenu contextMenu;
    wxMenu noObjectContextMenu;
    wxMenu zoomMenu;
    wxMenu undoMenu;

    bool isReloading; ///< True when the scene is being reloaded ( and dynamic extensions compiled ) and cannot be previewed yet.
    bool editing; ///< True when the editor is in edition mode
    bool allowPreview; ///< If set to false, no preview can be made. ( Useful when editing external layouts )

    RuntimeGame & gameEdited; ///< Game owning the instances being edited
    Scene & sceneEdited; ///< Scene to be used for edition
    InitialInstancesContainer & instances; ///< Instances to be edited
    SceneCanvasSettings & settings; ///< Settings to be used
    SceneCanvasEditionData editionData; ///< Contains all the data relevant to the edition mode
    SceneCanvasPreviewData previewData; ///< Contains all the data relevant to the preview mode

    gd::MainFrameWrapper & mainFrameWrapper; ///< Provide a link to the main editor

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

    static InitialPosition badInstance;
};


#endif // SCENECANVAS_H

