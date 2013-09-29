#ifndef REMINDERDIALOG_H
#define REMINDERDIALOG_H

//(*Headers(ReminderDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class ReminderDialog: public wxDialog
{
public:

    ReminderDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~ReminderDialog();

    //(*Declarations(ReminderDialog)
    wxButton* neverBt;
    wxStaticText* StaticText2;
    wxButton* laterBt;
    wxStaticBitmap* imageBmp;
    wxStaticText* StaticText1;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    //*)

protected:

    //(*Identifiers(ReminderDialog)
    static const long ID_STATICTEXT1;
    static const long ID_STATICBITMAP1;
    static const long ID_STATICTEXT2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ReminderDialog)
    void OnHyperlinkCtrl1Click(wxCommandEvent& event);
    void OnneverBtClick(wxCommandEvent& event);
    void OnlaterBtClick(wxCommandEvent& event);
    void OnClose(wxCloseEvent& event);
    //*)
    void OpenLink(wxString link);

    std::string imageId; ///< The ID of the image displayed.

    DECLARE_EVENT_TABLE()
};

#endif
