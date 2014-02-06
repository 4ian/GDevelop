
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef EDITLINK_H
#define EDITLINK_H

//(*Headers(EditLink)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/combobox.h>
//*)
#include "GDCore/Events/Builtin/LinkEvent.h"
namespace gd { class Project; }

namespace gd
{

/**
 * \brief Editor for the link events.
 * \ingroup IDEDialogs
 */
class EditLink: public wxDialog
{
public:

    EditLink(wxWindow* parent, LinkEvent & event, const gd::Project & game);
    virtual ~EditLink();

    //(*Declarations(EditLink)
    wxButton* OkBt;
    wxStaticText* StaticText2;
    wxComboBox* linkedNameEdit;
    wxRadioButton* AllEventsCheck;
    wxStaticBitmap* StaticBitmap1;
    wxTextCtrl* EndEdit;
    wxStaticText* StaticText1;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxTextCtrl* StartEdit;
    wxRadioButton* OnlyEventsCheck;
    wxStaticText* StaticText5;
    wxStaticLine* StaticLine1;
    wxButton* AnnulerBt;
    wxStaticText* StaticText4;
    //*)

protected:

    //(*Identifiers(EditLink)
    static const long ID_STATICTEXT1;
    static const long ID_COMBOBOX1;
    static const long ID_RADIOBUTTON1;
    static const long ID_RADIOBUTTON2;
    static const long ID_TEXTCTRL2;
    static const long ID_STATICTEXT2;
    static const long ID_TEXTCTRL3;
    static const long ID_STATICTEXT4;
    static const long ID_STATICTEXT5;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(EditLink)
    void OnAideBtClick(wxCommandEvent& event);
    void OnAnnulerBtClick(wxCommandEvent& event);
    void OnOkBtClick(wxCommandEvent& event);
    void OnStartEditText(wxCommandEvent& event);
    void OnEndEditText(wxCommandEvent& event);
    void OnOnlyEventsCheckSelect(wxCommandEvent& event);
    //*)

    LinkEvent & editedEvent;
    const gd::Project & game;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif