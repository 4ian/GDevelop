/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef LAYOUTEDITORCANVAS_H
#define LAYOUTEDITORCANVAS_H
//(*Headers(LayoutEditorCanvas)
#include <wx/panel.h>
//*)
#include <set>
#include <map>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <wx/menu.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/gdicmn.h>
#include <wx/panel.h>
namespace gd { class MainFrameWrapper; }
namespace gd { class InitialInstancesContainer; }
namespace gd { class InitialInstance; }
namespace gd { class LayoutEditorCanvasAssociatedEditor; }
namespace gd { class Project; }
namespace gd { class Layout; }
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

    std::string name; ///< The name of the button, chosen by the editor
    wxRect area; ///< The area where the button is displayed, in layout coordinates.
    InitialInstance * associatedInitialInstance; ///< The associated initial instance, if any.
};

/**
 * \brief Base class for implementing the main canvas of layout editors.
 *
 * \ingroup IDE
 * \ingroup IDE dialogs
 */
class GD_CORE_API LayoutEditorCanvas: public wxPanel
{
public:

    LayoutEditorCanvas(wxWindow* parent,
                       gd::Project & project,
                       gd::Layout & layout,
                       gd::InitialInstancesContainer & instances,
                       LayoutEditorCanvasOptions & options,
                       gd::MainFrameWrapper & mainFrameWrapper);
    virtual ~LayoutEditorCanvas();

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
    virtual void SetParentAuiManager(wxAuiManager * parentAuiManager_) { parentAuiManager = parentAuiManager_; };

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
     *
     * \note Do not redefine this function ( it is not virtual ), but gd::LayoutEditorCanvas::DoConnectEvents instead.
     */
    void ConnectEvents();

    /**
     * Called when the an editor made changes to the layout ( New layout added for example ) and so the editor must
     * be refreshed if needed.
     */
    virtual void RefreshFromLayout() {};

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
     * The editors' parent panel can forward the event of the scrollbars to these methods.
     * \see OnhScrollbarScroll
     */
    virtual void OnvScrollbarScroll(wxScrollEvent& event) {};

    /**
     * The editors' parent panel can forward the event of the scrollbars to these methods.
     * \see OnvScrollbarScroll
     */
    virtual void OnhScrollbarScroll(wxScrollEvent& event) {};

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
    void AddObject(const std::string & objectName);

    /**
     * Add an instance of the specified object at the specified position.
     */
    void AddObject(const std::string & objectName, float x, float y);

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
    virtual void EnsureVisible(const gd::InitialInstance & instance) {};

    /**
     * Set the layer where the new instance must be added
     */
    void SetCurrentLayer(const std::string & newLayer) { currentLayer = newLayer; }

    /**
     * Return the current layer
     */
    const std::string & GetCurrentLayer() const { return currentLayer; }

    /**
     * Return true if the editor is in editing state.
     */
    bool IsEditing() const { return editing; }

    /**
     * Return true if the scene is being previewed ( i.e. : IsEditing() == false )  but the preview is paused.
     */
    bool PreviewPaused() const { return !editing && !playing; }

    /**
     * Must pause the preview.<br>
     * See also the other method related to the state of the editor : PlayPreview, OnPreviewBtClick, OnEditionBtClick
     *
     * \note The default implementation is updating the working directory and set playing to false.
     */
    virtual void PausePreview();

    /**
     * Must play the layout.<br>
     * See also the other method related to the state of the editor : PausePreview, OnPreviewBtClick, OnEditionBtClick
     *
     * \note The default implementation is updating the working directory and set playing to false.
     */
    virtual void PlayPreview();

    /** To be redefined by the child classes so as to provide the width of an initial instance */
    virtual double GetWidthOfInitialInstance(InitialInstance & instance) const { return 16; };

    /** To be redefined by the child classes so as to provide the height of an initial instance */
    virtual double GetHeightOfInitialInstance(InitialInstance & instance) const { return 16; };

    //(*Declarations(LayoutEditorCanvas)
    //*)

protected:
    //(*Identifiers(LayoutEditorCanvas)
    //*)
    //Common identifiers of ribbon buttons shared by layout editors of any platform.
    static const long idRibbonEditMode;
    static const long idRibbonPreviewMode;
    static const long idRibbonHelp;
    //Edition mode identifiers
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

    //(*Handlers(LayoutEditorCanvas)
    //*)

    //Events
    virtual void OnPaint(wxPaintEvent& event);
    virtual void OnEraseBackground(wxEraseEvent& event) {};
    virtual void OnIdle(wxIdleEvent&) {};
    virtual void OnHelpBtClick( wxCommandEvent & event ) {};
    virtual void OnLeftDown( wxMouseEvent &event );
    virtual void OnLeftUp( wxMouseEvent &event );
    virtual void OnLeftDClick( wxMouseEvent &event );
    virtual void OnKey( wxKeyEvent& evt );
    virtual void OnKeyUp( wxKeyEvent& evt );
    virtual void OnMiddleDown( wxMouseEvent &event ) {};
    virtual void OnMouseWheel( wxMouseEvent &event ) {};
    virtual void OnRightUp( wxMouseEvent &event ) {};
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
    virtual void OnGuiElementHovered(const LayoutEditorCanvasGuiElement & guiElement) {};
    virtual void OnGuiElementPressed(const LayoutEditorCanvasGuiElement & guiElement) {};
    virtual void OnGuiElementReleased(const LayoutEditorCanvasGuiElement & guiElement) {};
    virtual void OnInitialInstanceMoved(gd::InitialInstance & instance) {};
    virtual void OnInitialInstanceAdded(gd::InitialInstance & instance) {};
    virtual void OnInitialInstanceDeleted(gd::InitialInstance & instance) {};

    /** To be redefined by the child classes so as to provide the position of the mouse */
    virtual double GetMouseXOnLayout() const { return 0; };

    /** To be redefined by the child classes so as to provide the position of the mouse */
    virtual double GetMouseYOnLayout() const { return 0; };

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
     * Called when the preview button is clicked.
     * The default implementation of this method do some useful work ( disable useless editors, call methods to change the ribbon tools...) :
     * If you redefine this function, you can call LayoutEditorCanvas::OnPreviewBtClick(event);
     * so as not to have to redo this work.
     */
    virtual void OnPreviewBtClick( wxCommandEvent & event );

    /**
     * Called when the preview button is clicked.
     * See OnPreviewBtClick method for more infomation about the default implementation.
     */
    virtual void OnEditionBtClick( wxCommandEvent & event );

    /**
     * Called when the ribbon buttons of preview mode must be created inside ribbonToolbar.
     * Default implementation adds common buttons: if you redefine this function,
     * you can call LayoutEditorCanvas::CreatePreviewRibbonTools();
     * so as not to have to redo this work.
     */
    virtual void CreatePreviewRibbonTools();

    /**
     * Called when the ribbon buttons of edition mode must be created inside ribbonToolbar.
     * \see CreatePreviewRibbonTools
     */
    virtual void CreateEditionRibbonTools();

    /**
     * Redefine this function to connect the ribbon buttons to the editors methods.
     * Ribbons buttons are created thanks to CreatePreviewRibbonTools and CreateEditionRibbonTools.
     * \see CreatePreviewRibbonTools
     */
    virtual void DoConnectEvents() {};

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
     * Undo last changes.
     */
    virtual void Undo(unsigned int times = 1);

    /**
     * Redo last changes.
     */
    virtual void Redo(unsigned int times = 1);

    gd::Project & project; ///< The project owning the layout
    gd::Layout & layout; ///< The layout being edited or used to edit the instances
    gd::InitialInstancesContainer & instances; ///< The initial instances of objects being edited
    LayoutEditorCanvasOptions & options;
    gd::MainFrameWrapper & mainFrameWrapper;
    std::set<LayoutEditorCanvasAssociatedEditor*> associatedEditors;
    wxWindow * parentControl; ///< The wxWidgets control owning the editor ( probably a wxPanel )
    wxAuiManager * parentAuiManager; ///< Pointer to the wxAuiManager displayed the editor. Can be NULL.
    wxScrollBar * hScrollbar;
    wxScrollBar * vScrollbar;
    wxMenu undoMenu;

    bool hasJustRightClicked;
    bool ctrlPressed;
    bool altPressed;
    bool shiftPressed;
    double oldMouseX; ///< The mouse X position which was usually stored the last time a right click happened.
    double oldMouseY; ///< The mouse X position which was usually stored the last time a right click happened.
    bool isMovingInstance;

    bool isSelecting;
    wxRect selectionRectangle;
    std::map <InitialInstance*, wxRealPoint > selectedInstances;
    std::string currentLayer; ///< The layer where the new instance must be added.

    std::vector < boost::shared_ptr<gd::InitialInstancesContainer> > history; ///< History of changes
    std::vector < boost::shared_ptr<gd::InitialInstancesContainer> > redoHistory; ///< Histoy of changes so as to "redo"
    boost::shared_ptr<gd::InitialInstancesContainer> latestState; ///< Necessary to keep track of what changed

    std::vector<LayoutEditorCanvasGuiElement> guiElements;

    bool editing; ///< True if the layout is being edited, false if a preview is running.
    bool playing; ///< True if the layout is being previewed and the preview is not paused.

    DECLARE_EVENT_TABLE()
    friend class InstancesInsideSelectionPicker;
    friend class SmallestInstanceUnderCursorPicker;
};

}

#endif
