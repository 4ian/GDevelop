/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef ERRORCOMPILATION_H
#define ERRORCOMPILATION_H
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

//(*Headers(CompilationErrorDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
#include "GDCpp/Runtime/String.h"

using namespace std;

/**
 * \brief Dialog used to warn the user that the compilation failed.
 * \ingroup IDE
 */
class CompilationErrorDialog: public wxDialog
{
public:

    CompilationErrorDialog(wxWindow* parent, gd::String report);
    virtual ~CompilationErrorDialog();

    //(*Declarations(CompilationErrorDialog)
    wxStaticText* StaticText2;
    wxButton* FermerBt;
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxStaticText* StaticText3;
    wxStaticLine* StaticLine2;
    wxTextCtrl* ReportEdit;
    wxStaticLine* StaticLine3;
    wxStaticLine* StaticLine1;
    wxStaticText* StaticText4;
    wxStaticBitmap* StaticBitmap3;
    wxButton* AideBt;
    //*)

protected:

    //(*Identifiers(CompilationErrorDialog)
    static const long ID_STATICBITMAP3;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL1;
    static const long ID_STATICLINE2;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICLINE1;
    static const long ID_STATICTEXT2;
    static const long ID_STATICTEXT3;
    static const long ID_STATICLINE3;
    static const long ID_STATICTEXT4;
    static const long ID_BUTTON2;
    static const long ID_BUTTON1;
    //*)

private:

    //(*Handlers(CompilationErrorDialog)
    void OnAideBtClick(wxCommandEvent& event);
    void OnFermerBtClick(wxCommandEvent& event);
    //*)

    DECLARE_EVENT_TABLE()
};

#endif
#endif
