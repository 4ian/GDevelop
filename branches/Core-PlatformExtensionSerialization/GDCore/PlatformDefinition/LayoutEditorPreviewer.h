#ifndef LAYOUTEDITORPREVIEWER_H
#define LAYOUTEDITORPREVIEWER_H
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/event.h>
namespace gd { class LayoutEditorCanvas; }
class wxRibbonButtonBar;
class wxAuiManager;

namespace gd
{

/**
 * \brief Base class used to define what should happen when a preview is launched for a platform.
 *
 * When launching a preview for a platform, the IDE calls gd::Platform::GetLayoutPreviewer which
 * must return a LayoutEditorPreviewer object. <br>
 * This object is stored by the IDE and can be used to launch a preview ( see LaunchPreview method ).
 *
 * \see gd::Platform
 */
class GD_CORE_API LayoutEditorPreviewer : public wxEvtHandler
{
public:
    LayoutEditorPreviewer() {};
    virtual ~LayoutEditorPreviewer();

    /**
     * \brief Called to create the buttons need by the previewer.
     */
    virtual void CreatePreviewRibbonTools(wxRibbonButtonBar & buttonBar) {};

    /**
     * \brief Called to connect the buttons with their events.
     */
    virtual void ConnectPreviewRibbonToolsEvents() {};

    /**
     * \brief Can be called by the IDE to notify the previewer that it is displayed thanks to a wxAuiManager
     * and that it can uses it to display it own sub editors.
     */
    virtual void SetParentAuiManager(wxAuiManager * parentAuiManager_) {};

    /**
     * \brief Called when the previewer must launch the preview ( i.e: Preview button was pressed in the editor ).
     * You can return false is no preview must be done ( The editor will go back into editing state )
     *
     * \return true if the previewer takes care of showing a preview into the editor, false if the editor must go back into editing state.
     */
    virtual bool LaunchPreview() { return false; };

    /**
     * \brief Called when the previewer must stop the preview ( i.e: Editing button was pressed in the editor )
     */
    virtual void StopPreview() {};

    /**
     * \brief Called when the previewer must pause the preview.
     */
    virtual void PausePreview() {};

    /**
     * \brief Called regularly during a preview by the parent editor to render a frame.
     */
    virtual void OnUpdate() {};

    /**
     * \brief When doing a preview, must return true if the preview is in a paused state.
     */
    virtual bool IsPaused() { return false; }
};

}

#endif
#endif // LAYOUTEDITORPREVIEWER_H
