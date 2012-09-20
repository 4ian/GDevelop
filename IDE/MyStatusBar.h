#ifdef __BORLANDC__
    #pragma hdrstop
#endif

#if !wxUSE_STATUSBAR
    #error "You need to set wxUSE_STATUSBAR to 1 to compile this sample"
#endif // wxUSE_STATUSBAR

// for all others, include the necessary headers
#include <wx/app.h>
#include <wx/log.h>
#include <wx/frame.h>
#include <wx/statusbr.h>
#include <wx/timer.h>
#include <wx/checkbox.h>
#include <wx/statbmp.h>
#include <wx/menu.h>
#include <wx/msgdlg.h>
#include <wx/textdlg.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/bmpbuttn.h>
#include <wx/dcmemory.h>

#include <wx/datetime.h>
#include <wx/numdlg.h>

// define this for the platforms which don't support wxBitmapButton (such as
// Motif), else a wxBitmapButton will be used
#ifdef __WXMOTIF__
//#define USE_MDI_PARENT_FRAME 1

#ifdef USE_MDI_PARENT_FRAME
    #include <wx/mdi.h>
#endif // USE_MDI_PARENT_FRAME
    #define USE_STATIC_BITMAP
#endif

// ----------------------------------------------------------------------------
// resources
// ----------------------------------------------------------------------------

#ifdef USE_STATIC_BITMAP
    #include "green.xpm"
    #include "red.xpm"
#endif // USE_STATIC_BITMAP

// ----------------------------------------------------------------------------
// private classes
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// constants
// ----------------------------------------------------------------------------

// IDs for the controls and the menu commands
enum
{
    // menu items
    StatusBar_Quit = 1,
    StatusBar_SetFields,
    StatusBar_Recreate,
    StatusBar_About,
    StatusBar_Toggle,
    StatusBar_Checkbox = 1000,
    StatusBar_SetStyle,
    StatusBar_SetStyleNormal,
    StatusBar_SetStyleFlat,
    StatusBar_SetStyleRaised
};

static const int BITMAP_SIZE_X = 24;
static const int BITMAP_SIZE_Y = 24;

// A custom status bar which contains controls, icons &c
class MyStatusBar : public wxStatusBar
{
public:
    MyStatusBar(wxWindow *parent);
    virtual ~MyStatusBar();

    void UpdateClock();

    // event handlers
    void OnSize(wxSizeEvent& event);

private:
    // toggle the state of the status bar controls
    void DoToggle();

    enum
    {
        Field_Text,
        Field_Checkbox,
        Field_Bitmap,
        Field_Clock,
        Field_Max
    };

    wxBitmapButton *m_statbmp;

    DECLARE_EVENT_TABLE()
};

