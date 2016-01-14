/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef GDCORE_BEHAVIORTYPECHOICE_H
#define GDCORE_BEHAVIORTYPECHOICE_H

//(*Headers(ChooseBehaviorTypeDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/hyperlink.h>
#include <wx/choice.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }

namespace gd {

/**
 * \brief Dialog displaying all the behaviors types available in a project, allowing the user to choose one.
 * \ingroup IDEDialogs
 */
class GD_CORE_API ChooseBehaviorTypeDialog: public wxDialog
{
public:

    /**
     * \brief Default constructor
     *
     * \param parent The parent wxWindow
     * \param project The project in which the behavior type must be selected
     */
    ChooseBehaviorTypeDialog(wxWindow* parent, gd::Project & project);
    virtual ~ChooseBehaviorTypeDialog();

    /**
     * \brief Returns the selected behavior type.
     */
    const gd::String & GetSelectedBehaviorType() const { return selectedBehaviorType; }

    /**
     * \brief Display the dialog and add the selected behavior to the object.
     */
    static bool ChooseAndAddBehaviorToObject(wxWindow * parent, gd::Project & project, gd::Object * object,
        gd::Layout * layout, bool isGlobalObject);

private:

    //(*Declarations(ChooseBehaviorTypeDialog)
    wxStaticBitmap* StaticBitmap2;
    wxChoice* platformChoice;
    wxStaticText* StaticText2;
    wxStaticText* StaticText1;
    wxButton* cancelBt;
    wxStaticLine* StaticLine2;
    wxListCtrl* behaviorsList;
    wxHyperlinkCtrl* helpBt;
    wxButton* okBt;
    //*)

    //(*Identifiers(ChooseBehaviorTypeDialog)
    static const long ID_STATICTEXT1;
    static const long ID_LISTCTRL1;
    static const long ID_STATICTEXT2;
    static const long ID_STATICLINE2;
    static const long ID_CHOICE1;
    static const long ID_STATICBITMAP5;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    //*)

    //(*Handlers(ChooseBehaviorTypeDialog)
    void OnbehaviorsListItemActivated(wxListEvent& event);
    void OnbehaviorsListItemSelect(wxListEvent& event);
    void OnokBtClick(wxCommandEvent& event);
    void OncancelBtClick(wxCommandEvent& event);
    void OnmoreBehaviorsBtClick(wxCommandEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnplatformChoiceSelect(wxCommandEvent& event);
    //*)
    void UpdateListColumnsWidth();
    void RefreshList();

    gd::Project & project;
    gd::String selectedBehaviorType;

    DECLARE_EVENT_TABLE()
};

}
#endif
#endif
