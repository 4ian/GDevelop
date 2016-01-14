/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef ChooseBehaviorDialog_H
#define ChooseBehaviorDialog_H

//(*Headers(ChooseBehaviorDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/listbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/srchctrl.h>
#include "GDCore/String.h"
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Dialog used to choose a behavior of an object.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseBehaviorDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor
     *
     * \param parent The wxWidgets parent window
     * \param project Project
     * \param layout Layout
     * \param parentObject The object from which a behavior must be chosen
     * \param behaviorTypeAllowed If not empty, only behaviors of this type will be shown
     */
    ChooseBehaviorDialog(wxWindow* parent, Project & project, gd::Layout & layout, gd::String parentObject_, gd::String behaviorTypeAllowed_);
    virtual ~ChooseBehaviorDialog();

    /**
     * \brief Automatically choose the behavior if there is only
     * a single behavior to be chosen.
     * \return true if a behavior (or none) was chosen. false if there are two behaviors or more.
     */
    bool DeduceBehavior();

    /**
     * \brief Return the chosen behavior name
     */
    const gd::String & GetChosenBehavior() const { return behaviorChosen; }

protected:
    //(*Declarations(ChooseBehaviorDialog)
    wxSearchCtrl* searchCtrl;
    wxButton* ChoisirBt;
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxStaticLine* StaticLine2;
    wxButton* AnnulerBt;
    wxListBox* behaviorsList;
    wxStaticBitmap* StaticBitmap3;
    //*)


    //(*Identifiers(ChooseBehaviorDialog)
    static const long ID_STATICBITMAP3;
    static const long ID_STATICTEXT1;
    static const long ID_PANEL1;
    static const long ID_STATICLINE2;
    static const long ID_LISTBOX1;
    static const long ID_TEXTCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

private:

    //(*Handlers(ChooseBehaviorDialog)
    void OnChoisirBtClick(wxCommandEvent& event);
    void OnCancelBtClick(wxCommandEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    void OnsearchCtrlTextEnter(wxCommandEvent& event);
    //*)

    void RefreshList();
    Project & project;
    gd::Layout & layout;
    gd::String parentObject;
    gd::String behaviorTypeAllowed;
    gd::String behaviorChosen;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
