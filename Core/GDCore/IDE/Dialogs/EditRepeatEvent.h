/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef EDITREPEATEVENT_H
#define EDITREPEATEVENT_H

//(*Headers(EditRepeatEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class RepeatEvent; }

namespace gd
{

/**
 * \brief Editor for Repeat events.
 * \ingroup IDEDialogs
 */
class EditRepeatEvent: public wxDialog
{
public:

    EditRepeatEvent(wxWindow* parent, RepeatEvent & event_, gd::Project & game_, gd::Layout & scene_);
    virtual ~EditRepeatEvent();

    //(*Declarations(EditRepeatEvent)
    wxBitmapButton* expressionBt;
    wxStaticBitmap* StaticBitmap1;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxStaticLine* StaticLine1;
    wxTextCtrl* expressionEdit;
    wxHyperlinkCtrl* helpBt;
    wxButton* okBt;
    //*)

protected:

    //(*Identifiers(EditRepeatEvent)
    static const long ID_STATICTEXT1;
    static const long ID_TEXTCTRL1;
    static const long ID_BITMAPBUTTON1;
    static const long ID_STATICLINE1;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(EditRepeatEvent)
    void OnexpressionBtClick(wxCommandEvent& event);
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    //*)

    RepeatEvent & event;
    gd::Project & game;
    gd::Layout & scene;

    DECLARE_EVENT_TABLE()
};

}

#endif //EDITREPEATEVENT_H
#endif
