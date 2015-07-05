#ifndef CHOIXCLAVIER_H
#define CHOIXCLAVIER_H

//(*Headers(ChoixClavier)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

#include <string>
#include <vector>
#include "GDCore/Utf8String.h"

class ChoixClavier: public wxDialog
{
public:

    ChoixClavier(wxWindow* parent, gd::String pTouche);
    virtual ~ChoixClavier();

    //(*Declarations(ChoixClavier)
    wxStaticText* StaticText2;
    wxButton* Button1;
    wxStaticBitmap* StaticBitmap1;
    wxPanel* Panel1;
    wxStaticLine* StaticLine1;
    wxHyperlinkCtrl* helpBt;
    //*)

    gd::String selectedKey;

protected:

    //(*Identifiers(ChoixClavier)
    static const long ID_STATICTEXT3;
    static const long ID_PANEL1;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    //*)

private:

    //(*Handlers(ChoixClavier)
    void OnKeyDown(wxKeyEvent& event);
    void OnButton1Click(wxCommandEvent& event);
    void OnTextCtrl1Text(wxCommandEvent& event);
    void OnPanel1KeyDown(wxKeyEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnPanel1KeyDown1(wxKeyEvent& event);
    //*)

    DECLARE_EVENT_TABLE()
};

#endif
