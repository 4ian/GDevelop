/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#ifndef SCENEEDITORCANVAS_H
#define SCENEEDITORCANVAS_H
#include <boost/shared_ptr.hpp>
#include <boost/bimap.hpp>
#include <SFML/Graphics.hpp>
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas.h"
#include "GDL/RuntimeGame.h"
#include "GDL/RuntimeScene.h"
namespace gd { class MainFrameWrapper; }
namespace gd { class InitialInstancesContainer; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class InitialInstance; }
namespace gd { class LayoutEditorCanvasOptions; }
class DebuggerGUI;
class ProfileDlg;
class RenderDialog;

/**
 * \brief The new scene editor canvas
 */
class GD_API SceneEditorCanvas : public gd::LayoutEditorCanvas, public sf::RenderWindow
{
public:
    SceneEditorCanvas(wxWindow* parent, gd::Project & project_, gd::Layout & layout_, gd::InitialInstancesContainer & instances_, gd::LayoutEditorCanvasOptions & settings_, gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~SceneEditorCanvas() {};

    /**
     * \brief Return a reference to the game owning the scene being edited inside the editor.
     */
    RuntimeGame & GetEditedGame() { return game; }

    /**
     * \brief Return a reference to the scene being edited inside the editor.
     */
    Scene & GetEditedScene() { return scene; }

    /**
     * \brief Return a reference to the scene used for preview inside the editor.
     */
    RuntimeScene & GetRuntimeScene() { return previewScene; }

    /**
     * Refresh the scene being edited.
     *
     * The state of the editor is preserved.
     *
     * Can be called internally, when the editor see that changes have been made
     * or from other external editors.
     */
    void Reload();

    /**
     * Can be called by the external window, owned by the editor, so as to notify the editor that
     * the window has been closed.
     */
    void ExternalWindowClosed();

    /**
     * We're redefining this method so as to create missing sub editors if needed.
     */
    virtual void SetParentAuiManager(wxAuiManager * parentAuiManager_);

    virtual void UpdateSize();
    virtual void UpdateScrollbars();
    virtual void OnvScrollbarScroll(wxScrollEvent& event);
    virtual void OnhScrollbarScroll(wxScrollEvent& event);

    void UpdateViewAccordingToZoomFactor();

private:
    //Methods allowing to run SFML within the wxWidgets control
    virtual void OnUpdate();
    virtual void OnIdle(wxIdleEvent&);
    virtual void OnPaint(wxPaintEvent&);
    virtual void OnEraseBackground(wxEraseEvent&) {};
    virtual void DoConnectEvents();

    //Changing the state of the editor
    virtual void OnPreviewBtClick( wxCommandEvent & event );
    virtual void OnEditionBtClick( wxCommandEvent & event );
    virtual void OnHelpBtClick( wxCommandEvent & event );

    //Other events
    virtual void OnOrigineBtClick(wxCommandEvent & event );
    virtual void OnZoomInitBtClick( wxCommandEvent & event );
    virtual void OnZoomMoreBtClick(wxRibbonButtonBarEvent& evt);
    virtual void OnCustomZoomSelected(wxCommandEvent& event);
    virtual void OnLeftUp( wxMouseEvent &event );
    virtual void OnMiddleDown( wxMouseEvent &event );
    virtual void OnMotion( wxMouseEvent &event );
    virtual void OnRightUp( wxMouseEvent &event );
    virtual void OnMouseWheel( wxMouseEvent &event );

    virtual void OnInitialInstanceMoved(gd::InitialInstance & instance);
    virtual void OnInitialInstanceAdded(gd::InitialInstance & instance);
    virtual void OnInitialInstanceDeleted(gd::InitialInstance & instance);
    virtual void OnGuiElementPressed(const gd::LayoutEditorCanvasGuiElement & guiElement);
    virtual void OnGuiElementHovered(const gd::LayoutEditorCanvasGuiElement & guiElement);
    virtual void Undo(unsigned int times = 1) { LayoutEditorCanvas::Undo(times); Reload(); };
    virtual void Redo(unsigned int times = 1) { LayoutEditorCanvas::Redo(times); Reload(); };

    virtual double GetMouseXOnLayout();
    virtual double GetMouseYOnLayout();
    virtual double GetWidthOfInitialInstance(gd::InitialInstance & instance);
    virtual double GetHeightOfInitialInstance(gd::InitialInstance & instance);
    virtual double GetRealXPositionOfInitialInstance(gd::InitialInstance & instance);
    virtual double GetRealYPositionOfInitialInstance(gd::InitialInstance & instance);
    virtual void CreatePreviewRibbonTools();
    virtual void CreateEditionRibbonTools();

    virtual void OnPreviewRefreshBtClick( wxCommandEvent & event );
    virtual void OnPreviewPlayBtClick( wxCommandEvent & event );
    virtual void OnPreviewPlayWindowBtClick( wxCommandEvent & event );
    virtual void OnPreviewPauseBtClick( wxCommandEvent & event );
    virtual void OnPreviewDebugBtClick( wxCommandEvent & event );
    virtual void OnPreviewProfilerBtClick( wxCommandEvent & event );

    void ReloadSecondPart();

    //Rendering methods. The rendering during preview is done by previewScene.
    void RenderCompilationScreen();
    void RenderEdittime();
    void RenderGrid();
    void AddSmallButtonGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::Vector2f & position, const std::string & buttonName );
    void DrawSelectionRectangleGuiElement(std::vector < boost::shared_ptr<sf::Shape> > & target, const sf::FloatRect & rectangle );
    sf::Vector2f ConvertToWindowCoordinates(float x, float y, const sf::View & view);

    static const float gapBetweenButtonsAndRectangle = 5;
    static const float smallButtonSize = 5;

    //References to objects being edited
    RuntimeGame & game; ///< The game being edited. Initialized at the editor construction from the gd::Project parameter.
    Scene & scene; ///< The scene being edited. Initialized at the editor construction from the gd::Layout parameter.
    InitialInstancesContainer & instances; ///< The instances being edited.  Initialized at the editor construction from the gd::InitialInstancesContainer parameter.

    //Members used during preview or compilation
    RuntimeGame previewGame; ///< Runtime game used during preview.
    RuntimeScene previewScene; ///< Runtime scene used to render or preview the scene.
    static sf::Texture reloadingIconImage;
    static sf::Sprite reloadingIconSprite;
    static sf::Text reloadingText;

    //Editors owned by the scene editor canvas.
    boost::shared_ptr<RenderDialog> externalPreviewWindow;
    boost::shared_ptr<DebuggerGUI> debugger;
    boost::shared_ptr<ProfileDlg> profiler;

    //Editing members data
    sf::View editionView; ///< The view used for editing
    std::string currentResizeBt;
    std::map<gd::InitialInstance*, double> resizeOriginalWidths;
    std::map<gd::InitialInstance*, double> resizeOriginalHeights;
    sf::Vector2f resizeMouseStartPosition;
    bool isMovingView;
    sf::Vector2f movingViewMouseStartPosition;
    sf::Vector2f movingViewStartPosition;

    typedef boost::bimap<InitialPosition*, boost::shared_ptr<Object> > InstancesAndObjectsBimap;
    typedef InstancesAndObjectsBimap::value_type InstanceAndObjectPair;
    InstancesAndObjectsBimap initialInstancesAndObjectsBimap; ///< Links between initial instances and the objects really used by previewScene to render the scene when editing.

    //Custom ribbons buttons identifiers
    static const long idRibbonOrigine;
    static const long idRibbonOriginalZoom;
    static const long ID_CUSTOMZOOMMENUITEM;
    static const long idRibbonRefresh;
    static const long idRibbonPlay;
    static const long idRibbonPlayWin;
    static const long idRibbonPause;
    static const long idRibbonResetGlobalVars;
    static const long idRibbonDebugger;
    static const long idRibbonProfiler;

    wxMenu zoomMenu;

    /**
     * Tool function returning the object used to display during the \a instance when editing.
     * Can return a null pointer if the object is not found ( even if it should not happen normally ).
     */
    boost::shared_ptr<Object> GetObjectLinkedToInitialInstance(gd::InitialInstance & instance);

    /**
     * Update the mouse according to the selected button
     */
    void UpdateMouseResizeCursor(const std::string & currentResizeBt);

    //State management
    bool isReloading; ///< Our editor is a bit special: It sometimes need to wait for a compilation to finish before going into preview mode.
};

#endif // SCENEEDITORCANVAS_H
#endif
