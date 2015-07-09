#ifndef REMINDERDIALOG_H
#define REMINDERDIALOG_H

//(*Headers(ReminderDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include "GDCore/String.h"

class ReminderDialog: public wxDialog
{
public:

    ReminderDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~ReminderDialog();

    //(*Declarations(ReminderDialog)
    wxHyperlinkCtrl* HyperlinkCtrl2;
    wxButton* neverBt;
    wxButton* sendBt;
    wxButton* laterBt;
    wxStaticBitmap* imageBmp;
    wxStaticText* StaticText1;
    wxStaticText* StaticText3;
    wxTextCtrl* mailEdit;
    wxStaticText* StaticText5;
    wxStaticLine* StaticLine1;
    wxTextCtrl* feedbackEdit;
    wxStaticText* StaticText4;
    //*)

protected:

    //(*Identifiers(ReminderDialog)
    static const long ID_STATICTEXT1;
    static const long ID_STATICTEXT4;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICTEXT5;
    static const long ID_TEXTCTRL2;
    static const long ID_BUTTON3;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP1;
    static const long ID_STATICTEXT3;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ReminderDialog)
    void OnHyperlinkCtrl1Click(wxCommandEvent& event);
    void OnneverBtClick(wxCommandEvent& event);
    void OnlaterBtClick(wxCommandEvent& event);
    void OnClose(wxCloseEvent& event);
    void OnHyperlinkCtrl2Click(wxCommandEvent& event);
    void OnsendBtClick(wxCommandEvent& event);
    void OnfeedbackEditText(wxCommandEvent& event);
    //*)
    void OpenLink(wxString link);

    gd::String imageId; ///< The ID of the image displayed.
    bool feedbackWritten;

    DECLARE_EVENT_TABLE()
};

#endif
