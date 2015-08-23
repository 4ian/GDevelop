/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef ADVANCEDPASTEDLG_H
#define ADVANCEDPASTEDLG_H

//(*Headers(InstancesAdvancedPasteDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

namespace gd
{

/**
 * \brief Dialogs allowing to choose options before doing an advanced paste
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API InstancesAdvancedPasteDialog: public wxDialog
{
public:

    InstancesAdvancedPasteDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~InstancesAdvancedPasteDialog();

    void SetStartX(float xStart);
    void SetStartY(float xStart);
    void SetXGap(float xStart);
    void SetYGap(float xStart);

    float GetStartX() const;
    float GetStartY() const;
    std::size_t GetXCount() const;
    std::size_t GetYCount() const;
    float GetXGap() const;
    float GetYGap() const;
    float GetRotationIncrementation() const;

    //(*Declarations(InstancesAdvancedPasteDialog)
    wxTextCtrl* yGapEdit;
    wxStaticText* StaticText9;
    wxStaticBitmap* StaticBitmap2;
    wxSpinCtrl* xCountEdit;
    wxStaticText* StaticText2;
    wxTextCtrl* xStartEdit;
    wxStaticText* StaticText6;
    wxStaticText* StaticText8;
    wxStaticText* StaticText11;
    wxTextCtrl* rotationEdit;
    wxStaticText* StaticText1;
    wxStaticText* StaticText3;
    wxButton* cancelBt;
    wxStaticText* StaticText5;
    wxStaticText* StaticText7;
    wxTextCtrl* yStartEdit;
    wxStaticLine* StaticLine1;
    wxHyperlinkCtrl* helpBt;
    wxSpinCtrl* yCountEdit;
    wxTextCtrl* xGapEdit;
    wxStaticText* StaticText4;
    wxButton* okBt;
    //*)

protected:

    //(*Identifiers(InstancesAdvancedPasteDialog)
    static const long ID_STATICTEXT9;
    static const long ID_TEXTCTRL2;
    static const long ID_STATICTEXT11;
    static const long ID_TEXTCTRL3;
    static const long ID_STATICTEXT1;
    static const long ID_SPINCTRL1;
    static const long ID_STATICTEXT2;
    static const long ID_SPINCTRL2;
    static const long ID_STATICTEXT3;
    static const long ID_STATICTEXT6;
    static const long ID_TEXTCTRL4;
    static const long ID_STATICTEXT7;
    static const long ID_TEXTCTRL5;
    static const long ID_STATICTEXT8;
    static const long ID_STATICTEXT4;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICTEXT5;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(InstancesAdvancedPasteDialog)
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    //*)

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
