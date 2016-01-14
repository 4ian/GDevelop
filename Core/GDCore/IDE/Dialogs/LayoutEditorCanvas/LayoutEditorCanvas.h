/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef LAYOUTEDITORCANVAS_H
#define LAYOUTEDITORCANVAS_H
//(*Headers(LayoutEditorCanvas)
#include <wx/panel.h>
//*)
#include <set>
#include <map>
#include <vector>
#include <functional>
#include <memory>
#include <SFML/Graphics.hpp>
#include <wx/menu.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/gdicmn.h>
#include <wx/panel.h>
#include "GDCore/Project/LayoutEditorPreviewer.h"
#include "GDCore/String.h"
namespace gd { class MainFrameWrapper; }
namespace gd { class InitialInstancesContainer; }
namespace gd { class InitialInstance; }
namespace gd { class ExternalLayout; }
namespace gd { class LayoutEditorCanvasAssociatedEditor; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Object; }
namespace gd { class LayoutEditorCanvasOptions; }
class wxWindow;
class wxRibbonButtonBar;
class wxRibbonPage;
class wxAuiManager;
class wxScrollBar;

namespace gd
{

/**
 * \brief Describe a GUI element drawn on a LayoutEditorCanvas, like a resize button or a context button.
 *
 * These buttons are most of time created by the specialization of the LayoutEditorCanvas, during rendering.
 * When LayoutEditorCanvas detects a click on a button, it calls OnGuiElementHovered/Pressed/Released.
 *
 * \see LayoutEditorCanvas
 *
 * \ingroup IDE
 * \ingroup IDE dialogs
 */
class LayoutEditorCanvasGuiElement
{
public:
    LayoutEditorCanvasGuiElement() : associatedInitialInstance(NULL) {};
    virtual ~LayoutEditorCanvasGuiElement() {};

    gd::String name; ///< The name of the button, chosen by the editor
    wxRect area; ///< The area where the button is displayed, in layout coordinates.
    InitialInstance * associatedInitialInstance; ///< The associated initial instance, if any.
};

/**
 * \brief Base class for implementing the main canvas of layout editors.
 *
 * \ingroup IDE
 * \ingroup IDE dialogs
 */
class GD_CORE_API LayoutEditorCanvas: public wxPanel, public sf::RenderWindow
{
    friend class InstancesRenderer;
public:

    /**
     * \brief Construct a new layout editor.
     *
     * \param parent The wxWidgets parent window
     * \param project The project owning the layout
     * \param layout The layout being edited
     * \param instances The instances to edit: most of the time, they are either the
     * layout instances or the external layout instances.
     * \param options The options of the editor
     * \param mainFrameWrapper Wrapper to let the editor access to the main frame.
     * \param externalLayout The external layout being edited, or NULL.
     */
    LayoutEditorCanvas(wxWindow* parent,
                       gd::Project & project,
                       gd::Layout & layout,
                       gd::InitialInstancesContainer & instances,
                       LayoutEditorCanvasOptions & options,
                       gd::MainFrameWrapper & mainFrameWrapper,
                       gd::ExternalLayout * externalLayout = NULL);
    virtual ~LayoutEditorCanvas();

    /**
     * Get the parent window of the editor.s
     */
    wxWindow * GetParentControl() { return parentControl; }

    /**
     * \brief Return a reference to the game owning the scene being edited inside the editor.
     */
    gd::Project & GetProject() { return project; }

    /**
     * \brief Return a reference to the scene being edited inside the editor.
     */
    gd::Layout & GetLayout() { return layout; }

    /**
     * \brief Return a pointer to the external layout being edited, if any, or
     * NULL otherwise.
     */
    gd::ExternalLayout * GetExternalLayout() { return externalLayout; }

    /**
     * \brief Provide an access to the main frame wrapper that can be needed by some previewers.
     */
    gd::MainFrameWrapper & GetMainFrameWrapper() { return mainFrameWrapper; }

    /**
     * \brief Declares an editor to be associated with the LayoutEditorCanvas.
     *
     * When LayoutEditorCanvas will make changes, it will be notifying the associated editors thanks
     * to the members functions declared in gd::LayoutEditorCanvasAssociatedEditor.
     *
     * The IDE, when creating a LayoutEditorCanvas, is responsible for calling this method, as it is the IDE
     * which is also creating the others editors.
     *
     * \param editor Pointer to the editor to be notified of changes. Must be not NULL.
     */
    void AddAssociatedEditor(gd::LayoutEditorCanvasAssociatedEditor * editor);

    /**
     * Can be called by the IDE to notify the editor that it is displayed thanks to a wxAuiManager
     * and that it can uses it to display it own sub editors.
     */
    void SetParentAuiManager(wxAuiManager * parentAuiManager_);

    /**
     * Get the wxAuiManager managing the editor. Can be NULL.
     *
     * \see SetParentAuiManager
     */
    wxAuiManager * GetParentAuiManager() { return parentAuiManager; };

    /**
     * Set the scrollbars associated with the editor.
     *
     * \param hScrollbar The horizontal scrollbar
     * \param vScrollbar The vertical scrollbar
     */
    virtual void SetScrollbars(wxScrollBar * hScrollbar_, wxScrollBar * vScrollbar_) { hScrollbar = hScrollbar_; vScrollbar = vScrollbar_; }

    /**
     * Must be called by the IDE when the parent control size has changed:
     * The editor must update its size ( wxWindow::SetSize ) according to the parentControl size and the scrollbars.
     */
    void UpdateSize();

    /**
     * Called by the IDE when the editor is active to connect ribbon buttons to the editor methods
     */
    void ConnectEvents();

    /**
     * Static method for creating the ribbon's page used by all layout editors.
     * Called by the IDE.
     * \return The wxRibbonButtonBar to be used for the custom tools. Can be accessed then thanks to the MainFrameWrapper object.
     */
    static wxRibbonButtonBar* CreateRibbonPage(wxRibbonPage * page);

    /**
     * Can be called by the IDE to force the recreation of the custom toolbar of the ribbon, for example when
     * switching the focus to a LayoutEditorCanvas.
     *
     * \see CreatePreviewRibbonTools
     * \see CreateEditionRibbonTools
     */
    void RecreateRibbonToolbar();

    /**
     * Set a function to be called when the ribbon button bar containing the layout editor tools
     * is updated.
     */
    void OnRibbonButtonBarUpdated(std::function<void(wxRibbonButtonBar *)> cb) { onRibbonButtonBarUpdatedCb = cb; };

    /**
     * Get the context menu used for objects.
     */
    wxMenu & GetContextMenu() { return contextMenu; };

    /**
     * Get the context menu used when no object is selected.
     */
    wxMenu & GetNoObjectContextMenu() { return noObjectContextMenu; };

    /**
     * The editors' parent panel can forward the event of the scrollbars to these methods.
     * \see OnhScrollbarScroll
     */
    virtual void OnvScrollbarScroll(wxScrollEvent& event);

    /**
     * The editors' parent panel can forward the event of the scrollbars to these methods.
     * \see OnvScrollbarScroll
     */
    virtual void OnhScrollbarScroll(wxScrollEvent& event);

    /**
     * Return a list of the currently selected instances.
     */
    std::vector<gd::InitialInstance*> GetSelection();

    /**
     * Clear the selection, notifying associated editors.
     */
    void ClearSelection();

    /**
     * Add an instance of the specified object at the cursor position.
     */
    void AddObject(const gd::String & objectName);

    /**
     * Add an instance of the specified object at the specified position.
     */
    void AddObject(const gd::String & objectName, float x, float y);

    /**
     * Add an instance to selection, notifying associated editors.
     */
    void SelectInstance(InitialInstance * instance);

    /**
     * Remove an instance from selection, notifying associated editors.
     */
    void UnselectInstance(InitialInstance * instance);

    /**
     * Delete the specified instance, notifying associated editors.
     */
    void DeleteInstances(std::vector<InitialInstance *> instances);

    /**
     * Can be called so that the editor make the initial instance passed in parameters visible.
     */
    virtual void EnsureVisible(const gd::InitialInstance & instance);

    /**
     * Set the layer where the new instance must be added
     */
    void SetCurrentLayer(const gd::String & newLayer) { currentLayer = newLayer; }

    /**
     * Return the current layer
     */
    const gd::String & GetCurrentLayer() const { return currentLayer; }

    /**
     * Return true if the editor is in editing state.
     */
    bool IsEditing() const { return editing; }

    /**
     * Return true if the scene is being previewed ( i.e. : IsEditing() == false )  but the preview is paused.
     */
    bool PreviewPaused() const;

    /**
     * \brief Tell the current previewer to pause the preview.
     *
     * Has no effects in editing state.
     */
    virtual void PausePreview();

    /**
     * Load resources for objects.
     */
    void ReloadResources();

    /**
     * \brief Can be called ( by previewers for example ) to ask the editor to go back to editing state.
     */
    void GoToEditingState();

    /**
     * \brief Enable or disable idle events. Disabling them avoid the scene to be constantly rendered.
     * \note Used by the scene editor when the user switch to the event editor.
     */
    void EnableIdleEvents(bool enable = true) {enableIdleEvents = enable;};

    virtual sf::Vector2f GetInitialInstanceSize(gd::InitialInstance & instance) const;
    virtual sf::Vector2f GetInitialInstanceOrigin(gd::InitialInstance & instance) const;

    //(*Declarations(LayoutEditorCanvas)
    //*)

protected:
    //(*Identifiers(LayoutEditorCanvas)
    //*)

    //All ribbons identifiers
    static const long idRibbonEditMode;
    static const long idRibbonPreviewMode;
    static const long idRibbonHelp;
    static const long idRibbonObjectsEditor;
    static const long idRibbonLayersEditor;
    static const long idRibbonGrid;
    static const long idRibbonWindowMask;
    static const long idRibbonGridSetup;
    static const long idRibbonUndo;
    static const long idUndo10;
    static const long idUndo20;
    static const long idClearHistory;
    static const long idRibbonRedo;
    static const long idRibbonObjectsPositionList;
    static const long idRibbonFullScreen;
    static const long idRibbonOrigine;
    static const long idRibbonOriginalZoom;
    static const long ID_CUSTOMZOOMMENUITEM500;
    static const long ID_CUSTOMZOOMMENUITEM200;
    static const long ID_CUSTOMZOOMMENUITEM150;
    static const long ID_CUSTOMZOOMMENUITEM100;
    static const long ID_CUSTOMZOOMMENUITEM50;
    static const long ID_CUSTOMZOOMMENUITEM25;
    static const long ID_CUSTOMZOOMMENUITEM10;
    static const long ID_CUSTOMZOOMMENUITEM5;

    //Context menu identifiers
    static const long ID_ADDOBJMENU;
    static const long ID_DELOBJMENU;
    static const long ID_PROPMENU;
    static const long ID_AUTOMENU;
    static const long ID_LAYERUPMENU;
    static const long ID_LAYERDOWNMENU;
    static const long ID_COPYMENU;
    static const long ID_CUTMENU;
    static const long ID_PASTEMENU;
    static const long ID_PASTESPECIALMENU;
    static const long ID_CREATEOBJECTMENU;
    static const long ID_UNLOCKMENU;
    static const long ID_LOCKMENU;
    std::map<long, gd::String> idForPlatformsMenu;

    //(*Handlers(LayoutEditorCanvas)
    //*)

    //Methods allowing to run SFML within the wxWidgets control
    virtual void OnUpdate();
    virtual void OnPaint(wxPaintEvent& event);
    virtual void OnEraseBackground(wxEraseEvent& event);
    virtual void OnIdle(wxIdleEvent&);
    //Changing the state of the editor
    virtual void OnPreviewBtClick( wxCommandEvent & event );
    virtual void OnPreviewDropDownBtClick( wxRibbonButtonBarEvent & event );
    virtual void OnEditionBtClick( wxCommandEvent & event );
    //Others events
    virtual void OnHelpBtClick( wxCommandEvent & event );
    virtual void OnLeftDown( wxMouseEvent &event );
    virtual void OnLeftUp( wxMouseEvent &event );
    virtual void OnLeftDClick( wxMouseEvent &event );
    virtual void OnKey( wxKeyEvent& evt );
    virtual void OnKeyUp( wxKeyEvent& evt );
    virtual void OnMiddleDown( wxMouseEvent &event );
    virtual void OnMiddleUp( wxMouseEvent &event );
    virtual void OnMouseWheel( wxMouseEvent &event );
    virtual void OnRightUp( wxMouseEvent &event );
    virtual void OnMotion( wxMouseEvent &event );
    virtual void OnGridBtClick( wxCommandEvent & event );
    virtual void OnGridSetupBtClick( wxCommandEvent & event );
    virtual void OnObjectsPositionList( wxCommandEvent & event );
    virtual void OnClearHistorySelected( wxCommandEvent & event );
    virtual void OnUndo10Selected(wxCommandEvent& event) {Undo(10);};
    virtual void OnUndo20Selected(wxCommandEvent& event) {Undo(20);};
    virtual void OnObjectsEditor( wxCommandEvent & event );
    virtual void OnLayersEditor( wxCommandEvent & event );
    virtual void OnUndoBtClick( wxCommandEvent & event );
    virtual void OnUndoMoreBtClick( wxRibbonButtonBarEvent & event );
    virtual void OnRedoBtClick( wxCommandEvent & event );
    virtual void OnWindowMaskBtClick( wxCommandEvent & event );
    virtual void OnFullScreenBtClick(wxCommandEvent& event);
    virtual void OnGuiElementHovered(const LayoutEditorCanvasGuiElement & guiElement);
    virtual void OnGuiElementPressed(const LayoutEditorCanvasGuiElement & guiElement);
    virtual void OnGuiElementReleased(const LayoutEditorCanvasGuiElement & guiElement);
    virtual void OnOrigineBtClick(wxCommandEvent & event );
    virtual void OnZoomInitBtClick( wxCommandEvent & event );
    virtual void OnZoomMoreBtClick(wxRibbonButtonBarEvent& evt);
    virtual void OnCustomZoom5Selected(wxCommandEvent& event);
    virtual void OnCustomZoom10Selected(wxCommandEvent& event);
    virtual void OnCustomZoom25Selected(wxCommandEvent& event);
    virtual void OnCustomZoom50Selected(wxCommandEvent& event);
    virtual void OnCustomZoom100Selected(wxCommandEvent& event);
    virtual void OnCustomZoom150Selected(wxCommandEvent& event);
    virtual void OnCustomZoom200Selected(wxCommandEvent& event);
    virtual void OnCustomZoom500Selected(wxCommandEvent& event);
    virtual void OnPropObjSelected( wxCommandEvent & event );
    virtual void OnAddAutoObjSelected( wxCommandEvent & event );
    virtual void OnLayerUpSelected( wxCommandEvent & event );
    virtual void OnLayerDownSelected( wxCommandEvent & event );
    virtual void OnCopySelected( wxCommandEvent & event );
    virtual void OnCutSelected( wxCommandEvent & event );
    virtual void OnPasteSelected( wxCommandEvent & event );
    virtual void OnPasteSpecialSelected( wxCommandEvent & event );
    virtual void OnDeleteObjectSelected( wxCommandEvent & event );
    virtual void OnCreateObjectSelected( wxCommandEvent & event );
    virtual void OnLockSelected( wxCommandEvent & event );
    virtual void OnUnLockSelected( wxCommandEvent & event );
    virtual void OnPreviewForPlatformSelected( wxCommandEvent & event );

    virtual double GetMouseXOnLayout() const;
    virtual double GetMouseYOnLayout() const;

    //Rendering methods.
    void RenderEdittime();
    void RenderGrid();
    void RenderWindowMask();
    void RenderInitialWindowBorder();
    void AddSmallButtonGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, const gd::String & buttonName );
    void DrawSelectionRectangleGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle );
    void DrawAngleButtonGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, float angle );
    void DrawHighlightRectangleGuiElement(std::vector < std::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle );
    sf::Vector2f ConvertToWindowCoordinates(float x, float y, const sf::View & view);

    /**
     * Can be called ( most of the time when the layout is rendered when editing ) to declare that
     * there is an active gui element at a position, along with some other informations.
     *
     * \see LayoutEditorCanvasGuiElement
     * \see ClearAllGuiElements
     */
    void AddGuiElement(LayoutEditorCanvasGuiElement element) { guiElements.push_back(element); };

    /**
     * Clear the list containing the description of gui elements. Should be called at each rendering when editing,
     * before adding the new gui elements just rendered.
     */
    void ClearAllGuiElements() { guiElements.clear(); };

    /**
     * Called when the ribbon buttons of edition mode must be created inside ribbonToolbar.
     * \see CreatePreviewRibbonTools
     */
    void CreateEditionRibbonTools();

    /**
     * \brief Toggle the disabled state of the Edition and Preview button according
     * to the state of the editor (editing or previewing).
     */
    void UpdateModeButtonsState();

    /**
     * Return a pointer to the smallest initial instance under the cursor.
     * Can be NULL.
     */
    InitialInstance * GetInitialInstanceUnderCursor(bool pickOnlyLockedInstances = false) { return GetInitialInstanceAtPosition(GetMouseXOnLayout(), GetMouseYOnLayout(), pickOnlyLockedInstances); };

    /**
     * Return a pointer to the smallest initial instance which intersect with the specified position
     * Can be NULL.
     */
    InitialInstance * GetInitialInstanceAtPosition(double xPosition, double yPosition, bool pickOnlyLockedInstances = false);

    /**
     * Called when a changes has been made ( Something which is lasting, e.g. when an object has been moved,
     * but not when it is being moved ).
     */
    void ChangesMade();

    /**
     * Tool function returning the object used to display during the \a instance when editing.
     */
    gd::Object * GetObjectLinkedToInitialInstance(gd::InitialInstance & instance) const;

    /**
     * Undo last changes.
     */
    void Undo(std::size_t times = 1);

    /**
     * Redo last changes.
     */
    void Redo(std::size_t times = 1);

    /**
     * Update the mouse according to the selected button
     */
    void UpdateMouseResizeCursor(const gd::String & currentDraggableBt);

    void UpdateContextMenu();
    void UpdateScrollbars();
    void UpdateViewAccordingToZoomFactor();

    void SendSelectionToLayer(const gd::String & newLayerName);

    gd::Project & project; ///< The project owning the layout
    gd::Layout & layout; ///< The layout being edited or used to edit the instances
    gd::ExternalLayout * externalLayout; ///< The external layout being edited, if any.
    gd::InitialInstancesContainer & instances; ///< The initial instances of objects being edited
    LayoutEditorCanvasOptions & options;
    gd::MainFrameWrapper & mainFrameWrapper;
    std::set<LayoutEditorCanvasAssociatedEditor*> associatedEditors;
    std::map<gd::String, std::shared_ptr<gd::LayoutEditorPreviewer> > previewers;
    wxWindow * parentControl; ///< The wxWidgets control owning the editor ( probably a wxPanel )
    wxAuiManager * parentAuiManager; ///< Pointer to the wxAuiManager displayed the editor. Can be NULL.
    wxScrollBar * hScrollbar;
    wxScrollBar * vScrollbar;
    wxMenu undoMenu;

    sf::View editionView; ///< The view used for editing
    gd::String currentDraggableBt;
    std::map<gd::InitialInstance*, double> resizeOriginalWidths;
    std::map<gd::InitialInstance*, double> resizeOriginalHeights;
    sf::Vector2f resizeMouseStartPosition;
    sf::Vector2f angleButtonCenter;
    bool isMovingView;
    sf::Vector2f movingViewMouseStartPosition;
    sf::Vector2f movingViewStartPosition;
    bool hasJustRightClicked;
    bool ctrlPressed;
    bool altPressed;
    bool shiftPressed;
    double oldMouseX; ///< The mouse X position which was usually stored the last time a right click happened.
    double oldMouseY; ///< The mouse Y position which was usually stored the last time a right click happened.
    bool isMovingInstance;

    float gapBetweenButtonsAndRectangle;
    float smallButtonSize;

    bool firstRefresh;

    bool isSelecting;
    wxRect selectionRectangle;
    std::map <InitialInstance*, wxRealPoint > selectedInstances;
    gd::String currentLayer; ///< The layer where the new instance must be added.

    std::vector < std::shared_ptr<gd::InitialInstancesContainer> > history; ///< History of changes
    std::vector < std::shared_ptr<gd::InitialInstancesContainer> > redoHistory; ///< Histoy of changes so as to "redo"
    std::shared_ptr<gd::InitialInstancesContainer> latestState; ///< Necessary to keep track of what changed

    std::vector<LayoutEditorCanvasGuiElement> guiElements;

    //State
    bool editing; ///< True if the layout is being edited, false if a preview is running.
    std::shared_ptr<gd::LayoutEditorPreviewer> currentPreviewer; ///< The previewer being used to preview the layout.

    bool enableIdleEvents;

    wxMenu contextMenu;
    wxMenu noObjectContextMenu;
    wxMenu zoomMenu;
    wxMenu platformsMenu;
    static wxRibbonButtonBar * modeRibbonBar;

    std::function<void(wxRibbonButtonBar *)> onRibbonButtonBarUpdatedCb;

    DECLARE_EVENT_TABLE()
    friend class InstancesInAreaPicker;
    friend class SmallestInstanceUnderCursorPicker;
};

}

#endif
#endif
